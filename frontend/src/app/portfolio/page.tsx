'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  Clock,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  CheckCircle2,
  X,
  Layers,
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
} from 'recharts';
import { api } from '@/lib/api';
import { PortfolioData, Investment, Transaction, Protocol } from '@/types';
import { MetricCard } from '@/components/MetricCard';
import { RiskBadge } from '@/components/RiskBadge';
import { useAuth } from '@/lib/authContext';

const PIE_COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function PortfolioPage() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Withdraw Modal
  const [withdrawTarget, setWithdrawTarget] = useState<Investment | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Add Position Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProtoSlug, setSelectedProtoSlug] = useState('aave');
  const [depositAmount, setDepositAmount] = useState('25000');
  const [depositAsset, setDepositAsset] = useState('USDC');

  const fetchPortfolioData = async () => {
    try {
      setIsRefreshing(true);
      const [portRes, protoRes] = await Promise.all([
        api.getPortfolio(),
        api.getProtocols(),
      ]);

      if (portRes.success) {
        setData(portRes);
      }
      if (protoRes.success) {
        setProtocols(protoRes.protocols);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawTarget) return;

    try {
      setIsSubmitting(true);
      const res = await api.withdrawInvestment({
        investmentId: withdrawTarget._id || withdrawTarget.id,
        withdrawAmount: withdrawAmount ? parseFloat(withdrawAmount) : undefined,
      });

      if (res.success) {
        setActionSuccess(res.message);
        await refreshUser();
        await fetchPortfolioData();
        setTimeout(() => {
          setWithdrawTarget(null);
          setWithdrawAmount('');
          setActionSuccess('');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProto = protocols.find((p) => p.slug === selectedProtoSlug);
    if (!targetProto) return;

    try {
      setIsSubmitting(true);
      const res = await api.addInvestment({
        protocolId: targetProto._id || targetProto.id || targetProto.slug,
        amount: parseFloat(depositAmount),
        asset: depositAsset,
        chain: targetProto.chains[0] || 'Ethereum',
      });

      if (res.success) {
        setActionSuccess(res.message);
        await refreshUser();
        await fetchPortfolioData();
        setTimeout(() => {
          setIsAddModalOpen(false);
          setActionSuccess('');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = data?.summary || {
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

  const investments = data?.investments || [];
  const protocolAllocations = data?.protocolAllocations || [];
  const assetDistribution = data?.assetDistribution || [];
  const growthHistory = data?.growthHistory || [];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Treasury Portfolio Management
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active Allocations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time positions, asset distribution, profit/loss reconciliation, and execution history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center gap-1.5 shadow-glow-emerald transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deposit Capital</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Portfolio Value"
          value={`$${summary.totalPortfolioValue.toLocaleString()}`}
          subValue={`24h Yield: +$${summary.performance24h.dailyYieldAccruedUsd}`}
          change={`+${summary.performance24h.percentageChange}%`}
          isPositive={true}
          icon={Wallet}
          accentColor="emerald"
        />

        <MetricCard
          title="Net Profit / Loss (PnL)"
          value={`+$${summary.netProfitLoss.toLocaleString()}`}
          subValue={`Total Rewards Claimed`}
          change={`+${summary.netProfitLossPercent}%`}
          isPositive={true}
          icon={TrendingUp}
          accentColor="cyan"
        />

        <MetricCard
          title="Deposited Principal"
          value={`$${summary.totalInvested.toLocaleString()}`}
          subValue={`Active in ${investments.length} Protocols`}
          icon={Layers}
          accentColor="blue"
        />

        <MetricCard
          title="Weighted Portfolio APY"
          value={`${summary.weightedApy}%`}
          subValue={`Est. Return: +$${summary.estimatedAnnualYieldUsd.toLocaleString()}/yr`}
          icon={DollarSign}
          accentColor="emerald"
        />
      </div>

      {/* Charts Grid: Growth & Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Curve (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Portfolio Performance & Compounded Yield
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Valuation history vs baseline deposited capital
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              30-Day Growth
            </span>
          </div>

          <div className="h-[270px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="portValGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
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
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#portValGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Pie Chart (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-sans">Protocol-Wise Allocation</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Risk distribution</p>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolAllocations}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {protocolAllocations.map((entry, index) => (
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
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {protocolAllocations.map((p, idx) => (
              <div key={p.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="font-bold text-white">{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Investments Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-sans">Current Treasury Positions</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live protocol positions with withdrawal controls
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {investments.length} Active Allocations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Protocol</th>
                <th className="pb-3">Asset & Chain</th>
                <th className="pb-3">Invested Principal</th>
                <th className="pb-3">Current Valuation</th>
                <th className="pb-3">Earned Yield</th>
                <th className="pb-3">Current APY</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3 text-right pr-2">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {investments.map((inv) => (
                <tr key={inv._id || inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden">
                        <img src={inv.protocolLogo} alt={inv.protocolName} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{inv.protocolName}</div>
                        <div className="text-[10px] text-slate-400">{inv.strategyName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="text-white font-semibold">{inv.assetSymbol}</div>
                    <span className="text-[10px] text-slate-400">{inv.chain}</span>
                  </td>
                  <td className="py-3.5 text-white font-medium">
                    ${inv.amountInvested.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-white font-bold">
                    ${inv.currentValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-emerald-400 font-bold">
                    +${inv.earnedYield.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-emerald-400 font-bold text-sm">
                    {inv.currentApy}%
                  </td>
                  <td className="py-3.5">
                    <RiskBadge level={inv.riskLevel} score={inv.riskScore} size="sm" />
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => {
                        setWithdrawTarget(inv);
                        setWithdrawAmount(inv.currentValue.toString());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 border border-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction & Withdrawal History Log */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-sans">Execution & Settlement History</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              On-chain deposits, withdrawals, and strategy settlements
            </p>
          </div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Type</th>
                <th className="pb-3">Protocol</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Network</th>
                <th className="pb-3">Transaction Hash</th>
                <th className="pb-3">Settlement</th>
                <th className="pb-3 text-right pr-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTransactions.map((tx) => (
                <tr key={tx._id || tx.id || tx.txHash} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 text-white font-semibold">{tx.protocolName}</td>
                  <td className="py-3 text-white font-bold">
                    ${tx.amount.toLocaleString()} {tx.asset}
                  </td>
                  <td className="py-3 text-slate-400">{tx.chain}</td>
                  <td className="py-3 text-cyan-400 text-[11px] font-mono">
                    {tx.txHash ? `${tx.txHash.substring(0, 10)}...${tx.txHash.substring(tx.txHash.length - 6)}` : '0x7a8...9f1'}
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 text-slate-400 text-[11px]">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setWithdrawTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-sans mb-1">
              Withdraw from {withdrawTarget.protocolName}
            </h3>
            <p className="text-slate-400 text-[11px] mb-4">
              Current Available Balance: ${withdrawTarget.currentValue.toLocaleString()} {withdrawTarget.assetSymbol}
            </p>

            {actionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">
                    Redemption Amount (USD)
                  </label>
                  <input
                    type="number"
                    max={withdrawTarget.currentValue}
                    min="1"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <div className="flex justify-end gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount((withdrawTarget.currentValue * 0.5).toString())}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(withdrawTarget.currentValue.toString())}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 hover:text-white"
                    >
                      100% (Max)
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Gas Fee:</span>
                    <span className="text-white">~$4.20</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Settlement Time:</span>
                    <span className="text-emerald-400">Immediate</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Executing Redemption...' : 'Confirm Withdrawal'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Position Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-sans mb-1">
              Deposit Treasury Capital
            </h3>
            <p className="text-slate-400 text-[11px] mb-4">
              Allocate funds to an audited DeFi protocol
            </p>

            {actionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleAddInvestment} className="space-y-4">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">
                    Select Protocol
                  </label>
                  <select
                    value={selectedProtoSlug}
                    onChange={(e) => setSelectedProtoSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {protocols.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.currentApy}% APY • Score: {p.riskScore})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">
                    Deposit Amount (USD)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">
                    Asset
                  </label>
                  <select
                    value={depositAsset}
                    onChange={(e) => setDepositAsset(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="USDC">USDC (Circle)</option>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="USDS">USDS (Sky / Maker)</option>
                    <option value="ETH">ETH / WETH</option>
                    <option value="wstETH">wstETH (Lido)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming Deposit...' : 'Confirm Allocation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
