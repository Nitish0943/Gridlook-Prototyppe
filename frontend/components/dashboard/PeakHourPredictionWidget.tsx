'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PeakHourSummaryResponse, PeakHourDetail } from '../../lib/types';
import { Clock, ArrowUpRight, ShieldAlert, MapPin, Activity } from 'lucide-react';
import Link from 'next/link';

interface PeakHourPredictionWidgetProps {
  summary?: PeakHourSummaryResponse;
  peakHours?: PeakHourDetail[];
  isLoading: boolean;
}

export default function PeakHourPredictionWidget({
  summary,
  peakHours = [],
  isLoading,
}: PeakHourPredictionWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 animate-pulse" />
    );
  }

  // Map data for the mini area chart
  const chartData = peakHours.map((item) => ({
    name: item.hour,
    violations: item.predicted_violations,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded shadow-xl font-mono text-[9px]">
          <p className="text-slate-400 font-bold">{payload[0].payload.name}</p>
          <p className="text-purple-400 font-black mt-0.5">
            Vol: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Peak Hour Prediction Engine
            </h3>
          </div>
          <Link
            href="/peak-hours"
            className="text-[10px] font-bold text-purple-400 hover:text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-1 transition-colors"
          >
            <span>Strategic Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Proactive shift planning using 24-hour predictive illegal parking load models
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left: Mini Area Chart */}
          <div className="lg:col-span-2 h-44 w-full">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-550 font-mono text-xs">
                No predictive data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="widgetForecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="violations"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#widgetForecastGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Right: Summary KPIs */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Next Peak Hour</span>
                <span className="text-sm font-black text-slate-100 mt-0.5 block">{summary?.next_peak_hour || 'N/A'}</span>
              </div>
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Highest Risk Junction</span>
                <span className="text-xs font-black text-amber-500 mt-0.5 block truncate" title={summary?.highest_risk_junction}>
                  {summary?.highest_risk_junction || 'N/A'}
                </span>
              </div>
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-bold block">Peak Violations</span>
                <span className="text-sm font-black text-rose-500 mt-0.5 block">
                  {peakHours.find((h) => h.hour === summary?.next_peak_hour)?.predicted_violations || 0}
                </span>
              </div>
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
