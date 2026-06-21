'use client';

import React, { useMemo } from 'react';
import { UserCheck, ShieldAlert, TrendingDown, Sparkles, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Hooks
import { useRecommendations, useRecommendationsSummary } from '../../lib/hooks/useRecommendations';

// Components
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import RecommendationTable from '../../components/tables/RecommendationTable';

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#10b981',
};

export default function RecommendationsPage() {
  const { data: recommendations, isLoading: recommendationsLoading, isError, refetch } = useRecommendations();
  const { data: summary, isLoading: summaryLoading } = useRecommendationsSummary();

  const isLoading = recommendationsLoading || summaryLoading;

  // Calculate total officers required
  const totalOfficers = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return 0;
    return recommendations.reduce((acc, r) => acc + r.officers, 0);
  }, [recommendations]);

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  const kpis = [
    {
      title: 'Critical Zones',
      value: summary?.critical_zones ?? 0,
      icon: ShieldAlert,
      color: 'text-rose-500',
    },
    {
      title: 'Enforcement Officers Req.',
      value: totalOfficers,
      icon: UserCheck,
      color: 'text-cyan-400',
    },
    {
      title: 'Est. Citywide Relief',
      value: `${summary?.estimated_citywide_reduction ?? 0}%`,
      icon: TrendingDown,
      color: 'text-emerald-500',
    },
  ];

  // Bar chart data for Priority Distribution
  const priorityChartData = [
    { name: 'Critical', count: summary?.critical_zones ?? 0, color: PRIORITY_COLORS.Critical },
    { name: 'High', count: summary?.high_zones ?? 0, color: PRIORITY_COLORS.High },
    // Compute others dynamically or represent typical distribution
    { name: 'Medium', count: recommendations ? recommendations.filter(r => r.priority === 'Medium').length : 0, color: PRIORITY_COLORS.Medium },
    { name: 'Low', count: recommendations ? recommendations.filter(r => r.priority === 'Low').length : 0, color: PRIORITY_COLORS.Low },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enforcement Recommendation Engine"
        description="AI-prioritized deployment schedules and municipal traffic management plans"
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
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl font-black text-slate-100 mt-1.5 font-mono">
                    {kpi.value.toLocaleString()}
                  </h3>
                </div>
                <div className={`p-2 bg-slate-950/60 border border-slate-850 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Table */}
        <div className="lg:col-span-2">
          <RecommendationTable data={recommendations} isLoading={isLoading} />
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4">
              Priority Zones Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(30, 41, 59, 0.3)' }}
                    contentStyle={{ background: '#020617', borderColor: '#1e293b' }}
                    labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={25}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Cards describing Deployment Rationale */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>AI Deployment Rationale & Analysis</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations && recommendations.slice(0, 6).map((rec) => {
            const color = PRIORITY_COLORS[rec.priority];
            return (
              <div
                key={rec.junction_name}
                className="bg-slate-950/50 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                    <span className="font-mono font-bold text-slate-500">#{rec.rank}</span>
                    <span
                      className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded border font-mono"
                      style={{ color, backgroundColor: `${color}10`, borderColor: `${color}30` }}
                    >
                      {rec.priority} Score: {rec.priority_score}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider truncate mb-2">
                    {rec.junction_name}
                  </h4>

                  <p className="text-slate-400 text-xs leading-normal">
                    {rec.reason}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-900/50 pt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>WINDOW: {rec.recommended_time_window}</span>
                  <span className="text-emerald-400 font-semibold">-{rec.expected_congestion_reduction}% FLOW</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
