'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSpilloverData, useSpilloverSummary, useSpilloverMapData } from '../../lib/hooks/useSpillover';

import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import SpilloverKPIs from '../../components/spillover/SpilloverKPIs';
import SpilloverTable from '../../components/spillover/SpilloverTable';
import SpilloverInsights from '../../components/spillover/SpilloverInsights';

const SpilloverMap = dynamic(() => import('../../components/spillover/SpilloverMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading GIS Map...
    </div>
  ),
});

export default function SpilloverPage() {
  const { data: spilloversList, isLoading: listLoading, isError: listError, refetch: refetchList } = useSpilloverData();
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useSpilloverSummary();
  const { data: mapData, isLoading: mapLoading, isError: mapError, refetch: refetchMap } = useSpilloverMapData();

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
        title="Spillover Parking Analysis"
        description="Detect and mitigate the spread of illegal parking from primary hotspots into adjacent secondary zones."
      />

      <SpilloverKPIs summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Insights (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[500px]">
            <SpilloverMap mapData={mapData} isLoading={isLoading} />
          </div>
          <SpilloverInsights 
            summary={summary} 
            spillovers={spilloversList?.spillovers} 
            isLoading={isLoading} 
          />
        </div>

        {/* Right Column: Table (1/3 width) */}
        <div className="h-full">
          <SpilloverTable spillovers={spilloversList?.spillovers} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
