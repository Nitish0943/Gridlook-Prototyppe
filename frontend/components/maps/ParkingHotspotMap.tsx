'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import leaflet.heat plugin side-effects
import 'leaflet.heat';

import { MapDataResponse, HotspotDetail, MapViolationDetail } from '../../lib/types';
import { Flame, Activity, ShieldAlert, Navigation, Layers, Compass, BarChart } from 'lucide-react';

interface ParkingHotspotMapProps {
  mapData: MapDataResponse;
  isLoading: boolean;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#2563eb', // Blue
};

// Custom DivIcon for glowing violation markers
const createViolationIcon = (severity: string) => {
  let glowColor = 'bg-blue-400';
  let pinColor = 'bg-blue-500';

  if (severity === 'Critical') {
    glowColor = 'bg-red-400';
    pinColor = 'bg-red-500';
  } else if (severity === 'High') {
    glowColor = 'bg-orange-400';
    pinColor = 'bg-orange-500';
  } else if (severity === 'Medium') {
    glowColor = 'bg-yellow-400';
    pinColor = 'bg-yellow-500';
  }

  return L.divIcon({
    html: `<span class="flex h-3.5 w-3.5 relative">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${glowColor} opacity-70"></span>
      <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${pinColor} border border-slate-900 shadow-md"></span>
    </span>`,
    className: 'custom-violation-node',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

// Heatmap Layer Renderer Component
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    // L.heatLayer is registered globally by importing 'leaflet.heat'
    const heat = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 16,
      max: 1.0,
      gradient: {
        0.2: '#2563eb', // blue
        0.4: '#3b82f6', // blue
        0.6: '#eab308', // yellow
        0.8: '#f97316', // orange
        1.0: '#ef4444', // red
      },
    }).addTo(map);

    return () => {
      if (map && heat) {
        map.removeLayer(heat);
      }
    };
  }, [map, points]);

  return null;
}

// Controller component to programmatically pan/zoom
function MapController({ resetTrigger, center, zoom }: { resetTrigger: number; center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (resetTrigger > 0) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [resetTrigger, map, center, zoom]);

  return null;
}

