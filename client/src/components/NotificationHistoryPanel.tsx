import { useNotificationHistory } from '@/contexts/NotificationHistoryContext';
import { Bell, Trash2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

/**
 * Notification History Panel Component
 * Displays historical notifications in a side panel
 */
export function NotificationHistoryPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearHistory } = useNotificationHistory();
  const [open, setOpen] = useState(false);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-l-4 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500 text-green-900';
      case 'info':
      default:
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'alert':
        return 'Alert';
      case 'warning':
        return 'Warning';
      case 'success':
        return 'Success';
      case 'info':
      default:
        return 'Info';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          title="Notification history"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 mb-4">
          <SheetTitle>Notifications</SheetTitle>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                title="Mark all as read"
                className="h-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearHistory}
                title="Clear history"
                className="h-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${getTypeStyles(notification.type)} ${
                  !notification.read ? 'opacity-100 font-medium' : 'opacity-75'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase">
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-current rounded-full" />
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mt-1">{notification.title}</h4>
                    <p className="text-xs opacity-90 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
