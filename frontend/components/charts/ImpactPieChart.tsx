'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ImpactSummaryResponse } from '../../lib/types';

interface ImpactPieChartProps {
  summary?: ImpactSummaryResponse;
  isLoading: boolean;
}

const COLORS = {
  Critical: '#ef4444', // rose-500
  High: '#f97316',     // orange-500
  Medium: '#eab308',   // yellow-500
  Low: '#10b981',      // emerald-500
};

export default function ImpactPieChart({ summary, isLoading }: ImpactPieChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-slate-500 text-xs">Loading severity distribution...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Critical', value: summary?.critical_locations ?? 0, color: COLORS.Critical },
    { name: 'High', value: summary?.high_locations ?? 0, color: COLORS.High },
    { name: 'Medium', value: summary?.medium_locations ?? 0, color: COLORS.Medium },
    { name: 'Low', value: summary?.low_locations ?? 0, color: COLORS.Low },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="font-semibold text-xs font-mono" style={{ color: data.color }}>
            {data.name} Severity
          </p>
          <p className="text-slate-100 text-[11px] font-mono mt-0.5">
            Junctions: <span className="font-bold">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.payload.color }}
            />
            <span className="font-mono">{entry.value} ({entry.payload.value})</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          Junction Severity Distribution
        </h3>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Count of junctions categorized by operational impact level
        </p>
      </div>

      <div className="h-64 w-full flex flex-col justify-center">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
