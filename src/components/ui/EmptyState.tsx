import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl px-6 py-12 text-center flex flex-col items-center justify-center">
      <div className="h-11 w-11 rounded-xl bg-[#F7F7FC] border border-[#E4E6F0] flex items-center justify-center text-[#5A627A] mb-3">
        {icon || <FolderOpen className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-semibold text-[#0B1230]">{title}</h3>
      <p className="mt-1 text-xs text-[#5A627A] max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
