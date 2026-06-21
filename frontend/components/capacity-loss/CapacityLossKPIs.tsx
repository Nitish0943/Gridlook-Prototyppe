import React from 'react';
import { motion } from 'framer-motion';
import { CapacityLossSummaryResponse } from '../../lib/types';
import { Gauge, AlertTriangle, MapPin, TrendingDown, Activity } from 'lucide-react';

interface CapacityLossKPIsProps {
  summary?: CapacityLossSummaryResponse;
  isLoading: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as any },
  }),
};

export default function CapacityLossKPIs({ summary, isLoading }: CapacityLossKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Average Capacity Loss',
      value: `${summary?.average_capacity_loss ?? 0}%`,
      icon: Gauge,
      color: 'text-cyan-400',
      border: 'border-cyan-800/30',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.08)]',
      desc: 'Mean road capacity reduction',
    },
    {
      title: 'Critical Locations',
      value: `${summary?.critical_locations ?? 0}`,
      icon: AlertTriangle,
      color: 'text-rose-400',
      border: 'border-rose-800/30',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.08)]',
      desc: 'Junctions with ≥76% capacity loss',
    },
    {
      title: 'Highest Loss Area',
      value: summary?.highest_loss_area ?? 'N/A',
      icon: MapPin,
      color: 'text-amber-400',
      border: 'border-amber-800/30',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.08)]',
      desc: 'Most affected junction',
      isText: true,
    },
    {
      title: 'Citywide Capacity Loss',
      value: `${summary?.citywide_capacity_loss ?? 0}%`,
      icon: TrendingDown,
      color: 'text-violet-400',
      border: 'border-violet-800/30',
      glow: 'shadow-[0_0_15px_rgba(167,139,250,0.08)]',
      desc: 'Median capacity reduction across city',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className={`bg-slate-950/80 backdrop-blur-md border ${kpi.border} rounded-xl p-5 ${kpi.glow} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                {kpi.title}
              </span>
              <Icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className={`font-mono font-black ${kpi.isText ? 'text-lg truncate' : 'text-3xl'} text-slate-100`}>
              {kpi.value}
            </div>
            <span className="text-[10px] text-slate-600 font-mono mt-1">{kpi.desc}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
