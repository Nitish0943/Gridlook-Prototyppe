'use client';

import React from 'react';
import { ShieldAlert, Flame, AlertTriangle, TrendingUp, Eye, IndianRupee, Activity, TrendingDown } from 'lucide-react';
import { StatsResponse, HotspotsSummaryResponse, ImpactSummaryResponse, ForecastSummaryResponse, EconomicImpactSummaryResponse, CapacityLossSummaryResponse } from '../../lib/types';
import { formatRupeesLocal } from './DashboardEconomicSummary';

interface DashboardKPIsProps {
  stats?: StatsResponse;
  hotspotsSummary?: HotspotsSummaryResponse;
  impactSummary?: ImpactSummaryResponse;
  forecastSummary?: ForecastSummaryResponse;
  economicSummary?: EconomicImpactSummaryResponse;
  capacitySummary?: CapacityLossSummaryResponse;
  isLoading: boolean;
}

export default function DashboardKPIs({
  stats,
  hotspotsSummary,
  impactSummary,
  forecastSummary,
  economicSummary,
  capacitySummary,
  isLoading,
}: DashboardKPIsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-xl p-6 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const execKpis = [
    {
      title: 'Total Violations',
      value: stats?.total_violations.toLocaleString() ?? '0',
      icon: ShieldAlert,
      color: 'text-[#0F4C81]',
      bgColor: 'bg-blue-50 border-blue-100',
      borderColor: 'border-slate-200 hover:border-blue-300 shadow-sm',
      trend: '+12.4% vs last week',
      trendUp: true,
      desc: 'Total registered parking violations citywide',
    },
    {
      title: 'Critical Hotspots',
      value: hotspotsSummary?.critical_hotspots.toString() ?? '0',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-100',
      borderColor: 'border-slate-200 hover:border-rose-300 shadow-sm',
      trend: 'Immediate intervention required',
      trendUp: true,
      desc: 'Junctions requiring active enforcement',
    },
    {
      title: 'Daily Economic Loss',
      value: formatRupeesLocal(economicSummary?.citywide_daily_loss ?? 0),
      icon: IndianRupee,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      borderColor: 'border-slate-200 hover:border-emerald-300 shadow-sm',
      trend: 'Congestion cost (commuter time + fuel waste)',
      trendUp: false,
      desc: 'Daily monetized citywide waste',
    },
  ];

  const analyticalKpis = [
    {
      title: 'Total Hotspots',
      value: hotspotsSummary?.total_hotspots.toString() ?? '0',
      icon: Flame,
      color: 'text-amber-500',
      borderColor: 'border-slate-200 hover:border-amber-200 shadow-xs',
      trend: '+3 new clusters',
      trendUp: true,
      desc: 'Active congestion hotspots',
    },
    {
      title: 'Avg Impact Score',
      value: impactSummary?.average_impact_score.toFixed(1) ?? '0.0',
      icon: TrendingUp,
      color: 'text-purple-500',
      borderColor: 'border-slate-200 hover:border-purple-200 shadow-xs',
      trend: '-1.4 this cycle',
      trendUp: false,
      desc: 'Arterial impact index',
    },
    {
      title: 'Future Risk Areas',
      value: forecastSummary?.high_risk_areas.toString() ?? '0',
      icon: Eye,
      color: 'text-indigo-500',
      borderColor: 'border-slate-200 hover:border-indigo-200 shadow-xs',
      trend: '+2 projected (30d)',
      trendUp: true,
      desc: 'Emerging risk areas',
    },
    {
      title: 'Capacity Loss',
      value: `${capacitySummary?.citywide_capacity_loss.toFixed(0) ?? '0'}%`,
      icon: Activity,
      color: 'text-orange-500',
      borderColor: 'border-slate-200 hover:border-orange-200 shadow-xs',
      trend: 'Corridor flow reduction',
      trendUp: true,
      desc: 'Arterial flow loss',
    },
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Top Tier: Executive KPIs */}
      <div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-2">
          Executive Command Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {execKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className={`bg-white border rounded-xl p-5 hover:bg-slate-50/50 transition-all duration-300 ${kpi.borderColor}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">
                      {kpi.title}
                    </p>
                    <h3 className="text-3xl font-black text-slate-100 mt-2 font-mono">
                      {kpi.value}
                    </h3>
                  </div>
                  <div className={`p-2.5 rounded-lg border shrink-0 ${kpi.bgColor} ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col font-sans text-[10px]">
                  <span className={`font-bold ${kpi.trendUp && kpi.title === 'Critical Hotspots' ? 'text-rose-600' : 'text-slate-500'}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-slate-400 mt-0.5">{kpi.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Tier: Analytical KPIs */}
      <div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-2">
          Sector Analytical Metrics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analyticalKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className={`bg-white border rounded-xl p-4 hover:bg-slate-50/50 transition-all duration-300 ${kpi.borderColor}`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans truncate">
                      {kpi.title}
                    </p>
                    <h3 className="text-xl font-bold text-slate-100 mt-1 font-mono truncate">
                      {kpi.value}
                    </h3>
                  </div>
                  <div className={`p-1.5 bg-slate-50 border border-slate-200 rounded-lg ${kpi.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                
                <div className="mt-3 flex flex-col font-sans text-[9px]">
                  <span className={`font-bold ${kpi.trendUp ? 'text-rose-500' : 'text-slate-500'}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-slate-400 mt-0.5 truncate">{kpi.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
