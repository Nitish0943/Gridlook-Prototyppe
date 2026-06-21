'use client';

import React from 'react';
import { CapacityLossSummaryResponse, CapacityLossDetail } from '../../lib/types';
import { Activity, ShieldAlert, ArrowUpRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DashboardCapacityMonitorProps {
  summary?: CapacityLossSummaryResponse;
  locations?: CapacityLossDetail[];
  isLoading: boolean;
}

export default function DashboardCapacityMonitor({
  summary,
  locations = [],
  isLoading,
}: DashboardCapacityMonitorProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-[220px] animate-pulse" />
    );
  }

  // Find top 3 critical capacity loss locations
  const topCriticalRoads = [...locations]
    .sort((a, b) => b.capacity_loss - a.capacity_loss)
    .slice(0, 3);

  // Recovery potential: 30% parking enforcement reclaims ~35% of lost width
  const reclaimedWidthPct = ((summary?.average_capacity_loss ?? 0) * 0.35).toFixed(1);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full min-h-[220px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Road Capacity & Bottleneck Monitor
            </h3>
          </div>
          <Link
            href="/capacity-loss"
            className="text-[10px] font-bold text-amber-400 hover:text-slate-100 uppercase tracking-wider font-mono border-b border-amber-500/0 hover:border-amber-400 transition-all"
          >
            Corridor Analytics
          </Link>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Real-time effective road width reduction due to double parking and lane obstruction
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[11px]">
          {/* Stats Column */}
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Avg Capacity Loss:</span>
              <span className="font-bold text-amber-400">{summary?.average_capacity_loss.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Critical Roads:</span>
              <span className="font-bold text-rose-500">{summary?.critical_locations} Nodes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recovery potential:</span>
              <span className="font-bold text-emerald-400">+{reclaimedWidthPct}% width</span>
            </div>
          </div>

          {/* Critical Locations List Column (2/3 width) */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[8px] text-slate-550 uppercase font-black tracking-wider block">
              Highest Capacity Loss Corridors
            </span>
            {topCriticalRoads.map((road) => (
              <div
                key={road.junction_name}
                className="bg-slate-950/60 hover:bg-slate-950/80 border border-slate-850/60 rounded-lg p-2.5 flex items-center justify-between transition-colors"
              >
                <span className="text-slate-200 font-semibold truncate max-w-[170px]" title={road.junction_name}>
                  {road.junction_name}
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-slate-400 text-[10px]">Loss:</span>
                  <span className="font-black text-rose-500">{road.capacity_loss}%</span>
                  <span className="text-slate-500 font-mono">({road.occupied_width}m / {road.road_width}m)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
