export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface AuditReport {
  auditor: string;
  date: string;
  scope: string;
  reportUrl: string;
  score: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  allResolved: boolean;
}

export interface HistoricalYieldPoint {
  date: string;
  apy: number;
  tvl: number;
}

export interface RiskFactor {
  id: string;
  name: string;
  weight: string;
  weightNum: number;
  score: number;
  weightedContribution: number;
  status: string;
  explanation: string;
  icon?: string;
}

export interface SmartContractDetails {
  upgradeability: string;
  timelockHours: number;
  multiSigRequirement: string;
  adminControlRisk: string;
  centralizationRisk: string;
  openVulnerabilities: number;
  insuranceFundCovered: boolean;
  insuranceFundUsd: number;
  bugBountyMax: number;
  securityIncidents?: Array<{
    date: string;
    description: string;
    fundsRecovered: boolean;
    amountLost: number;
    resolution: string;
  }>;
}

export interface RiskFactorBreakdown {
  smartContractSecurity: { score: number; weight: number; factorName: string; explanation: string };
  liquidityRisk: { score: number; weight: number; factorName: string; explanation: string };
  protocolStability: { score: number; weight: number; factorName: string; explanation: string };
  historicalPerformance: { score: number; weight: number; factorName: string; explanation: string };
  decentralization: { score: number; weight: number; factorName: string; explanation: string };
  marketVolatility: { score: number; weight: number; factorName: string; explanation: string };
}

export interface Protocol {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  symbol: string;
  logo: string;
  category: 'Lending' | 'DEX' | 'Liquid Staking' | 'Yield Aggregator' | 'CDP / Stablecoin' | 'Derivatives';
  chains: string[];
  currentApy: number;
  tvl: number;
  liquidityStatus: string;
  utilizationRate?: number;
  auditStatus: string;
  auditCount: number;
  securityScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  protocolAgeYears: number;
  launchDate?: string;
  description: string;
  website?: string;
  github?: string;
  docsUrl?: string;
  tokenContract?: string;
  governanceModel?: string;
  smartContractDetails?: SmartContractDetails;
  riskFactorBreakdown?: RiskFactorBreakdown;
  auditReports?: AuditReport[];
  historicalYield?: HistoricalYieldPoint[];
  keyFeatures?: string[];
  supportedAssets?: string[];
}

export interface RiskAssessment {
  totalScore: number;
  riskLevel: RiskLevel;
  colorMeta: {
    level: string;
    badgeClass: string;
    colorHex: string;
    gaugeZone: string;
    summary: string;
  };
  factors: RiskFactor[];
  strengths: string[];
  warnings: string[];
  governanceDetails?: SmartContractDetails;
  auditCount: number;
  auditors: string[];
}

export interface Allocation {
  protocolId?: string;
  protocolName: string;
  slug: string;
  logo: string;
  category: string;
  chain: string;
  apy: number;
  riskScore: number;
  riskLevel: RiskLevel;
  percentage: number;
  allocatedAmountUsd: number;
  projectedAnnualReturnUsd: number;
  riskRationale?: string;
}

export interface YieldCurvePoint {
  month: number;
  monthLabel: string;
  expectedReturnUsd: number;
  expectedBalanceUsd: number;
  conservativeReturnUsd: number;
  aggressiveReturnUsd: number;
}

export interface OptimizerResult {
  strategyName: string;
  parameters: {
    investmentAmountUsd: number;
    riskTolerance: 'Conservative' | 'Balanced' | 'Aggressive';
    preferredChains: string[];
    minAcceptableApy: number;
    maxRiskScore: number;
    investmentDurationMonths: number;
  };
  allocations: Allocation[];
  metrics: {
    totalInvestedUsd: number;
    estimatedAnnualYieldUsd: number;
    weightedPortfolioApy: number;
    portfolioRiskScore: number;
    portfolioRiskLevel: RiskLevel;
    diversificationScore: number;
    sharpeRatioEstimate: number;
  };
  projectedYieldCurve: YieldCurvePoint[];
}

export interface Investment {
  _id?: string;
  id?: string;
  protocolId: string;
  protocolName: string;
  protocolSlug: string;
  protocolLogo?: string;
  chain: string;
  assetSymbol: string;
  amountInvested: number;
  currentValue: number;
  earnedYield: number;
  currentApy: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'Active' | 'Completed' | 'Liquidated' | 'Withdrawn';
  startDate: string;
  strategyName: string;
}

export interface Transaction {
  _id?: string;
  id?: string;
  protocolName: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'CLAIM_REWARD' | 'REBALANCE';
  amount: number;
  asset: string;
  chain: string;
  txHash: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  gasFeeUsd: number;
  notes: string;
  timestamp: string;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalInvested: number;
  earnedRewards: number;
  netProfitLoss: number;
  netProfitLossPercent: number;
  estimatedAnnualYieldUsd: number;
  weightedApy: number;
  averagePortfolioRiskScore: number;
  portfolioRiskLevel: RiskLevel;
  diversificationScore: number;
  activePositionsCount: number;
  performance24h: {
    valueChangeUsd: number;
    percentageChange: number;
    isPositive: boolean;
    dailyYieldAccruedUsd: number;
  };
}

export interface PortfolioData {
  summary: PortfolioSummary;
  investments: Investment[];
  protocolAllocations: Array<{
    name: string;
    value: number;
    percentage: number;
    apy: number;
    riskScore: number;
    riskLevel: RiskLevel;
    chain: string;
    logo?: string;
  }>;
  assetDistribution: Array<{
    asset: string;
    amount: number;
    percentage: number;
  }>;
  growthHistory: Array<{
    date: string;
    portfolioValue: number;
    depositedCapital: number;
    cumulativeYield: number;
  }>;
  recentTransactions: Transaction[];
}

export interface AnalyticsData {
  apyComparison: Array<{
    name: string;
    slug: string;
    apy: number;
    riskScore: number;
    category: string;
    riskLevel: RiskLevel;
  }>;
  riskVsReturn: Array<{
    name: string;
    slug: string;
    x: number;
    y: number;
    z: number;
    tvlFormatted: string;
    category: string;
    riskLevel: RiskLevel;
  }>;
  categoryBreakdown: Array<{
    category: string;
    totalTvl: number;
    count: number;
    avgApy: number;
    tvlBillions: number;
  }>;
  chainDominance: Array<{
    chain: string;
    tvl: number;
    percentage: number;
  }>;
  macroTrends: Array<{
    month: string;
    tvlBillions: number;
    avgApy: number;
  }>;
  totalEcosystemTvl: number;
  totalProtocolsMonitored: number;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  riskTolerance: 'Conservative' | 'Balanced' | 'Aggressive';
  preferredChains: string[];
  portfolioStats?: {
    totalInvested: number;
    currentValue: number;
    earnedYield: number;
    weightedApy: number;
    averageRiskScore: number;
  };
}
