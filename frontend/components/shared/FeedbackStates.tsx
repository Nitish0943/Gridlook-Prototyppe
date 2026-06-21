'use client';

import React from 'react';
import { AlertCircle, FileQuestion, RefreshCw } from 'lucide-react';

interface LoadingSkeletonProps {
  rows?: number;
}

export function LoadingSkeleton({ rows = 4 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="h-8 bg-slate-900/50 border border-slate-800 rounded-lg animate-pulse w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
        <div className="h-80 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 text-slate-500 mb-4">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">{title}</h3>
      <p className="text-slate-500 text-xs mt-1 max-w-sm leading-normal">{description}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Connection to Smart City Telemetry Stream Offline.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-rose-950/30 rounded-2xl bg-rose-950/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
      <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-800/30 text-rose-500 mb-4 animate-pulse">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-450 uppercase tracking-wider font-mono">System Telemetry Offline</h3>
      <p className="text-slate-505 text-xs mt-1.5 max-w-md leading-normal">
        {message} Please ensure the FastAPI backend is running locally on port 8000.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-4 py-2 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-800/40 rounded-xl text-xs font-bold font-mono text-rose-450 hover:text-slate-100 flex items-center space-x-1.5 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETRY TELEMETRY LINK</span>
        </button>
      )}
    </div>
  );
}
