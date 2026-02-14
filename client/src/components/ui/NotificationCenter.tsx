import { forwardRef, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationCategory = 'system' | 'user' | 'order' | 'alert' | 'success';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  /**
   * Notification ID
   */
  id: string;
  /**
   * Notification title
   */
  title: string;
  /**
   * Notification message
   */
  message?: string;
  /**
   * Notification type
   */
  type?: NotificationType;
  /**
   * Notification category
   */
  category?: NotificationCategory;
  /**
   * Notification priority
   */
  priority?: NotificationPriority;
  /**
   * Timestamp
   */
  timestamp: number;
  /**
   * Is read
   */
  read?: boolean;
  /**
   * Action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Icon
   */
  icon?: ReactNode;
}

export interface NotificationCenterProps {
  /**
   * Notifications
   */
  notifications: Notification[];
  /**
   * On notification dismiss
   */
  onDismiss?: (id: string) => void;
  /**
   * On notification mark as read
   */
  onMarkAsRead?: (id: string) => void;
  /**
   * On notification action click
   */
  onActionClick?: (id: string) => void;
  /**
   * Max visible notifications
   */
  maxVisible?: number;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type?: NotificationType, icon?: ReactNode) {
  if (icon) return icon;

  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

/**
 * Get priority badge color
 */
function getPriorityColor(priority?: NotificationPriority) {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

/**
 * NotificationCenter Component
 * 
 * Display and manage notifications with categories and priorities
 */
export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  (
    {
      notifications,
      onDismiss,
      onMarkAsRead,
      onActionClick,
      maxVisible = 5,
      className = '',
    },
    ref
  ) => {
    const visibleNotifications = notifications.slice(0, maxVisible);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
      >
        {visibleNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
              onMarkAsRead={onMarkAsRead}
              onActionClick={onActionClick}
            />
          ))
        )}

        {notifications.length > maxVisible && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            +{notifications.length - maxVisible} more notifications
          </div>
        )}
      </div>
    );
  }
);

NotificationCenter.displayName = 'NotificationCenter';

/**
 * NotificationItem Component
 */
export interface NotificationItemProps {
  /**
   * Notification
   */
  notification: Notification;
  /**
   * On dismiss callback
   */
  onDismiss?: (id: string) => void;
  /**
   * On mark as read callback
   */
  onMarkAsRead?: (id: string) => void;
  /**
   * On action click callback
   */
  onActionClick?: (id: string) => void;
}

export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  (
    {
      notification,
      onDismiss,
      onMarkAsRead,
      onActionClick,
    },
    ref
  ) => {
    const typeClasses = {
      'info': 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
      'success': 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
      'warning': 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
      'error': 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'p-4 rounded-lg border',
          typeClasses[notification.type || 'info'],
          'animate-in fade-in slide-in-from-top-2 duration-200'
        )}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 pt-0.5">
            {getNotificationIcon(notification.type, notification.icon)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                )}
              </div>

              {/* Priority badge */}
              {notification.priority && (
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0',
                    getPriorityColor(notification.priority)
                  )}
                >
                  {notification.priority}
                </span>
              )}
            </div>

            {/* Action button */}
            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  onActionClick?.(notification.id);
                }}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                {notification.action.label}
              </button>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {notification.category && (
                <span className="px-2 py-1 bg-muted rounded">
                  {notification.category}
                </span>
              )}
              <span>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead?.(notification.id)}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                title="Mark as read"
              >
                <div className="h-2 w-2 bg-primary rounded-full" />
              </button>
            )}
            <button
              onClick={() => onDismiss?.(notification.id)}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

NotificationItem.displayName = 'NotificationItem';

/**
 * useNotificationCenter Hook
 * 
 * Manage notifications
 */
export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      title: string,
      options?: {
        message?: string;
        type?: NotificationType;
        category?: NotificationCategory;
        priority?: NotificationPriority;
        action?: { label: string; onClick: () => void };
        icon?: ReactNode;
        duration?: number;
      }
    ) => {
      const id = `notif-${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        title,
        message: options?.message,
        type: options?.type || 'info',
        category: options?.category,
        priority: options?.priority,
        timestamp: Date.now(),
        read: false,
        action: options?.action,
        icon: options?.icon,
      };

      setNotifications((prev) => [notification, ...prev]);

      if (options?.duration !== 0) {
        setTimeout(() => {
          removeNotification(id);
        }, options?.duration || 5000);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback(
    (title: string, options?: Omit<Parameters<typeof addNotification>[1], 'type'>) => {
      return addNotification(title, { ...options, type: 'success' });
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, options?: Omit<Parameters<typeof addNotification>[1], 'type'>) => {
      return addNotification(title, { ...options, type: 'error' });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, options?: Omit<Parameters<typeof addNotification>[1], 'type'>) => {
      return addNotification(title, { ...options, type: 'warning' });
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, options?: Omit<Parameters<typeof addNotification>[1], 'type'>) => {
      return addNotification(title, { ...options, type: 'info' });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}
