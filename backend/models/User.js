const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['institutional_treasurer', 'analyst', 'individual_investor'],
      default: 'institutional_treasurer',
    },
    organization: {
      type: String,
      default: 'Horizon Capital DAO Treasury',
    },
    riskTolerance: {
      type: String,
      enum: ['Conservative', 'Balanced', 'Aggressive'],
      default: 'Balanced',
    },
    preferredChains: {
      type: [String],
      default: ['Ethereum', 'Arbitrum', 'Polygon'],
    },
    portfolioStats: {
      totalInvested: { type: Number, default: 0 },
      currentValue: { type: Number, default: 0 },
      earnedYield: { type: Number, default: 0 },
      weightedApy: { type: Number, default: 0 },
      averageRiskScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
