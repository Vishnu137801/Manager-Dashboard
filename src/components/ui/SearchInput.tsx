import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="h-4 w-4 text-[#69718A] absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 text-sm bg-white border border-[#E4E6F0] rounded-lg text-[#0B1230] placeholder:text-[#8E95AA] focus:outline-none focus:border-[#7050F5] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 p-1 text-[#69718A] hover:text-[#0B1230] rounded"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
