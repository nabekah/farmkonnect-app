import React, { createContext, useContext, useState, useCallback } from 'react';
import { ActivityNotification, NotificationType } from '@/components/ActivityNotificationToast';

interface NotificationContextType {
  notifications: ActivityNotification[];
  addNotification: (notification: Omit<ActivityNotification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);

  const addNotification = useCallback((notification: Omit<ActivityNotification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random()}`;
    const newNotification: ActivityNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

/**
 * Helper hooks for specific notification types
 */
export function useNotificationHelpers() {
  const { addNotification } = useNotification();

  return {
    success: (title: string, message: string, duration?: number) =>
      addNotification({ type: 'success', title, message, duration }),
    error: (title: string, message: string, duration?: number) =>
      addNotification({ type: 'error', title, message, duration }),
    warning: (title: string, message: string, duration?: number) =>
      addNotification({ type: 'warning', title, message, duration }),
    info: (title: string, message: string, duration?: number) =>
      addNotification({ type: 'info', title, message, duration }),
  };
}
