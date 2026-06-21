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
} from 'recharts';
import { LocationImpactDetail } from '../../lib/types';

interface ImpactBarChartProps {
  data?: LocationImpactDetail[];
  isLoading: boolean;
}

export default function ImpactBarChart({ data = [], isLoading }: ImpactBarChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-slate-500 text-xs">Loading impact metrics...</p>
      </div>
    );
  }

  // Display top 10 locations by impact score
  const chartData = data
    .slice(0, 10)
    .map((item) => ({
      name: item.junction_name.replace(' JUNCTION', '').trim(),
      score: item.impact_score,
      violations: item.violations,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-100 font-semibold text-xs font-mono">{payload[0].payload.name}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-cyan-400 text-[11px] font-mono">
              Impact Score: <span className="font-bold">{payload[0].value}</span>
            </p>
            <p className="text-slate-400 text-[11px] font-mono">
              Violations: <span className="font-bold">{payload[0].payload.violations}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          Top 10 Impact Locations
        </h3>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Junctions ranked by normalized traffic congestion impact score
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0891b2" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.3)' }} />
            <Bar
              dataKey="score"
              fill="url(#barGradient)"
              radius={[0, 4, 4, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
