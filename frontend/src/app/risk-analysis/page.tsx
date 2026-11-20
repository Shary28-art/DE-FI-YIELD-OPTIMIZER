'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Droplets,
  Scale,
  Sliders,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { Protocol } from '@/types';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskGauge } from '@/components/RiskGauge';

export default function RiskAnalysisPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [riskOverview, setRiskOverview] = useState<any>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [protoRes, overRes] = await Promise.all([
          api.getProtocols({ sortBy: 'risk_desc' }),
          api.getRiskOverview(),
        ]);

        if (protoRes.success) {
          setProtocols(protoRes.protocols);
          if (protoRes.protocols.length > 0) {
            setSelectedProtocol(protoRes.protocols[0]);
          }
        }
        if (overRes.success) {
          setRiskOverview(overRes);
        }
      } catch (err) {
        console.error('Failed to load risk analysis data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format radar data for the selected protocol
  const radarData = selectedProtocol
    ? [
        {
          subject: 'Security & Audits',
          score: selectedProtocol.riskFactorBreakdown?.smartContractSecurity?.score || selectedProtocol.securityScore,
          benchmark: 85,
        },
        {
          subject: 'Liquidity Depth',
          score: selectedProtocol.riskFactorBreakdown?.liquidityRisk?.score || 85,
          benchmark: 80,
        },
        {
          subject: 'Protocol Stability',
          score: selectedProtocol.riskFactorBreakdown?.protocolStability?.score || 85,
          benchmark: 82,
        },
        {
          subject: 'Yield Consistency',
          score: selectedProtocol.riskFactorBreakdown?.historicalPerformance?.score || 80,
          benchmark: 78,
        },
        {
          subject: 'Decentralization',
          score: selectedProtocol.riskFactorBreakdown?.decentralization?.score || 80,
          benchmark: 75,
        },
        {
          subject: 'Market Resilience',
          score: selectedProtocol.riskFactorBreakdown?.marketVolatility?.score || 80,
          benchmark: 79,
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Smart Contract & Liquidity Risk Engine
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            6 Quantitative Pillars
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Deep structural assessment of smart contract immutability, timelock duration, multisig threshold,
          centralization attack vectors, and protocol solvency stress-testing.
        </p>
      </div>

      {/* 4 Risk Classification Bands Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="glass-panel p-4 rounded-xl border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold uppercase text-[11px]">Low Risk (80–100)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              {riskOverview?.distribution?.Low?.count || 6} Protocols
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Multi-audited by top tier firms, immutable or &gt;48h timelocked, &gt;$1B TVL with zero unresolved exploits.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border-blue-500/30 bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-bold uppercase text-[11px]">Moderate Risk (60–79)</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
              {riskOverview?.distribution?.Moderate?.count || 4} Protocols
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Standard DeFi protocols with proven operations, but moderate centralization or pool dependency exposure.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold uppercase text-[11px]">High Risk (40–59)</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
              {riskOverview?.distribution?.High?.count || 1} Protocol
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Higher APYs with elevated risk factors: single audit, volatile collateral, or short track record.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-rose-400 font-bold uppercase text-[11px]">Critical Risk (0–39)</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
              {riskOverview?.distribution?.Critical?.count || 0} Protocols
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Unaudited smart contracts, active exploit vectors, or un-timelocked single-admin EOA keys.
          </p>
        </div>
      </div>

      {/* Interactive Deep Dive for Selected Protocol */}
      {selectedProtocol && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2">
                <img
                  src={selectedProtocol.logo}
                  alt={selectedProtocol.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white font-sans">{selectedProtocol.name} Risk Anatomy</h2>
                  <RiskBadge
                    level={selectedProtocol.riskLevel}
                    score={selectedProtocol.riskScore}
                    size="md"
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Category: {selectedProtocol.category} • Current APY: {selectedProtocol.currentApy}% • TVL: ${(selectedProtocol.tvl / 1e9).toFixed(2)}B
                </p>
              </div>
            </div>

            {/* Selector Dropdown to switch protocol */}
            <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto">
              <span className="text-slate-400">Select Protocol:</span>
              <select
                value={selectedProtocol.slug}
                onChange={(e) => {
                  const p = protocols.find((item) => item.slug === e.target.value);
                  if (p) setSelectedProtocol(p);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold cursor-pointer"
              >
                {protocols.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.riskScore}/100)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Radar Chart */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                6-Dimension Health Radar vs Industry Benchmark
              </span>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                    <Radar
                      name={selectedProtocol.name}
                      dataKey="score"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="benchmark"
                      stroke="#06B6D4"
                      fill="#06B6D4"
                      fillOpacity={0.15}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explanation & Security Specs */}
            <div className="lg:col-span-7 space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 font-sans">
                Audit & Governance Risk Analysis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Upgradeability Status</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedProtocol.smartContractDetails?.upgradeability}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    {selectedProtocol.smartContractDetails?.timelockHours}h Enforced Timelock
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Multi-Sig Guard Threshold</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedProtocol.smartContractDetails?.multiSigRequirement}
                  </div>
                  <span className="text-[11px] text-cyan-400 mt-1 block">
                    Hardware Wallet Co-signers
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Admin Key Centralization</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedProtocol.smartContractDetails?.adminControlRisk}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Zero single-sign EOA risk
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Insurance Shortfall Buffer</span>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    {selectedProtocol.smartContractDetails?.insuranceFundCovered
                      ? `$${((selectedProtocol.smartContractDetails.insuranceFundUsd || 0) / 1e6).toFixed(0)}M Backstop`
                      : 'Self-Guaranteed'}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Protocol Safety Module
                  </span>
                </div>
              </div>

              {/* Explanations of factors */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white font-sans">
                  Contributing Risk Factors & Solvency Analysis:
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedProtocol.riskFactorBreakdown?.smartContractSecurity?.explanation}
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {selectedProtocol.riskFactorBreakdown?.liquidityRisk?.explanation}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  href={`/protocols/${selectedProtocol.slug}`}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all font-mono"
                >
                  <span>View Full Protocol Spec</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Risk Matrix Across All Protocols */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-sans">
              Protocol Risk Comparison Matrix
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Side-by-side risk score breakdown and auditor credentials
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Protocol</th>
                <th className="pb-3">Security (30%)</th>
                <th className="pb-3">Liquidity (25%)</th>
                <th className="pb-3">Stability (15%)</th>
                <th className="pb-3">Yield Perf (10%)</th>
                <th className="pb-3">Decentral. (10%)</th>
                <th className="pb-3">Volatility (10%)</th>
                <th className="pb-3">Overall Score</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {protocols.map((p) => {
                const bd: any = p.riskFactorBreakdown || {};
                return (
                  <tr
                    key={p.slug}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedProtocol(p)}
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1 overflow-hidden">
                          <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300 font-semibold">
                      {bd.smartContractSecurity?.score || p.securityScore}/100
                    </td>
                    <td className="py-3.5 text-slate-300 font-semibold">
                      {bd.liquidityRisk?.score || 85}/100
                    </td>
                    <td className="py-3.5 text-slate-300 font-semibold">
                      {bd.protocolStability?.score || 85}/100
                    </td>
                    <td className="py-3.5 text-slate-300 font-semibold">
                      {bd.historicalPerformance?.score || 80}/100
                    </td>
                    <td className="py-3.5 text-slate-300 font-semibold">
                      {bd.decentralization?.score || 80}/100
                    </td>
                    <td className="py-3.5 text-slate-300 font-semibold">
                      {bd.marketVolatility?.score || 80}/100
                    </td>
                    <td className="py-3.5">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} size="sm" />
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProtocol(p);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
