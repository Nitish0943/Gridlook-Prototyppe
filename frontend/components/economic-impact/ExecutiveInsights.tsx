import React from 'react';
import { EconomicImpactSummaryResponse, EconomicImpactDetail } from '../../lib/types';
import { Brain, Zap, Target } from 'lucide-react';
import { formatRupees } from './EconomicKPIs';

interface ExecutiveInsightsProps {
  summary?: EconomicImpactSummaryResponse;
  locations?: EconomicImpactDetail[];
  isLoading: boolean;
}

export default function ExecutiveInsights({ summary, locations, isLoading }: ExecutiveInsightsProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="animate-pulse flex items-center text-cyan-400">
          <Brain className="w-6 h-6 mr-3" />
          <span className="font-mono text-xs tracking-widest uppercase">Synthesizing Executive Insights...</span>
        </div>
      </div>
    );
  }

  // Generate dynamic insights
  const insights: string[] = [];

  if (summary && locations && locations.length > 0) {
    const totalDaily = summary.citywide_daily_loss;
    const worstJunction = locations[0];

    // Insight 1: Contribution of the worst junction
    if (worstJunction && totalDaily > 0) {
      const contributionPercent = ((worstJunction.daily_loss / totalDaily) * 100).toFixed(1);
      insights.push(
        `Junction "${worstJunction.junction_name}" contributes ${contributionPercent}% of the city's parking-related economic losses, accounting for ${formatRupees(worstJunction.yearly_loss)} annually.`
      );
    }

    // Insight 2: Cumulative impact of top 5 junctions
    const top5Locations = locations.slice(0, 5);
    const top5YearlyLoss = top5Locations.reduce((acc, curr) => acc + curr.yearly_loss, 0);
    const savings30Percent = top5YearlyLoss * 0.3;
    insights.push(
      `Reducing parking violations by 30% in the top 5 economic drain hotspots could reclaim approximately ${formatRupees(savings30Percent)} annually.`
    );

    // Insight 3: Cost-driver classification
    let fuelSum = 0;
    let delaySum = 0;
    let productivitySum = 0;
    let enforcementSum = 0;
    locations.forEach((loc) => {
      fuelSum += loc.breakdown.fuel_waste;
      delaySum += loc.breakdown.delay_cost;
      productivitySum += loc.breakdown.productivity_loss;
      enforcementSum += loc.breakdown.enforcement_cost;
    });

    const totalCalculated = fuelSum + delaySum + productivitySum + enforcementSum;
    if (totalCalculated > 0) {
      const delayShare = (((delaySum + productivitySum) / totalCalculated) * 100).toFixed(0);
      insights.push(
        `Traffic delay and productivity loss represent ${delayShare}% of overall parking costs. Operational strategies should prioritize clearance times rather than citation rates alone.`
      );
    }

    // Insight 4: Category distribution summary
    const criticalCount = locations.filter(l => l.category === 'Critical').length;
    if (criticalCount > 0) {
      insights.push(
        `Identified ${criticalCount} critical congestion bottlenecks. Initiating targeted automated enforcement in these specific areas can save up to ${formatRupees(totalDaily * 0.15)} daily across the city.`
      );
    }
  } else {
    insights.push("Awaiting structural capacity and vehicle violation data to generate intelligent traffic routing and restriction insights.");
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-855 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-855 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <Brain className="w-4 h-4 mr-2 text-cyan-400" />
          AI Executive Insights
        </h3>
        <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 flex items-center">
          <Zap className="w-3 h-3 mr-1" /> Live Analysis
        </span>
      </div>

      <div className="p-5 space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start bg-slate-900/40 p-4 rounded-lg border border-slate-800/50 hover:bg-slate-900/60 transition-colors">
            <div className="mt-0.5 mr-3 p-1.5 bg-cyan-950/50 border border-cyan-800/30 rounded-md">
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-slate-100 text-sm font-semibold mb-1">Strategic Observation #{idx + 1}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
