import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Archive,
  Bell,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  channel: 'email' | 'sms' | 'push';
  timestamp: Date;
  read: boolean;
  category: string;
}

interface NotificationHistoryProps {
  notifications?: Notification[];
  maxItems?: number;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Severe Weather Alert',
    message: 'Heavy rainfall expected in your area tomorrow. Consider postponing outdoor activities.',
    type: 'critical',
    channel: 'push',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    category: 'farm-alerts',
  },
  {
    id: '2',
    title: 'New Marketplace Listing',
    message: 'Premium fertilizer now available at ₦5,000/bag. Limited stock!',
    type: 'info',
    channel: 'email',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    category: 'marketplace',
  },
  {
    id: '3',
    title: 'Mentorship Session Reminder',
    message: 'Your session with Adekunle starts in 1 hour. Join the video call now.',
    type: 'warning',
    channel: 'push',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
    category: 'mentorship',
  },
  {
    id: '4',
    title: 'Equipment Rental Confirmed',
    message: 'Your tractor rental for Feb 15-17 is confirmed. Pickup at 8 AM.',
    type: 'info',
    channel: 'sms',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    category: 'equipment',
  },
  {
    id: '5',
    title: 'Payout Processed',
    message: 'Your marketplace earnings (₦45,000) have been transferred to your account.',
    type: 'info',
    channel: 'email',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    category: 'payments',
  },
];

export default function NotificationHistory({
  notifications = MOCK_NOTIFICATIONS,
  maxItems = 10,
}: NotificationHistoryProps) {
  const [displayedNotifications, setDisplayedNotifications] = useState(
    notifications.slice(0, maxItems)
  );
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === displayedNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(displayedNotifications.map((n) => n.id));
    }
  };

  const handleDelete = (id: string) => {
    setDisplayedNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleArchive = (id: string) => {
    setDisplayedNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = displayedNotifications.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
            </CardDescription>
          </div>
          <Badge variant="outline">{displayedNotifications.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        {displayedNotifications.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedNotifications.length === displayedNotifications.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedNotifications.length > 0
                  ? `${selectedNotifications.length} selected`
                  : 'Select all'}
              </span>
            </div>
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDisplayedNotifications((prev) =>
                      prev.filter((n) => !selectedNotifications.includes(n.id))
                    );
                    setSelectedNotifications([]);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDisplayedNotifications((prev) =>
                      prev.filter((n) => !selectedNotifications.includes(n.id))
                    );
                    setSelectedNotifications([]);
                  }}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-colors ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="rounded mt-1"
                  />

                  {/* Type Icon */}
                  <div className="flex-shrink-0">{getTypeIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {notification.category}
                      </Badge>
                      <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getChannelIcon(notification.channel)}
                        {notification.channel}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchive(notification.id)}
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {notifications.length > maxItems && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setDisplayedNotifications(notifications);
            }}
          >
            Load More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
