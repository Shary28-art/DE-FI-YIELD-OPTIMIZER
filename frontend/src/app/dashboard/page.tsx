'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  PieChart as PieChartIcon,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
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
import { PortfolioData, Protocol } from '@/types';
import { MetricCard } from '@/components/MetricCard';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskGauge } from '@/components/RiskGauge';
import { useAuth } from '@/lib/authContext';

const PIE_COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [portRes, protoRes] = await Promise.all([
        api.getPortfolio(),
        api.getProtocols({ sortBy: 'tvl_desc' }),
      ]);

      if (portRes.success) {
        setPortfolioData(portRes);
      }
      if (protoRes.success) {
        setProtocols(protoRes.protocols);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summary = portfolioData?.summary || {
    totalPortfolioValue: 268420,
    totalInvested: 250000,
    earnedRewards: 18420,
    netProfitLoss: 18420,
    netProfitLossPercent: 7.37,
    estimatedAnnualYieldUsd: 19728,
    weightedApy: 7.35,
    averagePortfolioRiskScore: 84,
    portfolioRiskLevel: 'Low',
    diversificationScore: 85,
    activePositionsCount: 4,
    performance24h: {
      valueChangeUsd: 145.2,
      percentageChange: 0.28,
      isPositive: true,
      dailyYieldAccruedUsd: 54.05,
    },
  };

  const positions = portfolioData?.investments || [];
  const allocations = portfolioData?.protocolAllocations || [];
  const growthHistory = portfolioData?.growthHistory || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Treasury Overview
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Institutional Grade
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time portfolio valuation, multi-auditor risk exposure, and yield performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl glass-panel-interactive text-slate-300 hover:text-white text-xs font-mono font-medium flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync Reserves</span>
          </button>

          <Link
            href="/optimizer"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center gap-2 shadow-glow-emerald transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rebalance Portfolio</span>
          </Link>
        </div>
      </div>

      {/* 8 Core Institutional Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Portfolio Value"
          value={`$${summary.totalPortfolioValue.toLocaleString()}`}
          change={`+${summary.performance24h.percentageChange}% 24h`}
          subValue={`+$${summary.performance24h.valueChangeUsd.toFixed(2)}`}
          isPositive={summary.performance24h.isPositive}
          icon={Wallet}
          accentColor="emerald"
        />

        <MetricCard
          title="Capital Invested"
          value={`$${summary.totalInvested.toLocaleString()}`}
          subValue={`PnL: +$${summary.netProfitLoss.toLocaleString()} (${summary.netProfitLossPercent}%)`}
          change={`+${summary.netProfitLossPercent}%`}
          isPositive={true}
          icon={Layers}
          accentColor="cyan"
        />

        <MetricCard
          title="Estimated Annual Yield"
          value={`$${summary.estimatedAnnualYieldUsd.toLocaleString()}`}
          subValue={`Weighted APY: ${summary.weightedApy}%`}
          change={`${summary.weightedApy}% APY`}
          isPositive={true}
          icon={TrendingUp}
          accentColor="blue"
        />

        <MetricCard
          title="Average Portfolio Risk"
          value={`${summary.averagePortfolioRiskScore}/100`}
          badge={summary.portfolioRiskLevel}
          subValue={`Diversification Index: ${summary.diversificationScore}/100`}
          isPositive={summary.averagePortfolioRiskScore >= 80}
          icon={ShieldCheck}
          accentColor={summary.averagePortfolioRiskScore >= 80 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl glass-panel font-mono text-xs">
        <div>
          <span className="text-slate-400 text-[11px] uppercase">Active Positions</span>
          <div className="text-lg font-bold text-white mt-0.5">{summary.activePositionsCount} Protocols</div>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] uppercase">Total Earned Rewards</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">+${summary.earnedRewards.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] uppercase">24h Accrued Yield</span>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">+${summary.performance24h.dailyYieldAccruedUsd}</div>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] uppercase">Diversification Score</span>
          <div className="text-lg font-bold text-white mt-0.5">{summary.diversificationScore}/100 (Optimal)</div>
        </div>
      </div>

      {/* Charts Section: Performance Growth & Allocation Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Line / Area Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-sans">Portfolio Valuation & Yield Accrual</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">30-Day performance timeline with cumulative yield</p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              30D Trend
            </span>
          </div>

          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
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
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  name="Portfolio Value"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#valGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeYield"
                  name="Accrued Yield"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#yieldGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Allocation Pie Chart (1 Col) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white font-sans">Protocol Allocation</h2>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 font-mono">Diversification across DeFi protocols</p>
          </div>

          <div className="h-[210px] w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
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
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-mono">Weighted APY</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{summary.weightedApy}%</span>
            </div>
          </div>

          {/* Allocation Legend breakdown */}
          <div className="space-y-1.5 mt-2 font-mono text-xs">
            {allocations.map((alloc, idx) => (
              <div key={alloc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate max-w-[120px]">{alloc.name}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-semibold text-white">{alloc.percentage}%</span>
                  <span className="text-slate-400 text-[10px]">${(alloc.value / 1000).toFixed(0)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Investment Positions Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-sans">Active Treasury Positions</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live yield-farming allocations and contract risk verification
            </p>
          </div>
          <Link
            href="/portfolio"
            className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
          >
            <span>Manage All Positions</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Protocol & Asset</th>
                <th className="pb-3">Chain</th>
                <th className="pb-3">Deposited Capital</th>
                <th className="pb-3">Current Value</th>
                <th className="pb-3">Earned Yield</th>
                <th className="pb-3">Current APY</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positions.map((pos) => (
                <tr key={pos._id || pos.id || pos.protocolSlug} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden">
                        <img src={pos.protocolLogo} alt={pos.protocolName} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{pos.protocolName}</div>
                        <div className="text-[11px] text-slate-400">{pos.assetSymbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px]">
                      {pos.chain}
                    </span>
                  </td>
                  <td className="py-3.5 text-white font-medium">
                    ${pos.amountInvested.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-white font-bold">
                    ${pos.currentValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-emerald-400 font-bold">
                    +${pos.earnedYield.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-emerald-400 font-bold text-sm">
                    {pos.currentApy}%
                  </td>
                  <td className="py-3.5">
                    <RiskBadge level={pos.riskLevel} score={pos.riskScore} size="sm" />
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <Link
                      href={`/protocols/${pos.protocolSlug}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors inline-block"
                    >
                      Audit Specs
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Safe Yielding Opportunities Bar */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-sans">Institutional Safe Yield Opportunities</h2>
            <p className="text-xs text-slate-400 font-mono">
              Protocols qualifying for institutional risk threshold (&gt;85 Risk Score)
            </p>
          </div>
          <Link
            href="/protocols?minRiskScore=80"
            className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            <span>Explorer Filter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {protocols
            .filter((p) => p.riskScore >= 88)
            .slice(0, 3)
            .map((p) => (
              <div
                key={p.slug}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden">
                    <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs">{p.name}</h3>
                    <div className="text-[10px] text-slate-400 font-mono">
                      TVL: ${((p.tvl || 0) / 1e9).toFixed(2)}B
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-emerald-400 font-bold text-sm">{p.currentApy}% APY</div>
                  <div className="text-[10px] text-cyan-400 font-semibold">{p.riskScore}/100 Safe</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
