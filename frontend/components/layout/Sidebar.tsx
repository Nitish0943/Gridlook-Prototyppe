'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Flame,
  Gauge,
  LineChart,
  UserCheck,
  Cpu,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Map,
  Construction,
  Banknote,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Executive overview' },
    { name: 'Hotspots', path: '/hotspots', icon: Flame, desc: 'Hotspot engine analysis' },
    { name: 'Impact Analysis', path: '/impact-score', icon: Gauge, desc: 'Congestion impact score' },
    { name: 'Correlation', path: '/correlation', icon: LineChart, desc: 'Congestion correlation' },
    { name: 'Spillover Analysis', path: '/spillover', icon: Map, desc: 'Secondary zone tracking' },
    { name: 'Road Capacity', path: '/capacity-loss', icon: Construction, desc: 'Road capacity estimator' },
    { name: 'Economic Impact', path: '/economic-impact', icon: Banknote, desc: 'Financial cost analysis' },
    { name: 'Future Forecast', path: '/forecast', icon: TrendingUp, desc: 'Risk predictions' },
    { name: 'Peak Hour Prediction', path: '/peak-hours', icon: Clock, desc: 'Hourly risk forecasts' },
    { name: 'Recommendations', path: '/recommendations', icon: UserCheck, desc: 'Enforcement plan' },
    { name: 'Digital Twin', path: '/digital-twin', icon: Cpu, desc: 'What-if simulations' },
    { name: 'Settings', path: '/settings', icon: Settings, desc: 'System settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1E3A5F] border-r border-[#172e4d] text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#172e4d] h-16 shrink-0">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="p-1.5 bg-[#0F4C81] border border-[#0d3f6d] rounded-lg text-white">
            <Shield className="w-5 h-5 shrink-0" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black tracking-widest text-white font-sans uppercase shrink-0"
            >
              SCITA PLATFORM
            </motion.span>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1 hover:bg-[#162C4E] border border-transparent hover:border-[#172e4d] rounded-md transition-colors text-[#94a3b8] hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all group relative ${
                isActive
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81] shadow-sm'
                  : 'hover:bg-[#162C4E] text-[#cbd5e1] border-transparent hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'
                }`}
              />

              {!collapsed && (
                <div className="flex flex-col">
                  <span>{item.name}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Version */}
      <div className="p-4 border-t border-[#172e4d] shrink-0 text-center md:text-left">
        {!collapsed ? (
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] font-bold text-white font-sans uppercase tracking-wider">
              Traffic Control Division
            </span>
            <span className="text-[9px] text-[#94a3b8] font-sans">v1.2.0 (Official)</span>
          </div>
        ) : (
          <span className="text-[9px] font-bold text-[#94a3b8] font-sans">V1</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 h-screen sticky top-0 z-40 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sliding panel */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-60 z-50 md:hidden transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
