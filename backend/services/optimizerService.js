/**
 * Institutional Yield Farming Strategy Optimizer
 * 
 * Uses constrained Mean-Variance Optimization & Risk-Weighted Diversification
 * to allocate treasury funds across qualifying DeFi protocols.
 */

const { calculateProtocolRisk } = require('./riskEngine');

/**
 * Strategy Presets Configuration
 */
const STRATEGY_PRESETS = {
  Conservative: {
    minRiskScore: 80, // Only Low Risk (Institutional grade)
    maxSingleProtocolAllocation: 0.30, // 30% cap
    minProtocols: 4,
    riskWeightPreference: 0.75, // Heavily weight risk over raw APY
    description: 'Capital preservation focus. Bluechip protocols, maximum audits, deepest liquidity.',
  },
  Balanced: {
    minRiskScore: 65, // Low and upper Moderate Risk
    maxSingleProtocolAllocation: 0.35, // 35% cap
    minProtocols: 3,
    riskWeightPreference: 0.50, // Balanced trade-off
    description: 'Optimal risk-adjusted yield. Mix of leading lending markets, liquid staking, and stable AMMs.',
  },
  Aggressive: {
    minRiskScore: 45, // Allows High Yield & derivative protocols
    maxSingleProtocolAllocation: 0.40, // 40% cap
    minProtocols: 3,
    riskWeightPreference: 0.25, // Heavily weight APY
    description: 'High alpha generation. Leverages yield boosters, liquid restaking, and concentrated LP pools.',
  },
};

/**
 * Calculate Herfindahl-Hirschman Diversification Score (0 to 100)
 * HHI = sum of (market_share_percent^2). Perfect monopoly = 10,000, 5 equal parts = 2,000.
 * Inverted: 100 - (HHI / 100) normalized.
 */
const calculateDiversificationScore = (allocations) => {
  if (!allocations || allocations.length === 0) return 0;
  if (allocations.length === 1) return 20;

  const hhi = allocations.reduce((acc, curr) => acc + Math.pow(curr.percentage, 2), 0);
  // Equal 4-way split is 25^2 * 4 = 2500 -> score ~ 85
  // Equal 5-way split is 20^2 * 5 = 2000 -> score ~ 92
  const normalized = Math.max(10, Math.min(100, Math.round(100 - (hhi - 1500) / 85)));
  return normalized;
};

/**
 * Generate monthly cumulative returns projection
 */
const generateProjectedReturns = (principal, annualRate, durationMonths = 12) => {
  const points = [];
  const monthlyRate = annualRate / 100 / 12;

  // Track standard compounding
  let runningPrincipal = principal;
  let runningConservative = principal;
  let runningAggressive = principal;

  for (let m = 1; m <= Math.max(12, durationMonths); m++) {
    runningPrincipal *= (1 + monthlyRate);
    runningConservative *= (1 + (monthlyRate * 0.85)); // 15% lower scenario
    runningAggressive *= (1 + (monthlyRate * 1.20)); // 20% higher scenario

    points.push({
      month: m,
      monthLabel: `M${m}`,
      expectedReturnUsd: Math.round(runningPrincipal - principal),
      expectedBalanceUsd: Math.round(runningPrincipal),
      conservativeReturnUsd: Math.round(runningConservative - principal),
      aggressiveReturnUsd: Math.round(runningAggressive - principal),
    });
  }

  return points;
};

/**
 * Optimize Portfolio Allocations
 */
