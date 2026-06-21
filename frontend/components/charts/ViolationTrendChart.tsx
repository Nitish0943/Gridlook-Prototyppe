'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ViolationTypeCount } from '../../lib/types';

interface ViolationTrendChartProps {
  data?: ViolationTypeCount[];
  isLoading: boolean;
}

const COLORS = ['#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6'];

export default function ViolationTrendChart({ data = [], isLoading }: ViolationTrendChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-slate-500 text-xs">Loading violation profile...</p>
      </div>
    );
  }

  // Use top 5 categories
  const chartData = data.slice(0, 5).map((item) => ({
    name: item.violation_type.length > 15 ? `${item.violation_type.substring(0, 15)}...` : item.violation_type,
    fullName: item.violation_type,
    count: item.count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-100 font-semibold text-xs font-mono">{payload[0].payload.fullName}</p>
          <p className="text-purple-400 text-[12px] font-bold font-mono mt-0.5">
            Incidents: {payload[0].value.toLocaleString()}
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
          Violation Category Breakdown
        </h3>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Top types of illegal parking offenses registered
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} vertical={true} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.3)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
