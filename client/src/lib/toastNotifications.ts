/**
 * Toast Notification System
 * Centralized system for displaying toast notifications
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const DEFAULT_DURATION = 5000; // 5 seconds

/**
 * Generate a unique ID for a toast
 */
export function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper functions for creating toasts
 */
export const toastHelpers = {
  success: (title: string, message: string, duration = DEFAULT_DURATION) => ({
    type: 'success' as ToastType,
    title,
    message,
    duration,
  }),

  error: (title: string, message: string, duration = DEFAULT_DURATION) => ({
    type: 'error' as ToastType,
    title,
    message,
    duration,
  }),

  warning: (title: string, message: string, duration = DEFAULT_DURATION) => ({
    type: 'warning' as ToastType,
    title,
    message,
    duration,
  }),

  info: (title: string, message: string, duration = DEFAULT_DURATION) => ({
    type: 'info' as ToastType,
    title,
    message,
    duration,
  }),
};
