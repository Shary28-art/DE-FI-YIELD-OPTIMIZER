const Protocol = require('../models/Protocol');
const { calculateProtocolRisk } = require('../services/riskEngine');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

// Detailed risk assessment for a specific protocol
const getProtocolRisk = async (req, res) => {
  try {
    const { protocolId } = req.params;
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
      return res.status(404).json({ success: false, message: 'Protocol not found for risk assessment.' });
    }

    const riskAssessment = calculateProtocolRisk(protocol);

    res.json({
      success: true,
      protocol: {
        id: protocol._id || protocol.id,
        name: protocol.name,
        slug: protocol.slug,
        symbol: protocol.symbol,
        logo: protocol.logo,
        currentApy: protocol.currentApy,
        tvl: protocol.tvl,
        chains: protocol.chains,
        category: protocol.category,
      },
      riskAssessment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to compute risk assessment.', error: err.message });
  }
};

// Ecosystem-wide Risk Overview
const getRiskOverview = async (req, res) => {
  try {
    let protocols = [];

    if (isInMemoryFallback()) {
      protocols = Array.from(inMemoryDB.getCollection('protocols').values());
    } else {
      protocols = await Protocol.find({}).lean();
    }

    // Distribution by risk level
    const distribution = {
      Low: { count: 0, totalTvl: 0, label: 'Low Risk (80-100)', color: '#10B981' },
      Moderate: { count: 0, totalTvl: 0, label: 'Moderate Risk (60-79)', color: '#3B82F6' },
      High: { count: 0, totalTvl: 0, label: 'High Risk (40-59)', color: '#F59E0B' },
      Critical: { count: 0, totalTvl: 0, label: 'Critical Risk (0-39)', color: '#EF4444' },
    };

    let totalTvl = 0;
    protocols.forEach((p) => {
      const level = p.riskLevel || 'Moderate';
      if (distribution[level]) {
        distribution[level].count += 1;
        distribution[level].totalTvl += (p.tvl || 0);
      }
      totalTvl += (p.tvl || 0);
    });

    // Average factor scores across the entire ecosystem for radar charts
    const factorAverages = {
      smartContractSecurity: 0,
      liquidityRisk: 0,
      protocolStability: 0,
      historicalPerformance: 0,
      decentralization: 0,
      marketVolatility: 0,
    };

    if (protocols.length > 0) {
      protocols.forEach((p) => {
        const bd = p.riskFactorBreakdown || {};
        factorAverages.smartContractSecurity += bd.smartContractSecurity?.score || 75;
        factorAverages.liquidityRisk += bd.liquidityRisk?.score || 75;
        factorAverages.protocolStability += bd.protocolStability?.score || 75;
        factorAverages.historicalPerformance += bd.historicalPerformance?.score || 75;
        factorAverages.decentralization += bd.decentralization?.score || 75;
        factorAverages.marketVolatility += bd.marketVolatility?.score || 75;
      });

      Object.keys(factorAverages).forEach((k) => {
        factorAverages[k] = Math.round(factorAverages[k] / protocols.length);
      });
    }

    // Top audited protocols
    const topAudited = [...protocols]
      .sort((a, b) => (b.auditCount || 0) - (a.auditCount || 0))
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        audits: p.auditCount,
        securityScore: p.securityScore,
        riskScore: p.riskScore,
        riskLevel: p.riskLevel,
      }));

    res.json({
      success: true,
      totalProtocols: protocols.length,
      totalTvl,
      distribution,
      factorAverages,
      topAudited,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch ecosystem risk overview.', error: err.message });
  }
};

module.exports = {
  getProtocolRisk,
  getRiskOverview,
};
