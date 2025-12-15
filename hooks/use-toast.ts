import { useState, useCallback } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Toast) => {
    // Simple console log for now - can be enhanced with a toast provider
    console.log(`[Toast] ${toast.title}${toast.description ? `: ${toast.description}` : ''}`);

    setToasts(prev => [...prev, toast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  }, []);

  return { toast, toasts };
}
