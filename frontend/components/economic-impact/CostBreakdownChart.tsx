'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EconomicImpactDetail } from '../../lib/types';
import { Activity, PieChart as PieIcon } from 'lucide-react';
import { formatRupees } from './EconomicKPIs';

interface CostBreakdownChartProps {
  locations?: EconomicImpactDetail[];
  isLoading: boolean;
}

const COLORS = {
  fuel_waste: '#06b6d4',          // Cyan-500
  delay_cost: '#f97316',          // Orange-500
  productivity_loss: '#a855f7',   // Purple-500
  enforcement_cost: '#ef4444',    // Rose-500
};

export default function CostBreakdownChart({ locations = [], isLoading }: CostBreakdownChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) {
    return (
      <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Aggregate costs
  let fuelWasteSum = 0;
  let delayCostSum = 0;
  let productivityLossSum = 0;
  let enforcementCostSum = 0;

  locations.forEach((loc) => {
    fuelWasteSum += loc.breakdown.fuel_waste;
    delayCostSum += loc.breakdown.delay_cost;
    productivityLossSum += loc.breakdown.productivity_loss;
    enforcementCostSum += loc.breakdown.enforcement_cost;
  });

  const chartData = [
    { name: 'Fuel Waste', value: fuelWasteSum, color: COLORS.fuel_waste },
    { name: 'Travel Delay Cost', value: delayCostSum, color: COLORS.delay_cost },
    { name: 'Productivity Loss', value: productivityLossSum, color: COLORS.productivity_loss },
    { name: 'Enforcement Cost', value: enforcementCostSum, color: COLORS.enforcement_cost },
  ].filter((item) => item.value > 0);

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="font-semibold text-xs font-mono" style={{ color: data.color }}>
            {data.name}
          </p>
          <div className="mt-1 space-y-0.5">
            <p className="text-slate-100 text-[11px] font-mono">
              Daily Loss: <span className="font-bold">{formatRupees(data.value)}</span>
            </p>
            <p className="text-slate-450 text-[10px] font-mono">
              Share: <span className="font-bold">{percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = totalValue > 0 ? ((entry.payload.value / totalValue) * 100).toFixed(0) : '0';
          return (
            <li key={`item-${index}`} className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.payload.color }}
              />
              <span className="truncate">{entry.value}</span>
              <span className="text-slate-600 font-bold ml-auto">{percentage}%</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <PieIcon className="w-4 h-4 mr-2 text-cyan-400" />
          Cost Breakdown Chart
        </h3>
        <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
          Distribution of daily financial losses by cost category
        </p>
      </div>

      <div className="h-60 w-full flex flex-col justify-center">
        {totalValue === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-550 font-mono text-xs">
            No economic loss details registered.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
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
        )}
      </div>
    </div>
  );
}