export default function ParkingHotspotMap({ mapData, isLoading }: ParkingHotspotMapProps) {
  const [viewMode, setViewMode] = useState<'hotspots' | 'violations' | 'heatmap'>('hotspots');
  const [resetTrigger, setResetTrigger] = useState(0);

  const stats = useMemo(() => {
    const totalViolations = mapData?.violations?.length ?? 0;
    const totalHotspots = mapData?.hotspots?.length ?? 0;
    const criticalZones = mapData?.hotspots?.filter((h) => h.severity === 'Critical').length ?? 0;
    return { totalViolations, totalHotspots, criticalZones };
  }, [mapData]);

  // Convert raw heatmap array data to Leaflet-compatible format [[lat, lng, weight], ...]
  const heatmapPoints = useMemo(() => {
    if (!mapData || !mapData.heatmap) return [];
    return mapData.heatmap as [number, number, number][];
  }, [mapData]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center border border-slate-200 rounded-xl relative overflow-hidden">
        <Activity className="w-8 h-8 text-[#0F4C81] animate-spin mb-3" />
        <p className="text-[#475569] text-xs font-sans tracking-widest uppercase">
          Aligning GIS satellite telemetry...
        </p>
      </div>
    );
  }

  const handleResetView = () => {
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full relative border border-slate-850 rounded-xl overflow-hidden shadow-2xl bg-slate-950 flex flex-col justify-end">
      {/* Absolute Overlays */}
      {/* 1. Mode Switcher Controller Tabs */}
      <div className="absolute top-4 left-4 z-[1000] flex space-x-1 bg-slate-950/90 backdrop-blur-md border border-slate-850 p-1 rounded-xl shadow-lg">
        {(['hotspots', 'violations', 'heatmap'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans transition-all ${
              viewMode === mode
                ? 'bg-[#0f4c81] text-white border-[#0f4c81] shadow-sm'
                : 'text-[#475569] hover:text-[#1e293b] border border-transparent'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 2. Top-Right Action Dashboard Menu */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2 items-end">
        <button
          onClick={handleResetView}
          className="p-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-850 rounded-xl text-slate-500 hover:text-[#1e293b] hover:border-slate-350 shadow-lg transition-all"
          title="Reset Map Bounds"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Floating Telemetry Stats Widget */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-850 p-3 rounded-xl shadow-lg flex flex-col space-y-1.5 max-w-[200px] text-[9px] font-sans text-[#475569]">
          <div className="flex justify-between space-x-4 border-b border-slate-850 pb-1 font-black text-[#0f4c81] uppercase tracking-widest">
            <span>Grid Analytics</span>
          </div>
          <div className="flex justify-between">
            <span>Clusters</span>
            <span className="text-[#1e293b] font-bold">{stats.totalHotspots}</span>
          </div>
          <div className="flex justify-between">
            <span>Sample Nodes</span>
            <span className="text-[#1e293b] font-bold">{stats.totalViolations}</span>
          </div>
          <div className="flex justify-between">
            <span>Critical Nodes</span>
            <span className="text-rose-600 font-bold">{stats.criticalZones}</span>
          </div>
        </div>
      </div>

      {/* 3. Floating Bottom-Left GIS Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/95 backdrop-blur-md border border-slate-850 p-3 rounded-xl shadow-2xl flex flex-col space-y-1 text-[9px] font-sans text-[#475569]">
        <div className="font-black text-[#1e293b] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5 text-[#0f4c81]" />
          <span>Risk Legend</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
          <span>Critical Severity (&gt;500)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
          <span>High Severity (201-500)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
          <span>Medium Severity (51-200)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          <span>Low Severity (0-50)</span>
        </div>
      </div>

      {/* Actual GIS Leaflet Map Core Component */}
      <div className="w-full h-full z-10">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false} // Disable default zoom control to keep theme sleek
          style={{ width: '100%', height: '100%', background: '#F8FAFC' }}
        >
          {/* Programmatic panning controller */}
          <MapController resetTrigger={resetTrigger} center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} />

          {/* CartoDB Voyager Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Render Mode 1: Hotspots (CircleMarkers scaled by count) */}
          {viewMode === 'hotspots' &&
            mapData?.hotspots?.map((hs) => {
              const color = SEVERITY_COLORS[hs.severity as keyof typeof SEVERITY_COLORS] || '#10b981';
              // Sizing logic: larger radius for high violations
              const radius = Math.max(8, Math.min(26, Math.sqrt(hs.violation_count) * 0.7));

              return (
                <CircleMarker
                  key={hs.cluster_id}
                  center={[hs.latitude, hs.longitude]}
                  radius={radius}
                  fillColor={color}
                  color={color}
                  weight={1}
                  fillOpacity={0.4}
                  className="pulsing-circle-marker"
                >
                  <Popup className="custom-leaflet-popup font-sans text-xs">
                    <div className="w-64 p-1 text-left space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                            style={{ backgroundColor: color }}
                          />
                          <h4 className="text-xs font-bold text-[#0f4c81] uppercase tracking-wider">
                            Sector #{hs.rank}
                          </h4>
                        </div>
                        <span
                          className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded border"
                          style={{ color, backgroundColor: `${color}15`, borderColor: `${color}30` }}
                        >
                          {hs.severity}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-[11px] text-[#475569]">
                        <p className="flex justify-between">
                          <span className="text-[#475569]">Junction:</span>
                          <strong className="text-[#1e293b] truncate max-w-[140px]" title={hs.junction_name || 'Commercial Zone'}>
                            {hs.junction_name || 'Commercial Zone'}
                          </strong>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#475569]">District:</span>
                          <strong className="text-[#1e293b] truncate max-w-[140px]" title={hs.police_station || 'District HQ'}>
                            {hs.police_station || 'District HQ'}
                          </strong>
                        </p>
                      </div>

                      {/* Info Blocks */}
                      <div className="grid grid-cols-4 gap-1.5 text-center mt-2.5">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[7px] text-[#475569] uppercase font-bold block">Violations</span>
                          <p className="text-[10px] font-black text-[#0f4c81] mt-0.5">{hs.violation_count}</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[7px] text-[#475569] uppercase font-bold block">Vehicles</span>
                          <p className="text-[10px] font-black text-amber-600 mt-0.5">{hs.unique_vehicles}</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[7px] text-[#475569] uppercase font-bold block">Types</span>
                          <p className="text-[10px] font-black text-[#1e3a5f] mt-0.5">{hs.unique_violation_types}</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[7px] text-[#475569] uppercase font-bold block">Stations</span>
                          <p className="text-[10px] font-black text-emerald-600 mt-0.5">{hs.police_stations}</p>
                        </div>
                      </div>

                      {/* Coords */}
                      <p className="text-[8px] text-[#475569] text-right mt-1 border-t border-slate-200 pt-1.5">
                        GPS: ({hs.latitude.toFixed(4)}, {hs.longitude.toFixed(4)})
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* Render Mode 2: Violations (Clustered Markers) */}
          {viewMode === 'violations' && mapData?.violations && (
            <MarkerClusterGroup
              chunkedLoading
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              maxClusterRadius={50}
            >
              {mapData.violations.map((v, i) => (
                <Marker
                  key={i}
                  position={[v.latitude, v.longitude]}
                  icon={createViolationIcon(v.severity)}
                >
                  <Popup className="custom-leaflet-popup font-sans text-xs">
                    <div className="w-56 p-1 text-left space-y-2">
                      <div className="border-b border-slate-200 pb-1.5 mb-1.5 font-bold text-[#0f4c81] uppercase tracking-wider text-[11px] truncate" title={v.violation_type}>
                        {v.violation_type}
                      </div>
                      <div className="space-y-1 text-[10px] text-[#475569]">
                        <p className="flex justify-between">
                          <span className="text-[#475569]">Junction:</span>
                          <strong className="text-[#1e293b] truncate max-w-[130px]" title={v.junction_name}>{v.junction_name}</strong>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#475569]">District Station:</span>
                          <strong className="text-[#1e293b] truncate max-w-[130px]" title={v.police_station}>{v.police_station}</strong>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#475569]">Disruption Severity:</span>
                          <strong className="text-[#0f4c81] font-bold uppercase">{v.severity}</strong>
                        </p>
                      </div>
                      <p className="text-[8px] text-[#475569] text-right border-t border-slate-200 pt-1 mt-1">
                        GPS: ({v.latitude.toFixed(4)}, {v.longitude.toFixed(4)})
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}

          {/* Render Mode 3: Heatmap (Violations density) */}
          {viewMode === 'heatmap' && heatmapPoints.length > 0 && (
            <HeatmapLayer points={heatmapPoints} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
