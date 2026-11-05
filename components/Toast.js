import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Notification Component
 * Provides non-intrusive notifications to replace browser alerts
 */
const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const accents = {
    success: 'bg-leaf text-white',
    error: 'bg-berry text-white',
    warning: 'bg-sun text-ink',
    info: 'bg-card-blue text-ink',
  };

  return (
    <div
      className="cutout flex min-w-[280px] max-w-[460px] items-start gap-3 p-3 animate-slide-in"
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${accents[type]}`}>{icons[type]}</span>
      <p className="flex-1 pt-1 font-display text-base text-ink">{message}</p>
      <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-ink/10" aria-label="Close notification">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

/**
 * Toast Container Component
 * Manages multiple toast notifications
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="no-print fixed right-4 top-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default Toast;
