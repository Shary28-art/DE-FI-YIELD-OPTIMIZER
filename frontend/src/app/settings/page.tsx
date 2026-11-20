'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Settings,
  UserCheck,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Save,
  Globe,
  Sliders,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [organization, setOrganization] = useState(user?.organization || 'Horizon Capital DAO Treasury');
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Balanced' | 'Aggressive'>(
    user?.riskTolerance || 'Balanced'
  );
  const [preferredChains, setPreferredChains] = useState<string[]>(
    user?.preferredChains || ['Ethereum', 'Arbitrum', 'Polygon']
  );
  const [minRiskThreshold, setMinRiskThreshold] = useState<number>(75);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const toggleChain = (chain: string) => {
    if (preferredChains.includes(chain)) {
      if (preferredChains.length > 1) {
        setPreferredChains(preferredChains.filter((c) => c !== chain));
      }
    } else {
      setPreferredChains([...preferredChains, chain]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.updatePreferences({
        organization,
        riskTolerance,
        preferredChains,
      });

      if (res.success) {
        setSaveSuccess('Treasury risk preferences updated successfully.');
        await refreshUser();
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Treasury Profile & Risk Governance
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Institutional Account
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your treasury identification, risk tolerance bounds, chain permissions, and automated warning thresholds.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-sans">Institutional Organization</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Authorized Signer Name
              </label>
              <input
                type="text"
                value={user?.name || 'Sarah Lin (Chief Risk Officer)'}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || 'treasury@horizoncapital.fi'}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Organization / Treasury Entity
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Risk Governance Presets */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-sans">Default Risk Governance Preset</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Conservative', 'Balanced', 'Aggressive'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRiskTolerance(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  riskTolerance === preset
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold font-sans text-sm">{preset}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {preset === 'Conservative'
                    ? 'Score >= 80 only'
                    : preset === 'Balanced'
                    ? 'Score >= 65'
                    : 'High APY weighting'}
                </div>
              </button>
            ))}
          </div>

          {/* Preferred Networks */}
          <div className="pt-2">
            <label className="block text-slate-400 uppercase text-[10px] mb-2">
              Whitelisted Settlement Networks
            </label>
            <div className="flex flex-wrap gap-2">
              {['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Base'].map((chain) => {
                const isSelected = preferredChains.includes(chain);
                return (
                  <button
                    key={chain}
                    type="button"
                    onClick={() => toggleChain(chain)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {chain}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Automated Alert Triggers */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white font-sans">Automated Risk Safeguards</h2>
          </div>

          <div>
            <div className="flex justify-between items-center text-slate-300 mb-1.5">
              <span>Automatic Treasury Alert Threshold</span>
              <span className="text-amber-400 font-bold">Score &lt; {minRiskThreshold}/100</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={minRiskThreshold}
              onChange={(e) => setMinRiskThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Instantly notifies treasury multisig signers if any active protocol suffers an audit downgrade or liquidity run.
            </p>
          </div>
        </div>

        {/* API Keys & Webhook Integration */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Key className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white font-sans">Treasury API Key Access</h2>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Production Analytics Key</span>
              <span className="text-slate-200 font-mono text-xs font-bold">
                aegis_live_948f2b7194a08c14d9e2309
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
              Active Read/Write
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs tracking-wider transition-all shadow-glow-emerald flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Preferences...' : 'Save Treasury Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
