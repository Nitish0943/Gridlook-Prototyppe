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
import { PeakHourDetail } from '../../lib/types';
import { Activity, LineChart as ChartIcon } from 'lucide-react';

interface PredictionChartProps {
  peakHours?: PeakHourDetail[];
  isLoading: boolean;
}

export default function PredictionChart({
  peakHours = [],
  isLoading,
}: PredictionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) {
    return (
      <div className="h-96 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <Activity className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const chartData = peakHours.map((item) => ({
    name: item.hour,
    violations: item.predicted_violations,
    risk: item.risk_score,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-lg shadow-xl backdrop-blur-md font-mono text-[11px]">
          <p className="text-slate-450 uppercase font-black text-[10px]">Hour: {payload[0].payload.name}</p>
          <p className="text-purple-400 font-bold mt-1">
            Predicted Violations: <span className="text-slate-100 font-black">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-cyan-400 font-bold mt-0.5">
            Peak Hour Risk Score: <span className="text-slate-100 font-black">{payload[0].payload.risk}/100</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
            <ChartIcon className="w-4 h-4 mr-2 text-purple-400" />
            24-Hour Citywide Predicted Violation Profile
          </h3>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Hourly predictions generated via Random Forest projection of historical citywide telemetry
        </p>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-550 font-mono text-xs">
            No predictive data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="violations"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#predictionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
