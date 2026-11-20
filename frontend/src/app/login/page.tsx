'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Zap, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    try {
      const ok = await demoLogin();
      if (ok) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Demo login initialization error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand / Logo */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-glow-emerald mb-3">
            <div className="w-full h-full bg-[#0B0F19] rounded-[15px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Institutional Treasury Sign In
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Access your verified portfolio, risk scores, and yield optimizer
          </p>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="glass-panel p-4 rounded-2xl border-emerald-500/40 bg-emerald-950/20 text-center space-y-2">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
            Instant Evaluation Session
          </span>
          <p className="text-xs text-slate-300">
            Pre-loaded with $268k institutional portfolio and complete 6-factor risk analysis data.
          </p>
          <button
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow-emerald"
          >
            <Zap className="w-4 h-4" />
            <span>Launch 1-Click Demo Treasury</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="bg-[#0B0F19] px-3 text-[10px] uppercase font-mono text-slate-500 relative">
            Or Sign In With Credentials
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="treasury@institution.fi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs tracking-wider transition-all border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Authorization...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center font-mono text-xs text-slate-400">
          <span>Need an institutional account? </span>
          <Link href="/register" className="text-emerald-400 hover:underline font-semibold">
            Register Treasury
          </Link>
        </div>
      </div>
    </div>
  );
}
