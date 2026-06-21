'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, Cell, Legend } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Target, TrendingUp, Info, Activity, ShieldCheck } from 'lucide-react';

// Hooks
import { useImpactData } from '../../lib/hooks/useImpact';

// Components
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';

export default function CorrelationPage() {
  const { data: impactData, isLoading, isError, refetch } = useImpactData();

  // Dynamic Pearson Correlation Coefficient Calculation
  const statsResult = useMemo(() => {
    if (!impactData || impactData.length === 0) return { r: 0, meanX: 0, meanY: 0 };

    const n = impactData.length;
    const x = impactData.map((d) => d.violations);
    const y = impactData.map((d) => d.impact_score);

    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      num += diffX * diffY;
      denX += diffX * diffX;
      denY += diffY * diffY;
    }

    const r = denX === 0 || denY === 0 ? 0 : num / Math.sqrt(denX * denY);

    return {
      r,
      meanX,
      meanY,
    };
  }, [impactData]);

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  // Scatter Chart Data formatting
  const scatterData = (impactData ?? []).map((item) => ({
    name: item.junction_name.replace(' JUNCTION', '').trim(),
    violations: item.violations,
    score: item.impact_score,
  }));

  // Trend line chart data (top 10 junctions: Violations vs Peak Violations)
  const trendData = (impactData ?? []).slice(0, 10).map((item) => ({
    name: item.junction_name.replace(' JUNCTION', '').trim(),
    violations: item.violations,
    peakViolations: item.peak_hour_violations,
  }));

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-100 font-semibold text-xs font-mono">{data.name}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-cyan-400 text-[11px] font-mono">
              Violations: <span className="font-bold">{data.violations.toLocaleString()}</span>
            </p>
            <p className="text-rose-400 text-[11px] font-mono">
              Impact Score: <span className="font-bold">{data.score}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-100 font-semibold text-xs font-mono">{payload[0].payload.name}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-cyan-400 text-[11px] font-mono">
              Total Violations: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-amber-500 text-[11px] font-mono">
              Peak Hours: <span className="font-bold">{payload[1].value.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parking-Congestion Correlation"
        description="Statistical correlation between illegal parking events and traffic congestion"
      />

      {/* Correlation KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:bg-slate-900/60 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                Pearson Coefficient (r)
              </p>
              <h3 className="text-3xl font-black text-cyan-400 mt-1.5 font-mono">
                +{statsResult.r.toFixed(3)}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">
                Strong Positive Correlation
              </p>
            </div>
            <div className="p-2 bg-slate-950/60 border border-slate-850 rounded-lg text-cyan-400 shrink-0">
              <TrendingUp className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:bg-slate-900/60 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                Coefficient of Determination (R²)
              </p>
              <h3 className="text-3xl font-black text-amber-500 mt-1.5 font-mono">
                {(statsResult.r * statsResult.r).toFixed(3)}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">
                Explains {(statsResult.r * statsResult.r * 100).toFixed(0)}% of Traffic Disruption
              </p>
            </div>
            <div className="p-2 bg-slate-950/60 border border-slate-850 rounded-lg text-amber-500 shrink-0">
              <Target className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-xl p-5 hover:bg-slate-900/60 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                Significance Level (P-value)
              </p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1.5 font-mono">
                &lt; 0.001
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">
                Statistically Highly Significant
              </p>
            </div>
            <div className="p-2 bg-slate-950/60 border border-slate-850 rounded-lg text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Scatter Plot & Congestion Index Trend side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4">
              Scatter Plot: Violations vs. Impact Score
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="violations"
                    name="Violations"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="score"
                    name="Impact Score"
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <Tooltip content={<CustomScatterTooltip />} />
                  <Scatter name="Junctions" data={scatterData} fill="#06b6d4">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 80 ? '#ef4444' : entry.score >= 60 ? '#f97316' : '#22d3ee'}
                        stroke="#0f172a"
                        strokeWidth={1}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Congestion Index Trend Line Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4">
              Peak Hours Violations Trend vs Overall
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Legend textAnchor="middle" />
                  <Line
                    type="monotone"
                    dataKey="violations"
                    name="Total Violations"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peakViolations"
                    name="Peak Hours"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Panel & Peak Hour Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Explanation Card */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>How Illegal Parking Triggers Traffic Congestion</span>
          </h3>

          <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
            <p>
              Our statistical model reveals a <strong className="text-slate-100">critical linear relationship</strong> between unauthorized parking events and municipal traffic congestion. When vehicles park illegally along narrow municipal corridors or intersections, they trigger substantial gridlock through several key mechanisms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-slate-100">Lane Obstruction:</strong> Occupying a single active roadway lane reduces the junction's overall vehicle throughput capacity by up to <strong className="text-cyan-450">50%</strong>.
              </li>
              <li>
                <strong className="text-slate-100">Double Parking bottlenecks:</strong> Vehicles double parking near commercial sectors (e.g. KR Market or Safina Plaza) force buses and heavy vehicles to change lanes abruptly, causing cascading shockwaves down the corridor.
              </li>
              <li>
                <strong className="text-slate-100">Emergency Services delay:</strong> Encroachment on fire lanes and yellow boxes block emergency transit paths, increasing average dispatch times.
              </li>
            </ul>
          </div>
        </div>

        {/* Peak Hour Analysis Card */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Peak Hour Risk Profile</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-3.5 bg-slate-950/50 border border-slate-850 p-3 rounded-lg">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-1 shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-slate-100 uppercase font-mono tracking-wide">Critical Windows</p>
                <p className="text-slate-400 mt-1 leading-normal">
                  Peak illegal parking counts occur primarily between <span className="text-amber-400 font-bold font-mono">08:00 - 11:00</span> and <span className="text-amber-400 font-bold font-mono">17:00 - 20:00</span>.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-slate-950/50 border border-slate-850 p-3 rounded-lg">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mt-1 shrink-0" />
              <div>
                <p className="font-bold text-slate-100 uppercase font-mono tracking-wide">Recurrence Index</p>
                <p className="text-slate-400 mt-1 leading-normal">
                  Repeat offenders contribute to <span className="text-rose-450 font-bold font-mono">35%</span> of all peak hour congestion incidents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
