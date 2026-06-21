'use client';

import React from 'react';
import { PeakHourDetail } from '../../lib/types';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

interface TopPeakHoursTableProps {
  peakHours?: PeakHourDetail[];
  isLoading: boolean;
}

export default function TopPeakHoursTable({
  peakHours = [],
  isLoading,
}: TopPeakHoursTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 h-80 animate-pulse" />
    );
  }

  // Sort by violations descending to find top peak times
  const sortedPeaks = [...peakHours].sort((a, b) => b.predicted_violations - a.predicted_violations);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Top Peak Hours Schedule
            </h3>
          </div>
        </div>
        <p className="text-slate-550 text-[10px] font-mono mb-4">
          Future peak traffic periods sorted by predicted violation density
        </p>

        {/* Table Body Scroll */}
        <div className="overflow-x-auto border border-slate-850 rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-850 z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Hour</th>
                <th className="px-4 py-3 text-right">Predicted Violations</th>
                <th className="px-4 py-3 text-right">Risk Score</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 bg-slate-900/10">
              {sortedPeaks.length > 0 ? (
                sortedPeaks.map((item) => {
                  const isCritical = item.risk === 'Critical';
                  const isHigh = item.risk === 'High';
                  const isMedium = item.risk === 'Medium';
                  
                  return (
                    <tr
                      key={item.hour}
                      className="hover:bg-slate-950/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-100">
                        {item.hour}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-200">
                        {item.predicted_violations}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-200">
                        {item.risk_score}/100
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                            isCritical
                              ? 'bg-rose-950/30 text-rose-450 border-rose-800/30'
                              : isHigh
                              ? 'bg-amber-950/30 text-amber-400 border-amber-800/30'
                              : isMedium
                              ? 'bg-yellow-950/30 text-yellow-400 border-yellow-800/30'
                              : 'bg-emerald-950/30 text-emerald-450 border-emerald-800/30'
                          }`}
                        >
                          {item.risk}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-550">
                    No active peak hour predictions.
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
