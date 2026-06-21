'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingDown, Target, Info } from 'lucide-react';
import { HotspotsSummaryResponse, RecommendationsSummaryResponse } from '../../lib/types';

interface ExecutiveSummaryProps {
  hotspotsSummary?: HotspotsSummaryResponse;
  recommendationsSummary?: RecommendationsSummaryResponse;
  isLoading: boolean;
}

export default function ExecutiveSummary({
  hotspotsSummary,
  recommendationsSummary,
  isLoading,
}: ExecutiveSummaryProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 h-[260px] animate-pulse" />
    );
  }

  const criticalCount = hotspotsSummary?.critical_hotspots ?? 0;
  const highCount = hotspotsSummary?.high_hotspots ?? 0;
  const estimatedReduction = recommendationsSummary?.estimated_citywide_reduction ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-2xl h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider font-mono">
            System Executive Summary
          </h2>
        </div>

        <p className="text-slate-350 text-sm leading-relaxed mb-5">
          Geospatial analysis has identified <span className="text-amber-400 font-semibold">{hotspotsSummary?.total_hotspots} parking hotspots</span> across monitored junctions. Of these, <span className="text-rose-500 font-semibold">{criticalCount} critical</span> and <span className="text-amber-500 font-semibold">{highCount} high-severity</span> hotspots represent the highest risk for traffic flow disruption and emergency vehicle obstruction.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3 flex items-center space-x-3">
            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Priority Zones</p>
              <p className="text-sm font-semibold text-slate-100">
                {recommendationsSummary?.total_recommendations ?? 0} Areas Identified
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3 flex items-center space-x-3">
            <div className="p-2 rounded bg-rose-950/40 border border-rose-800/30 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Est. Reduction</p>
              <p className="text-sm font-semibold text-rose-400 font-mono">
                {estimatedReduction}% Congestion
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-cyan-950/20 border border-cyan-800/20 rounded-lg p-3 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-normal">
          <strong className="text-cyan-300">Operational Strategy:</strong> Deploying the recommended enforcement resources to the top 5 hotspots will resolve up to <strong className="text-slate-100">{(estimatedReduction * 1.25).toFixed(0)}%</strong> of high-impact illegal parking incidents within the next 24 hours.
        </p>
      </div>
    </motion.div>
  );
}
