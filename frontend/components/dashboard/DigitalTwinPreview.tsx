'use client';

import React, { useState } from 'react';
import { Cpu, ArrowUpRight, TrendingDown, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatRupees } from '../economic-impact/EconomicKPIs';

interface DigitalTwinPreviewProps {
  totalViolations: number;
  dailyLoss: number;
  avgCapacityLoss: number;
  isLoading: boolean;
}

export default function DigitalTwinPreview({
  totalViolations,
  dailyLoss,
  avgCapacityLoss,
  isLoading,
}: DigitalTwinPreviewProps) {
  const [reduction, setReduction] = useState<number>(10); // default to 10%

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 animate-pulse" />
    );
  }

  // Calculate simulated parameters
  // Annualized savings: dailyLoss * 365 * (reduction / 100)
  const annualSavings = dailyLoss * 365 * (reduction / 100);
  const dailySavings = dailyLoss * (reduction / 100);
  
  // Capacity recovery potential (e.g. 0.45% recovery per 1% violation reduction)
  const capacityRecovery = (reduction * 0.45).toFixed(1);
  
  // Congestion reduction potential (e.g. 0.6% congestion reduction per 1% violation reduction)
  const congestionReduction = (reduction * 0.6).toFixed(1);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Digital Twin Simulation Panel
            </h3>
          </div>
          <Link
            href="/digital-twin"
            className="text-[10px] font-bold text-emerald-400 hover:text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-1 transition-colors"
          >
            <span>View Full Simulation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Model targeted reduction levels and evaluate citywide congestion and economic recovery metrics
        </p>

        {/* Current Metrics Box */}
        <div className="grid grid-cols-3 gap-3 text-center mb-5 font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
            <span className="text-[8px] text-slate-500 uppercase font-bold">Current Violations</span>
            <p className="text-xs font-black text-slate-100 mt-0.5">{totalViolations.toLocaleString()}</p>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
            <span className="text-[8px] text-slate-500 uppercase font-bold">Daily Econ Loss</span>
            <p className="text-xs font-black text-rose-400 mt-0.5">{formatRupees(dailyLoss)}</p>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
            <span className="text-[8px] text-slate-500 uppercase font-bold">Avg Capacity Loss</span>
            <p className="text-xs font-black text-amber-500 mt-0.5">{avgCapacityLoss.toFixed(1)}%</p>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2 mb-5 font-mono">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-400 uppercase">Target Violation Reduction</span>
            <span className="text-emerald-400 text-xs font-black">{reduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={reduction}
            onChange={(e) => setReduction(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase">
            <span>0% (Baseline)</span>
            <span>25% (Target)</span>
            <span>50% (Max Enforcement)</span>
          </div>
        </div>

        {/* Simulated Impact Indicators */}
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 border-b border-emerald-850/60 pb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Simulated Operational Recovery</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold">Potential Savings</span>
              <p className="text-sm font-black text-slate-100">{formatRupees(dailySavings)}/day</p>
              <p className="text-[8px] text-emerald-400/80 font-bold">{formatRupees(annualSavings)}/yr</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold">Capacity Recovery</span>
              <p className="text-sm font-black text-slate-100">+{capacityRecovery}%</p>
              <p className="text-[8px] text-slate-500 font-bold">Reclaimed Lanes</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-500 uppercase font-bold">Congestion Relief</span>
              <p className="text-sm font-black text-emerald-400">-{congestionReduction}%</p>
              <p className="text-[8px] text-slate-500 font-bold">Flow Multiplier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
