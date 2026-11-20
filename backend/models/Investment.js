const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    protocolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Protocol',
      required: true,
    },
    protocolName: { type: String, required: true },
    protocolSlug: { type: String, required: true },
    protocolLogo: { type: String, default: '' },
    chain: { type: String, default: 'Ethereum' },
    assetSymbol: { type: String, default: 'USDC' },
    amountInvested: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, required: true, min: 0 },
    earnedYield: { type: Number, default: 0 },
    currentApy: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' },
    status: { type: String, enum: ['Active', 'Completed', 'Liquidated', 'Withdrawn'], default: 'Active' },
    startDate: { type: Date, default: Date.now },
    strategyName: { type: String, default: 'Balanced Treasury Yield' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Investment', investmentSchema);
