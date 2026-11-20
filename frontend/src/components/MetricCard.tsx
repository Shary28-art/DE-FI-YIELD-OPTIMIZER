import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: string | number;
  isPositive?: boolean;
  icon?: LucideIcon;
  badge?: string;
  accentColor?: 'emerald' | 'cyan' | 'blue' | 'amber' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  change,
  isPositive = true,
  icon: Icon,
  badge,
  accentColor = 'emerald',
}) => {
  const accentClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }[accentColor];

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-slate-700 hover:shadow-card-subtle">
      {/* Background ambient subtle glow */}
      <div
        className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{
          background:
            accentColor === 'emerald'
              ? '#10B981'
              : accentColor === 'cyan'
              ? '#06B6D4'
              : accentColor === 'blue'
              ? '#3B82F6'
              : '#F59E0B',
        }}
      />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${accentClasses}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={`font-mono font-medium flex items-center gap-0.5 ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
        {subValue && <span className="text-slate-400">{subValue}</span>}
      </div>
    </div>
  );
};
