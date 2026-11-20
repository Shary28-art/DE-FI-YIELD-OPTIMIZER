'use client';

import React from 'react';
import { RiskLevel } from '@/types';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score = 85,
  size = 'md',
  showDetails = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let color = '#10B981'; // Emerald
  let level: RiskLevel = 'Low';
  let zoneText = 'Safe Institutional';
  let description = 'Highest tier security with deep liquidity & proven track record.';

  if (clampedScore < 40) {
    color = '#EF4444';
    level = 'Critical';
    zoneText = 'Critical Risk';
    description = 'High vulnerability, unaudited contracts, or extreme centralization.';
  } else if (clampedScore < 60) {
    color = '#F59E0B';
    level = 'High';
    zoneText = 'Elevated Risk';
    description = 'High APY volatility, recent code updates, or moderate liquidity depth.';
  } else if (clampedScore < 80) {
    color = '#3B82F6';
    level = 'Moderate';
    zoneText = 'Standard Yield';
    description = 'Adequate audit backing with solid liquidity fundamentals.';
  }

  // Circular gauge calculations
  const dimension = size === 'sm' ? 100 : size === 'lg' ? 220 : 160;
  const strokeWidth = size === 'sm' ? 8 : size === 'lg' ? 14 : 12;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc for gauge look
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90 drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]"
        >
          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center">
          <span
            className={`font-mono font-bold tracking-tight text-white ${
              size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-3xl'
            }`}
          >
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3">
          <div
            className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block font-mono"
            style={{ backgroundColor: `${color}18`, color: color, border: `1px solid ${color}40` }}
          >
            {level} Risk • {zoneText}
          </div>
          {size !== 'sm' && (
            <p className="text-xs text-slate-400 max-w-[240px] mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
