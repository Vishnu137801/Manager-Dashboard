import React from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  headerActions,
  children,
  widthClass = 'max-w-2xl',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0B1230]/40 backdrop-blur-[1px]">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <aside
        className={`relative z-10 w-full ${widthClass} bg-white h-full border-l border-[#E4E6F0] shadow-2xl flex flex-col`}
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EEF0F7]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#0B1230] truncate">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#5A627A] truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-[#5A627A] hover:text-[#0B1230] hover:bg-[#F7F7FC] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">{children}</div>
      </aside>
    </div>
  );
};
