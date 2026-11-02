import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function add(type: Toast['type'], message: string, duration = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, message, duration };

    update((toasts) => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }

  function dismiss(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    success: (msg: string, d?: number) => add('success', msg, d),
    error: (msg: string, d?: number) => add('error', msg, d),
    info: (msg: string, d?: number) => add('info', msg, d),
    warning: (msg: string, d?: number) => add('warning', msg, d),
    dismiss
  };
}

export const toasts = createToastStore();
