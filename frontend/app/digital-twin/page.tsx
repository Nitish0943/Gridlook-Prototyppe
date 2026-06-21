'use client';

import React from 'react';
import PageHeader from '../../components/shared/PageHeader';
import { LoadingSkeleton, ErrorState } from '../../components/shared/FeedbackStates';
import DigitalTwinSimulator from '../../components/twin/DigitalTwinSimulator';
import ScenarioComparisonChart from '../../components/charts/ScenarioComparisonChart';

// Hooks
import { useStats } from '../../lib/hooks/useStats';
import { useScenarios } from '../../lib/hooks/useSimulation';

export default function DigitalTwinPage() {
  const { data: stats, isLoading: statsLoading, isError, refetch } = useStats();
  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();

  const isLoading = statsLoading || scenariosLoading;

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulation Twin Center"
        description="What-if modeling and citywide congestion improvement estimations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Simulation Controls & Before/After Details (2/3 width) */}
        <div className="lg:col-span-2">
          <DigitalTwinSimulator initialViolations={stats?.total_violations ?? 0} />
        </div>

        {/* Right Side: Scenario Analysis Chart (1/3 width) */}
        <div>
          <ScenarioComparisonChart data={scenarios} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
