'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CapacityLossDetail } from '../../lib/types';
import { BarChart3, Activity } from 'lucide-react';

interface CapacityDistributionChartProps {
  locations?: CapacityLossDetail[];
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Low: '#22c55e',
  Medium: '#eab308',
  High: '#f97316',
  Critical: '#ef4444',
};

export default function CapacityDistributionChart({ locations, isLoading }: CapacityDistributionChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) {
    return (
      <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 flex items-center justify-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm">No data available.</p>
      </div>
    );
  }

  // Compute distribution counts
  const distribution = [
    { category: 'Low', count: locations.filter(l => l.risk === 'Low').length, range: '0–25%' },
    { category: 'Medium', count: locations.filter(l => l.risk === 'Medium').length, range: '26–50%' },
    { category: 'High', count: locations.filter(l => l.risk === 'High').length, range: '51–75%' },
    { category: 'Critical', count: locations.filter(l => l.risk === 'Critical').length, range: '76–100%' },
  ];

  return (
    <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-cyan-400" />
          Capacity Loss Distribution
        </h3>
        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">
          By Risk Category
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={distribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#f8fafc',
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
            formatter={(value: any, _name: any, props: any) => [
              `${value} junctions (${props.payload.range})`,
              'Count',
            ]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {distribution.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category]}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
