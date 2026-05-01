'use client';

import { useDevice } from '@/hooks/useDevice';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  mobileCard: (row: T) => React.ReactNode;
  loading?: boolean;
}

/**
 * Adaptive DataTable component.
 * Renders a full-featured table on desktop and a card-based list on mobile.
 */
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
            <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse" />
          ))
        ) : (
          data.map((row, i) => <div key={i}>{mobileCard(row)}</div>)
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th 
                  key={h.id} 
                  className="px-6 py-4 cursor-pointer select-none transition-colors hover:bg-gray-100"
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getCanSort() && (
                      <span className="text-gray-400">
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[h.column.getIsSorted() as string] ?? <ChevronsUpDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
