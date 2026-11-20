const Protocol = require('../models/Protocol');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

const getAnalytics = async (req, res) => {
  try {
    let protocols = [];

    if (isInMemoryFallback()) {
      protocols = Array.from(inMemoryDB.getCollection('protocols').values());
    } else {
      protocols = await Protocol.find({}).lean();
    }

    // 1. APY Comparison Bar Chart Data
    const apyComparison = protocols
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        apy: p.currentApy,
        riskScore: p.riskScore,
        category: p.category,
        riskLevel: p.riskLevel,
      }))
      .sort((a, b) => b.apy - a.apy);

    // 2. Risk vs Return Scatter Plot
    const riskVsReturn = protocols.map((p) => ({
      name: p.name,
      slug: p.slug,
      x: p.riskScore, // X-axis: Risk Score (0-100, higher is safer)
      y: p.currentApy, // Y-axis: APY (%)
      z: Math.round((p.tvl || 100000000) / 100000000), // Bubble size factor
      tvlFormatted: `$${((p.tvl || 0) / 1e9).toFixed(2)}B`,
      category: p.category,
      riskLevel: p.riskLevel,
    }));

    // 3. Category TVL & Protocol Count
    const categoryStats = {};
    protocols.forEach((p) => {
      const cat = p.category || 'Other';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { category: cat, totalTvl: 0, count: 0, avgApy: 0 };
      }
      categoryStats[cat].totalTvl += p.tvl || 0;
      categoryStats[cat].count += 1;
      categoryStats[cat].avgApy += p.currentApy || 0;
    });

    const categoryBreakdown = Object.values(categoryStats).map((c) => ({
      ...c,
      avgApy: Number((c.avgApy / c.count).toFixed(2)),
      tvlBillions: Number((c.totalTvl / 1e9).toFixed(2)),
    }));

    // 4. Chain Dominance
    const chainStats = {};
    protocols.forEach((p) => {
      (p.chains || ['Ethereum']).forEach((c) => {
        chainStats[c] = (chainStats[c] || 0) + (p.tvl || 0) / (p.chains.length || 1);
      });
    });

    const totalEcosystemTvl = Object.values(chainStats).reduce((a, b) => a + b, 0);
    const chainDominance = Object.entries(chainStats)
      .map(([chain, tvl]) => ({
        chain,
        tvl: Math.round(tvl),
        percentage: totalEcosystemTvl > 0 ? Number(((tvl / totalEcosystemTvl) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.tvl - a.tvl);

    // 5. 12-Month Historical TVL & Average APY Macro Trends
    const macroTrends = [
      { month: 'Jan', tvlBillions: 48.2, avgApy: 5.8 },
      { month: 'Feb', tvlBillions: 54.1, avgApy: 6.2 },
      { month: 'Mar', tvlBillions: 61.5, avgApy: 7.1 },
      { month: 'Apr', tvlBillions: 59.8, avgApy: 6.9 },
      { month: 'May', tvlBillions: 65.4, avgApy: 7.4 },
      { month: 'Jun', tvlBillions: 68.2, avgApy: 7.2 },
      { month: 'Jul', tvlBillions: 74.0, avgApy: 7.9 },
      { month: 'Aug', tvlBillions: 78.6, avgApy: 8.3 },
      { month: 'Sep', tvlBillions: 82.1, avgApy: 7.8 },
      { month: 'Oct', tvlBillions: 89.4, avgApy: 8.5 },
      { month: 'Nov', tvlBillions: 96.8, avgApy: 8.1 },
      { month: 'Dec', tvlBillions: 104.5, avgApy: 8.7 },
    ];

    res.json({
      success: true,
      apyComparison,
      riskVsReturn,
      categoryBreakdown,
      chainDominance,
      macroTrends,
      totalEcosystemTvl: protocols.reduce((acc, p) => acc + (p.tvl || 0), 0),
      totalProtocolsMonitored: protocols.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.', error: err.message });
  }
};

module.exports = {
  getAnalytics,
};
