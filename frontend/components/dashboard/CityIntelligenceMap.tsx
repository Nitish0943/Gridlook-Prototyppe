'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { HotspotDetail, SpilloverMapDetail, ForecastMapDetail } from '../../lib/types';
import { Activity, Layers, Flame, Compass, Eye } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface CityIntelligenceMapProps {
  hotspots?: HotspotDetail[];
  spilloverZones?: SpilloverMapDetail[];
  forecastLocations?: ForecastMapDetail[];
  isLoading: boolean;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

const SEVERITY_COLORS = {
  Critical: '#ef4444', // Red
  High: '#f97316',     // Orange
  Medium: '#eab308',   // Yellow
  Low: '#2563eb',      // Blue (Normal)
};

export default function CityIntelligenceMap({
  hotspots = [],
  spilloverZones = [],
  forecastLocations = [],
  isLoading,
}: CityIntelligenceMapProps) {
  const [showHotspots, setShowHotspots] = useState(true);
  const [showSpillover, setShowSpillover] = useState(true);
  const [showForecast, setShowForecast] = useState(true);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#0F4C81] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-md flex flex-col min-h-[400px]">
      {/* Header and Controls */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-b border-slate-200 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#0F4C81]" />
          <h3 className="text-[10px] uppercase tracking-widest text-[#1E293B] font-bold font-sans">
            City Intelligence Command Map
          </h3>
        </div>

        {/* Map Layers Toggles */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 space-x-1 shrink-0 font-sans text-[9px] font-bold">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2 py-1 rounded flex items-center space-x-1 transition-all cursor-pointer ${
              showHotspots
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-450 hover:text-slate-600 border border-transparent'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Hotspots ({hotspots.length})</span>
          </button>
          
          <button
            onClick={() => setShowSpillover(!showSpillover)}
            className={`px-2 py-1 rounded flex items-center space-x-1 transition-all cursor-pointer ${
              showSpillover
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-slate-450 hover:text-slate-600 border border-transparent'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Spillover ({spilloverZones.length})</span>
          </button>

          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`px-2 py-1 rounded flex items-center space-x-1 transition-all cursor-pointer ${
              showForecast
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'text-slate-450 hover:text-slate-600 border border-transparent'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Forecast ({forecastLocations.length})</span>
          </button>
        </div>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Hotspots layer */}
        {showHotspots &&
          hotspots.map((hotspot) => {
            const color = SEVERITY_COLORS[hotspot.severity] || SEVERITY_COLORS.Low;
            return (
              <CircleMarker
                key={`hotspot-${hotspot.cluster_id}`}
                center={[hotspot.latitude, hotspot.longitude]}
                radius={Math.min(18, Math.max(7, hotspot.violation_count / 35))}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.45,
                  weight: 1.5,
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="font-sans text-[11px] text-[#1e293b] min-w-[200px] p-1 border-0">
                    <div className="font-black text-xs text-[#0f4c81] mb-2 truncate">
                      🔥 {hotspot.junction_name || `Junction Cluster #${hotspot.cluster_id}`}
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Violations:</span>
                      <span className="font-bold text-[#1e293b]">{hotspot.violation_count}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Severity:</span>
                      <span className="font-bold" style={{ color }}>{hotspot.severity}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Vehicles Logged:</span>
                      <span className="font-bold text-[#1e293b]">{hotspot.unique_vehicles}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Spillover layer */}
        {showSpillover &&
          spilloverZones.map((zone) => {
            // Map cyan/purple to Orange (High) / Blue (Normal)
            const color = zone.type === 'primary' ? '#f97316' : '#2563eb';
            return (
              <CircleMarker
                key={`spillover-${zone.id}`}
                center={[zone.latitude, zone.longitude]}
                radius={Math.min(22, Math.max(8, zone.radius / 12))}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.3,
                  weight: 1,
                  dashArray: zone.type === 'secondary' ? '4 4' : undefined,
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="font-sans text-[11px] text-[#1e293b] min-w-[200px] p-1 border-0">
                    <div className="font-black text-xs text-[#0f4c81] mb-2 truncate">
                      🌐 Spillover: {zone.label}
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Spillover Type:</span>
                      <span className="font-bold text-[#0f4c81] capitalize">{zone.type}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Spillover Score:</span>
                      <span className="font-bold text-[#1e293b]">{zone.score}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Risk Radius:</span>
                      <span className="font-bold text-[#1e293b]">{zone.radius} meters</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Forecast layer */}
        {showForecast &&
          forecastLocations.map((loc) => {
            // Map purple to severity color scale based on forecasted growth/risk
            const color = loc.future_risk_score >= 75 
              ? '#ef4444' 
              : loc.future_risk_score >= 45 
                ? '#f97316' 
                : '#eab308';
            return (
              <CircleMarker
                key={`forecast-${loc.id}`}
                center={[loc.latitude, loc.longitude]}
                radius={Math.min(18, Math.max(7, loc.radius))}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.35,
                  weight: 1.5,
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="font-sans text-[11px] text-[#1e293b] min-w-[200px] p-1 border-0">
                    <div className="font-black text-xs text-[#0f4c81] mb-2 truncate">
                      🔮 Forecast: {loc.label}
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Current Violations:</span>
                      <span className="font-bold text-[#1e293b]">{loc.current_violations}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Predicted (30d):</span>
                      <span className="font-bold text-[#1e293b]">{loc.predicted_violations}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Growth Rate:</span>
                      <span className={`font-bold ${loc.growth_rate >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {loc.growth_rate >= 0 ? '+' : ''}{loc.growth_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#475569]">Future Risk Score:</span>
                      <span className="font-bold text-[#1e293b]">{loc.future_risk_score}/100</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      {/* Mini Legend overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 pointer-events-auto shadow-md">
        <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black font-sans block">
          RISK CLASSIFICATION
        </span>
        <div className="grid grid-cols-1 gap-1 font-sans text-[9px] font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] block shrink-0" />
            <span className="text-slate-600">Critical Status</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] block shrink-0" />
            <span className="text-slate-600">High Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] block shrink-0" />
            <span className="text-slate-600">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] block shrink-0" />
            <span className="text-slate-600">Normal / Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
