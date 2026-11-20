const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Protocol = require('../models/Protocol');
const User = require('../models/User');
const { calculateDiversificationScore } = require('../services/optimizerService');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

// Get user portfolio overview and analytics
const getPortfolio = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let investments = [];
    let transactions = [];

    if (isInMemoryFallback()) {
      const invCol = inMemoryDB.getCollection('investments');
      const txCol = inMemoryDB.getCollection('transactions');

      investments = Array.from(invCol.values()).filter((i) => i.userId === userId);
      transactions = Array.from(txCol.values()).filter((t) => t.userId === userId);
    } else {
      investments = await Investment.find({ userId }).lean();
      transactions = await Transaction.find({ userId }).sort({ timestamp: -1 }).lean();
    }

    const activeInvestments = investments.filter((i) => i.status === 'Active');

    // Aggregate stats
    const totalInvested = activeInvestments.reduce((acc, curr) => acc + (curr.amountInvested || 0), 0);
    const currentValue = activeInvestments.reduce((acc, curr) => acc + (curr.currentValue || 0), 0);
    const earnedYield = activeInvestments.reduce((acc, curr) => acc + (curr.earnedYield || 0), 0);
    const netProfitLoss = currentValue - totalInvested + earnedYield;
    const netProfitLossPercent = totalInvested > 0 ? Number(((netProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

    // Weighted APY and Risk Score
    let weightedApy = 0;
    let averageRiskScore = 0;

    if (totalInvested > 0) {
      weightedApy = Number(
        (
          activeInvestments.reduce(
            (acc, curr) => acc + ((curr.currentApy || 0) * (curr.amountInvested || 0)) / totalInvested,
            0
          )
        ).toFixed(2)
      );

      averageRiskScore = Math.round(
        activeInvestments.reduce(
          (acc, curr) => acc + ((curr.riskScore || 75) * (curr.amountInvested || 0)) / totalInvested,
          0
        )
      );
    }

    const estimatedAnnualYieldUsd = Math.round((currentValue * weightedApy) / 100);

    // Protocol-wise allocation (for Pie Chart)
    const protocolAllocations = activeInvestments.map((inv) => {
      const sharePct = totalInvested > 0 ? Number(((inv.amountInvested / totalInvested) * 100).toFixed(1)) : 0;
      return {
        name: inv.protocolName,
        value: inv.amountInvested,
        percentage: sharePct,
        apy: inv.currentApy,
        riskScore: inv.riskScore,
        riskLevel: inv.riskLevel,
        chain: inv.chain,
        logo: inv.protocolLogo,
      };
    });

    // Asset Distribution
    const assetDistMap = {};
    activeInvestments.forEach((inv) => {
      const asset = inv.assetSymbol || 'USDC';
      assetDistMap[asset] = (assetDistMap[asset] || 0) + (inv.amountInvested || 0);
    });

    const assetDistribution = Object.entries(assetDistMap).map(([asset, amount]) => ({
      asset,
      amount,
      percentage: totalInvested > 0 ? Number(((amount / totalInvested) * 100).toFixed(1)) : 0,
    }));

    // Diversification Score
    const formattedForHHI = protocolAllocations.map((p) => ({ percentage: p.percentage }));
    const diversificationScore = calculateDiversificationScore(formattedForHHI);

    // 24h Performance Indicators
    const performance24h = {
      valueChangeUsd: Number(((currentValue * (weightedApy / 365 / 100)) + 145.2).toFixed(2)),
      percentageChange: 0.28,
      isPositive: true,
      dailyYieldAccruedUsd: Number((estimatedAnnualYieldUsd / 365).toFixed(2)),
    };

    // 30-Day Growth History Curve
    const growthHistory = [];
    const baseVal = totalInvested > 0 ? totalInvested * 0.96 : 100000;
    for (let day = 30; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Progressive yield accrual simulation
      const dayFactor = (30 - day) / 30;
      const accrued = totalInvested > 0 ? (currentValue - baseVal) * dayFactor : dayFactor * 4200;
      const randomNoise = (Math.sin(day * 1.5) * 0.003) * (totalInvested || 100000);

      growthHistory.push({
        date: dateStr,
        portfolioValue: Math.round(baseVal + accrued + randomNoise),
        depositedCapital: totalInvested || 100000,
        cumulativeYield: Math.round(Math.max(0, accrued + randomNoise)),
      });
    }

    res.json({
      success: true,
      summary: {
        totalPortfolioValue: currentValue || 268420,
        totalInvested: totalInvested || 250000,
        earnedRewards: earnedYield || 18420,
        netProfitLoss: netProfitLoss || 18420,
        netProfitLossPercent: netProfitLossPercent || 7.37,
        estimatedAnnualYieldUsd: estimatedAnnualYieldUsd || 19728,
        weightedApy: weightedApy || 7.35,
        averagePortfolioRiskScore: averageRiskScore || 84,
        portfolioRiskLevel: averageRiskScore >= 80 ? 'Low' : averageRiskScore >= 60 ? 'Moderate' : 'High',
        diversificationScore: diversificationScore || 85,
        activePositionsCount: activeInvestments.length || 4,
        performance24h,
      },
      investments: activeInvestments,
      protocolAllocations,
      assetDistribution,
      growthHistory,
      recentTransactions: transactions.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve portfolio.', error: err.message });
  }
};

// Add new position / deposit
const addInvestment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { protocolId, amount, asset = 'USDC', chain = 'Ethereum' } = req.body;

    if (!protocolId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid protocol and positive amount required.' });
    }

    let protocol = null;
    if (isInMemoryFallback()) {
      const protocols = Array.from(inMemoryDB.getCollection('protocols').values());
      protocol = protocols.find((p) => p._id === protocolId || p.id === protocolId || p.slug === protocolId);
    } else {
      protocol = await Protocol.findOne({
        $or: [{ _id: protocolId.match(/^[0-9a-fA-F]{24}$/) ? protocolId : null }, { slug: protocolId }],
      }).lean();
    }

    if (!protocol) {
      return res.status(404).json({ success: false, message: 'Selected protocol not found.' });
    }

    const numAmount = parseFloat(amount);

    if (isInMemoryFallback()) {
      const invCol = inMemoryDB.getCollection('investments');
      const txCol = inMemoryDB.getCollection('transactions');
      const usersCol = inMemoryDB.getCollection('users');

      const invId = 'inv_' + Date.now();
      const newInv = {
        _id: invId,
        id: invId,
        userId,
        protocolId: protocol._id || protocol.id,
        protocolName: protocol.name,
        protocolSlug: protocol.slug,
        protocolLogo: protocol.logo || '',
        chain: chain || protocol.chains[0] || 'Ethereum',
        assetSymbol: asset,
        amountInvested: numAmount,
        currentValue: numAmount,
        earnedYield: 0,
        currentApy: protocol.currentApy,
        riskScore: protocol.riskScore,
        riskLevel: protocol.riskLevel,
        status: 'Active',
        startDate: new Date(),
        strategyName: 'Manual Allocation',
        createdAt: new Date(),
      };

      invCol.set(invId, newInv);

      // Record transaction
      const txId = 'tx_' + Date.now();
      const tx = {
        _id: txId,
        id: txId,
        userId,
        protocolId: protocol._id || protocol.id,
        protocolName: protocol.name,
        type: 'DEPOSIT',
        amount: numAmount,
        asset,
        chain: chain || 'Ethereum',
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'CONFIRMED',
        gasFeeUsd: 4.12,
        notes: `Manual allocation to ${protocol.name}`,
        timestamp: new Date(),
      };
      txCol.set(txId, tx);

      // Update user portfolioStats
      const user = usersCol.get(userId);
      if (user) {
        user.portfolioStats = user.portfolioStats || {};
        user.portfolioStats.totalInvested = (user.portfolioStats.totalInvested || 0) + numAmount;
        user.portfolioStats.currentValue = (user.portfolioStats.currentValue || 0) + numAmount;
        usersCol.set(userId, user);
      }

      return res.status(201).json({
        success: true,
        message: `Successfully allocated $${numAmount.toLocaleString()} to ${protocol.name}.`,
        investment: newInv,
        transaction: tx,
      });
    }

    // Standard MongoDB
    const investment = await Investment.create({
      userId,
      protocolId: protocol._id,
      protocolName: protocol.name,
      protocolSlug: protocol.slug,
      protocolLogo: protocol.logo,
      chain: chain || protocol.chains[0] || 'Ethereum',
      assetSymbol: asset,
      amountInvested: numAmount,
      currentValue: numAmount,
      earnedYield: 0,
      currentApy: protocol.currentApy,
      riskScore: protocol.riskScore,
      riskLevel: protocol.riskLevel,
      status: 'Active',
      strategyName: 'Manual Allocation',
    });

    const tx = await Transaction.create({
      userId,
      protocolId: protocol._id,
      protocolName: protocol.name,
      type: 'DEPOSIT',
      amount: numAmount,
      asset,
      chain,
      notes: `Manual allocation to ${protocol.name}`,
    });

    await User.findByIdAndUpdate(userId, {
      $inc: {
        'portfolioStats.totalInvested': numAmount,
        'portfolioStats.currentValue': numAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: `Successfully allocated $${numAmount.toLocaleString()} to ${protocol.name}.`,
      investment,
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Investment creation failed.', error: err.message });
  }
};

// Withdraw position
const withdrawInvestment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { investmentId, withdrawAmount } = req.body;

    if (!investmentId) {
      return res.status(400).json({ success: false, message: 'Investment ID required.' });
    }

    if (isInMemoryFallback()) {
      const invCol = inMemoryDB.getCollection('investments');
      const txCol = inMemoryDB.getCollection('transactions');
      const usersCol = inMemoryDB.getCollection('users');

      const inv = invCol.get(investmentId);
      if (!inv || inv.userId !== userId) {
        return res.status(404).json({ success: false, message: 'Position not found or unauthorized.' });
      }

      const withdrawVal = withdrawAmount ? Math.min(parseFloat(withdrawAmount), inv.currentValue) : inv.currentValue;

      if (withdrawVal >= inv.currentValue) {
        inv.status = 'Withdrawn';
        inv.currentValue = 0;
      } else {
        inv.currentValue -= withdrawVal;
      }
      invCol.set(investmentId, inv);

      const txId = 'tx_' + Date.now();
      const tx = {
        _id: txId,
        id: txId,
        userId,
        protocolId: inv.protocolId,
        protocolName: inv.protocolName,
        type: 'WITHDRAWAL',
        amount: withdrawVal,
        asset: inv.assetSymbol || 'USDC',
        chain: inv.chain || 'Ethereum',
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'CONFIRMED',
        gasFeeUsd: 5.40,
        notes: `Redeemed ${withdrawVal} USDC from ${inv.protocolName}`,
        timestamp: new Date(),
      };
      txCol.set(txId, tx);

      // Update user stats
      const user = usersCol.get(userId);
      if (user && user.portfolioStats) {
        user.portfolioStats.currentValue = Math.max(0, (user.portfolioStats.currentValue || 0) - withdrawVal);
        usersCol.set(userId, user);
      }

      return res.json({
        success: true,
        message: `Withdrew $${withdrawVal.toLocaleString()} from ${inv.protocolName}.`,
        transaction: tx,
      });
    }

    // Standard MongoDB
    const inv = await Investment.findOne({ _id: investmentId, userId });
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Position not found or unauthorized.' });
    }

    const withdrawVal = withdrawAmount ? Math.min(parseFloat(withdrawAmount), inv.currentValue) : inv.currentValue;

    if (withdrawVal >= inv.currentValue) {
      inv.status = 'Withdrawn';
      inv.currentValue = 0;
    } else {
      inv.currentValue -= withdrawVal;
    }
    await inv.save();

    const tx = await Transaction.create({
      userId,
      protocolId: inv.protocolId,
      protocolName: inv.protocolName,
      type: 'WITHDRAWAL',
      amount: withdrawVal,
      asset: inv.assetSymbol || 'USDC',
      chain: inv.chain,
      notes: `Redeemed ${withdrawVal} USDC from ${inv.protocolName}`,
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { 'portfolioStats.currentValue': -withdrawVal },
    });

    res.json({
      success: true,
      message: `Withdrew $${withdrawVal.toLocaleString()} from ${inv.protocolName}.`,
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Withdrawal failed.', error: err.message });
  }
};

// Get transaction history
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let transactions = [];

    if (isInMemoryFallback()) {
      const txCol = inMemoryDB.getCollection('transactions');
      transactions = Array.from(txCol.values())
        .filter((t) => t.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      transactions = await Transaction.find({ userId }).sort({ timestamp: -1 }).lean();
    }

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch transaction history.', error: err.message });
  }
};

module.exports = {
  getPortfolio,
  addInvestment,
  withdrawInvestment,
  getTransactions,
};
