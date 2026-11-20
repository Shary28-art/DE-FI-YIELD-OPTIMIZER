const mongoose = require('mongoose');

const auditReportSchema = new mongoose.Schema({
  auditor: { type: String, required: true },
  date: { type: String, required: true },
  scope: { type: String, default: 'Core Protocol Smart Contracts & Math Engines' },
  reportUrl: { type: String, default: 'https://github.com' },
  score: { type: Number, default: 95 },
  criticalIssues: { type: Number, default: 0 },
  highIssues: { type: Number, default: 0 },
  mediumIssues: { type: Number, default: 0 },
  lowIssues: { type: Number, default: 0 },
  allResolved: { type: Boolean, default: true },
});

const historicalYieldSchema = new mongoose.Schema({
  date: { type: String, required: true },
  apy: { type: Number, required: true },
  tvl: { type: Number, required: true },
});

const protocolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Lending', 'DEX', 'Liquid Staking', 'Yield Aggregator', 'CDP / Stablecoin', 'Derivatives'],
      required: true,
    },
    chains: {
      type: [String],
      required: true,
      default: ['Ethereum'],
    },
    currentApy: {
      type: Number,
      required: true,
      min: 0,
    },
    tvl: {
      type: Number,
      required: true,
      min: 0,
    },
    liquidityStatus: {
      type: String,
      enum: ['Deep', 'Healthy', 'Moderate', 'Thin', 'Volatile'],
      default: 'Deep',
    },
    utilizationRate: {
      type: Number,
      default: 65, // percentage
    },
    auditStatus: {
      type: String,
      enum: ['Fully Audited', 'Multi-Audited', 'Single Audit', 'Pending Audit', 'Unaudited'],
      default: 'Multi-Audited',
    },
    auditCount: {
      type: Number,
      default: 3,
      min: 0,
    },
    securityScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    riskScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      required: true,
    },
    protocolAgeYears: {
      type: Number,
      required: true,
      default: 3.5,
    },
    launchDate: {
      type: String,
      default: '2020-01-15',
    },
    description: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: 'https://defillama.com',
    },
    github: {
      type: String,
      default: 'https://github.com',
    },
    docsUrl: {
      type: String,
      default: 'https://docs.defi.org',
    },
    tokenContract: {
      type: String,
      default: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    },
    governanceModel: {
      type: String,
      default: 'Decentralized DAO with On-chain Voting & Timelock',
    },
    // Smart Contract Specific Security Specs
    smartContractDetails: {
      upgradeability: {
        type: String,
        enum: ['Immutable', 'Timelocked Proxy (48h+)', 'Multi-Sig Proxy', 'Single Admin Proxy'],
        default: 'Timelocked Proxy (48h+)',
      },
      timelockHours: { type: Number, default: 48 },
      multiSigRequirement: { type: String, default: '5 of 8 Hardware Wallets' },
      adminControlRisk: {
        type: String,
        enum: ['Low (Decentralized Timelock)', 'Moderate (Multisig Guarded)', 'High (Privileged Keys)', 'Critical (EOA Admin)'],
        default: 'Low (Decentralized Timelock)',
      },
      centralizationRisk: {
        type: String,
        enum: ['Decentralized', 'Moderately Decentralized', 'Centralized Admin', 'Custodial Element'],
        default: 'Decentralized',
      },
      openVulnerabilities: { type: Number, default: 0 },
      insuranceFundCovered: { type: Boolean, default: true },
      insuranceFundUsd: { type: Number, default: 25000000 },
      bugBountyMax: { type: Number, default: 2000000 },
      securityIncidents: [
        {
          date: String,
          description: String,
          fundsRecovered: Boolean,
          amountLost: Number,
          resolution: String,
        },
      ],
    },
    // 6-Factor Risk Engine Breakdown
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: { type: Number, default: 90 }, // 0-100
        weight: { type: Number, default: 0.30 }, // 30%
        factorName: { type: String, default: 'Smart Contract Security & Audits' },
        explanation: { type: String, default: 'Multiple tier-1 audits with zero open critical issues.' },
      },
      liquidityRisk: {
        score: { type: Number, default: 88 }, // 0-100
        weight: { type: Number, default: 0.25 }, // 25%
        factorName: { type: String, default: 'Liquidity & Solvency Risk' },
        explanation: { type: String, default: 'Deep liquidity depth across major stablecoin and bluechip pairs.' },
      },
      protocolStability: {
        score: { type: Number, default: 92 }, // 0-100
        weight: { type: Number, default: 0.15 }, // 15%
        factorName: { type: String, default: 'Protocol Stability & Age' },
        explanation: { type: String, default: 'Battle-tested through multiple crypto market cycles.' },
      },
      historicalPerformance: {
        score: { type: Number, default: 85 }, // 0-100
        weight: { type: Number, default: 0.10 }, // 10%
        factorName: { type: String, default: 'Historical Yield Performance' },
        explanation: { type: String, default: 'Predictable historical yield yields with consistent utilization.' },
      },
      decentralization: {
        score: { type: Number, default: 82 }, // 0-100
        weight: { type: Number, default: 0.10 }, // 10%
        factorName: { type: String, default: 'Governance Decentralization' },
        explanation: { type: String, default: 'Distributed governance voting with timelock delay.' },
      },
      marketVolatility: {
        score: { type: Number, default: 80 }, // 0-100
        weight: { type: Number, default: 0.10 }, // 10%
        factorName: { type: String, default: 'Market Volatility Resilience' },
        explanation: { type: String, default: 'Collateral liquidation engines tested under severe market stress.' },
      },
    },
    auditReports: [auditReportSchema],
    historicalYield: [historicalYieldSchema],
    keyFeatures: [String],
    supportedAssets: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Protocol', protocolSchema);
