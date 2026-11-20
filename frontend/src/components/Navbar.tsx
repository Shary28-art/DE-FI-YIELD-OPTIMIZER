'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Shield, Sparkles, UserCheck, LogOut, Menu, X, ExternalLink, Zap } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-glow-emerald">
              <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Shield className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  AEGIS<span className="text-emerald-400">.DEFI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  TREASURY
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 -mt-0.5">
                Yield Optimizer & Risk-Scoring Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live Financial Metrics Bar (Desktop) */}
        <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Total Monitored TVL:</span>
            <span className="font-bold text-white">$68.45B</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Avg Benchmark APY:</span>
            <span className="font-bold text-emerald-400">7.35%</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Audit Verifier:</span>
            <span className="font-semibold text-cyan-400">100% On-Chain</span>
          </div>
        </div>

        {/* Right: User Status & Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[150px]">
                  {user.organization || 'Institutional Treasury'}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-black font-mono">
                {user.name?.charAt(0) || 'U'}
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoLogin()}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all font-mono"
              >
                <Zap className="w-3.5 h-3.5" />
                1-Click Demo Treasury
              </button>
              <Link
                href="/login"
                className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
