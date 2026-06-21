import React from 'react';
import { SpilloverDetail } from '../../lib/types';
import { TrendingUp, AlertCircle, ShieldAlert, Activity } from 'lucide-react';

interface SpilloverTableProps {
  spillovers?: SpilloverDetail[];
  isLoading: boolean;
}

export default function SpilloverTable({ spillovers, isLoading }: SpilloverTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!spillovers || spillovers.length === 0) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm">No spillover data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-850 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        .spillover-table-container {
          max-height: 550px;
          overflow-y: auto;
          overflow-x: auto;
          overscroll-behavior: contain;
        }
        .spillover-table-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .spillover-table-container::-webkit-scrollbar-track {
          background: rgba(2, 6, 23, 0.6);
        }
        .spillover-table-container::-webkit-scrollbar-thumb {
          background: rgba(30, 41, 59, 0.8);
          border-radius: 4px;
          border: 1px solid rgba(51, 65, 85, 0.4);
        }
        .spillover-table-container::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}} />
      <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-cyan-400" />
          Spillover Zone Rankings
        </h3>
        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">
          Ranked by Severity Score
        </span>
      </div>

      <div className="spillover-table-container">
        <table className="w-full min-w-[700px] text-left border-separate border-spacing-0">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Rank</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Primary Junction (Source)</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Spillover Score</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Nearby Violations</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Growth Rate</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Affected Secondary Zones</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {spillovers.map((zone, idx) => {
              const isCritical = zone.spillover_score >= 80;
              const isHigh = zone.spillover_score >= 60 && zone.spillover_score < 80;
              
              let scoreColor = 'text-emerald-400';
              if (isCritical) scoreColor = 'text-rose-500';
              else if (isHigh) scoreColor = 'text-orange-400';

              return (
                <tr 
                  key={zone.hotspot_id} 
                  className="border-b border-slate-850/50 hover:bg-slate-850/30 transition-colors"
                >
                  <td className="p-4 text-slate-400 border-b border-slate-900/40">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-100 font-bold">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-100 max-w-[200px] truncate border-b border-slate-900/40" title={zone.junction_name}>
                    {zone.junction_name}
                  </td>
                  <td className="p-4 border-b border-slate-900/40">
                    <div className="flex items-center space-x-2">
                      <span className={`font-black text-sm ${scoreColor}`}>
                        {zone.spillover_score}
                      </span>
                      {isCritical && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 border-b border-slate-900/40">
                    {zone.nearby_violation_density}
                  </td>
                  <td className="p-4 text-slate-300 border-b border-slate-900/40">
                    <span className={zone.hotspot_growth_rate > 1.2 ? 'text-rose-400' : 'text-emerald-400'}>
                      {zone.hotspot_growth_rate.toFixed(2)}x
                    </span>
                  </td>
                  <td className="p-4 border-b border-slate-900/40">
                    <div className="flex flex-wrap gap-1">
                      {zone.secondary_zones.length > 0 ? (
                        zone.secondary_zones.slice(0, 2).map((sec, i) => (
                          <span key={i} className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded truncate max-w-[120px]" title={sec}>
                            {sec}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-600 italic">None</span>
                      )}
                      {zone.secondary_zones.length > 2 && (
                        <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                          +{zone.secondary_zones.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
