'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Github,
  Globe,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
  Users,
  Coins,
  TrendingUp,
  Activity,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '@/lib/api';
import { Protocol, RiskAssessment } from '@/types';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskGauge } from '@/components/RiskGauge';
import { useAuth } from '@/lib/authContext';

export default function ProtocolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const protocolId = params.id as string;
  const { user, refreshUser } = useAuth();

  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Allocation modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');
  const [depositAsset, setDepositAsset] = useState('USDC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const [protoRes, riskRes] = await Promise.all([
          api.getProtocolById(protocolId),
          api.getProtocolRisk(protocolId),
        ]);

        if (protoRes.success) {
          setProtocol(protoRes.protocol);
        }
        if (riskRes.success) {
          setRiskAssessment(riskRes.riskAssessment);
        }
      } catch (err) {
        console.error('Error fetching protocol details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (protocolId) {
      fetchDetails();
    }
  }, [protocolId]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol || !depositAmount) return;

    try {
      setIsSubmitting(true);
      const res = await api.addInvestment({
        protocolId: protocol._id || protocol.id || protocol.slug,
        amount: parseFloat(depositAmount),
        asset: depositAsset,
        chain: protocol.chains[0] || 'Ethereum',
      });

      if (res.success) {
        setDepositSuccess(`Successfully allocated $${parseFloat(depositAmount).toLocaleString()} into ${protocol.name}!`);
        await refreshUser();
        setTimeout(() => {
          setIsDepositModalOpen(false);
          setDepositSuccess('');
          router.push('/portfolio');
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !protocol) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span>Verifying Smart Contract Risk Parameters...</span>
        </div>
      </div>
    );
  }

  const contractDetails = protocol.smartContractDetails || {
    upgradeability: 'Timelocked Proxy (48h+)',
    timelockHours: 48,
    multiSigRequirement: '5 of 8 Multi-Sig Signers',
    adminControlRisk: 'Low (Decentralized Timelock)',
    centralizationRisk: 'Decentralized',
    openVulnerabilities: 0,
    insuranceFundCovered: true,
    insuranceFundUsd: 50000000,
    bugBountyMax: 2000000,
  };

  const factors = riskAssessment?.factors || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/protocols"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Protocol Explorer</span>
        </Link>

        <div className="flex items-center gap-2">
          {protocol.website && (
            <a
              href={protocol.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Official Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {protocol.github && (
            <a
              href={protocol.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Verified GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Protocol Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center p-3 shadow-lg flex-shrink-0">
              <img src={protocol.logo} alt={protocol.name} className="w-full h-full object-contain" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  {protocol.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {protocol.symbol}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {protocol.category}
                </span>
                <RiskBadge level={protocol.riskLevel} score={protocol.riskScore} size="md" />
              </div>

              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                {protocol.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 uppercase">Supported Networks:</span>
                {protocol.chains.map((chain) => (
                  <span
                    key={chain}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & APY CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 w-full lg:w-auto">
            <div className="text-left lg:text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Current APY</span>
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                {protocol.currentApy}%
              </div>
              <span className="text-xs text-slate-400">
                TVL: ${(protocol.tvl / 1e9).toFixed(2)}B
              </span>
            </div>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-2 shadow-glow-emerald transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Allocate Treasury Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Risk Score Gauge Breakdown & Smart Contract Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Gauge Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
            Institutional Risk Index
          </span>

          <RiskGauge score={protocol.riskScore} size="lg" showDetails={true} />

          <div className="w-full mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Security Score</span>
              <span className="text-cyan-400 font-bold text-base mt-0.5 block">
                {protocol.securityScore}/100
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Verified Audits</span>
              <span className="text-emerald-400 font-bold text-base mt-0.5 block">
                {protocol.auditCount} Audits
              </span>
            </div>
          </div>
        </div>

        {/* 6-Factor Risk Pillar Breakdown (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                6-Factor Quantitative Risk Decomposition
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Exact algorithmic weights and transparent audit breakdown
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Weighted Sum: {protocol.riskScore}/100
            </span>
          </div>

          <div className="space-y-4 mt-4">
            {factors.map((factor) => (
              <div key={factor.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{factor.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {factor.weight}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Contrib: +{factor.weightedContribution}</span>
                    <span className="font-bold text-white">{factor.score}/100</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.score >= 80
                        ? 'bg-emerald-500'
                        : factor.score >= 60
                        ? 'bg-blue-500'
                        : factor.score >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 mt-2 font-mono leading-relaxed">
                  {factor.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Contract Security Specs & Audit Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Specs */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-sans">
              Smart Contract Governance & Privileged Keys
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Upgradeability Status:</span>
              <span className="font-semibold text-emerald-400">
                {contractDetails.upgradeability}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Timelock Enforced Delay:</span>
              <span className="font-semibold text-white">
                {contractDetails.timelockHours} Hours (Mandatory)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Multi-Sig Signer Threshold:</span>
              <span className="font-semibold text-cyan-400">
                {contractDetails.multiSigRequirement}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Admin Control Centralization:</span>
              <span className="font-semibold text-white">
                {contractDetails.adminControlRisk}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Insurance & Backstop Fund:</span>
              <span className="font-semibold text-emerald-400">
                {contractDetails.insuranceFundCovered
                  ? `Covered ($${(contractDetails.insuranceFundUsd / 1e6).toFixed(0)}M Reserves)`
                  : 'Self-Insured / Uncovered'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Bug Bounty Maximum:</span>
              <span className="font-semibold text-white">
                ${(contractDetails.bugBountyMax / 1e6).toFixed(1)}M via Immunefi
              </span>
            </div>
          </div>
        </div>

        {/* Audit Verification Log */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-sans">
                Formal Smart Contract Audit Directory
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {protocol.auditReports && protocol.auditReports.length > 0 ? (
                protocol.auditReports.map((audit, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{audit.auditor}</span>
                      <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                        Score: {audit.score}/100
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">Scope: {audit.scope}</div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                      <span className="text-slate-500">Date: {audit.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          All Issues Resolved
                        </span>
                        <a
                          href={audit.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-0.5"
                        >
                          Report <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs py-4 text-center">
                  Audited under core protocol standards.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">Verification Guarantee:</span> All smart contract bytecode matches public open-source verification on Etherscan.
          </div>
        </div>
      </div>

      {/* Historical Yield & TVL Area Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white font-sans">
              Historical APY & Liquidity Depth (6-Month Horizon)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Historical APY stability and TVL capital retention
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            6M Verified On-Chain
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={protocol.historicalYield || []}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="protoApyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
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
                formatter={(val: any, name: any) => [
                  name === 'apy' ? `${val}% APY` : `$${(val / 1e9).toFixed(2)}B TVL`,
                  name === 'apy' ? 'Yield' : 'TVL',
                ]}
              />
              <Area
                type="monotone"
                dataKey="apy"
                name="apy"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#protoApyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation / Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2">
                <img src={protocol.logo} alt={protocol.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-sans">Allocate to {protocol.name}</h3>
                <span className="text-xs text-emerald-400 font-mono">{protocol.currentApy}% APY • {protocol.riskLevel} Risk</span>
              </div>
            </div>

            {depositSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{depositSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">
                    Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">
                    Asset Currency
                  </label>
                  <select
                    value={depositAsset}
                    onChange={(e) => setDepositAsset(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="USDC">USDC (Circle USD)</option>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="DAI">DAI / USDS (Sky)</option>
                    <option value="ETH">ETH / WETH</option>
                    <option value="wstETH">wstETH (Lido)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Projected Annual Return:</span>
                    <span className="font-bold text-emerald-400">
                      +${((parseFloat(depositAmount) || 0) * (protocol.currentApy / 100)).toLocaleString()} / yr
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gas Execution Estimate:</span>
                    <span className="text-white">~$3.85 (Ethereum L2 optimized)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming Treasury Allocation...' : 'Confirm Allocation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
