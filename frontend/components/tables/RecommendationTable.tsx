'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { RecommendationDetail } from '../../lib/types';

interface RecommendationTableProps {
  data?: RecommendationDetail[];
  isLoading: boolean;
}

export default function RecommendationTable({ data = [], isLoading }: RecommendationTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<RecommendationDetail>[]>(
    () => [
      {
        accessorKey: 'rank',
        header: 'Rank',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-400 font-bold">
            #{info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: 'junction_name',
        header: 'Junction Name',
        cell: (info) => (
          <span className="text-slate-100 font-semibold text-xs">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'priority_score',
        header: 'Priority Score',
        cell: (info) => {
          const score = info.getValue() as number;
          let barColor = 'bg-emerald-500';
          if (score >= 80) barColor = 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
          else if (score >= 60) barColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
          else if (score >= 30) barColor = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]';

          return (
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-100 w-6">{score}</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: (info) => {
          const priority = info.getValue() as string;
          let colors = 'bg-slate-800/80 text-slate-300 border-slate-700';
          if (priority === 'Critical') {
            colors = 'bg-rose-950/40 text-rose-400 border-rose-800/40 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
          } else if (priority === 'High') {
            colors = 'bg-amber-950/40 text-amber-400 border-amber-800/40';
          } else if (priority === 'Medium') {
            colors = 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40';
          } else if (priority === 'Low') {
            colors = 'bg-emerald-950/40 text-emerald-400 border-emerald-850/40';
          }

          return (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border tracking-wider font-mono ${colors}`}>
              {priority}
            </span>
          );
        },
      },
      {
        accessorKey: 'officers',
        header: 'Deployment',
        cell: (info) => {
          const officers = info.getValue() as number;
          return (
            <div className="flex items-center space-x-1 text-cyan-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span className="font-mono text-xs font-bold text-slate-100">{officers} officer{officers !== 1 ? 's' : ''}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'recommended_time_window',
        header: 'Time Window',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-850">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'expected_congestion_reduction',
        header: 'Relief Est.',
        cell: (info) => {
          const reduction = info.getValue() as number;
          return (
            <span className="text-emerald-400 text-xs font-mono font-bold">
              +{reduction}% Flow
            </span>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: 'Analysis',
        cell: (info) => (
          <p className="text-xs text-slate-400 max-w-xs truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </p>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 h-[400px] flex items-center justify-center animate-pulse">
        <p className="text-slate-500 text-xs">Loading operational priorities...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Enforcement recommendations
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Targeted deployment coordinates, timing parameters, and impact forecasts
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/80 border border-slate-850 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 font-mono transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full border border-slate-850 rounded-lg">
          <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-950/70 border-b border-slate-850">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:text-cyan-400' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {header.column.getCanSort() && (
                          <span className="text-slate-600">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-3 h-3 text-cyan-400" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-3 h-3 text-cyan-400" />
                            ) : null}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-850/50 hover:bg-slate-900/35 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-slate-500 font-mono">
                    No deployment matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-4 border-t border-slate-850/40 pt-3">
          <span className="text-[10px] text-slate-500 font-mono">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <div className="flex space-x-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 border border-slate-850 rounded bg-slate-950/60 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-slate-950/60 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 border border-slate-850 rounded bg-slate-950/60 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-slate-950/60 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