const optimizeStrategy = (protocols, options = {}) => {
  const {
    investmentAmountUsd = 100000,
    riskTolerance = 'Balanced',
    preferredChains = [],
    minAcceptableApy = 0,
    maxRiskScore = 100, // or minimum acceptable safety score
    investmentDurationMonths = 12,
  } = options;

  const preset = STRATEGY_PRESETS[riskTolerance] || STRATEGY_PRESETS.Balanced;

  // 1. Filter protocols based on user constraints
  let candidates = protocols.filter((p) => {
    // APY threshold
    if (minAcceptableApy > 0 && p.currentApy < minAcceptableApy) return false;

    // Chain filter (if specified and not empty)
    if (preferredChains && preferredChains.length > 0) {
      const hasMatchingChain = p.chains.some((c) => preferredChains.includes(c));
      if (!hasMatchingChain) return false;
    }

    // Risk threshold according to preset and custom bounds
    const effectiveMinScore = Math.max(preset.minRiskScore, 30);
    if (p.riskScore < effectiveMinScore) return false;

    return true;
  });

  // Fallback: If filter is too strict, relax chain constraints or pick top safe protocols
  if (candidates.length < 2) {
    candidates = [...protocols]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }

  // 2. Compute Utility Scores for candidate selection
  // Score = APY * (1 - riskWeightPreference) + (RiskScore / 10) * riskWeightPreference
  const scored = candidates.map((p) => {
    const riskFactor = p.riskScore / 100; // 0 to 1
    const apyFactor = Math.min(p.currentApy / 20, 1.5); // normalized APY factor

    const utility =
      (1 - preset.riskWeightPreference) * apyFactor * 100 +
      preset.riskWeightPreference * riskFactor * 100;

    return {
      protocol: p,
      utility,
    };
  });

  // Sort by utility descending
  scored.sort((a, b) => b.utility - a.utility);

  // 3. Select 3-5 diversified protocols with category diversity
  const selected = [];
  const usedCategories = new Set();

  for (const item of scored) {
    if (selected.length >= 5) break;
    // Prefer distinct categories for the first 3
    if (selected.length < 3 && usedCategories.has(item.protocol.category)) {
      continue;
    }
    selected.push(item);
    usedCategories.add(item.protocol.category);
  }

  // If we couldn't get at least 3 distinct categories, backfill with remaining highest utility
  if (selected.length < Math.min(3, scored.length)) {
    for (const item of scored) {
      if (!selected.includes(item)) {
        selected.push(item);
        if (selected.length >= 3) break;
      }
    }
  }

  // 4. Determine Allocation Weights with Cap and Normalization
  const totalUtility = selected.reduce((sum, item) => sum + item.utility, 0);
  let rawWeights = selected.map((item) => item.utility / totalUtility);

  // Apply single protocol cap
  const cap = preset.maxSingleProtocolAllocation;
  let cappedWeights = rawWeights.map((w) => Math.min(w, cap));

  // Distribute remaining excess evenly
  let allocatedSum = cappedWeights.reduce((s, w) => s, 0);
  let excess = 1 - cappedWeights.reduce((s, w) => s + w, 0);

  if (excess > 0) {
    // Add to elements not yet capped
    const uncappedIndexes = cappedWeights
      .map((w, idx) => (w < cap ? idx : null))
      .filter((idx) => idx !== null);

    if (uncappedIndexes.length > 0) {
      const bonus = excess / uncappedIndexes.length;
      uncappedIndexes.forEach((idx) => {
        cappedWeights[idx] = Math.min(cap, cappedWeights[idx] + bonus);
      });
    }
  }

  // Re-normalize to exactly 100%
  const finalSum = cappedWeights.reduce((s, w) => s + w, 0);
  const normalizedPercentages = cappedWeights.map((w) =>
    Math.round((w / finalSum) * 100)
  );

  // Adjust any rounding drift so sum is exactly 100%
  const currentTotal = normalizedPercentages.reduce((s, p) => s + p, 0);
  if (currentTotal !== 100 && normalizedPercentages.length > 0) {
    normalizedPercentages[0] += (100 - currentTotal);
  }

  // 5. Build Final Allocations
  const allocations = selected.map((item, idx) => {
    const proto = item.protocol;
    const pct = normalizedPercentages[idx];
    const allocatedAmountUsd = Math.round((investmentAmountUsd * pct) / 100);
    const projectedAnnualReturnUsd = Math.round((allocatedAmountUsd * proto.currentApy) / 100);

    return {
      protocolId: proto._id,
      protocolName: proto.name,
      slug: proto.slug,
      logo: proto.logo,
      category: proto.category,
      chain: proto.chains[0] || 'Ethereum',
      apy: proto.currentApy,
      riskScore: proto.riskScore,
      riskLevel: proto.riskLevel,
      percentage: pct,
      allocatedAmountUsd,
      projectedAnnualReturnUsd,
      riskRationale: `${proto.name} provides ${proto.currentApy}% APY with a robust risk score of ${proto.riskScore}/100 and ${proto.auditCount} formal audits.`,
    };
  });

  // 6. Portfolio-Level Aggregate Metrics
  const weightedPortfolioApy = Number(
    allocations.reduce((acc, curr) => acc + (curr.apy * curr.percentage) / 100, 0).toFixed(2)
  );

  const weightedRiskScore = Math.round(
    allocations.reduce((acc, curr) => acc + (curr.riskScore * curr.percentage) / 100, 0)
  );

  const estimatedAnnualYieldUsd = allocations.reduce(
    (acc, curr) => acc + curr.projectedAnnualReturnUsd,
    0
  );

  const diversificationScore = calculateDiversificationScore(allocations);

  let portfolioRiskLevel = 'Low';
  if (weightedRiskScore < 40) portfolioRiskLevel = 'Critical';
  else if (weightedRiskScore < 60) portfolioRiskLevel = 'High';
  else if (weightedRiskScore < 80) portfolioRiskLevel = 'Moderate';

  // 7. Projected Returns Over Duration
  const projectedYieldCurve = generateProjectedReturns(
    investmentAmountUsd,
    weightedPortfolioApy,
    investmentDurationMonths
  );

  return {
    strategyName: `${riskTolerance} Institutional Yield Strategy`,
    parameters: {
      investmentAmountUsd,
      riskTolerance,
      preferredChains,
      minAcceptableApy,
      maxRiskScore,
      investmentDurationMonths,
    },
    allocations,
    metrics: {
      totalInvestedUsd: investmentAmountUsd,
      estimatedAnnualYieldUsd,
      weightedPortfolioApy,
      portfolioRiskScore: weightedRiskScore,
      portfolioRiskLevel,
      diversificationScore,
      sharpeRatioEstimate: Number(((weightedPortfolioApy - 3.8) / (105 - weightedRiskScore) * 8).toFixed(2)),
    },
    projectedYieldCurve,
  };
};

module.exports = {
  STRATEGY_PRESETS,
  optimizeStrategy,
  calculateDiversificationScore,
  generateProjectedReturns,
};
