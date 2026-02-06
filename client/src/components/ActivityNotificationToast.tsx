import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface ActivityNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ActivityNotificationToastProps {
  notification: ActivityNotification;
  onDismiss: (id: string) => void;
}

/**
 * Individual toast notification component
 */
export function ActivityNotificationToast({
  notification,
  onDismiss,
}: ActivityNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300); // Allow fade-out animation
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      default:
        return 'text-blue-900';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border rounded-lg p-4 shadow-lg ${getBgColor()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${getTextColor()}`}>
              {notification.title}
            </h3>
            <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
              {notification.message}
            </p>
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className={`text-sm font-medium mt-2 underline hover:no-underline ${getTextColor()}`}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(notification.id), 300);
            }}
            className={`flex-shrink-0 ${getTextColor()} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast container for managing multiple notifications
 */
interface ActivityNotificationContainerProps {
  notifications: ActivityNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ActivityNotificationContainer({
  notifications,
  onDismiss,
  position = 'top-right',
}: ActivityNotificationContainerProps) {
  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClass()} z-50 space-y-2 pointer-events-none`}>
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ActivityNotificationToast
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}
