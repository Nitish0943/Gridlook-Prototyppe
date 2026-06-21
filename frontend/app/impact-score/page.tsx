'use client';

import React, { useMemo } from 'react';
import { Gauge, ShieldAlert, Award, FileSpreadsheet, Percent, HelpCircle } from 'lucide-react';

// Hooks
import { useImpactData, useImpactSummary } from '../../lib/hooks/useImpact';

// Components
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import ImpactBarChart from '../../components/charts/ImpactBarChart';
import ImpactPieChart from '../../components/charts/ImpactPieChart';

export default function ImpactScorePage() {
  const { data: impactData, isLoading: impactLoading, isError: impactError, refetch } = useImpactData();
  const { data: impactSummary, isLoading: impactSummaryLoading } = useImpactSummary();

  const isLoading = impactLoading || impactSummaryLoading;

  const highestImpactArea = useMemo(() => {
    if (!impactData || impactData.length === 0) return null;
    return impactData[0]; // Already sorted by rank/score desc
  }, [impactData]);

  if (impactError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  const kpis = [
    {
      title: 'Avg Impact Score',
      value: impactSummary?.average_impact_score.toFixed(1) ?? '0.0',
      icon: Gauge,
      color: 'text-cyan-400',
    },
    {
      title: 'Critical Locations',
      value: impactSummary?.critical_locations ?? 0,
      icon: ShieldAlert,
      color: 'text-rose-500',
    },
    {
      title: 'Highest Impact Area',
      value: highestImpactArea ? `${highestImpactArea.impact_score}/100` : '0/100',
      subtitle: highestImpactArea?.junction_name.replace(' JUNCTION', '') ?? '',
      icon: Award,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parking Impact Score Engine"
        description="Analyses junction traffic disruption levels caused by illegal parking"
      />

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:bg-slate-900/60 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl font-black text-slate-100 mt-1.5 font-mono truncate">
                    {kpi.value}
                  </h3>
                  {kpi.subtitle && (
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate uppercase">
                      {kpi.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-2 bg-slate-950/60 border border-slate-850 rounded-lg ${kpi.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula card & Top 10 Bar Chart side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formula Explainer Card */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Congestion Impact Formula</span>
            </h3>

            {/* Styled human-readable formula card */}
            <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-5 mb-5 relative overflow-hidden font-mono text-left">
              <div className="absolute top-0 right-0 p-1.5 text-[8px] bg-cyan-950/40 border-b border-l border-cyan-850 text-cyan-400 rounded-bl font-black uppercase">
                scoring engine
              </div>
              <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3">Normalized equation</p>
              <div className="space-y-1.5 text-xs font-bold text-slate-100">
                <div className="text-cyan-400 text-sm font-black mb-2">Impact Score =</div>
                <div className="pl-4 flex items-center space-x-1">
                  <span className="text-slate-600">(</span>
                  <span className="text-cyan-300">0.4</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-slate-100">Frequency</span>
                  <span className="text-slate-600">)</span>
                </div>
                <div className="pl-4 flex items-center space-x-1">
                  <span className="text-cyan-400 font-extrabold">+</span>
                  <span className="text-slate-600">(</span>
                  <span className="text-cyan-300">0.3</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-slate-100 font-semibold">Peak Hour Violations</span>
                  <span className="text-slate-600">)</span>
                </div>
                <div className="pl-4 flex items-center space-x-1">
                  <span className="text-cyan-400 font-extrabold">+</span>
                  <span className="text-slate-600">(</span>
                  <span className="text-cyan-300">0.2</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-slate-100 font-semibold">Repeat Offenders</span>
                  <span className="text-slate-600">)</span>
                </div>
                <div className="pl-4 flex items-center space-x-1">
                  <span className="text-cyan-400 font-extrabold">+</span>
                  <span className="text-slate-600">(</span>
                  <span className="text-cyan-300">0.1</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-slate-100 font-semibold">Violation Diversity</span>
                  <span className="text-slate-600">)</span>
                </div>
              </div>
            </div>

            {/* Parameter breakdown list */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Violation Frequency (40%)</span>
                </span>
                <span className="text-slate-100 font-mono font-bold">0.4 Freq</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Peak Hour Violations (30%)</span>
                </span>
                <span className="text-slate-100 font-mono font-bold">0.3 Peak</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Repeat Offender Index (20%)</span>
                </span>
                <span className="text-slate-100 font-mono font-bold">0.2 Repeat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Violation Type Diversity (10%)</span>
                </span>
                <span className="text-slate-100 font-mono font-bold">0.1 Div</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 leading-normal font-sans italic">
            * Jaccard similarities and normalized vehicle-to-violation ratios are calculated per junction.
          </p>
        </div>

        {/* Top 10 chart (2/3 width) */}
        <div className="lg:col-span-2">
          <ImpactBarChart data={impactData} isLoading={isLoading} />
        </div>
      </div>

      {/* Ranking Table & Pie Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Locations Table */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Ranked Traffic Disruption Locations
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-850 rounded-lg">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-850 text-slate-400 font-mono">
                    <th className="px-4 py-2.5 font-bold uppercase">Rank</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Junction Name</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Violations</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Repeat Offenders</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Peak Hour</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {impactData && impactData.slice(0, 8).map((loc) => (
                    <tr key={loc.junction_name} className="border-b border-slate-850/50 hover:bg-slate-900/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-400">#{loc.rank}</td>
                      <td className="px-4 py-2.5 text-slate-100 font-semibold">{loc.junction_name}</td>
                      <td className="px-4 py-2.5 font-mono text-cyan-450">{loc.violations.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-amber-500">{loc.repeat_offenders.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-450">{loc.peak_hour_violations.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono font-black text-rose-450">{loc.impact_score}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Severity Category Distribution Chart */}
        <div>
          <ImpactPieChart summary={impactSummary} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
