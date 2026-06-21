'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useCapacityLossData, useCapacityLossSummary, useCapacityLossMap } from '../../lib/hooks/useCapacityLoss';

import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import CapacityLossKPIs from '../../components/capacity-loss/CapacityLossKPIs';
import CapacityLossTable from '../../components/capacity-loss/CapacityLossTable';
import CapacityDistributionChart from '../../components/capacity-loss/CapacityDistributionChart';
import CapacityInsights from '../../components/capacity-loss/CapacityInsights';

const CapacityLossMap = dynamic(() => import('../../components/capacity-loss/CapacityLossMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading GIS Map...
    </div>
  ),
});

export default function CapacityLossPage() {
  const { data: capacityLossList, isLoading: listLoading, isError: listError, refetch: refetchList } = useCapacityLossData();
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useCapacityLossSummary();
  const { data: mapData, isLoading: mapLoading, isError: mapError, refetch: refetchMap } = useCapacityLossMap();

  const isLoading = listLoading || summaryLoading || mapLoading;
  const isError = listError || summaryError || mapError;

  const handleRetry = () => {
    refetchList();
    refetchSummary();
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
        title="Road Capacity Loss Estimator"
        description="Analyze road capacity reduction and traffic flow obstruction caused by illegal street parking violations."
      />

      <CapacityLossKPIs summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map, Chart, and Insights (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[500px]">
            <CapacityLossMap mapData={mapData} isLoading={isLoading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CapacityDistributionChart locations={capacityLossList?.locations} isLoading={isLoading} />
            <CapacityInsights summary={summary} locations={capacityLossList?.locations} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Column: Table (1/3 width) */}
        <div className="h-full">
          <CapacityLossTable locations={capacityLossList?.locations} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
