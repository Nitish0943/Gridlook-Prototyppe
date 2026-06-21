'use client';

import React from 'react';
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';

// Hooks
import {
  usePeakHours,
  useJunctionPeakHours,
  usePeakHoursSummary,
} from '../../lib/hooks/usePeakHours';

// Components
import PeakHourKPIs from '../../components/peak-hours/PeakHourKPIs';
import PredictionChart from '../../components/peak-hours/PredictionChart';
import TopPeakHoursTable from '../../components/peak-hours/TopPeakHoursTable';
import PeakHourHeatmap from '../../components/peak-hours/PeakHourHeatmap';
import JunctionPeakAnalysis from '../../components/peak-hours/JunctionPeakAnalysis';
import AIInsights from '../../components/peak-hours/AIInsights';

export default function PeakHoursPage() {
  const { data: peakHoursData, isLoading: peakHoursLoading, isError: peakHoursError, refetch: refetchPeakHours } = usePeakHours();
  const { data: junctionPeakData, isLoading: junctionPeakLoading, isError: junctionPeakError, refetch: refetchJunctionPeaks } = useJunctionPeakHours();
  const { data: summaryData, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = usePeakHoursSummary();

  const isLoading = peakHoursLoading || junctionPeakLoading || summaryLoading;
  const isError = peakHoursError || junctionPeakError || summaryError;

  const handleRetry = () => {
    refetchPeakHours();
    refetchJunctionPeaks();
    refetchSummary();
  };

  if (isError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <PageHeader
        title="Peak Hour predictions"
        description="Machine Learning forecasts predicting peak parking violation hours and risk scores for active deployment planning."
      />

      {/* ROW 1: KPI CARDS */}
      <PeakHourKPIs
        summary={summaryData}
        peakHours={peakHoursData?.peak_hours}
        isLoading={isLoading}
      />

      {/* ROW 2 & 3: prediction chart & table side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[420px]">
          {/* ROW 2: 24-HOUR PREDICTION CHART */}
          <PredictionChart peakHours={peakHoursData?.peak_hours} isLoading={isLoading} />
        </div>
        <div className="h-[420px]">
          {/* ROW 3: TOP PEAK HOURS TABLE */}
          <TopPeakHoursTable peakHours={peakHoursData?.peak_hours} isLoading={isLoading} />
        </div>
      </div>

      {/* ROW 4: PEAK HOUR HEATMAP */}
      <div className="w-full">
        <PeakHourHeatmap peakHours={peakHoursData?.peak_hours} isLoading={isLoading} />
      </div>

      {/* ROW 5 & 6: junction peak analysis & AI insights side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* ROW 5: JUNCTION PEAK ANALYSIS */}
          <JunctionPeakAnalysis junctions={junctionPeakData} isLoading={isLoading} />
        </div>
        <div>
          {/* ROW 6: AI INSIGHTS */}
          <AIInsights
            summary={summaryData}
            peakHours={peakHoursData?.peak_hours}
            junctions={junctionPeakData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
