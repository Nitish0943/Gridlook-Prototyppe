'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Sparkles, AlertCircle, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { useSimulate } from '../../lib/hooks/useSimulation';
import { SimulateResponse } from '../../lib/types';

interface DigitalTwinSimulatorProps {
  initialViolations: number;
}

export default function DigitalTwinSimulator({ initialViolations }: DigitalTwinSimulatorProps) {
  const [reduction, setReduction] = useState(30); // Default 30% reduction
  const { mutate: runSimulation, data, isPending, error } = useSimulate();

  // Run initial simulation on load or when reduction changes (debounced/on-demand)
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation(reduction);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [reduction, runSimulation]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReduction(parseInt(e.target.value, 10));
  };

  const simResult: SimulateResponse | undefined = data;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-2xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider font-mono">
              Digital Twin Simulator
            </h2>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-850 rounded uppercase tracking-widest font-mono animate-pulse">
            what-if mode
          </span>
        </div>

        {/* Simulation Control */}
        <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-slate-350 text-xs font-semibold uppercase tracking-wider font-mono">
              Target Violation Reduction
            </label>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {reduction}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={reduction}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
            <span>0% (BASELINE)</span>
            <span>50% (MODERATE)</span>
            <span>100% (COMPLETE)</span>
          </div>
        </div>

        {/* Simulation Results */}
        <div className="relative">
          {isPending && !simResult && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
              <span className="text-cyan-400 text-xs font-mono animate-pulse">Simulating scenario...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-lg flex items-center space-x-2 text-rose-400 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to run simulation. Ensure backend is running.</span>
            </div>
          )}

          {simResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Metric 1 */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Violations
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-500 line-through font-mono">
                      {simResult.city_summary.violations_before.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-100 font-mono">
                      {simResult.city_summary.violations_after.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          10,
                          (simResult.city_summary.violations_after /
                            simResult.city_summary.violations_before) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Impact Score
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-500 line-through font-mono">
                      {simResult.city_summary.impact_before}
                    </span>
                    <span className="text-sm font-bold text-amber-500 font-mono">
                      {simResult.city_summary.impact_after}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          10,
                          (simResult.city_summary.impact_after /
                            simResult.city_summary.impact_before) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Relief Index
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">FLOW</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +{simResult.city_summary.improvement_percentage}%
                    </span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${simResult.city_summary.improvement_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Prediction Insight */}
              <div className="bg-gradient-to-r from-cyan-950/15 to-purple-950/15 border border-cyan-850/30 rounded-xl p-4 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    AI Sim-Twin Insight
                  </p>
                  <p className="text-xs text-slate-300 mt-1 leading-normal">
                    {simResult.insight}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {simResult && simResult.hotspots && simResult.hotspots.length > 0 && (
        <div className="mt-6 border-t border-slate-850 pt-5">
          <div className="flex items-center space-x-1.5 mb-3 text-xs text-slate-400 uppercase font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Top Impact Junction Simulation Relief</span>
          </div>

          <div className="space-y-2">
            {simResult.hotspots.slice(0, 3).map((item) => (
              <div
                key={item.junction_name}
                className="bg-slate-950/50 hover:bg-slate-950/70 border border-slate-900 rounded-lg p-2.5 flex items-center justify-between text-xs transition-all"
              >
                <span className="text-slate-100 font-medium truncate max-w-[120px] sm:max-w-none">
                  {item.junction_name.replace(' JUNCTION', '')}
                </span>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    <span className="text-slate-500">{item.before_violations}</span>
                    <ArrowRight className="w-3 h-3 text-slate-650" />
                    <span className="text-slate-100 font-bold">{item.after_violations}</span>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-850/30 font-mono font-semibold">
                    -{item.improvement_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
