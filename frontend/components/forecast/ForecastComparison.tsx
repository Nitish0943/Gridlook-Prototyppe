import React from 'react';
import { ForecastDetail } from '../../lib/types';
import { Eye, ArrowRight, Activity, Zap } from 'lucide-react';

interface ForecastComparisonProps {
  locations?: ForecastDetail[];
  isLoading: boolean;
}

export default function ForecastComparison({ locations = [], isLoading }: ForecastComparisonProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Display comparisons for the top 3 critical forecasted hotspots
  const displayItems = locations.slice(0, 3);

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 border-b border-slate-855 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <Eye className="w-4 h-4 mr-2 text-cyan-400" />
          Forecast vs Current Comparison
        </h3>
        <span className="text-[9px] text-cyan-400 font-mono uppercase bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 flex items-center">
          <Zap className="w-3 h-3 mr-1" /> Telemetry Compare
        </span>
      </div>

      {/* Comparisons */}
      <div className="p-5 space-y-5">
        {displayItems.map((item) => {
          const maxVal = Math.max(item.current_violations, item.predicted_violations, 1);
          const currentWidth = `${(item.current_violations / maxVal) * 100}%`;
          const predictedWidth = `${(item.predicted_violations / maxVal) * 100}%`;

          return (
            <div key={item.junction_name} className="space-y-2 bg-slate-900/20 p-4 rounded-xl border border-slate-850">
              <div className="flex justify-between items-center">
                <span className="text-slate-100 text-xs font-mono font-bold truncate max-w-[200px]" title={item.junction_name}>
                  {item.junction_name}
                </span>
                <span className="text-[10px] text-rose-500 font-mono font-bold uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  +{item.growth_rate}%
                </span>
              </div>

              {/* Progress bars side by side */}
              <div className="space-y-3 pt-2">
                {/* Current */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Current Baseline</span>
                    <span className="text-slate-350">{item.current_violations.toLocaleString()} violations</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: currentWidth }} />
                  </div>
                </div>

                {/* Forecast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-cyan-400">Forecasted State (30d)</span>
                    <span className="text-slate-100 font-bold">{item.predicted_violations.toLocaleString()} violations</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-purple-500 to-rose-500 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" style={{ width: predictedWidth }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
