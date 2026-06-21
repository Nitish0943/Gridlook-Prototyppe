'use client';

import React from 'react';
import { ImpactSummaryResponse, SpilloverSummaryResponse, CapacityLossSummaryResponse, EconomicImpactSummaryResponse } from '../../lib/types';
import { formatRupees } from '../economic-impact/EconomicKPIs';

interface CityPerformanceGaugesProps {
  impactSummary?: ImpactSummaryResponse;
  spilloverSummary?: SpilloverSummaryResponse;
  capacityLossSummary?: CapacityLossSummaryResponse;
  economicSummary?: EconomicImpactSummaryResponse;
  isLoading: boolean;
}

interface GaugeProps {
  title: string;
  value: number;
  max: number;
  label: string;
  colorClass: string;
  colorHex: string;
  glowClass: string;
  unit?: string;
  isCurrency?: boolean;
}

function RadialGauge({ title, value, max, label, colorClass, colorHex, glowClass, unit = '', isCurrency = false }: GaugeProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  const displayValue = isCurrency ? formatRupees(value) : value.toFixed(1);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-between text-center min-h-[220px]">
      <div className="w-full flex justify-between items-center mb-2">
        <span className="text-[9px] font-black font-mono tracking-widest text-slate-500 uppercase">
          {title}
        </span>
      </div>

      <div className="relative flex items-center justify-center h-28 w-28 my-2">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Arc */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active Arc */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={colorHex}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className={`text-lg font-black text-slate-100 ${glowClass}`}>
            {displayValue}
            {unit && <span className="text-[10px] ml-0.5 text-slate-400">{unit}</span>}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">
            {label}
          </span>
        </div>
      </div>

      <div className="text-[10px] text-slate-450 font-mono mt-1">
        Index Status: <span className={`${colorClass} font-bold`}>{percentage > 70 ? 'CRITICAL' : percentage > 40 ? 'ELEVATED' : 'STABLE'}</span>
      </div>
    </div>
  );
}

export default function CityPerformanceGauges({
  impactSummary,
  spilloverSummary,
  capacityLossSummary,
  economicSummary,
  isLoading,
}: CityPerformanceGaugesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-56 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // 1. Parking Impact: average impact score / 100
  const impactVal = impactSummary?.average_impact_score ?? 0;

  // 2. Spillover Risk: average spillover score / 100
  const spilloverVal = spilloverSummary?.average_spillover_score ?? 0;

  // 3. Capacity Loss: average capacity loss percentage
  const capacityVal = capacityLossSummary?.average_capacity_loss ?? 0;

  // 4. Economic Loss: Daily loss relative to 25 Lakhs (standard high cap)
  const economicVal = economicSummary?.citywide_daily_loss ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <RadialGauge
        title="Parking Impact"
        value={impactVal}
        max={100}
        label="Avg Impact"
        colorClass="text-rose-500"
        colorHex="#ef4444"
        glowClass="shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        unit=""
      />
      <RadialGauge
        title="Spillover Risk"
        value={spilloverVal}
        max={100}
        label="Spillover Index"
        colorClass="text-cyan-400"
        colorHex="#06b6d4"
        glowClass="shadow-[0_0_10px_rgba(34,211,238,0.2)]"
        unit=""
      />
      <RadialGauge
        title="Capacity Loss"
        value={capacityVal}
        max={100}
        label="Avg Capacity Loss"
        colorClass="text-amber-500"
        colorHex="#eab308"
        glowClass="shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        unit="%"
      />
      <RadialGauge
        title="Economic Loss"
        value={economicVal}
        max={3000000} // Capped relative to ₹30 Lakhs
        label="Daily Loss"
        colorClass="text-emerald-400"
        colorHex="#10b981"
        glowClass="shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        isCurrency={true}
      />
    </div>
  );
}
