import React from 'react';
import { CapacityLossDetail } from '../../lib/types';
import { TrendingDown, AlertCircle, Activity } from 'lucide-react';

interface CapacityLossTableProps {
  locations?: CapacityLossDetail[];
  isLoading: boolean;
}

const RISK_COLORS: Record<string, string> = {
  Critical: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
  High: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
  Medium: 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40',
  Low: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
};

export default function CapacityLossTable({ locations, isLoading }: CapacityLossTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm">No capacity loss data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        .capacity-table-container {
          max-height: 550px;
          overflow-y: auto;
          overflow-x: auto;
          overscroll-behavior: contain;
        }
        .capacity-table-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .capacity-table-container::-webkit-scrollbar-track {
          background: rgba(2, 6, 23, 0.6);
        }
        .capacity-table-container::-webkit-scrollbar-thumb {
          background: rgba(30, 41, 59, 0.8);
          border-radius: 4px;
          border: 1px solid rgba(51, 65, 85, 0.4);
        }
        .capacity-table-container::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}} />

      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
        <h3 className="text-slate-200 font-bold tracking-widest text-xs uppercase flex items-center">
          <TrendingDown className="w-4 h-4 mr-2 text-cyan-400" />
          Top Affected Roads
        </h3>
        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">
          Ranked by Capacity Loss
        </span>
      </div>

      <div className="capacity-table-container">
        <table className="w-full min-w-[700px] text-left border-separate border-spacing-0">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Rank</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Junction</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Capacity Loss %</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Occupied Width</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Available Width</th>
              <th className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm p-4 font-medium border-b border-slate-800">Risk</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {locations.map((loc, idx) => {
              let scoreColor = 'text-emerald-400';
              if (loc.risk === 'Critical') scoreColor = 'text-rose-500';
              else if (loc.risk === 'High') scoreColor = 'text-orange-400';
              else if (loc.risk === 'Medium') scoreColor = 'text-yellow-400';

              const badgeColors = RISK_COLORS[loc.risk] || RISK_COLORS.Low;

              return (
                <tr
                  key={loc.junction_name}
                  className="border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors"
                >
                  <td className="p-4 border-b border-slate-900/40">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-100 font-bold">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-100 max-w-[200px] truncate border-b border-slate-900/40" title={loc.junction_name}>
                    {loc.junction_name}
                  </td>
                  <td className="p-4 border-b border-slate-900/40">
                    <div className="flex items-center space-x-2">
                      <span className={`font-black text-sm ${scoreColor}`}>
                        {loc.capacity_loss}%
                      </span>
                      {loc.risk === 'Critical' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 border-b border-slate-900/40">
                    {loc.occupied_width}m
                  </td>
                  <td className="p-4 text-slate-300 border-b border-slate-900/40">
                    {loc.available_width}m
                  </td>
                  <td className="p-4 border-b border-slate-900/40">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border tracking-wider font-mono ${badgeColors}`}>
                      {loc.risk}
                    </span>
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
