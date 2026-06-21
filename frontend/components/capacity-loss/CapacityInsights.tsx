import React from 'react';
import { CapacityLossSummaryResponse, CapacityLossDetail } from '../../lib/types';
import { Brain, Zap, Target } from 'lucide-react';

interface CapacityInsightsProps {
  summary?: CapacityLossSummaryResponse;
  locations?: CapacityLossDetail[];
  isLoading: boolean;
}

export default function CapacityInsights({ summary, locations, isLoading }: CapacityInsightsProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="animate-pulse flex items-center text-cyan-400">
          <Brain className="w-6 h-6 mr-3" />
          <span className="font-mono text-xs tracking-widest uppercase">Analyzing Road Capacity Metrics...</span>
        </div>
      </div>
    );
  }

  // Generate dynamic insights
  const insights: string[] = [];

  if (summary && locations && locations.length > 0) {
    const criticalCount = summary.critical_locations;
    
    insights.push(
      `Citywide average capacity loss stands at ${summary.average_capacity_loss}%, with ${criticalCount} junction${
        criticalCount === 1 ? '' : 's'
      } designated as Critical (≥76% lane obstruction). Immediate parking enforcement or physical barriers are required at these locations.`
    );

    const worstJunction = locations[0];
    if (worstJunction && worstJunction.capacity_loss >= 60) {
      insights.push(
        `Critical bottleneck detected at "${worstJunction.junction_name}" with a capacity loss of ${worstJunction.capacity_loss}%. Illegal parking occupies ${worstJunction.occupied_width}m of the ${worstJunction.road_width}m road width, leaving only ${worstJunction.available_width}m for active transit.`
      );
    }

    const highAmp = locations.find(l => l.congestion_amplification > 75 && l.junction_name !== worstJunction?.junction_name);
    if (highAmp) {
      insights.push(
        `High congestion amplification (${highAmp.congestion_amplification}%) at "${highAmp.junction_name}" is driven by a combination of high violation density (${highAmp.vehicle_count} vehicles) and narrow road corridors. Target this zone for tow-away campaigns.`
      );
    }

    const twoWheelerDominant = locations.find(l => l.vehicle_count > 15 && l.capacity_loss < 40);
    if (twoWheelerDominant) {
      insights.push(
        `Junction "${twoWheelerDominant.junction_name}" has high violation frequency (${twoWheelerDominant.vehicle_count} incidents) but moderate capacity loss (${twoWheelerDominant.capacity_loss}%), indicating a high ratio of motorcycles or auto-rickshaws. Recommending dedicated off-street two-wheeler parking bays.`
      );
    }
    
    if (insights.length === 0) {
      insights.push("Road capacity parameters across all junctions are within normal baseline tolerances. Continuous monitoring active.");
    }
  } else {
    insights.push("Awaiting structural capacity and vehicle violation data to generate intelligent traffic routing and restriction insights.");
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <Brain className="w-4 h-4 mr-2 text-cyan-400" />
          AI Capacity Loss Insights
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
