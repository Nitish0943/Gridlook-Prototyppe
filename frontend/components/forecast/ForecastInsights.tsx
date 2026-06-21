import React from 'react';
import { ForecastSummaryResponse, ForecastDetail } from '../../lib/types';
import { Brain, Zap, Target } from 'lucide-react';

interface ForecastInsightsProps {
  summary?: ForecastSummaryResponse;
  locations?: ForecastDetail[];
  isLoading: boolean;
}

export default function ForecastInsights({ summary, locations = [], isLoading }: ForecastInsightsProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="animate-pulse flex items-center text-cyan-400">
          <Brain className="w-6 h-6 mr-3" />
          <span className="font-mono text-xs tracking-widest uppercase">Analyzing Forecast Vectors...</span>
        </div>
      </div>
    );
  }

  // Generate dynamic insights
  const insights: string[] = [];

  if (summary && locations && locations.length > 0) {
    const totalPredicted = locations.reduce((acc, curr) => acc + curr.predicted_violations, 0);

    // Insight 1: Highest growth projection
    const highestGrowthLoc = locations.find(l => l.junction_name === summary.highest_growth_area) || locations[0];
    if (highestGrowthLoc) {
      insights.push(
        `"${highestGrowthLoc.junction_name}" is projected to experience a ${highestGrowthLoc.growth_rate}% increase in illegal parking violations over the next 30 days.`
      );
    }

    // Insight 2: Share of top 5 hotspots
    if (locations.length >= 5 && totalPredicted > 0) {
      const top5Predicted = locations.slice(0, 5).reduce((acc, curr) => acc + curr.predicted_violations, 0);
      const top5Share = ((top5Predicted / totalPredicted) * 100).toFixed(1);
      insights.push(
        `The top 5 future risk hotspots are expected to contribute ${top5Share}% of all future parking violations citywide.`
      );
    }

    // Insight 3: Critical risk zones requiring attention
    const criticalZonesCount = summary.critical_future_hotspots;
    if (criticalZonesCount > 0) {
      insights.push(
        `Geospatial forecasting indicates ${criticalZonesCount} hotspots will transition to Critical risk levels due to positive trend slope convergence.`
      );
    }

    // Insight 4: Reclaimable enforcement savings projection
    // Average economic cost per violation: ₹42.5
    const totalWeeklyPredicted = locations.reduce((acc, curr) => acc + curr.predicted_7_days, 0);
    const potentialWeeklyReclaimed = totalWeeklyPredicted * 42.5 * 0.20; // 20% reduction savings
    insights.push(
      `Preemptive enforcement deployment targeting these projected zones could reclaim up to ₹${potentialWeeklyReclaimed.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in weekly delay and productivity losses.`
    );
  } else {
    insights.push("Awaiting structural time-series data to run predictive risk forecasting calculations.");
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-855 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-855 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <Brain className="w-4 h-4 mr-2 text-cyan-400" />
          AI Forecast Insights
        </h3>
        <span className="text-[10px] text-purple-400 font-mono uppercase bg-purple-405/10 px-2 py-1 rounded border border-purple-405/20 flex items-center">
          <Zap className="w-3 h-3 mr-1" /> Predictive Analysis
        </span>
      </div>

      <div className="p-5 space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start bg-slate-900/40 p-4 rounded-lg border border-slate-800/50 hover:bg-slate-900/60 transition-colors">
            <div className="mt-0.5 mr-3 p-1.5 bg-cyan-950/50 border border-cyan-800/30 rounded-md">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-slate-100 text-sm font-semibold mb-1">Strategic Prediction #{idx + 1}</h4>
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
