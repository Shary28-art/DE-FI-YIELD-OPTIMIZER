'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  TrendingUp,
  Lock,
  PieChart,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Protocol } from '@/types';
import { RiskBadge } from '@/components/RiskBadge';
import { useAuth } from '@/lib/authContext';

export default function LandingPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { demoLogin } = useAuth();

  useEffect(() => {
    const fetchTopProtocols = async () => {
      try {
        const res = await api.getProtocols({ sortBy: 'tvl_desc' });
        if (res.success && res.protocols) {
          setProtocols(res.protocols.slice(0, 6));
        }
      } catch (err) {
        console.warn('Using demo protocols fallback');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopProtocols();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Institutional Yield & Smart Contract Risk Analytics Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight font-sans">
          Autonomous Yield Optimization{' '}
          <span className="gradient-text-emerald">Backed by On-Chain Risk Scoring</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Analyze smart contract audits, liquidity depth, and protocol governance to construct
          diversified, high-alpha yield farming portfolios for institutional treasuries and professional investors.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-wide transition-all shadow-glow-emerald flex items-center gap-2 font-mono"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/optimizer"
            className="px-6 py-3.5 rounded-xl glass-panel-interactive text-white font-semibold text-sm tracking-wide flex items-center gap-2 font-mono"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Yield Optimizer</span>
          </Link>

          <button
            onClick={() => demoLogin().then(() => window.location.href = '/dashboard')}
            className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-sm font-semibold flex items-center gap-2 font-mono"
          >
            <Zap className="w-4 h-4" />
            <span>Instant Demo Session</span>
          </button>
        </div>

        {/* Live Ecosystem Stats Strip */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Monitored TVL</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">$68.45B+</div>
            <span className="text-[11px] text-emerald-400 font-mono">11 Bluechip Protocols</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Benchmark APY</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">7.35%</div>
            <span className="text-[11px] text-slate-400 font-mono">Risk-Adjusted Weighted</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Audit Reports Indexed</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">45+ Audits</div>
            <span className="text-[11px] text-slate-400 font-mono">OpenZeppelin & ToB</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400">Treasury Risk Bands</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">4 Classes</div>
            <span className="text-[11px] text-slate-400 font-mono">0–100 Normalized Engine</span>
          </div>
        </div>
      </section>

      {/* 6-Pillar Risk Engine Highlights */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
            Risk Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-sans">
            Transparent 6-Pillar Risk Scoring Algorithm
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Every protocol is evaluated dynamically across weighted quantitative metrics rather than subjective ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel-interactive p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                30% Weight
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Contract Security & Audits</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Formal verification, multi-auditor coverage (Trail of Bits, OpenZeppelin), code immutability vs proxy upgradeability, and vulnerability resolution track records.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                25% Weight
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Liquidity & Solvency Risk</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Total Value Locked depth, utilization equilibrium, exit slippage under stress, and secondary market peg resilience during market run events.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                15% Weight
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Protocol Stability & Age</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mainnet battle-testing longevity across crypto market drawdown cycles with uninterrupted liquidation solvency.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                10% Weight
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Historical Yield Performance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Separation of organic borrower demand yield vs hyper-inflationary reward emissions, analyzing APY stability variance.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                10% Weight
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Governance Decentralization</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              DAO governance token distribution, timelock duration (minimum 48h required for institutional classification), and admin key centralization.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                10% Weight
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Market Volatility Resilience</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Collateral liquidation engine response times, bad debt shortfall backstops, and behavior during black swan price shocks.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Protocols Preview */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
              Live Analytics Feed
            </span>
            <h2 className="text-3xl font-bold text-white mt-1">Tier-1 DeFi Protocols Monitored</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time risk scoring, APY yields, and TVL depth.</p>
          </div>
          <Link
            href="/protocols"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>View All Protocols</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocols.map((proto) => (
            <div
              key={proto.slug}
              className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2 overflow-hidden">
                      <img src={proto.logo} alt={proto.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{proto.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">{proto.category}</span>
                    </div>
                  </div>
                  <RiskBadge level={proto.riskLevel} score={proto.riskScore} size="sm" />
                </div>

                <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                  {proto.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Current APY</span>
                    <div className="text-emerald-400 font-bold text-base mt-0.5">
                      {proto.currentApy}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Total Value Locked</span>
                    <div className="text-white font-bold text-base mt-0.5">
                      ${((proto.tvl || 0) / 1e9).toFixed(2)}B
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {proto.chains.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {c}
                    </span>
                  ))}
                  {proto.chains.length > 3 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/40 text-slate-400">
                      +{proto.chains.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {proto.auditCount} Audits Verified
                </span>
                <Link
                  href={`/protocols/${proto.slug}`}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-mono"
                >
                  <span>Risk Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-white font-mono text-sm tracking-tight">
              AEGIS.DEFI RISK DASHBOARD
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono text-center sm:text-right">
            <span>Institutional-Grade Smart Contract & Liquidity Risk Analytics • Next.js + Express + MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
