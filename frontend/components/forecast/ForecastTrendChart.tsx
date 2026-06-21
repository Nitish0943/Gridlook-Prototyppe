'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendPoint } from '../../lib/types';
import { Activity, LineChart as ChartIcon } from 'lucide-react';

interface ForecastTrendChartProps {
  dailyTrends?: TrendPoint[];
  isLoading: boolean;
}

type TimelineOption = 7 | 30 | 90;

export default function ForecastTrendChart({ dailyTrends = [], isLoading }: ForecastTrendChartProps) {
  const [mounted, setMounted] = useState(false);
  const [timeline, setTimeline] = useState<TimelineOption>(30); // default 30 days

  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Filter trends based on timeline option
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
            Forecasted Violations: <span className="text-slate-100 font-black">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const options: TimelineOption[] = [7, 30, 90];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
            <ChartIcon className="w-4 h-4 mr-2 text-cyan-400" />
            Violations Forecast Timeline
          </h3>

          {/* Timeline tabs */}
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 self-start">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setTimeline(opt)}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                  timeline === opt
                    ? 'bg-slate-900 text-slate-100 shadow-md'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {opt}d
              </button>
            ))}
          </div>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Holt-Winters exponential smoothing daily projected violation frequency citywide
        </p>
      </div>

      <div className="h-60 w-full">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-550 font-mono text-xs">
            No daily forecast data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
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
                fill="url(#forecastGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
