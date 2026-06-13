"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast portal container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const styles = {
            success: "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
            error: "bg-red-50 dark:bg-red-950/90 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50",
            info: "bg-indigo-50 dark:bg-indigo-950/90 text-indigo-850 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50"
          }[toast.type];

          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto ${styles}`}
            >
              <div className="flex gap-2.5 items-start">
                <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white shrink-0 p-0.5 rounded-full cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
