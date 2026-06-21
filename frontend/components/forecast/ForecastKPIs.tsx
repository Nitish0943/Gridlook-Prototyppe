import React from 'react';
import { motion } from 'framer-motion';
import { ForecastSummaryResponse } from '../../lib/types';
import { ShieldAlert, TrendingUp, AlertOctagon, Flame } from 'lucide-react';

interface ForecastKPIsProps {
  summary?: ForecastSummaryResponse;
  predictedMonthlyViolations: number;
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

export default function ForecastKPIs({ summary, predictedMonthlyViolations, isLoading }: ForecastKPIsProps) {
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
      title: 'High Risk Areas',
      value: `${summary?.high_risk_areas ?? 0}`,
      icon: ShieldAlert,
      color: 'text-orange-400',
      border: 'border-orange-850/30',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.08)]',
      desc: 'Junctions in high-risk categories',
    },
    {
      title: 'Critical Future Hotspots',
      value: `${summary?.critical_future_hotspots ?? 0}`,
      icon: AlertOctagon,
      color: 'text-rose-500',
      border: 'border-rose-850/30',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.08)]',
      desc: 'Severe congestion hotspots predicted',
    },
    {
      title: 'Average Growth Rate',
      value: `${summary?.average_growth_rate ?? 0}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      border: 'border-cyan-850/30',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.08)]',
      desc: 'Average predicted growth trend',
    },
    {
      title: 'Predicted Monthly Violations',
      value: predictedMonthlyViolations.toLocaleString(),
      icon: Flame,
      color: 'text-purple-400',
      border: 'border-purple-850/30',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.08)]',
      desc: 'Projections for next 30 days',
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
            <div className="font-mono font-black text-3xl text-slate-100">
              {kpi.value}
            </div>
            <span className="text-[10px] text-slate-650 font-mono mt-1">{kpi.desc}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
