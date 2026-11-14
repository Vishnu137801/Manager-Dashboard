import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../../app/AppContext';

export const ToastNotifications: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.variant === 'success'
            ? CheckCircle2
            : toast.variant === 'error'
            ? AlertCircle
            : toast.variant === 'warning'
            ? AlertCircle
            : Info;

        const iconColor =
          toast.variant === 'success'
            ? 'text-[#16A36A]'
            : toast.variant === 'error'
            ? 'text-[#E05252]'
            : toast.variant === 'warning'
            ? 'text-[#E9A23B]'
            : 'text-[#478BFA]';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-[#0B1230] text-white rounded-xl px-4 py-3 shadow-lg border border-white/10"
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] text-white/75 leading-snug">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-0.5 text-white/60 hover:text-white rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
