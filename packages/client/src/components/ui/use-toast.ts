import { useCallback } from 'react';
import { create } from 'zustand';

interface ToastState {
  toasts: {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }[];
  addToast: (toast: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useShowToast() {
  const addToast = useToast((state) => state.addToast);
  return useCallback(
    (toast: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      addToast(toast);
    },
    [addToast]
  );
}
