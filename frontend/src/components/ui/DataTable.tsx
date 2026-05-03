'use client';

import { useDevice } from '@/hooks/useDevice';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  HeaderGroup,
  Header,
  Row,
  Cell as TableCell,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  mobileCard: (row: T) => React.ReactNode;
  loading?: boolean;
}

import { motion } from 'framer-motion';

export function DataTable<T>({ data, columns, mobileCard, loading }: Props<T>) {
  const device = useDevice();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (device === 'mobile') {
    return (
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[2rem] bg-gray-200 animate-pulse" />
          ))
        ) : (
          data.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {mobileCard(row)}
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/20">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg: HeaderGroup<T>) => (
            <tr key={hg.id} className="bg-gray-50/50 border-b border-gray-100">
              {hg.headers.map((h: Header<T, any>) => (
                <th
                  key={h.id}
                  className="px-8 py-5 cursor-pointer select-none transition-colors hover:bg-gray-100/50"
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </span>
                    {h.column.getCanSort() && (
                      <span className="text-gray-300">
                        {{
                          asc: <ChevronUp size={14} strokeWidth={3} />,
                          desc: <ChevronDown size={14} strokeWidth={3} />,
                        }[h.column.getIsSorted() as string] ?? <ChevronsUpDown size={14} strokeWidth={3} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-8 py-5">
                    <div className="h-4 w-full rounded-full bg-gray-50 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-8 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                    <ChevronsUpDown size={24} />
                  </div>
                  <p className="text-gray-400 font-bold tracking-tight">No records found</p>
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row: Row<T>, i: number) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-brand-50/30 transition-colors group"
              >
                {row.getVisibleCells().map((cell: TableCell<T, any>) => (
                  <td key={cell.id} className="px-8 py-5 text-gray-700 font-semibold group-hover:text-brand-900 transition-colors">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
