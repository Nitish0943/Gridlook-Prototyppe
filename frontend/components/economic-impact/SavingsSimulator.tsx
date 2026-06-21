'use client';

import React, { useState } from 'react';
import { ShieldCheck, Coins, Sparkles } from 'lucide-react';
import { formatRupees } from './EconomicKPIs';

interface SavingsSimulatorProps {
  yearlyLoss?: number;
  isLoading: boolean;
}

export default function SavingsSimulator({ yearlyLoss = 0, isLoading }: SavingsSimulatorProps) {
  const [reduction, setReduction] = useState<number>(30); // default 30%

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="animate-pulse flex items-center text-cyan-400">
          <Coins className="w-6 h-6 mr-3" />
          <span className="font-mono text-xs tracking-widest uppercase">Calibrating Savings Simulator...</span>
        </div>
      </div>
    );
  }

  const projectedSavings = yearlyLoss * (reduction / 100);

  const reductionOptions = [10, 20, 30, 50];

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <Coins className="w-4 h-4 mr-2 text-cyan-400" />
          Enforcement Savings Simulator
        </h3>
        <span className="text-[9px] text-purple-400 font-mono uppercase bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20 flex items-center">
          <Sparkles className="w-3 h-3 mr-1" /> Sim Engine
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <p className="text-slate-400 text-xs leading-relaxed font-mono mb-4">
            Evaluate cost recovery projections by reducing violation frequencies.
            Adjust target reduction rate to estimate reclaimable municipal losses:
          </p>

          {/* Tab Selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {reductionOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setReduction(opt)}
                className={`py-2 rounded-lg border font-mono font-bold text-xs transition-all ${
                  reduction === opt
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:bg-slate-900 hover:text-slate-350'
                }`}
              >
                -{opt}%
              </button>
            ))}
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Conservative</span>
              <span className="text-cyan-450 font-bold">{reduction}% Reduction Target</span>
              <span>Aggressive</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="5"
              value={reduction}
              onChange={(e) => setReduction(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
            />
          </div>
        </div>

        {/* Projection Box */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex items-center space-x-4 hover:border-cyan-800/40 transition-colors shadow-inner">
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/30 rounded-lg text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider font-mono">
              Projected Annual Savings
            </h4>
            <div className="text-slate-100 text-lg font-mono font-black mt-0.5">
              {formatRupees(projectedSavings)}
            </div>
            <p className="text-slate-500 text-[9px] font-mono mt-1">
              Reducing illegal parking by <span className="text-cyan-400 font-bold">{reduction}%</span> could save approximately <span className="text-slate-100 font-bold">{formatRupees(projectedSavings)}</span> annually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
