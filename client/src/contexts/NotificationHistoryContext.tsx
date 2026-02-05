import React, { createContext, useContext, useState, useCallback } from 'react';

export interface HistoricalNotification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationHistoryContextType {
  notifications: HistoricalNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<HistoricalNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
}

const NotificationHistoryContext = createContext<NotificationHistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'notification-history';
const MAX_HISTORY = 50;

export function NotificationHistoryProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<HistoricalNotification[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<HistoricalNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: HistoricalNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.error('Failed to save notification history');
      }
      return updated;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.error('Failed to save notification history');
      }
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.error('Failed to save notification history');
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      console.error('Failed to clear notification history');
    }
  }, []);

  return (
    <NotificationHistoryContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearHistory,
      }}
    >
      {children}
    </NotificationHistoryContext.Provider>
  );
}

export function useNotificationHistory() {
  const context = useContext(NotificationHistoryContext);
  if (!context) {
    throw new Error('useNotificationHistory must be used within NotificationHistoryProvider');
  }
  return context;
}
