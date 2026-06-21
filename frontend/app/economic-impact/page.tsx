'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  useEconomicImpactData,
  useEconomicImpactSummary,
  useEconomicImpactTrends,
  useEconomicImpactMap,
} from '../../lib/hooks/useEconomicImpact';

import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import EconomicKPIs from '../../components/economic-impact/EconomicKPIs';
import EconomicLossTable from '../../components/economic-impact/EconomicLossTable';
import CostBreakdownChart from '../../components/economic-impact/CostBreakdownChart';
import EconomicTrendChart from '../../components/economic-impact/EconomicTrendChart';
import SavingsSimulator from '../../components/economic-impact/SavingsSimulator';
import ExecutiveInsights from '../../components/economic-impact/ExecutiveInsights';

const EconomicMap = dynamic(() => import('../../components/economic-impact/EconomicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading Economic GIS Map...
    </div>
  ),
});

export default function EconomicImpactPage() {
  const { data: listResponse, isLoading: listLoading, isError: listError, refetch: refetchList } = useEconomicImpactData();
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useEconomicImpactSummary();
  const { data: trendResponse, isLoading: trendLoading, isError: trendError, refetch: refetchTrends } = useEconomicImpactTrends();
  const { data: mapResponse, isLoading: mapLoading, isError: mapError, refetch: refetchMap } = useEconomicImpactMap();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Economic Impact Analysis"
        description="Quantify and analyze the municipal financial costs, travel delay waste, and productivity losses caused by parking violations."
      />

      {/* ROW 1: Executive KPI Cards */}
      <EconomicKPIs summary={summary} isLoading={isLoading} />

      {/* ROW 2 & 3: Map and Rankings Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px]">
          <EconomicMap mapData={mapResponse} isLoading={isLoading} />
        </div>
        <div className="h-[500px]">
          <EconomicLossTable locations={listResponse?.locations} isLoading={isLoading} />
        </div>
      </div>

      {/* ROW 4 & 5: Cost Breakdown & Economic Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostBreakdownChart locations={listResponse?.locations} isLoading={isLoading} />
        <EconomicTrendChart trends={trendResponse?.trends} isLoading={isLoading} />
      </div>

      {/* ROW 6 & 7: Savings Simulation & Executive Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsSimulator yearlyLoss={summary?.citywide_yearly_loss} isLoading={isLoading} />
        <ExecutiveInsights summary={summary} locations={listResponse?.locations} isLoading={isLoading} />
      </div>
    </div>
  );
}
