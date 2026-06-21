'use client';

import React from 'react';
import { PeakHourDetail } from '../../lib/types';
import { Layers } from 'lucide-react';

interface PeakHourHeatmapProps {
  peakHours?: PeakHourDetail[];
  isLoading: boolean;
}

export default function PeakHourHeatmap({
  peakHours = [],
  isLoading,
}: PeakHourHeatmapProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-[180px] animate-pulse" />
    );
  }

  // Group by hour. Since peakHours contains predictions chronologically (often starting from varying hours),
  // let's sort them by the raw hour string (e.g. "00:00" to "23:00") so it forms a daily cycle.
  const dailyCycle = [...peakHours].sort((a, b) => a.hour.localeCompare(b.hour));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-500/25 border-rose-500/50 text-rose-350 shadow-[inset_0_0_12px_rgba(239,68,68,0.15)]';
      case 'High':
        return 'bg-orange-500/25 border-orange-500/50 text-orange-350 shadow-[inset_0_0_12px_rgba(249,115,22,0.15)]';
      case 'Medium':
        return 'bg-yellow-500/25 border-yellow-500/50 text-yellow-350 shadow-[inset_0_0_12px_rgba(234,179,8,0.15)]';
      default:
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-350';
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Peak hour risk Heatmap matrix
            </h3>
          </div>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Visual index of chronological hourly risk categories mapped to a daily timeline
        </p>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3 mt-2 font-mono">
          {dailyCycle.map((item) => (
            <div
              key={item.hour}
              className={`border rounded-lg p-3 text-center transition-all duration-350 flex flex-col justify-between items-center hover:scale-105 ${getRiskColor(
                item.risk
              )}`}
            >
              <span className="text-[10px] font-bold text-slate-100">{item.hour}</span>
              <div className="h-1 w-full bg-slate-950/40 rounded-full my-2 overflow-hidden">
                <div
                  className="h-full bg-current rounded-full"
                  style={{ width: `${item.risk_score}%` }}
                />
              </div>
              <div className="flex flex-col text-[8px] font-black uppercase">
                <span>{item.predicted_violations} vils</span>
                <span className="opacity-70 mt-0.5">{item.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
