'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SpilloverMapResponse } from '../../lib/types';
import { Activity, Compass, MapPin } from 'lucide-react';

interface SpilloverMapProps {
  mapData?: SpilloverMapResponse;
  isLoading: boolean;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function SpilloverMap({ mapData, isLoading }: SpilloverMapProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-50 flex flex-col items-center justify-center border border-slate-200 rounded-xl relative overflow-hidden">
        <Activity className="w-8 h-8 text-[#0F4C81] animate-spin mb-3" />
        <p className="text-[#475569] text-xs font-sans tracking-widest uppercase">
          Aligning Spillover Telemetry...
        </p>
      </div>
    );
  }

  const primaryZones = mapData?.zones?.filter(z => z.type === 'primary') || [];
  const secondaryZones = mapData?.zones?.filter(z => z.type === 'secondary') || [];

  return (
    <div className="w-full h-full min-h-[500px] relative border border-slate-200 rounded-xl overflow-hidden shadow-md bg-white flex flex-col">
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col space-y-1 text-[9px] font-sans text-[#475569]">
        <div className="font-black text-[#1e293b] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-[#0f4c81]" />
          <span>Zone Legend</span>
        </div>
        <div className="flex items-center space-x-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] shrink-0" />
          <span className="text-slate-600">Primary Hotspot (Source)</span>
        </div>
        <div className="flex items-center space-x-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)] shrink-0" />
          <span className="text-slate-600">Secondary Spillover Zone</span>
        </div>
        <div className="flex items-center space-x-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 shrink-0" />
          <span className="text-slate-600">Risk Boundary Radius</span>
        </div>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#F8FAFC' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Primary Zones and their risk radiuses */}
        {primaryZones.map((zone) => (
          <React.Fragment key={zone.id}>
            {/* Risk Radius circle */}
            <CircleMarker
              center={[zone.latitude, zone.longitude]}
              radius={zone.radius / 10} // visual scaling for leaflet circle marker
              fillColor="#eab308"
              color="#eab308"
              weight={1}
              fillOpacity={0.05}
              opacity={0.3}
            />
            {/* Primary Center */}
            <CircleMarker
              center={[zone.latitude, zone.longitude]}
              radius={10}
              fillColor="#ef4444"
              color="#ef4444"
              weight={2}
              fillOpacity={0.8}
            >
              <Popup className="custom-leaflet-popup font-sans text-xs">
                <div className="p-1 space-y-1">
                  <h4 className="font-bold text-[#0f4c81] uppercase">{zone.label || `Hotspot ${zone.id}`}</h4>
                  <p className="text-rose-600 text-[10px]">Primary Source</p>
                  <p className="text-[#475569] text-[10px]">Score: <span className="text-[#1e293b] font-bold">{zone.score}</span></p>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}

        {/* Secondary Zones */}
        {secondaryZones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={6}
            fillColor="#f97316"
            color="#f97316"
            weight={1}
            fillOpacity={0.6}
          >
            <Popup className="custom-leaflet-popup font-sans text-xs">
              <div className="p-1 space-y-1">
                <h4 className="font-bold text-[#0f4c81] uppercase">{zone.label || 'Unknown Junction'}</h4>
                <p className="text-orange-600 text-[10px]">Secondary Spillover</p>
                <p className="text-[#475569] text-[10px]">Inherited Risk: <span className="text-[#1e293b] font-bold">{zone.score}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
