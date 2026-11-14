import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../../utils/formatters';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  widthClass?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  pageSize = 10,
  emptyTitle = 'No matching records',
  emptyDescription = 'Adjust your active filters or scope to view records.',
  emptyAction,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (col: ColumnDef<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E4E6F0] bg-[#F7F7FC]/75">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={classNames(
                    'px-4 py-3 text-[11px] font-semibold text-[#5A627A] tracking-wide whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sortValue && 'cursor-pointer select-none hover:text-[#0B1230]',
                    col.widthClass
                  )}
                  onClick={() => toggleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortValue && sortKey === col.key && (
                      sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#7050F5]" /> : <ArrowDown className="h-3 w-3 text-[#7050F5]" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF0F7]">
            {pagedData.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={classNames(
                  'transition-colors text-[13px] text-[#0B1230]',
                  onRowClick ? 'hover:bg-[#7050F5]/[0.03] cursor-pointer' : 'hover:bg-[#F7F7FC]/60'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      'px-4 py-3 align-middle',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEF0F7] text-xs text-[#5A627A]">
          <span className="tabular-nums">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230] disabled:opacity-40 hover:bg-[#F7F7FC]"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230] disabled:opacity-40 hover:bg-[#F7F7FC]"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
