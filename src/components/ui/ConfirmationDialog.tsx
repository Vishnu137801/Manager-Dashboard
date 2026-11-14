import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../app/AppContext';

export const ConfirmationDialog: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useApp();

  if (!confirmDialog.open) return null;

  const isDanger = confirmDialog.variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1230]/45 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md bg-white border border-[#E4E6F0] rounded-xl shadow-xl p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-[#E05252]/10 text-[#E05252]' : 'bg-[#7050F5]/10 text-[#7050F5]'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-[#0B1230]">
              {confirmDialog.title}
            </h3>
            <p className="mt-1.5 text-sm text-[#5A627A] leading-relaxed">{confirmDialog.message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeConfirmDialog}
            className="px-4 py-2 text-xs font-semibold text-[#5A627A] bg-[#F7F7FC] hover:bg-[#EEF0F7] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              confirmDialog.onConfirm();
              closeConfirmDialog();
            }}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isDanger ? 'bg-[#E05252] hover:bg-[#C94141]' : 'bg-[#7050F5] hover:bg-[#5D3EE0]'
            }`}
          >
            {confirmDialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
