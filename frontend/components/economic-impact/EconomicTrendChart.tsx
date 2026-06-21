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
import { EconomicTrendPoint } from '../../lib/types';
import { Activity, LineChart as ChartIcon } from 'lucide-react';
import { formatRupees } from './EconomicKPIs';

interface EconomicTrendChartProps {
  trends?: EconomicTrendPoint[];
  isLoading: boolean;
}

export default function EconomicTrendChart({ trends = [], isLoading }: EconomicTrendChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Format dates for XAxis
  const chartData = trends.map((t) => {
    const d = new Date(t.date);
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      name: formattedDate,
      cost: t.cost,
      violations: t.violations,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-400 font-mono text-[10px] uppercase font-bold">{payload[0].payload.name}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-cyan-400 text-xs font-mono font-bold">
              Economic Loss: {formatRupees(payload[0].value)}
            </p>
            <p className="text-slate-500 text-[10px] font-mono">
              Violations: {payload[0].payload.violations}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
            <ChartIcon className="w-4 h-4 mr-2 text-cyan-400" />
            Economic Loss Trends
          </h3>
          <span className="text-[9px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Weekly Aggregates
          </span>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Historical analysis tracking weekly traffic costs and congestion drain
        </p>
      </div>

      <div className="h-60 w-full">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-550 font-mono text-xs">
            Awaiting historical trend data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.15)" />
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
                tickFormatter={(val) => {
                  if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
                  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                  return `₹${val}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
