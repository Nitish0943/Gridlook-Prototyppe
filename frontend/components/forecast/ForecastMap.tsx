'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ForecastMapResponse } from '../../lib/types';
import { Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface ForecastMapProps {
  mapData?: ForecastMapResponse;
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Critical: '#ef4444', // Red
  High: '#f97316',     // Orange
  Medium: '#eab308',   // Yellow
  Low: '#2563eb',      // Blue (Normal)
};

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

export default function ForecastMap({ mapData, isLoading }: ForecastMapProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse flex items-center justify-center">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const locations = mapData?.locations ?? [];

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-md flex flex-col min-h-[450px]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-b border-slate-200 p-3 flex justify-between items-center">
        <h3 className="text-[10px] uppercase tracking-widest text-[#1E293B] font-bold font-sans">
          Future Parking Risk Forecast Map
        </h3>
        <span className="text-[9px] text-slate-500 font-sans bg-slate-50 px-2 py-0.5 rounded border border-slate-200 uppercase font-bold">
          {locations.length} ZONES
        </span>
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

        {locations.map((loc) => {
          const color = CATEGORY_COLORS[loc.risk] || CATEGORY_COLORS.Low;
          return (
            <CircleMarker
              key={loc.id}
              center={[loc.latitude, loc.longitude]}
              radius={Math.max(6, loc.radius)}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.55,
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div style={{ minWidth: 220, color: '#1e293b', fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px' }}>
                  <div style={{ fontWeight: 850, fontSize: '12px', marginBottom: 8, color: '#0f4c81' }}>
                    {loc.label}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#475569' }}>Current Violations:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{loc.current_violations}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#475569' }}>Projected (30d):</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{loc.predicted_violations}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#475569' }}>Growth Rate:</span>
                    <span style={{ fontWeight: 700, color: loc.growth_rate >= 0 ? '#ef4444' : '#22c55e' }}>
                      {loc.growth_rate >= 0 ? '+' : ''}{loc.growth_rate}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#475569' }}>Future Risk Score:</span>
                    <span style={{ fontWeight: 700, color: color }}>{loc.future_risk_score}/100</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#475569' }}>Risk Classification:</span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: color + '22',
                      color: color,
                      border: `1px solid ${color}44`,
                      textTransform: 'uppercase',
                    }}>
                      {loc.risk}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 4 }}>
                    <span style={{ color: '#64748b' }}>Coordinates:</span>
                    <span style={{ color: '#64748b' }}>{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-slate-200 rounded-lg p-3 shadow-md">
        <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-sans mb-2">
          Future Risk Level
        </div>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center space-x-2 font-bold">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-slate-600 font-sans">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
