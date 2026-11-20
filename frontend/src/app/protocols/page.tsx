'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  ExternalLink,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Protocol } from '@/types';
import { RiskBadge } from '@/components/RiskBadge';

const CHAINS = ['All', 'Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Base'];
const CATEGORIES = ['All', 'Lending', 'DEX', 'Liquid Staking', 'Yield Aggregator', 'CDP / Stablecoin', 'Derivatives'];
const RISK_LEVELS = ['All', 'Low', 'Moderate', 'High', 'Critical'];

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [minApy, setMinApy] = useState<number>(0);
  const [sortBy, setSortBy] = useState('tvl_desc');

  const fetchProtocols = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProtocols({
        search: searchTerm || undefined,
        chain: selectedChain !== 'All' ? selectedChain : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        riskLevel: selectedRiskLevel !== 'All' ? selectedRiskLevel : undefined,
        minApy: minApy > 0 ? minApy : undefined,
        sortBy,
      });

      if (res.success && res.protocols) {
        setProtocols(res.protocols);
      }
    } catch (err) {
      console.error('Failed to load protocols:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, [searchTerm, selectedChain, selectedCategory, selectedRiskLevel, minApy, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Protocol Explorer
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {protocols.length} Verified Protocols
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional directory of audited DeFi protocols with real-time TVL, APY yields, and 6-factor risk metrics.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Control Center */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        {/* Top search and sort bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by protocol name, symbol, or description (e.g. Aave, Lido, Curve)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="tvl_desc">TVL: High to Low</option>
              <option value="tvl_asc">TVL: Low to High</option>
              <option value="apy_desc">APY: Highest Yield First</option>
              <option value="apy_asc">APY: Lowest First</option>
              <option value="risk_desc">Risk Score: Safest First</option>
              <option value="risk_asc">Risk Score: Lowest First</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Chain Dropdown */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Network
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {CHAINS.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Dropdown */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Risk Level
            </label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {RISK_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'All Risk Levels' : `${lvl} Risk`}
                </option>
              ))}
            </select>
          </div>

          {/* Min APY Range */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1">
              <span>Min APY</span>
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
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocols.map((proto) => (
            <div
              key={proto.slug}
              className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                      <img src={proto.logo} alt={proto.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-white text-base leading-tight">{proto.name}</h2>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {proto.symbol}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{proto.category}</span>
                    </div>
                  </div>
                  <RiskBadge level={proto.riskLevel} score={proto.riskScore} size="sm" />
                </div>

                <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                  {proto.description}
                </p>

                {/* Quantitative Metric Grid */}
                <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-center">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Current APY</span>
                    <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                      {proto.currentApy}%
                    </span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Total TVL</span>
                    <span className="text-white font-bold text-sm block mt-0.5">
                      ${((proto.tvl || 0) / 1e9).toFixed(2)}B
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Security</span>
                    <span className="text-cyan-400 font-bold text-sm block mt-0.5">
                      {proto.securityScore}/100
                    </span>
                  </div>
                </div>

                {/* Audit and Specs badges */}
                <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-[11px] text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {proto.auditCount} Verified Audits
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Age: {proto.protocolAgeYears} yrs
                  </span>
                </div>

                {/* Chains */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proto.chains.map((chain) => (
                    <span
                      key={chain}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {chain}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400/90 uppercase">
                  {proto.smartContractDetails?.upgradeability || 'Timelocked'}
                </span>
                <Link
                  href={`/protocols/${proto.slug}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200 text-xs font-mono font-semibold transition-all inline-flex items-center gap-1"
                >
                  <span>Full Risk Specs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-2xl p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Protocol</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Networks</th>
                  <th className="pb-3">Current APY</th>
                  <th className="pb-3">TVL</th>
                  <th className="pb-3">Liquidity Depth</th>
                  <th className="pb-3">Audits Verified</th>
                  <th className="pb-3">Risk Assessment</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {protocols.map((proto) => (
                  <tr key={proto.slug} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden">
                          <img src={proto.logo} alt={proto.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{proto.name}</div>
                          <div className="text-[11px] text-slate-400">{proto.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300">{proto.category}</td>
                    <td className="py-3.5">
                      <div className="flex gap-1">
                        {proto.chains.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                        {proto.chains.length > 2 && (
                          <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            +{proto.chains.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-emerald-400 font-bold text-sm">
                      {proto.currentApy}%
                    </td>
                    <td className="py-3.5 text-white font-bold">
                      ${((proto.tvl || 0) / 1e9).toFixed(2)}B
                    </td>
                    <td className="py-3.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px]">
                        {proto.liquidityStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-cyan-400 font-semibold">
                      {proto.auditCount} Audits
                    </td>
                    <td className="py-3.5">
                      <RiskBadge level={proto.riskLevel} score={proto.riskScore} size="sm" />
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <Link
                        href={`/protocols/${proto.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200 text-[11px] font-semibold transition-all inline-block"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
