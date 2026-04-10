'use client';

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  onDismiss: (id: string) => void;
}

function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  React.useEffect(() => {
    if (variant !== 'error') {
      const timer = setTimeout(() => onDismiss(id), 3000);
      return () => clearTimeout(timer);
    }
  }, [id, variant, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-full duration-300",
        variant === 'success' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        variant === 'error' && "bg-red-500/10 border-red-500/30 text-red-300",
        variant === 'default' && "bg-white/10 border-white/20 text-white"
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-1 text-xs opacity-70">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-1 hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

// Global toast state
let listeners: Array<(toasts: ToastItem[]) => void> = [];
let toastQueue: ToastItem[] = [];

function notifyListeners() {
  listeners.forEach((fn) => fn([...toastQueue]));
}

export function toast(item: Omit<ToastItem, 'id'>) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  toastQueue.push({ ...item, id });
  notifyListeners();
}

function dismissToast(id: string) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  notifyListeners();
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 sm:top-4 sm:right-4 max-sm:top-auto max-sm:bottom-4 max-sm:right-1/2 max-sm:translate-x-1/2">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
