import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-4 w-48 bg-[#EEF0F7] rounded" />
      <div className="divide-y divide-[#EEF0F7]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 rounded-lg bg-[#EEF0F7]" />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <div className="h-3.5 bg-[#EEF0F7] rounded w-3/4" />
                <div className="h-2.5 bg-[#F3F4FA] rounded w-1/2" />
              </div>
            </div>
            <div className="h-6 w-20 bg-[#EEF0F7] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
