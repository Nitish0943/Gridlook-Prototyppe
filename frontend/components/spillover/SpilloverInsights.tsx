import React from 'react';
import { SpilloverSummaryResponse, SpilloverDetail } from '../../lib/types';
import { Brain, ArrowRight, Zap, Target } from 'lucide-react';

interface SpilloverInsightsProps {
  summary?: SpilloverSummaryResponse;
  spillovers?: SpilloverDetail[];
  isLoading: boolean;
}

export default function SpilloverInsights({ summary, spillovers, isLoading }: SpilloverInsightsProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="animate-pulse flex items-center text-cyan-400">
          <Brain className="w-6 h-6 mr-3" />
          <span className="font-mono text-xs tracking-widest uppercase">Generating AI Insights...</span>
        </div>
      </div>
    );
  }

  // Generate dynamic insights
  const insights: string[] = [];

  if (summary && spillovers && spillovers.length > 0) {
    const criticalCount = summary.critical_spillovers;
    
    if (criticalCount > 0) {
      insights.push(`Detected ${criticalCount} critical spillover zones requiring immediate enforcement re-allocation to prevent broader gridlock.`);
    }

    const topSpillover = spillovers[0];
    if (topSpillover && topSpillover.spillover_score >= 70) {
      insights.push(`Primary source of spillover is "${topSpillover.junction_name}" with a severity score of ${topSpillover.spillover_score}. Parking saturation here is pushing vehicles into ${topSpillover.secondary_zones.length} adjacent secondary zones.`);
    }

    const highGrowth = spillovers.find(s => s.hotspot_growth_rate > 1.5);
    if (highGrowth) {
      insights.push(`Rapid expansion detected around "${highGrowth.junction_name}" (Growth Rate: ${highGrowth.hotspot_growth_rate.toFixed(2)}x). Recommend preemptive sign placements in nearby streets before they become permanent secondary hotspots.`);
    }
    
    if (insights.length === 0) {
      insights.push("Current spillover metrics are within acceptable thresholds. Monitor primary hotspots for signs of saturation.");
    }
  } else {
    insights.push("Awaiting sufficient data to compute actionable spillover insights.");
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <Brain className="w-4 h-4 mr-2 text-cyan-400" />
          AI Spillover Insights
        </h3>
        <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 flex items-center">
          <Zap className="w-3 h-3 mr-1" /> Live Analysis
        </span>
      </div>

      <div className="p-5 space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start bg-slate-900/40 p-4 rounded-lg border border-slate-800/50 hover:bg-slate-900/60 transition-colors">
            <div className="mt-0.5 mr-3 p-1.5 bg-cyan-950/50 border border-cyan-800/30 rounded-md">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-slate-100 text-sm font-semibold mb-1">Strategic Observation #{idx + 1}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
