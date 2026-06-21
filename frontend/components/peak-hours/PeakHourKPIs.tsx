'use client';

import React from 'react';
import { Clock, ShieldAlert, MapPin, Activity } from 'lucide-react';
import { PeakHourSummaryResponse, PeakHourDetail } from '../../lib/types';

interface PeakHourKPIsProps {
  summary?: PeakHourSummaryResponse;
  peakHours?: PeakHourDetail[];
  isLoading: boolean;
}

export default function PeakHourKPIs({
  summary,
  peakHours = [],
  isLoading,
}: PeakHourKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Find risk score details for the next peak hour
  const nextPeakDetail = peakHours.find((h) => h.hour === summary?.next_peak_hour);
  const nextRiskScore = nextPeakDetail?.risk_score ?? 0;
  const nextRisk = nextPeakDetail?.risk ?? 'Low';

  const kpis = [
    {
      title: 'Next Peak Hour',
      value: summary?.next_peak_hour || 'N/A',
      icon: Clock,
      color: 'text-purple-400',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/20',
      desc: 'Projected peak citywide activity',
    },
    {
      title: 'Predicted Peak Violations',
      value: nextPeakDetail?.predicted_violations.toString() || '0',
      icon: ShieldAlert,
      color: 'text-rose-500',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-rose-500/20',
      desc: 'Expected incidents at peak hour',
    },
    {
      title: 'Highest Risk Junction',
      value: summary?.highest_risk_junction || 'N/A',
      icon: MapPin,
      color: 'text-amber-500',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/20',
      desc: 'Top bottleneck corridor target',
    },
    {
      title: 'Peak Hour Risk Score',
      value: `${nextRiskScore}/100`,
      icon: Activity,
      color:
        nextRisk === 'Critical'
          ? 'text-rose-500'
          : nextRisk === 'High'
          ? 'text-orange-500'
          : nextRisk === 'Medium'
          ? 'text-yellow-500'
          : 'text-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-500/20',
      desc: `Classification: ${nextRisk}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`bg-slate-900/40 backdrop-blur-md border rounded-xl p-6 transition-all duration-350 cursor-pointer ${item.glow} hover:bg-slate-900/60`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {item.title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-2 font-mono">
                  {item.value}
                </h3>
              </div>
              <div className={`p-2 rounded-lg bg-slate-950/80 border border-slate-800 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-3 line-clamp-1">{item.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
