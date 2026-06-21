'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  useForecastData,
  useForecastSummary,
  useForecastTrends,
  useForecastMap,
} from '../../lib/hooks/useForecast';

import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import ForecastKPIs from '../../components/forecast/ForecastKPIs';
import ForecastTable from '../../components/forecast/ForecastTable';
import ForecastTrendChart from '../../components/forecast/ForecastTrendChart';
import EmergingHotspots from '../../components/forecast/EmergingHotspots';
import ForecastComparison from '../../components/forecast/ForecastComparison';
import ForecastInsights from '../../components/forecast/ForecastInsights';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { formatRupees } from '../../components/economic-impact/EconomicKPIs';

const ForecastMap = dynamic(() => import('../../components/forecast/ForecastMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading Predictive GIS Map...
    </div>
  ),
});

export default function ForecastPage() {
  const { data: forecastList, isLoading: listLoading, isError: listError, refetch: refetchList } = useForecastData();
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useForecastSummary();
  const { data: trendResponse, isLoading: trendLoading, isError: trendError, refetch: refetchTrends } = useForecastTrends();
  const { data: mapResponse, isLoading: mapLoading, isError: mapError, refetch: refetchMap } = useForecastMap();

  const [reduction, setReduction] = useState<number>(0); // 0% means baseline current forecast

  const isLoading = listLoading || summaryLoading || trendLoading || mapLoading;
  const isError = listError || summaryError || trendError || mapError;

  const handleRetry = () => {
    refetchList();
    refetchSummary();
    refetchTrends();
    refetchMap();
  };

  if (isError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  // Calculate base predicted violations sum
  const baseMonthlyViolations = forecastList?.forecast.reduce((acc, curr) => acc + curr.predicted_violations, 0) ?? 0;
  
  // Simulated stats
  const simulatedMonthlyViolations = Math.max(0, Math.round(baseMonthlyViolations * (1 - reduction / 100)));
  const simulatedHighRiskCount = Math.max(0, Math.round((summary?.high_risk_areas ?? 0) * (1 - reduction / 150)));
  const simulatedCriticalCount = Math.max(0, Math.round((summary?.critical_future_hotspots ?? 0) * (1 - reduction / 120)));
  
  // Future Savings: based on economic cost per violation of ₹42.5
  // yearly base predicted violations = baseMonthlyViolations * 12
  const simulatedYearlySavings = baseMonthlyViolations * 12 * 42.5 * (reduction / 100);

  // Future Capacity Recovery: 0.3% per percent of violation reduction capped at 100%
  const simulatedCapacityRecovery = (reduction * 0.45).toFixed(1);

  // Apply simulation parameters to list data if reduction is active
  const displayForecastList = forecastList?.forecast.map((loc) => {
    if (reduction > 0) {
      const simPred = Math.max(0, Math.round(loc.predicted_violations * (1 - reduction / 100)));
      const simRiskScore = Math.max(0, Math.round(loc.future_risk_score * (1 - reduction / 150)));
      let simRisk = 'Low';
      if (simRiskScore >= 81) simRisk = 'Critical';
      else if (simRiskScore >= 61) simRisk = 'High';
      else if (simRiskScore >= 31) simRisk = 'Medium';

      return {
        ...loc,
        predicted_violations: simPred,
        future_risk_score: simRiskScore,
        risk: simRisk as any,
      };
    }
    return loc;
  });

  const displayMapResponse = mapResponse ? {
    locations: mapResponse.locations.map((loc) => {
      if (reduction > 0) {
        const simPred = Math.max(0, Math.round(loc.predicted_violations * (1 - reduction / 100)));
        const simRiskScore = Math.max(0, Math.round(loc.future_risk_score * (1 - reduction / 150)));
        let simRisk = 'Low';
        if (simRiskScore >= 81) simRisk = 'Critical';
        else if (simRiskScore >= 61) simRisk = 'High';
        else if (simRiskScore >= 31) simRisk = 'Medium';

        return {
          ...loc,
          predicted_violations: simPred,
          future_risk_score: simRiskScore,
          risk: simRisk,
          radius: Math.max(5, intScale(simPred)),
        };
      }
      return loc;
    })
  } : undefined;

  function intScale(val: number) {
    return int(min(30, val / 40));
  }
  function int(val: number) {
    return Math.floor(val);
  }
  function min(a: number, b: number) {
    return Math.min(a, b);
  }

  const simulatedSummary = summary ? {
    ...summary,
    high_risk_areas: simulatedHighRiskCount,
    critical_future_hotspots: simulatedCriticalCount,
  } : undefined;

  // Simulated Trends
  const displayTrends = trendResponse ? {
    ...trendResponse,
    daily: trendResponse.daily.map((t) => ({
      ...t,
      predicted: Math.max(0, Math.round(t.predicted * (1 - reduction / 100))),
    }))
  } : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="Future Parking Risk Forecast"
          description="Holt-Winters predictive analytics forecasting upcoming violations, emerging hotspots, and projected traffic risks."
        />

        {/* Digital Twin Control Bar */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 max-w-md w-full shrink-0 shadow-lg">
          <div className="flex items-center space-x-2 shrink-0">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-mono font-bold text-slate-100 uppercase tracking-wider">Simulation Mode</span>
          </div>
          
          <div className="flex items-center space-x-2 w-full">
            <span className="text-[9px] font-mono text-slate-500 shrink-0">Reduction:</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 w-full justify-between">
              {[0, 10, 20, 30, 50].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setReduction(opt)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                    reduction === opt
                      ? 'bg-purple-950 text-purple-400 border border-purple-800/40 shadow-inner'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  {opt === 0 ? 'Off' : `${opt}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 1: Forecast KPI Cards */}
      <ForecastKPIs
        summary={simulatedSummary}
        predictedMonthlyViolations={simulatedMonthlyViolations}
        isLoading={isLoading}
      />

      {/* Digital Twin Impact Indicator Alert (if reduction is active) */}
      {reduction > 0 && (
        <div className="bg-purple-950/20 border border-purple-800/30 rounded-xl p-4 flex items-center space-x-4 hover:border-purple-800/50 transition-colors shadow-2xl">
          <div className="p-2.5 bg-purple-950/60 border border-purple-850/50 rounded-lg text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-slate-100 text-xs font-mono font-bold uppercase tracking-wider">
              Active Digital Twin Simulation Impact (-{reduction}%)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 mt-1 text-[10px] font-mono">
              <p className="text-slate-400">
                Future Savings: <span className="text-emerald-400 font-bold">{formatRupees(simulatedYearlySavings)}/year</span>
              </p>
              <p className="text-slate-400">
                Capacity Recovery: <span className="text-cyan-400 font-bold">+{simulatedCapacityRecovery}% lane flow</span>
              </p>
              <p className="text-slate-400">
                Critical Hotspots: <span className="text-slate-100 font-bold">{simulatedCriticalCount} remaining</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ROW 2 & 3: Forecast GIS Map and rankings table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px]">
          <ForecastMap mapData={displayMapResponse} isLoading={isLoading} />
        </div>
        <div className="h-[500px]">
          <ForecastTable locations={displayForecastList} isLoading={isLoading} />
        </div>
      </div>

      {/* ROW 4 & 5: Forecast Trend and Emerging Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ForecastTrendChart dailyTrends={displayTrends?.daily} isLoading={isLoading} />
        </div>
        <div className="h-full">
          <ForecastComparison locations={displayForecastList} isLoading={isLoading} />
        </div>
      </div>

      {/* ROW 6 & 7: Emerging Hotspots Row & AI Forecast Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmergingHotspots locations={displayForecastList} isLoading={isLoading} />
        </div>
        <div>
          <ForecastInsights summary={simulatedSummary} locations={displayForecastList} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
