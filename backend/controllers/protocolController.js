const Protocol = require('../models/Protocol');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

// List all protocols with filtering, search, and sorting
const getProtocols = async (req, res) => {
  try {
    const {
      search,
      category,
      chain,
      riskLevel,
      minApy,
      maxApy,
      minRiskScore,
      auditStatus,
      sortBy = 'tvl_desc',
    } = req.query;

    let protocols = [];

    if (isInMemoryFallback()) {
      protocols = Array.from(inMemoryDB.getCollection('protocols').values());
    } else {
      protocols = await Protocol.find({}).lean();
    }

    // Apply filtering in memory (consistent across both MongoDB and fallback)
    let filtered = protocols.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSymbol = p.symbol?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (!matchName && !matchSymbol && !matchDesc) return false;
      }

      if (category && category !== 'All' && p.category !== category) {
        return false;
      }

      if (chain && chain !== 'All') {
        if (!p.chains || !p.chains.includes(chain)) return false;
      }

      if (riskLevel && riskLevel !== 'All' && p.riskLevel !== riskLevel) {
        return false;
      }

      if (auditStatus && auditStatus !== 'All' && p.auditStatus !== auditStatus) {
        return false;
      }

      if (minApy && p.currentApy < parseFloat(minApy)) {
        return false;
      }

      if (maxApy && p.currentApy > parseFloat(maxApy)) {
        return false;
      }

      if (minRiskScore && p.riskScore < parseFloat(minRiskScore)) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'apy_desc':
          return b.currentApy - a.currentApy;
        case 'apy_asc':
          return a.currentApy - b.currentApy;
        case 'risk_desc':
          return b.riskScore - a.riskScore; // Higher score = safer
        case 'risk_asc':
          return a.riskScore - b.riskScore;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'tvl_asc':
          return a.tvl - b.tvl;
        case 'tvl_desc':
        default:
          return b.tvl - a.tvl;
      }
    });

    res.json({
      success: true,
      count: filtered.length,
      totalTvl: filtered.reduce((acc, p) => acc + (p.tvl || 0), 0),
      protocols: filtered,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch protocols.', error: err.message });
  }
};

// Get single protocol by ID or slug
const getProtocolById = async (req, res) => {
  try {
    const { id } = req.params;
    let protocol = null;

    if (isInMemoryFallback()) {
      const protocols = Array.from(inMemoryDB.getCollection('protocols').values());
      protocol = protocols.find((p) => p._id === id || p.id === id || p.slug === id);
    } else {
      protocol = await Protocol.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
      }).lean();
    }

    if (!protocol) {
      return res.status(404).json({ success: false, message: 'Protocol not found.' });
    }

    res.json({
      success: true,
      protocol,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch protocol details.', error: err.message });
  }
};

module.exports = {
  getProtocols,
  getProtocolById,
};
