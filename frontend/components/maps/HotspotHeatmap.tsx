'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Target, ShieldCheck, AlertCircle } from 'lucide-react';
import { useMapData } from '../../lib/hooks/useHotspots';

// Dynamically import Leaflet map with SSR disabled to prevent Node window compilation errors
const ParkingHotspotMap = dynamic(
  () => import('./ParkingHotspotMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center border border-slate-900 rounded-xl">
        <p className="text-slate-550 text-xs font-mono animate-pulse uppercase tracking-widest">
          Mounting GIS Canvas layers...
        </p>
      </div>
    ),
  }
);

interface HotspotHeatmapProps {
  hotspots?: any[];
  isLoading?: boolean;
}

export default function HotspotHeatmap({ hotspots, isLoading: parentLoading }: HotspotHeatmapProps) {
  const { data: mapData, isLoading: mapDataLoading, isError } = useMapData();
  const isLoading = mapDataLoading || parentLoading;

  if (isError) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
        <h4 className="text-sm font-bold text-slate-100 font-mono uppercase">GIS Server Link Error</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
          Could not fetch map telemetry coordinates from the backend.
        </p>
      </div>
    );
  }

  if (isLoading && !mapData) {
    return (
      <div className="h-[400px] bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-slate-550 text-xs font-mono tracking-widest uppercase">
          Syncing satellite GIS grid...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between relative overflow-hidden">
      {/* Map Header Info */}
      <div className="flex justify-between items-start mb-4 z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Smart City GIS Intelligence Map</span>
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            DBSCAN clusters, violation marker clusters, and density heatmap
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 text-[9px] font-mono bg-slate-950/80 border border-slate-850 px-2.5 py-1.5 rounded-lg uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Telemetry online</span>
        </div>
      </div>

      {/* Map Box Section */}
      <div className="w-full h-80 relative rounded-xl overflow-hidden bg-slate-950/50 border border-slate-850">
        {mapData && (
          <ParkingHotspotMap mapData={mapData} isLoading={!!isLoading} />
        )}
      </div>

      {/* Map Footer status */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-3">
        <span>OpenStreetMap Tiles (CartoDB Dark Matter)</span>
        <span>Interactive controls enabled</span>
      </div>
    </div>
  );
}
