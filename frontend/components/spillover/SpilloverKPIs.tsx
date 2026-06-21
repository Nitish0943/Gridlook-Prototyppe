'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Map, AlertOctagon, TrendingUp } from 'lucide-react';
import { SpilloverSummaryResponse } from '../../lib/types';

interface SpilloverKPIsProps {
  summary?: SpilloverSummaryResponse;
  isLoading: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut' as any,
    },
  }),
};

export default function SpilloverKPIs({ summary, isLoading }: SpilloverKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: 'Total Spillover Zones',
      value: summary?.total_spillover_zones.toLocaleString() ?? '0',
      icon: Map,
      color: 'text-amber-500',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/20',
      desc: 'Areas actively experiencing parking spillover',
    },
    {
      title: 'Critical Spillovers',
      value: summary?.critical_spillovers.toLocaleString() ?? '0',
      icon: AlertOctagon,
      color: 'text-rose-500',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-rose-500/20',
      desc: 'Zones with score > 80 requiring immediate action',
    },
    {
      title: 'Avg Spillover Score',
      value: summary?.average_spillover_score ? `${summary.average_spillover_score}` : '0',
      icon: TrendingUp,
      color: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-500/20',
      desc: 'City-wide average spillover severity score',
    },
    {
      title: 'Max Risk Radius',
      value: summary?.max_risk_radius_m ? `${summary.max_risk_radius_m}m` : '0m',
      icon: ShieldAlert,
      color: 'text-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20',
      desc: 'Boundary radius for secondary zone mapping',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiData.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.02, translateY: -2 }}
            className={`bg-slate-900/40 backdrop-blur-md border rounded-xl p-6 transition-all duration-350 cursor-pointer ${item.glow} hover:bg-slate-900/60`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {item.title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-2 font-mono">
                  {item.value}
                </h3>
              </div>
              <div className={`p-2 rounded-lg bg-slate-950/80 border border-slate-800 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-3 line-clamp-1">{item.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
