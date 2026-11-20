'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  ShieldAlert,
  Sliders,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Protocol Explorer', href: '/protocols', icon: Layers },
    { name: 'Risk Analysis', href: '/risk-analysis', icon: ShieldAlert },
    { name: 'Yield Optimizer', href: '/optimizer', icon: Sliders, highlight: true },
    { name: 'My Portfolio', href: '/portfolio', icon: Wallet },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Treasury Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar drawer / container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-lg flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.highlight && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-black font-bold">
                    AI Auto
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Institutional Treasury Snapshot Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="glass-panel p-3.5 rounded-xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-mono text-[11px]">Treasury Status</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] text-slate-400">Net Valuation:</span>
                <span className="font-semibold text-white">
                  ${(user?.portfolioStats?.currentValue || 268420).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] text-slate-400">Weighted APY:</span>
                <span className="font-semibold text-emerald-400">
                  {user?.portfolioStats?.weightedApy || 7.35}%
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] text-slate-400">Safety Score:</span>
                <span className="font-semibold text-cyan-400">
                  {user?.portfolioStats?.averageRiskScore || 84}/100
                </span>
              </div>
            </div>

            <Link
              href="/optimizer"
              onClick={onClose}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all font-mono"
            >
              <span>Optimize Yield</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
