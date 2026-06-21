'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Clock, ArrowUpRight } from 'lucide-react';

// Hooks
import { useStats } from '../../lib/hooks/useStats';
import { useHotspots, useHotspotsSummary } from '../../lib/hooks/useHotspots';
import { useImpactData, useImpactSummary } from '../../lib/hooks/useImpact';
import { useRecommendations, useRecommendationsSummary } from '../../lib/hooks/useRecommendations';
import { useSpilloverData, useSpilloverSummary, useSpilloverMapData } from '../../lib/hooks/useSpillover';
import { useCapacityLossData, useCapacityLossSummary } from '../../lib/hooks/useCapacityLoss';
import { useEconomicImpactData, useEconomicImpactSummary } from '../../lib/hooks/useEconomicImpact';
import { useForecastData, useForecastSummary, useForecastTrends, useForecastMap } from '../../lib/hooks/useForecast';
import { usePeakHours, usePeakHoursSummary } from '../../lib/hooks/usePeakHours';

// Components
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import DashboardKPIs from '../../components/dashboard/DashboardKPIs';
import ExecutiveInsightsPanel from '../../components/dashboard/ExecutiveInsightsPanel';
import ExecutiveSummary from '../../components/dashboard/ExecutiveSummary';
import CityPerformanceGauges from '../../components/dashboard/CityPerformanceGauges';
import PriorityActionsTable from '../../components/dashboard/PriorityActionsTable';
import DigitalTwinPreview from '../../components/dashboard/DigitalTwinPreview';
import DashboardForecastChart from '../../components/dashboard/DashboardForecastChart';
import DashboardEconomicSummary from '../../components/dashboard/DashboardEconomicSummary';
import DashboardCapacityMonitor from '../../components/dashboard/DashboardCapacityMonitor';
import SmartCityAIInsights from '../../components/dashboard/SmartCityAIInsights';
import PeakHourPredictionWidget from '../../components/dashboard/PeakHourPredictionWidget';

// Dynamic import for Leaflet Map to avoid SSR errors
const CityIntelligenceMap = dynamic(() => import('../../components/dashboard/CityIntelligenceMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading Tactical GIS Command Map...
    </div>
  ),
});

