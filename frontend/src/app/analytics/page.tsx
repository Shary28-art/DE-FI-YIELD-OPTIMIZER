'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '@/lib/api';
import { AnalyticsData } from '@/types';
import { MetricCard } from '@/components/MetricCard';
import { RiskBadge } from '@/components/RiskBadge';
import { TrendingUp, BarChart3, ScatterChart as ScatterIcon, Layers, ShieldCheck, Globe } from 'lucide-react';

const PIE_COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.getAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const apyComparison = data?.apyComparison || [];
  const riskVsReturn = data?.riskVsReturn || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const chainDominance = data?.chainDominance || [];
  const macroTrends = data?.macroTrends || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Institutional Market Analytics
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Recharts Visual Engine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Cross-protocol yield comparative curves, risk-return scatter plots, TVL ecosystem distributions, and macro APY trajectories.
        </p>
      </div>

      {/* Top Ecosystem Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Monitored TVL"
          value={`$${(((data?.totalEcosystemTvl || 68450000000) / 1e9)).toFixed(2)}B`}
          subValue="Across 6 Major Blockchains"
          icon={Layers}
          accentColor="emerald"
        />

        <MetricCard
          title="Monitored Protocols"
          value={`${data?.totalProtocolsMonitored || 11} Protocols`}
          subValue="100% On-Chain Bytecode Audited"
          icon={ShieldCheck}
          accentColor="cyan"
        />

        <MetricCard
          title="Peak Protocol APY"
          value="14.80%"
          subValue="Pendle Finance (Derivatives)"
          change="+14.8% APY"
          isPositive={true}
          icon={TrendingUp}
          accentColor="blue"
        />

        <MetricCard
          title="Ethereum Layer 1 Share"
          value={`${chainDominance[0]?.percentage || 65.4}%`}
          subValue="Total Capital Dominance"
          icon={Globe}
          accentColor="purple"
        />
      </div>

      {/* Risk vs Return Scatter Plot (Capital Allocation / Efficient Frontier) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans flex items-center gap-2">
              <ScatterIcon className="w-5 h-5 text-emerald-400" />
              Risk vs Return Capital Allocation Plot (Efficient Frontier)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              X-Axis: Risk Score (Higher = Safer) • Y-Axis: APY (%) • Bubble Size: Total Value Locked ($ TVL)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            Top Right = Optimal Safe Yield
          </span>
        </div>

        <div className="h-[340px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="Risk Score"
                unit="/100"
                domain={[60, 100]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="APY"
                unit="%"
                domain={[0, 18]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />
              <ZAxis type="number" dataKey="z" range={[80, 500]} name="TVL Factor" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs shadow-xl space-y-1">
                        <div className="font-bold text-white text-sm">{d.name}</div>
                        <div className="text-emerald-400">APY: {d.y}%</div>
                        <div className="text-cyan-400">Safety Score: {d.x}/100 ({d.riskLevel} Risk)</div>
                        <div className="text-slate-300">TVL: {d.tvlFormatted}</div>
                        <div className="text-slate-400 text-[10px]">Category: {d.category}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="DeFi Protocols" data={riskVsReturn} fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* APY Comparison Bar Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Cross-Protocol APY Yield Comparison
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ranked comparison of current annualized yield percentage
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Yield Ranked
          </span>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={apyComparison} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(val: any) => [`${val}% APY`, 'Current Yield']}
              />
              <Bar dataKey="apy" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 12-Month Macro TVL Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Macro TVL Trends (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-sans">
              12-Month Ecosystem TVL & Average APY Trajectory
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Aggregate Total Value Locked ($B) growth and baseline yields
            </p>
          </div>

          <div className="h-[270px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={macroTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="macroTvlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}B`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any, name: any) => [
                    name === 'tvlBillions' ? `$${val} Billion` : `${val}%`,
                    name === 'tvlBillions' ? 'Ecosystem TVL' : 'Average APY',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="tvlBillions"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#macroTvlGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chain Dominance (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-sans">Blockchain Network Dominance</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Share of total locked capital</p>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chainDominance}
                  dataKey="tvl"
                  nameKey="chain"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {chainDominance.map((entry, index) => (
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
                  formatter={(val: any) => [`$${((Number(val) || 0) / 1e9).toFixed(2)}B`, 'TVL']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {chainDominance.map((c, idx) => (
              <div key={c.chain} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300">{c.chain}</span>
                </div>
                <span className="font-bold text-white">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
