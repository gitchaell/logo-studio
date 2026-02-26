import { X, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Custom Event for cross-island communication
const TOAST_EVENT = 'logo-studio:toast';

export const toast = (message: string, type: ToastType = 'info') => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(TOAST_EVENT, { detail: { message, type } });
    window.dispatchEvent(event);
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, message: detail.message, type: detail.type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200' : ''}
            ${toast.type === 'info' ? 'bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook for compatibility/convenience, though direct import of toast is also fine
export function useToast() {
  return {
    addToast: toast
  };
}