export default function DashboardPage() {
  // Load data from all platform modules via hooks
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useStats();
  const { data: hotspots, isLoading: hotspotsLoading } = useHotspots();
  const { data: hotspotsSummary, isLoading: hotspotsSummaryLoading } = useHotspotsSummary();
  const { data: impactData, isLoading: impactLoading } = useImpactData();
  const { data: impactSummary, isLoading: impactSummaryLoading } = useImpactSummary();
  const { data: recommendations, isLoading: recommendationsLoading } = useRecommendations();
  const { data: recommendationsSummary, isLoading: recommendationsSummaryLoading } = useRecommendationsSummary();
  
  const { data: spilloverData, isLoading: spilloverLoading } = useSpilloverData();
  const { data: spilloverSummary, isLoading: spilloverSummaryLoading } = useSpilloverSummary();
  const { data: spilloverMap, isLoading: spilloverMapLoading } = useSpilloverMapData();
  
  const { data: capacityLossData, isLoading: capacityLossLoading } = useCapacityLossData();
  const { data: capacityLossSummary, isLoading: capacityLossSummaryLoading } = useCapacityLossSummary();
  
  const { data: economicImpactData, isLoading: economicImpactLoading } = useEconomicImpactData();
  const { data: economicImpactSummary, isLoading: economicImpactSummaryLoading } = useEconomicImpactSummary();
  
  const { data: forecastData, isLoading: forecastDataLoading } = useForecastData();
  const { data: forecastSummary, isLoading: forecastSummaryLoading } = useForecastSummary();
  const { data: forecastTrends, isLoading: forecastTrendsLoading } = useForecastTrends();
  const { data: forecastMap, isLoading: forecastMapLoading } = useForecastMap();
  const { data: peakHoursSummary, isLoading: peakHoursSummaryLoading } = usePeakHoursSummary();
  const { data: peakHoursData, isLoading: peakHoursLoading } = usePeakHours();

  const isLoading =
    statsLoading ||
    hotspotsLoading ||
    hotspotsSummaryLoading ||
    impactLoading ||
    impactSummaryLoading ||
    recommendationsLoading ||
    recommendationsSummaryLoading ||
    spilloverLoading ||
    spilloverSummaryLoading ||
    spilloverMapLoading ||
    capacityLossLoading ||
    capacityLossSummaryLoading ||
    economicImpactLoading ||
    economicImpactSummaryLoading ||
    forecastDataLoading ||
    forecastSummaryLoading ||
    forecastTrendsLoading ||
    forecastMapLoading ||
    peakHoursSummaryLoading ||
    peakHoursLoading;

  const handleRetry = () => {
    refetchStats();
  };

  if (statsError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={10} />;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <PageHeader
        title="Command Center Dashboard"
        description="Executive Smart City Control Panel and Operational Overview"
      />

      {/* ROW 1: CITY OVERVIEW KPIs */}
      <DashboardKPIs
        stats={stats}
        hotspotsSummary={hotspotsSummary}
        impactSummary={impactSummary}
        forecastSummary={forecastSummary}
        economicSummary={economicImpactSummary}
        capacitySummary={capacityLossSummary}
        isLoading={isLoading}
      />

      {/* ROW 2: MAP & EXECUTIVE SUMMARY SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] w-full">
          <CityIntelligenceMap
            hotspots={hotspots}
            spilloverZones={spilloverMap?.zones}
            forecastLocations={forecastMap?.locations}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1 h-auto lg:h-[450px]">
          <ExecutiveSummary
            hotspotsSummary={hotspotsSummary}
            recommendationsSummary={recommendationsSummary}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ROW 3: EXECUTIVE INSIGHTS */}
      <ExecutiveInsightsPanel
        impactData={impactData}
        spilloverData={spilloverData?.spillovers}
        forecastData={forecastData?.forecast}
        recommendations={recommendations}
        isLoading={isLoading}
      />

      {/* ROW 4: CITY PERFORMANCE ANALYTICS */}
      <CityPerformanceGauges
        impactSummary={impactSummary}
        spilloverSummary={spilloverSummary}
        capacityLossSummary={capacityLossSummary}
        economicSummary={economicImpactSummary}
        isLoading={isLoading}
      />

      {/* ROW 5 & 6: OPERATIONAL ACTIONS & DIGITAL TWIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROW 5: TOP PRIORITY ACTIONS */}
        <div className="h-full">
          <PriorityActionsTable recommendations={recommendations} isLoading={isLoading} />
        </div>

        {/* ROW 6: DIGITAL TWIN PREVIEW */}
        <div className="h-full">
          <DigitalTwinPreview
            totalViolations={stats?.total_violations ?? 0}
            dailyLoss={economicImpactSummary?.citywide_daily_loss ?? 0}
            avgCapacityLoss={capacityLossSummary?.average_capacity_loss ?? 0}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ROW 7 & 8: FORECAST TRENDS & ECONOMIC LOSS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROW 7: FUTURE RISK FORECAST */}
        <div className="lg:col-span-2 h-full">
          <DashboardForecastChart
            trendResponse={forecastTrends}
            forecastLocations={forecastData?.forecast}
            isLoading={isLoading}
          />
        </div>

        {/* ROW 8: ECONOMIC IMPACT SUMMARY */}
        <div className="h-full">
          <DashboardEconomicSummary summary={economicImpactSummary} isLoading={isLoading} />
        </div>
      </div>

      {/* ROW 9 & 10: ROAD CAPACITY & AI INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROW 9: ROAD CAPACITY MONITOR */}
        <div className="h-full">
          <DashboardCapacityMonitor
            summary={capacityLossSummary}
            locations={capacityLossData?.locations}
            isLoading={isLoading}
          />
        </div>

        {/* ROW 10: SMART CITY AI INSIGHTS */}
        <div className="h-full">
          <SmartCityAIInsights
            impactData={impactData}
            spilloverData={spilloverData?.spillovers}
            forecastData={forecastData?.forecast}
            economicData={economicImpactData?.locations}
            economicSummary={economicImpactSummary}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* PEAK HOUR PREDICTION WIDGET */}
      <div className="w-full">
        <PeakHourPredictionWidget
          summary={peakHoursSummary}
          peakHours={peakHoursData?.peak_hours}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
