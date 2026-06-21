'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#0F4C81] font-sans uppercase">
          {title}
        </h1>
        {description && (
          <p className="text-slate-600 text-xs font-sans uppercase tracking-widest mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-3 self-start md:self-auto shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
