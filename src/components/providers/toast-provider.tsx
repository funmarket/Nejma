"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'info' | 'success' | 'error';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={cn(
                "px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px] animate-in fade-in-0 slide-in-from-top-5",
                {
                    'bg-green-600': toast.type === 'success',
                    'bg-red-600': toast.type === 'error',
                    'bg-primary': toast.type === 'info',
                }
            )}
            >
            {toast.type === 'success' && <Check className="w-5 h-5 text-white" />}
            <span className="text-white text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
