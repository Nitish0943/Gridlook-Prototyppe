'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendPoint, ForecastDetail, ForecastTrendResponse } from '../../lib/types';
import { Activity, LineChart as ChartIcon, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface DashboardForecastChartProps {
  trendResponse?: ForecastTrendResponse;
  forecastLocations?: ForecastDetail[];
  isLoading: boolean;
}

type TimelineOption = 7 | 30 | 90;

export default function DashboardForecastChart({
  trendResponse,
  forecastLocations = [],
  isLoading,
}: DashboardForecastChartProps) {
  const [mounted, setMounted] = useState(false);
  const [timeline, setTimeline] = useState<TimelineOption>(30);

  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 animate-pulse flex items-center justify-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Get trends data depending on timeline selection
  const dailyTrends = trendResponse?.daily || [];
  const activeTrends = dailyTrends.slice(0, timeline);

  const chartData = activeTrends.map((t) => {
    const d = new Date(t.date);
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      name: formattedDate,
      predicted: t.predicted,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md font-mono text-[11px]">
          <p className="text-slate-450 uppercase font-bold text-[10px]">{payload[0].payload.name}</p>
          <p className="text-purple-400 font-bold mt-1">
            Predicted Violations: <span className="text-slate-100 font-black">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Top 3 Future Hotspots
  const topFutureHotspots = [...forecastLocations]
    .sort((a, b) => b.growth_rate - a.growth_rate)
    .slice(0, 3);

  const options: TimelineOption[] = [7, 30, 90];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <ChartIcon className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Future Risk Forecast Trend
            </h3>
          </div>
          <Link
            href="/forecast"
            className="text-[10px] font-bold text-purple-400 hover:text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-1 transition-colors"
          >
            <span>View Forecast</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 font-mono">
          <p className="text-slate-550 text-[10px]">
            Holt-Winters predictive violation frequency citywide
          </p>

          {/* Timeline tabs */}
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 self-start shrink-0">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setTimeline(opt)}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                  timeline === opt
                    ? 'bg-slate-900 text-slate-100 shadow-md'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                {opt}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Recharts Area */}
          <div className="lg:col-span-2 h-56 w-full">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-550 font-mono text-xs">
                No daily forecast data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardForecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashboardForecastGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Future Hotspots Column */}
          <div className="space-y-3 font-mono">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-purple-400" /> Top Projected Hotspots
            </h4>

            {topFutureHotspots.map((h) => (
              <div
                key={h.junction_name}
                className="bg-slate-950/60 hover:bg-slate-950/80 border border-slate-850 rounded-xl p-3 flex flex-col justify-between text-[11px] transition-colors"
              >
                <p className="text-slate-100 font-semibold truncate" title={h.junction_name}>
                  {h.junction_name}
                </p>
                <div className="flex justify-between items-center mt-1.5 text-[10px]">
                  <span className="text-slate-500">Predicted Vol: <strong className="text-slate-100 font-mono">{h.predicted_violations}</strong></span>
                  <span className="text-rose-400 font-bold">+{h.growth_rate.toFixed(1)}% growth</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
