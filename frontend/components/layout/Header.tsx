'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Clock, Database, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useStats } from '../../lib/hooks/useStats';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Header({ setMobileOpen }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');
  const { isError, isLoading, refetch } = useStats();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0] h-16 shrink-0 z-35">
      <div className="flex items-center space-x-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-[#1E293B]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Telemetry Header */}
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-[#0F4C81] animate-pulse" />
          <span className="text-xs font-bold text-[#1E293B] uppercase tracking-widest font-sans hidden sm:inline">
            Traffic Control Division
          </span>
          <span className="text-[10px] text-slate-300 hidden md:inline">|</span>
          <span className="text-[10px] text-slate-500 font-sans hidden md:inline">
            Integrated Parking Management System
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 p-1.5 rounded-lg">
        {/* Connection status */}
        <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-3">
          {isError ? (
            <span className="flex items-center space-x-1 text-rose-600 text-[10px] font-extrabold uppercase tracking-wider font-sans">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LINK OFFLINE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LINK ONLINE</span>
            </span>
          )}
        </div>

        {/* System clock */}
        <div className="flex items-center space-x-1 text-slate-600 text-[11px] font-sans border-r border-slate-200 pr-3">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last Updated: {currentTime || '00:00:00'}</span>
        </div>

        {/* Manual Refresh Trigger */}
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-1 text-slate-500 hover:text-[#0F4C81] disabled:opacity-50 hover:bg-slate-100 rounded transition-all"
          title="Sync System Telemetries"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0F4C81]' : ''}`} />
        </button>
      </div>
    </header>
  );
}
