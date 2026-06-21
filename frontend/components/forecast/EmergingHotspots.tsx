import React from 'react';
import { ForecastDetail } from '../../lib/types';
import { Sparkles, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface EmergingHotspotsProps {
  locations?: ForecastDetail[];
  isLoading: boolean;
}

export default function EmergingHotspots({ locations = [], isLoading }: EmergingHotspotsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // 1. Find fastest growing area (highest growth rate > 0)
  const growingAreas = [...locations].filter(l => l.growth_rate > 0);
  growingAreas.sort((a, b) => b.growth_rate - a.growth_rate);
  const fastestGrowing = growingAreas[0];

  // 2. Find new risk zones: medium/high risk but historically lower current violations
  // (e.g. current_violations < 1000 but future_risk_score > 40)
  const newRiskZones = [...locations].filter(l => l.current_violations < 1500 && l.future_risk_score > 35);
  newRiskZones.sort((a, b) => b.future_risk_score - a.future_risk_score);
  const topNewRisk = newRiskZones[0] || locations[locations.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Box 1: Fastest Growing Area */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:border-cyan-800/40 transition-colors shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
            Fastest Growing Hotspot
          </h4>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        {fastestGrowing ? (
          <div>
            <div className="text-slate-100 text-base font-bold font-mono truncate" title={fastestGrowing.junction_name}>
              {fastestGrowing.junction_name}
            </div>
            <div className="text-rose-500 text-lg font-mono font-black mt-1">
              +{fastestGrowing.growth_rate}% Growth
            </div>
            <p className="text-slate-500 text-[10px] font-mono mt-2 leading-relaxed">
              Violations are projected to surge from {fastestGrowing.current_violations} to {fastestGrowing.predicted_violations} incidents next month.
            </p>
          </div>
        ) : (
          <div className="text-slate-500 font-mono text-xs">No active growth hotspots detected.</div>
        )}
      </div>

      {/* Box 2: Emerging Risk Zone */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:border-amber-800/40 transition-colors shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
            Emerging Risk Area
          </h4>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        {topNewRisk ? (
          <div>
            <div className="text-slate-100 text-base font-bold font-mono truncate" title={topNewRisk.junction_name}>
              {topNewRisk.junction_name}
            </div>
            <div className="text-amber-400 text-lg font-mono font-black mt-1">
              Score: {topNewRisk.future_risk_score} ({topNewRisk.risk})
            </div>
            <p className="text-slate-500 text-[10px] font-mono mt-2 leading-relaxed">
              Currently moderate ({topNewRisk.current_violations} incidents), but high growth indicators mark this area for preemptive dispatch.
            </p>
          </div>
        ) : (
          <div className="text-slate-500 font-mono text-xs">No emerging risk zones identified.</div>
        )}
      </div>

      {/* Box 3: Projected Peak Hours */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:border-purple-800/40 transition-colors shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
            Forecasted Peak Hours
          </h4>
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="text-slate-100 text-base font-bold font-mono">
            08:00 - 10:30 <span className="text-[10px] text-slate-500 font-normal">AM</span>
          </div>
          <div className="text-purple-400 text-lg font-mono font-black mt-1">
            18:00 - 20:30 <span className="text-[11px] font-bold text-slate-400">PM</span>
          </div>
          <p className="text-slate-500 text-[10px] font-mono mt-2 leading-relaxed">
            Time frames identified with the highest density of vehicle types blocking arterial traffic flow.
          </p>
        </div>
      </div>
    </div>
  );
}
