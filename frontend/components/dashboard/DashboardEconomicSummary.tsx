'use client';

import React from 'react';
import { EconomicImpactSummaryResponse } from '../../lib/types';
import { IndianRupee, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface DashboardEconomicSummaryProps {
  summary?: EconomicImpactSummaryResponse;
  isLoading: boolean;
}

// Self-contained formatter for Indian Rupees in Lakh / Crore
export function formatRupeesLocal(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${val.toLocaleString()}`;
}

export default function DashboardEconomicSummary({
  summary,
  isLoading,
}: DashboardEconomicSummaryProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-[220px] animate-pulse" />
    );
  }

  const dailyLoss = summary?.citywide_daily_loss ?? 0;
  const monthlyLoss = summary?.citywide_monthly_loss ?? 0;
  const yearlyLoss = summary?.citywide_yearly_loss ?? 0;
  
  // Potential Savings: 30% reduction scenario
  const targetReduction = 30; // 30% reduction target
  const dailySavings = dailyLoss * (targetReduction / 100);
  const monthlySavings = monthlyLoss * (targetReduction / 100);
  const yearlySavings = yearlyLoss * (targetReduction / 100);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full min-h-[220px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Economic Impact Aggregator
            </h3>
          </div>
          <Link
            href="/economic-impact"
            className="text-[10px] font-bold text-emerald-600 hover:text-[#0F4C81] uppercase tracking-wider font-mono border-b border-emerald-500/0 hover:border-emerald-400 transition-all"
          >
            Full Audit
          </Link>
        </div>
        <p className="text-slate-500 text-[10px] font-mono mb-4">
          Direct fuel waste, worker productivity loss, and congestion delay valuations
        </p>

        {/* Aggregated Losses Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4 font-mono">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[8px] text-slate-500 uppercase font-bold block">Daily Cost</span>
            <span className="text-sm font-black text-rose-600 block mt-1">{formatRupeesLocal(dailyLoss)}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[8px] text-slate-500 uppercase font-bold block">Monthly Cost</span>
            <span className="text-sm font-black text-rose-600 block mt-1">{formatRupeesLocal(monthlyLoss)}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[8px] text-slate-500 uppercase font-bold block">Yearly Cost</span>
            <span className="text-sm font-black text-rose-600 block mt-1">{formatRupeesLocal(yearlyLoss)}</span>
          </div>
        </div>

        {/* Potential Savings Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start space-x-3">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-mono text-[10px] leading-relaxed">
            <span className="text-emerald-600 font-bold uppercase block tracking-wider mb-0.5">
              Target operational Recovery Potential (30% Reduction)
            </span>
            <p className="text-slate-600">
              Saving <strong className="text-slate-100 font-bold">{formatRupeesLocal(dailySavings)}/day</strong> or up to <strong className="text-slate-100 font-bold">{formatRupeesLocal(yearlySavings)}/year</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
