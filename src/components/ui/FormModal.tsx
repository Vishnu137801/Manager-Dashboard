import React from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-xl',
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1230]/45 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidthClass} bg-white border border-[#E4E6F0] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EEF0F7]">
          <div>
            <h3 className="text-base font-semibold text-[#0B1230]">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-[#5A627A]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#5A627A] hover:text-[#0B1230] hover:bg-[#F7F7FC] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
};
