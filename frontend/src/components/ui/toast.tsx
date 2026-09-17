"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (type !== "loading" && duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => addToast({ type: "success", title, description }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => addToast({ type: "error", title, description, duration: 6000 }),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => addToast({ type: "info", title, description }),
    [addToast]
  );

  const loading = useCallback(
    (title: string, description?: string) => addToast({ type: "loading", title, description, duration: 0 }),
    [addToast]
  );

  const dismiss = useCallback(
    (id?: string) => {
      if (id) {
        removeToast(id);
      } else {
        setToasts([]);
      }
    },
    [removeToast]
  );

  React.useEffect(() => {
    setGlobalToast({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      info,
      loading,
      dismiss,
    });
  }, [toasts, addToast, removeToast, success, error, info, loading, dismiss]);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, loading, dismiss }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Global standalone helper for non-component calls
let globalToastHandler: ToastContextType | null = null;
export function setGlobalToast(handler: ToastContextType) {
  globalToastHandler = handler;
}
export const toast = {
  success: (title: string, desc?: string) => globalToastHandler?.success(title, desc),
  error: (title: string, desc?: string) => globalToastHandler?.error(title, desc),
  info: (title: string, desc?: string) => globalToastHandler?.info(title, desc),
  loading: (title: string, desc?: string) => globalToastHandler?.loading(title, desc),
  dismiss: (id?: string) => globalToastHandler?.dismiss(id),
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto relative flex items-start gap-3.5 p-4 rounded-xl shadow-2xl border transition-all duration-300 animate-slide-up overflow-hidden ${
            t.type === "success"
              ? "bg-[#121214] text-white border-emerald-500/50 shadow-emerald-950/40"
              : t.type === "error"
              ? "bg-[#121214] text-white border-rose-500/50 shadow-rose-950/40"
              : t.type === "loading"
              ? "bg-[#121214] text-white border-blue-500/50 shadow-blue-950/40"
              : "bg-[#121214] text-white border-amber-500/50 shadow-amber-950/40"
          }`}
        >
          {/* Accent Colored Left Stripe */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              t.type === "success"
                ? "bg-emerald-500"
                : t.type === "error"
                ? "bg-rose-500"
                : t.type === "loading"
                ? "bg-blue-500"
                : "bg-amber-500"
            }`}
          />

          <div className="shrink-0 mt-0.5 pl-1">
            {t.type === "success" && (
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            {t.type === "error" && (
              <div className="h-6 w-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
            )}
            {t.type === "info" && (
              <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Info className="w-4 h-4 text-amber-400" />
              </div>
            )}
            {t.type === "loading" && (
              <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white tracking-wide leading-snug">{t.title}</p>
            {t.description && (
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed font-normal">
                {t.description}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
