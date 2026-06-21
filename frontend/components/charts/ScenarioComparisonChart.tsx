'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ScenarioDetail } from '../../lib/types';

interface ScenarioComparisonChartProps {
  data?: ScenarioDetail[];
  isLoading: boolean;
}

export default function ScenarioComparisonChart({ data = [], isLoading }: ScenarioComparisonChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-slate-500 text-xs">Loading scenario models...</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    scenario: item.scenario,
    reduction: item.impact_reduction,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Scenario: {payload[0].payload.scenario} Reduction
          </p>
          <p className="text-emerald-400 text-[13px] font-bold font-mono mt-1">
            Impact Relief: +{payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          Precalculated Scenarios Comparison
        </h3>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Projected reduction in city traffic congestion based on violation control
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="scenario"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="reduction"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#areaColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
