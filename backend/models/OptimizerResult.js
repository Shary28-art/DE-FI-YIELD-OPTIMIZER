const mongoose = require('mongoose');

const optimizerAllocationSchema = new mongoose.Schema({
  protocolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Protocol' },
  protocolName: { type: String, required: true },
  slug: { type: String, required: true },
  logo: { type: String, default: '' },
  category: { type: String, required: true },
  chain: { type: String, required: true },
  apy: { type: Number, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, required: true },
  percentage: { type: Number, required: true }, // e.g. 35%
  allocatedAmountUsd: { type: Number, required: true },
  projectedAnnualReturnUsd: { type: Number, required: true },
  riskRationale: { type: String, default: '' },
});

const optimizerResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    strategyName: { type: String, default: 'Custom Strategy' },
    parameters: {
      investmentAmountUsd: { type: Number, required: true },
      riskTolerance: {
        type: String,
        enum: ['Conservative', 'Balanced', 'Aggressive'],
        required: true,
      },
      preferredChains: [String],
      minAcceptableApy: { type: Number, default: 0 },
      maxRiskScore: { type: Number, default: 100 },
      investmentDurationMonths: { type: Number, default: 12 },
    },
    allocations: [optimizerAllocationSchema],
    metrics: {
      totalInvestedUsd: { type: Number, required: true },
      estimatedAnnualYieldUsd: { type: Number, required: true },
      weightedPortfolioApy: { type: Number, required: true },
      portfolioRiskScore: { type: Number, required: true },
      portfolioRiskLevel: { type: String, required: true },
      diversificationScore: { type: Number, required: true }, // 0-100 (Herfindahl index inverted)
      sharpeRatioEstimate: { type: Number, default: 2.1 },
    },
    projectedYieldCurve: [
      {
        month: Number,
        conservativeReturnUsd: Number,
        expectedReturnUsd: Number,
        aggressiveReturnUsd: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OptimizerResult', optimizerResultSchema);
