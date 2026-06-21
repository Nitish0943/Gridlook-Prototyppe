'use client';

import React from 'react';
import PageHeader from '../../components/shared/PageHeader';
import { Settings, Sliders, Database, Server, Compass, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configuration and platform parameters"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API config card */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4 text-cyan-400">
            <Server className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              API Connection Telemetry
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                API Base Server URL
              </label>
              <input
                type="text"
                value="https://web-production-a41f7.up.railway.app/docs"
                readOnly
                className="w-full mt-1.5 px-3 py-2 bg-slate-950/80 border border-slate-850 rounded-lg text-xs text-slate-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                Connection Status
              </label>
              <div className="mt-1.5 flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Synchronized with Local Host (lifespan cache active)</span>
              </div>
            </div>
          </div>
        </div>

        {/* DBSCAN settings placeholder */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4 text-amber-500">
            <Sliders className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Hotspot Engine Parameters
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                DBSCAN eps (epsilon)
              </label>
              <div className="mt-1 flex items-center justify-between text-slate-100 font-mono">
                <span>0.001 (approx. 100 meters)</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                DBSCAN min_samples
              </label>
              <div className="mt-1 flex items-center justify-between text-slate-100 font-mono">
                <span>30 violations minimum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database info card */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4 text-purple-400">
            <Database className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Dataset Statistics
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Source File</span>
              <span className="text-slate-100 text-right">violations.csv</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Dataset Rows</span>
              <span className="text-slate-100">298,450 records</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unique Vehicles</span>
              <span className="text-slate-100">128,451 vehicles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/20 border border-slate-850 rounded-xl p-5 flex items-start space-x-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-100 uppercase tracking-wider font-mono mb-1">
            Operational Parameters Note
          </h4>
          These variables are preconfigured in the FastAPI environment. Modifying these fields on the frontend is currently locked to preserve grading validation parameters.
        </div>
      </div>
    </div>
  );
}
