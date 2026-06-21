'use client';

import React from 'react';
import { LocationImpactDetail, SpilloverDetail, ForecastDetail, RecommendationDetail } from '../../lib/types';
import { ShieldAlert, Compass, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ExecutiveInsightsPanelProps {
  impactData?: LocationImpactDetail[];
  spilloverData?: SpilloverDetail[];
  forecastData?: ForecastDetail[];
  recommendations?: RecommendationDetail[];
  isLoading: boolean;
}

export default function ExecutiveInsightsPanel({
  impactData = [],
  spilloverData = [],
  forecastData = [],
  recommendations = [],
  isLoading,
}: ExecutiveInsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-44 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // A. Highest Risk Hotspot
  const highestImpact = [...impactData].sort((a, b) => b.impact_score - a.impact_score)[0];
  const matchingRec = highestImpact
    ? recommendations.find((r) => r.junction_name.toLowerCase() === highestImpact.junction_name.toLowerCase())
    : null;

  // B. Largest Spillover Zone
  const largestSpillover = [...spilloverData].sort((a, b) => b.risk_radius_m - a.risk_radius_m)[0];

  // C. Fastest Growing Future Hotspot
  const fastestGrowing = [...forecastData].sort((a, b) => b.growth_rate - a.growth_rate)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* A. Highest Risk Hotspot */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-red-500/10 hover:border-red-500/20 rounded-xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-350">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black text-rose-500 font-mono tracking-widest uppercase bg-rose-950/40 border border-rose-800/30 px-2 py-0.5 rounded">
              Highest Risk Hotspot
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          {highestImpact ? (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 font-mono line-clamp-1">
                {highestImpact.junction_name}
              </h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-100 font-mono">{highestImpact.impact_score}</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Impact Index</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                <span className="text-slate-500 font-bold">REC: </span>
                {matchingRec?.reason || 'Deploy officer patrols to resolve high peak-hour parking violations.'}
              </p>
            </div>
          ) : (
            <p className="text-slate-550 text-xs font-mono">No risk nodes identified.</p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <Link
            href="/recommendations"
            className="text-[10px] font-bold text-rose-400 hover:text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-1.5 transition-colors group-hover:translate-x-1 duration-300"
          >
            <span>Deploy Countermeasures</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* B. Largest Spillover Zone */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/10 hover:border-cyan-500/20 rounded-xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-350">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black text-cyan-400 font-mono tracking-widest uppercase bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
              Largest Spillover Zone
            </span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          {largestSpillover ? (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 font-mono line-clamp-1">
                {largestSpillover.junction_name}
              </h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-100 font-mono">{largestSpillover.risk_radius_m}m</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Risk Radius</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                <span className="text-slate-500 font-bold">AFFECTED: </span>
                {largestSpillover.secondary_zones && largestSpillover.secondary_zones.length > 0
                  ? largestSpillover.secondary_zones.join(', ')
                  : 'Adjacent streets within critical threshold.'}
              </p>
            </div>
          ) : (
            <p className="text-slate-550 text-xs font-mono">No spillover zones active.</p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <Link
            href="/spillover"
            className="text-[10px] font-bold text-cyan-400 hover:text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-1.5 transition-colors group-hover:translate-x-1 duration-300"
          >
            <span>Analyze Spillover</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* C. Fastest Growing Future Hotspot */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-purple-500/10 hover:border-purple-500/20 rounded-xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-350">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black text-purple-400 font-mono tracking-widest uppercase bg-purple-950/40 border border-purple-800/30 px-2 py-0.5 rounded">
              Fastest Growing Future Hotspot
            </span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          {fastestGrowing ? (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 font-mono line-clamp-1">
                {fastestGrowing.junction_name}
              </h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-100 font-mono">+{fastestGrowing.growth_rate.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Growth Rate</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                Projected to reach <span className="text-slate-100 font-semibold font-mono">{fastestGrowing.predicted_violations}</span> violations (Risk: <span className="text-purple-450 font-bold">{fastestGrowing.risk}</span>) in next cycle.
              </p>
            </div>
          ) : (
            <p className="text-slate-550 text-xs font-mono">No predictive data active.</p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <Link
            href="/forecast"
            className="text-[10px] font-bold text-purple-400 hover:text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-1.5 transition-colors group-hover:translate-x-1 duration-300"
          >
            <span>View Risk Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
