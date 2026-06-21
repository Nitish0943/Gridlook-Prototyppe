import React from 'react';
import { motion } from 'framer-motion';
import { EconomicImpactSummaryResponse } from '../../lib/types';
import { TrendingDown, Calendar, AlertTriangle, Landmark } from 'lucide-react';

interface EconomicKPIsProps {
  summary?: EconomicImpactSummaryResponse;
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

export const formatRupees = (value?: number) => {
  if (value === undefined || value === null) return '₹0';
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Crore`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} Lakh`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
};

export default function EconomicKPIs({ summary, isLoading }: EconomicKPIsProps) {
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
      title: 'Daily Economic Loss',
      value: formatRupees(summary?.citywide_daily_loss),
      icon: TrendingDown,
      color: 'text-amber-400',
      border: 'border-amber-800/30',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.08)]',
      desc: 'Estimated loss per 24 hours',
    },
    {
      title: 'Monthly Economic Loss',
      value: formatRupees(summary?.citywide_monthly_loss),
      icon: Calendar,
      color: 'text-rose-400',
      border: 'border-rose-800/30',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.08)]',
      desc: 'Projected monthly traffic drain',
    },
    {
      title: 'Yearly Economic Loss',
      value: formatRupees(summary?.citywide_yearly_loss),
      icon: Landmark,
      color: 'text-red-500',
      border: 'border-red-800/30',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.08)]',
      desc: 'Aggregated annual loss impact',
    },
    {
      title: 'Highest Loss Area',
      value: summary?.highest_loss_area ?? 'N/A',
      icon: AlertTriangle,
      color: 'text-cyan-400',
      border: 'border-cyan-800/30',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.08)]',
      desc: 'Worst financial drain junction',
      isText: true,
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
            <div className={`font-mono font-black ${kpi.isText ? 'text-sm truncate' : 'text-3xl'} text-slate-100`}>
              {kpi.value}
            </div>
            <span className="text-[10px] text-slate-650 font-mono mt-1">{kpi.desc}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
