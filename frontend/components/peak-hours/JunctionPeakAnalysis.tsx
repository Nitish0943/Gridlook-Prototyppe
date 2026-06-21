'use client';

import React from 'react';
import { JunctionPeakDetail } from '../../lib/types';
import { MapPin, Target } from 'lucide-react';

interface JunctionPeakAnalysisProps {
  junctions?: JunctionPeakDetail[];
  isLoading: boolean;
}

export default function JunctionPeakAnalysis({
  junctions = [],
  isLoading,
}: JunctionPeakAnalysisProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 animate-pulse" />
    );
  }

  // Slice top 10 junctions
  const top10 = junctions.slice(0, 10);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Junction Peak Pressure Analysis
            </h3>
          </div>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Top 10 junctions and their projected peak congestion hour in the next 24 hours
        </p>

        {/* Table Body Scroll */}
        <div className="overflow-x-auto border border-slate-850 rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-850 z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Junction Name</th>
                <th className="px-4 py-3 text-center">Predicted Peak Hour</th>
                <th className="px-4 py-3 text-right">Expected Violations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 bg-slate-900/10">
              {top10.length > 0 ? (
                top10.map((item) => (
                  <tr
                    key={item.junction_name}
                    className="hover:bg-slate-950/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-200 flex items-center space-x-1.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate max-w-[200px]" title={item.junction_name}>
                        {item.junction_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-100">
                      {item.peak_hour}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-450">
                      {item.predicted_violations}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-550">
                    No junction peak data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
