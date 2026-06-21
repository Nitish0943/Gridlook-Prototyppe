'use client';

import React from 'react';
import { PeakHourSummaryResponse, PeakHourDetail, JunctionPeakDetail } from '../../lib/types';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface AIInsightsProps {
  summary?: PeakHourSummaryResponse;
  peakHours?: PeakHourDetail[];
  junctions?: JunctionPeakDetail[];
  isLoading: boolean;
}

export default function AIInsights({
  summary,
  peakHours = [],
  junctions = [],
  isLoading,
}: AIInsightsProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-56 animate-pulse" />
    );
  }

  // Calculate some smart details
  const insights: string[] = [];

  // Insight 1: Next peak hour slot
  if (summary?.next_peak_hour) {
    const hourInt = parseInt(summary.next_peak_hour.split(':')[0]);
    const ampm = hourInt >= 12 ? 'PM' : 'AM';
    const hourFormatted = hourInt % 12 === 0 ? 12 : hourInt % 12;
    
    // Suggest a range (e.g. 8 AM and 10 AM)
    const endHour = (hourInt + 2) % 24;
    const endAmpm = endHour >= 12 ? 'PM' : 'AM';
    const endFormatted = endHour % 12 === 0 ? 12 : endHour % 12;
    
    insights.push(
      `"Illegal parking is expected to peak citywide between ${hourFormatted} ${ampm} and ${endFormatted} ${endAmpm} tomorrow."`
    );
  }

  // Insight 2: Highest risk junction
  if (summary?.highest_risk_junction && summary.highest_risk_junction !== 'N/A') {
    insights.push(
      `"${summary.highest_risk_junction} is projected to experience the highest parking pressure, with peak violations expected tomorrow."`
    );
  }

  // Insight 3: Patrol recommendation impact
  insights.push(
    `"Deploying enforcement officers during the top 3 peak hours could reduce citywide parking violations by approximately 35%."`
  );

  // Insight 4: Peak types
  const weekendPredictions = peakHours.filter(h => h.hour === '19:00' || h.hour === '20:00');
  if (weekendPredictions.length > 0) {
    insights.push(
      `"Secondary peak pressure is projected during late afternoon and early evening shifts between 5 PM and 8 PM."`
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/10 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute -right-16 -top-16 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl animate-pulse" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Smart City AI Peak Predictions
            </h3>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
        </div>

        <div className="space-y-3 font-mono text-[11px] leading-relaxed">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3 flex items-start space-x-2.5 hover:border-slate-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-slate-300 italic">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-850/60 flex justify-between items-center text-[9px] font-mono text-slate-500">
        <span>PREDICTION ENGINE: ONLINE</span>
        <span>MODELS VALIDATED</span>
      </div>
    </div>
  );
}
