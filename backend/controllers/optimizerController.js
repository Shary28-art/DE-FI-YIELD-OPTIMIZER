const Protocol = require('../models/Protocol');
const OptimizerResult = require('../models/OptimizerResult');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { optimizeStrategy, STRATEGY_PRESETS } = require('../services/optimizerService');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

// Run strategy optimization
const runOptimizer = async (req, res) => {
  try {
    const {
      investmentAmount = 100000,
      riskTolerance = 'Balanced',
      preferredChains = [],
      minAcceptableApy = 0,
      maxRiskScore = 100,
      investmentDuration = 12,
    } = req.body;

    let protocols = [];

    if (isInMemoryFallback()) {
      protocols = Array.from(inMemoryDB.getCollection('protocols').values());
    } else {
      protocols = await Protocol.find({}).lean();
    }

    if (!protocols || protocols.length === 0) {
      return res.status(400).json({ success: false, message: 'No protocols available for optimization.' });
    }

    const optimization = optimizeStrategy(protocols, {
      investmentAmountUsd: parseFloat(investmentAmount) || 100000,
      riskTolerance,
      preferredChains,
      minAcceptableApy: parseFloat(minAcceptableApy) || 0,
      maxRiskScore: parseFloat(maxRiskScore) || 100,
      investmentDurationMonths: parseInt(investmentDuration, 10) || 12,
    });

    res.json({
      success: true,
      optimization,
      presets: STRATEGY_PRESETS,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Optimization calculation failed.', error: err.message });
  }
};

// Deploy Strategy directly into user portfolio
const deployStrategy = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { allocations, strategyName = 'Optimized Strategy' } = req.body;

    if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid strategy allocations.' });
    }

    const createdInvestments = [];
    const createdTransactions = [];

    if (isInMemoryFallback()) {
      const invCol = inMemoryDB.getCollection('investments');
      const txCol = inMemoryDB.getCollection('transactions');
      const usersCol = inMemoryDB.getCollection('users');

      let addedTotal = 0;
      for (const item of allocations) {
        const invId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const newInv = {
          _id: invId,
          id: invId,
          userId,
          protocolId: item.protocolId || 'proto_' + item.slug,
          protocolName: item.protocolName,
          protocolSlug: item.slug,
          protocolLogo: item.logo || '',
          chain: item.chain || 'Ethereum',
          assetSymbol: 'USDC',
          amountInvested: item.allocatedAmountUsd,
          currentValue: item.allocatedAmountUsd,
          earnedYield: 0,
          currentApy: item.apy,
          riskScore: item.riskScore,
          riskLevel: item.riskLevel,
          status: 'Active',
          startDate: new Date(),
          strategyName,
          createdAt: new Date(),
        };

        invCol.set(invId, newInv);
        createdInvestments.push(newInv);
        addedTotal += item.allocatedAmountUsd;

        // Transaction log
        const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const tx = {
          _id: txId,
          id: txId,
          userId,
          protocolId: item.protocolId || 'proto_' + item.slug,
          protocolName: item.protocolName,
          type: 'DEPOSIT',
          amount: item.allocatedAmountUsd,
          asset: 'USDC',
          chain: item.chain || 'Ethereum',
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          status: 'CONFIRMED',
          gasFeeUsd: 3.85,
          notes: `Deployed from Optimizer (${strategyName})`,
          timestamp: new Date(),
        };
        txCol.set(txId, tx);
        createdTransactions.push(tx);
      }

      // Update user stats
      const user = usersCol.get(userId);
      if (user) {
        user.portfolioStats = user.portfolioStats || {};
        user.portfolioStats.totalInvested = (user.portfolioStats.totalInvested || 0) + addedTotal;
        user.portfolioStats.currentValue = (user.portfolioStats.currentValue || 0) + addedTotal;
        usersCol.set(userId, user);
      }

      return res.status(201).json({
        success: true,
        message: `Successfully deployed strategy into portfolio across ${allocations.length} protocols.`,
        investments: createdInvestments,
        transactions: createdTransactions,
      });
    }

    // Standard MongoDB
    let addedTotal = 0;
    for (const item of allocations) {
      const newInv = await Investment.create({
        userId,
        protocolId: item.protocolId,
        protocolName: item.protocolName,
        protocolSlug: item.slug,
        protocolLogo: item.logo || '',
        chain: item.chain || 'Ethereum',
        assetSymbol: 'USDC',
        amountInvested: item.allocatedAmountUsd,
        currentValue: item.allocatedAmountUsd,
        earnedYield: 0,
        currentApy: item.apy,
        riskScore: item.riskScore,
        riskLevel: item.riskLevel,
        status: 'Active',
        strategyName,
      });

      createdInvestments.push(newInv);
      addedTotal += item.allocatedAmountUsd;

      const tx = await Transaction.create({
        userId,
        protocolId: item.protocolId,
        protocolName: item.protocolName,
        type: 'DEPOSIT',
        amount: item.allocatedAmountUsd,
        asset: 'USDC',
        chain: item.chain || 'Ethereum',
        notes: `Deployed from Optimizer (${strategyName})`,
      });
      createdTransactions.push(tx);
    }

    await User.findByIdAndUpdate(userId, {
      $inc: {
        'portfolioStats.totalInvested': addedTotal,
        'portfolioStats.currentValue': addedTotal,
      },
    });

    res.status(201).json({
      success: true,
      message: `Successfully deployed strategy into portfolio across ${allocations.length} protocols.`,
      investments: createdInvestments,
      transactions: createdTransactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to deploy strategy.', error: err.message });
  }
};

module.exports = {
  runOptimizer,
  deployStrategy,
};
