import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Settings, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export default function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'bookings' | 'mentorship' | 'marketplace' | 'payments'>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Fetch notifications
  const { data: notificationsData, refetch } = trpc.notificationCenter.getNotifications.useQuery({
    filter: filter !== 'all' ? filter : undefined,
    limit: 50,
  });

  // Fetch preferences
  const { data: preferencesData } = trpc.notificationCenter.getNotificationPreferences.useQuery();

  // Mutations
  const markAsReadMutation = trpc.notificationCenter.markAsRead.useMutation();
  const deleteNotificationMutation = trpc.notificationCenter.deleteNotification.useMutation();
  const markAllAsReadMutation = trpc.notificationCenter.markAllAsRead.useMutation();
  const updatePreferencesMutation = trpc.notificationCenter.updateNotificationPreferences.useMutation();

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsReadMutation.mutateAsync({ notificationId });
    refetch();
  };

  const handleDelete = async (notificationId: number) => {
    await deleteNotificationMutation.mutateAsync({ notificationId });
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
    refetch();
  };

  const handleUpdatePreference = async (channel: 'email' | 'sms' | 'push', type: string, enabled: boolean) => {
    await updatePreferencesMutation.mutateAsync({
      channel,
      notificationType: type,
      enabled,
    });
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      booking_confirmation: '✓',
      mentorship_request: '👥',
      payment_received: '💰',
      product_sold: '🛒',
      equipment_available: '🔔',
    };
    return icons[type] || '📬';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-50 border-red-200',
      medium: 'bg-yellow-50 border-yellow-200',
      low: 'bg-blue-50 border-blue-200',
    };
    return colors[priority] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {notificationsData?.unreadCount || 0} unread notifications
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: 'all', label: 'All Notifications' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'bookings', label: 'Bookings' },
                  { id: 'mentorship', label: 'Mentorship' },
                  { id: 'marketplace', label: 'Marketplace' },
                  { id: 'payments', label: 'Payments' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === item.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Total This Week</p>
                    <p className="text-2xl font-bold text-gray-900">28</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {notificationsData?.notifications.length || 0} notifications
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </Button>
            </div>

            {/* Notifications List */}
            {notificationsData?.notifications && notificationsData.notifications.length > 0 ? (
              <div className="space-y-3">
                {notificationsData.notifications.map((notification: any) => (
                  <Card
                    key={notification.id}
                    className={`border-l-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50 border-l-blue-500' : 'border-l-gray-200'
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              {notification.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferencesData?.preferences && (
                <>
                  {/* Channel Settings */}
                  {Object.entries(preferencesData.preferences).map(([channel, settings]: any) => {
                    if (channel === 'frequency') return null;
                    
                    return (
                      <div key={channel}>
                        <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                          {channel} Notifications
                        </h3>
                        <div className="space-y-2 ml-4">
                          {Object.entries(settings).map(([type, enabled]: any) => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) =>
                                  handleUpdatePreference(
                                    channel as any,
                                    type,
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {type.replace(/_/g, ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Quiet Hours */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Quiet Hours</h3>
                    <label className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={preferencesData.preferences.frequency?.quietHours?.enabled}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">Enable quiet hours</span>
                    </label>
                    {preferencesData.preferences.frequency?.quietHours?.enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-7">
                        <div>
                          <label className="text-sm text-gray-600">Start Time</label>
                          <input
                            type="time"
                            defaultValue={preferencesData.preferences.frequency.quietHours.startTime}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">End Time</label>
                          <input
                            type="time"
                            defaultValue={preferencesData.preferences.frequency.quietHours.endTime}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-6">Save Preferences</Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
