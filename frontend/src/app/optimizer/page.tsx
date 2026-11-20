'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  PieChart as PieChartIcon,
  CheckCircle2,
  ArrowRight,
  Layers,
  Wallet,
  Coins,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { OptimizerResult, Allocation, RiskLevel } from '@/types';
import { RiskBadge } from '@/components/RiskBadge';
import { MetricCard } from '@/components/MetricCard';
import { useAuth } from '@/lib/authContext';

const PIE_COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
const AVAILABLE_CHAINS = ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Base'];

export default function OptimizerPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  // Optimizer Inputs
  const [investmentAmount, setInvestmentAmount] = useState<string>('250000');
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [selectedChains, setSelectedChains] = useState<string[]>(['Ethereum', 'Arbitrum', 'Polygon']);
  const [minApy, setMinApy] = useState<number>(3.5);
  const [maxRiskScore, setMaxRiskScore] = useState<number>(100);
  const [durationMonths, setDurationMonths] = useState<number>(12);

  // Optimizer Output State
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState('');

  const runOptimization = async () => {
    try {
      setIsLoading(true);
      const res = await api.runOptimizer({
        investmentAmount: parseFloat(investmentAmount) || 250000,
        riskTolerance,
        preferredChains: selectedChains,
        minAcceptableApy: minApy,
        maxRiskScore,
        investmentDuration: durationMonths,
      });

      if (res.success && res.optimization) {
        setResult(res.optimization);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [riskTolerance]);

  const handlePresetSelect = (preset: 'Conservative' | 'Balanced' | 'Aggressive') => {
    setRiskTolerance(preset);
    if (preset === 'Conservative') {
      setMinApy(3.0);
      setMaxRiskScore(100);
    } else if (preset === 'Balanced') {
      setMinApy(5.0);
      setMaxRiskScore(100);
    } else {
      setMinApy(8.0);
      setMaxRiskScore(100);
    }
  };

  const toggleChain = (chain: string) => {
    if (selectedChains.includes(chain)) {
      if (selectedChains.length > 1) {
        setSelectedChains(selectedChains.filter((c) => c !== chain));
      }
    } else {
      setSelectedChains([...selectedChains, chain]);
    }
  };

  const handleDeploy = async () => {
    if (!result || !result.allocations) return;

    try {
      setIsDeploying(true);
      const res = await api.deployStrategy({
        allocations: result.allocations,
        strategyName: result.strategyName,
      });

      if (res.success) {
        setDeploySuccess(`Strategy successfully deployed! Redirecting to treasury portfolio...`);
        await refreshUser();
        setTimeout(() => {
          router.push('/portfolio');
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deploy strategy');
    } finally {
      setIsDeploying(false);
    }
  };

  const metrics = result?.metrics;
  const allocations = result?.allocations || [];
  const projectedCurve = result?.projectedYieldCurve || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Yield Farming Strategy Optimizer
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Modern Portfolio Theory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Constrained mean-variance risk optimization engine that constructs diversified institutional DeFi allocations.
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handlePresetSelect('Conservative')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            riskTolerance === 'Conservative'
              ? 'bg-emerald-500/15 border-emerald-500 shadow-glow-emerald'
              : 'glass-panel-interactive border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm font-sans">Conservative Preset</span>
            <span className="text-xs font-mono font-bold text-emerald-400">Risk &ge; 80</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
            Capital preservation. Allocates to bluechips (Aave, Maker, Lido). Max 30% single-protocol cap.
          </p>
        </button>

        <button
          onClick={() => handlePresetSelect('Balanced')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            riskTolerance === 'Balanced'
              ? 'bg-blue-500/15 border-blue-500 shadow-sm'
              : 'glass-panel-interactive border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm font-sans">Balanced Preset</span>
            <span className="text-xs font-mono font-bold text-blue-400">Risk 65–85</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
            Optimal risk-adjusted yield. Blends lending markets, liquid staking, and stable AMM pools.
          </p>
        </button>

        <button
          onClick={() => handlePresetSelect('Aggressive')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            riskTolerance === 'Aggressive'
              ? 'bg-amber-500/15 border-amber-500 shadow-sm'
              : 'glass-panel-interactive border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm font-sans">Aggressive Preset</span>
            <span className="text-xs font-mono font-bold text-amber-400">High Alpha</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
            High yield generation. Incorporates yield tokenization (Pendle) and concentrated LP derivatives.
          </p>
        </button>
      </div>

      {/* Main Grid: Input Controls & Real-Time Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Optimization Parameters
            </h2>
            <span className="text-[10px] font-mono uppercase text-slate-400">Institutional Custom</span>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
              Investment Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                min="10000"
                step="10000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-2 mt-2 font-mono text-[10px]">
              {[100000, 250000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInvestmentAmount(amt.toString())}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  ${(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Blockchain Networks */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
              Target Blockchain Networks
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CHAINS.map((chain) => {
                const isSelected = selectedChains.includes(chain);
                return (
                  <button
                    key={chain}
                    type="button"
                    onClick={() => toggleChain(chain)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {chain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Acceptable APY Slider */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1.5">
              <span>Minimum Acceptable APY</span>
              <span className="text-emerald-400 font-bold">{minApy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={minApy}
              onChange={(e) => setMinApy(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Duration Months */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1.5">
              <span>Investment Duration Horizon</span>
              <span className="text-white font-bold">{durationMonths} Months</span>
            </div>
            <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
              {[3, 6, 12, 36].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 rounded-xl border transition-all ${
                    durationMonths === m
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runOptimization}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs tracking-wider transition-all shadow-glow-emerald flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Computing Efficient Frontier...' : 'Re-Run Optimization'}</span>
          </button>
        </div>

        {/* Right: Optimization Outputs & Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Output Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 rounded-xl text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Weighted APY</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {metrics?.weightedPortfolioApy || 7.35}%
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Est. Annual Return</span>
              <div className="text-xl font-bold text-white mt-1">
                +${(metrics?.estimatedAnnualYieldUsd || 18375).toLocaleString()}
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Portfolio Risk</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {metrics?.portfolioRiskScore || 86}/100
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Diversification</span>
              <div className="text-xl font-bold text-white mt-1">
                {metrics?.diversificationScore || 92}/100
              </div>
            </div>
          </div>

          {/* Allocation Breakdown and Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white font-sans">
                Recommended Allocation Breakdown
              </h2>
              <span className="text-xs font-mono text-emerald-400">
                Diversified Across {allocations.length} Protocols
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Pie Visual (5 cols) */}
              <div className="md:col-span-5 h-[200px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocations}
                      dataKey="percentage"
                      nameKey="protocolName"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {allocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                      formatter={(val: any) => [`${val}%`, 'Allocation']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Allocation List (7 cols) */}
              <div className="md:col-span-7 space-y-2.5 font-mono text-xs">
                {allocations.map((alloc, idx) => (
                  <div
                    key={alloc.protocolName}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{alloc.protocolName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({alloc.category})</span>
                        </div>
                        <span className="text-[11px] text-emerald-400">{alloc.apy}% APY</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">{alloc.percentage}%</div>
                      <div className="text-[11px] text-slate-400">
                        ${alloc.allocatedAmountUsd.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cumulative Projected Growth Over Time */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-white font-sans">
                  Projected Yield Curve ({durationMonths} Months)
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Compounded returns across conservative, expected, and aggressive scenarios
                </p>
              </div>
            </div>

            <div className="h-[240px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectedCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="optExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="monthLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any) => [`+$${Number(val).toLocaleString()}`, 'Yield Earned']}
                  />
                  <Area
                    type="monotone"
                    dataKey="expectedReturnUsd"
                    name="Expected Return"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#optExpGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="conservativeReturnUsd"
                    name="Bearish Case (-15%)"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="aggressiveReturnUsd"
                    name="Bullish Case (+20%)"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deploy Strategy Action Banner */}
          {deploySuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{deploySuccess}</span>
            </div>
          ) : (
            <div className="p-5 rounded-2xl glass-panel border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white font-sans text-sm">Deploy Optimized Strategy</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Allocate ${parseFloat(investmentAmount || '0').toLocaleString()} across these {allocations.length} protocols into your active treasury.
                </p>
              </div>

              <button
                onClick={handleDeploy}
                disabled={isDeploying || allocations.length === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-2 shadow-glow-emerald transition-all disabled:opacity-50"
              >
                <span>{isDeploying ? 'Deploying to Portfolio...' : 'Deploy to Portfolio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
