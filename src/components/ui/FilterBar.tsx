import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SearchInput } from './SearchInput';

export interface FilterSelect {
  key: string;
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selects?: FilterSelect[];
  onReset?: () => void;
  actions?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder,
  selects = [],
  onReset,
  actions,
}) => {
  const hasActive = Boolean(search) || selects.some((s) => s.value !== 'all' && s.value !== '');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-[#E4E6F0] rounded-xl p-3.5">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {onSearchChange !== undefined && (
          <SearchInput
            value={search || ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder || 'Search records...'}
            className="w-full sm:w-64"
          />
        )}

        {selects.map((sel) => (
          <div key={sel.key} className="flex items-center gap-1.5">
            <label htmlFor={`filter-${sel.key}`} className="sr-only">
              {sel.label}
            </label>
            <select
              id={`filter-${sel.key}`}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="h-10 px-3 text-xs font-medium bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg text-[#0B1230] focus:outline-none focus:border-[#7050F5] cursor-pointer"
            >
              <option value="all">{sel.label}: All</option>
              {sel.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActive && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-[#5A627A] hover:text-[#0B1230] hover:bg-[#F7F7FC] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
