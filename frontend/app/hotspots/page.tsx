'use client';

import React, { useMemo } from 'react';
import { Flame, ShieldAlert, Award, Grid, Compass, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Hooks
import { useHotspots, useHotspotsSummary } from '../../lib/hooks/useHotspots';
import { useImpactData } from '../../lib/hooks/useImpact';

// Components
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import HotspotHeatmap from '../../components/maps/HotspotHeatmap';

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#10b981',
};

export default function HotspotsPage() {
  const { data: hotspots, isLoading: hotspotsLoading, isError: hotspotsError, refetch } = useHotspots();
  const { data: hotspotsSummary, isLoading: hotspotsSummaryLoading } = useHotspotsSummary();
  const { data: impactData, isLoading: impactLoading } = useImpactData();

  const isLoading = hotspotsLoading || hotspotsSummaryLoading || impactLoading;

  // Compute cluster analytics metrics
  const clusterStats = useMemo(() => {
    if (!hotspots || hotspots.length === 0) return null;

    const totalViolations = hotspots.reduce((acc, h) => acc + h.violation_count, 0);
    const avgViolations = totalViolations / hotspots.length;

    const largestCluster = hotspots[0]; // Sorted by count desc
    const activeJunction = impactData && impactData.length > 0 ? impactData[0] : null;

    return {
      avgViolations,
      largestCluster,
      activeJunction,
    };
  }, [hotspots, impactData]);

  if (hotspotsError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  const kpis = [
    {
      title: 'Total Hotspots',
      value: hotspotsSummary?.total_hotspots ?? 0,
      icon: Flame,
      color: 'text-amber-500',
    },
    {
      title: 'Critical Hotspots',
      value: hotspotsSummary?.critical_hotspots ?? 0,
      icon: ShieldAlert,
      color: 'text-rose-500',
    },
    {
      title: 'Avg Violations / Hotspot',
      value: clusterStats ? Math.round(clusterStats.avgViolations) : 0,
      icon: Award,
      color: 'text-cyan-400',
    },
  ];

  // Bar chart data for Severity Distribution
  const barChartData = [
    { name: 'Critical', count: hotspotsSummary?.critical_hotspots ?? 0, color: SEVERITY_COLORS.Critical },
    { name: 'High', count: hotspotsSummary?.high_hotspots ?? 0, color: SEVERITY_COLORS.High },
    { name: 'Medium', count: hotspotsSummary?.medium_hotspots ?? 0, color: SEVERITY_COLORS.Medium },
    { name: 'Low', count: hotspotsSummary?.low_hotspots ?? 0, color: SEVERITY_COLORS.Low },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parking Hotspot Engine"
        description="Geospatial DBSCAN density-based clustering analytics"
      />

      {/* KPI Cards */}
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

      {/* Full-width Map */}
      <div className="h-[450px]">
        <HotspotHeatmap hotspots={hotspots} isLoading={isLoading} />
      </div>

      {/* Table & Chart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Hotspots Table */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4">
              Ranked Hotspot Clusters
            </h3>
            <div className="overflow-x-auto border border-slate-850 rounded-lg">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-850 text-slate-400 font-mono">
                    <th className="px-4 py-2.5 font-bold uppercase">Rank</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Sector / Center Coords</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Violations</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Severity</th>
                    <th className="px-4 py-2.5 font-bold uppercase">Overseers</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots && hotspots.slice(0, 8).map((hs) => (
                    <tr key={hs.cluster_id} className="border-b border-slate-850/50 hover:bg-slate-900/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-400">#{hs.rank}</td>
                      <td className="px-4 py-2.5 text-slate-100 font-semibold font-mono">
                        Sector {hs.cluster_id} ({hs.latitude.toFixed(4)}, {hs.longitude.toFixed(4)})
                      </td>
                      <td className="px-4 py-2.5 font-mono text-cyan-400 font-bold">{hs.violation_count.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border tracking-wider font-mono"
                          style={{
                            color: SEVERITY_COLORS[hs.severity],
                            backgroundColor: `${SEVERITY_COLORS[hs.severity]}10`,
                            borderColor: `${SEVERITY_COLORS[hs.severity]}30`,
                          }}
                        >
                          {hs.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{hs.police_stations} Stations</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Severity Distribution Bar Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4">
              Hotspot Severity Distribution
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
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
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Analytics Summary */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
          <Grid className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Hotspot Analytics Summary</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Largest Cluster */}
          <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 flex items-start space-x-3.5">
            <div className="p-2 bg-rose-950/40 border border-rose-800/30 text-rose-450 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Largest Cluster</p>
              <h4 className="text-sm font-bold text-slate-100 mt-1">Sector {clusterStats?.largestCluster?.cluster_id}</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Violations: <span className="text-rose-450 font-bold font-mono">{clusterStats?.largestCluster?.violation_count.toLocaleString()}</span>
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                Coords: ({clusterStats?.largestCluster?.latitude.toFixed(4)}, {clusterStats?.largestCluster?.longitude.toFixed(4)})
              </p>
            </div>
          </div>

          {/* Most Active Junction */}
          <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 flex items-start space-x-3.5">
            <div className="p-2 bg-amber-950/40 border border-amber-800/30 text-amber-500 rounded-lg">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Most Active Junction</p>
              <h4 className="text-sm font-bold text-slate-100 mt-1 truncate max-w-[170px]">
                {clusterStats?.activeJunction?.junction_name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Violations: <span className="text-amber-500 font-bold font-mono">{clusterStats?.activeJunction?.violations.toLocaleString()}</span>
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                Impact score: {clusterStats?.activeJunction?.impact_score}
              </p>
            </div>
          </div>

          {/* Most Active Police Station */}
          <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 flex items-start space-x-3.5">
            <div className="p-2 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Most Active Police District</p>
              <h4 className="text-sm font-bold text-slate-100 mt-1">Shivajinagar Traffic PS</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Oversees <span className="text-cyan-400 font-bold font-mono">16</span> hotspots in active grid
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                Status: Deployment priority high
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
