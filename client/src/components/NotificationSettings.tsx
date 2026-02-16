import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { pushNotificationService, NotificationPreferences } from '@/lib/pushNotifications'
import { Bell, Volume2, Vibrate, Clock } from 'lucide-react'

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    pushNotificationService.getPreferences()
  )
  const [notificationHistory, setNotificationHistory] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initNotifications = async () => {
      const success = await pushNotificationService.initialize()
      setIsInitialized(success)
      setNotificationHistory(pushNotificationService.getNotificationHistory())
    }

    initNotifications()
  }, [])

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    pushNotificationService.setPreferences({ [key]: value })
  }

  const handleTestNotification = async () => {
    await pushNotificationService.notifyTaskAssignment(1, 'Test Task', 'Test Worker')
    setNotificationHistory(pushNotificationService.getNotificationHistory())
  }

  const handleRequestPermission = async () => {
    const granted = await pushNotificationService.requestPermission()
    if (granted) {
      setPreferences({ ...preferences, enabled: true })
      pushNotificationService.setPreferences({ enabled: true })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Manage how you receive task notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Status */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Notification Status</h3>
                <p className="text-sm text-slate-600">
                  {isInitialized ? 'Notifications are ready' : 'Initializing notifications...'}
                </p>
              </div>
              <Badge className={isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {isInitialized ? 'Ready' : 'Loading'}
              </Badge>
            </div>
          </div>

          {/* Enable/Disable Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Enable Notifications</h3>
                <p className="text-sm text-slate-600">Receive push notifications on this device</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => handlePreferenceChange('enabled', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-slate-900">Notification Types</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Task Assignments</p>
                <p className="text-sm text-slate-600">Get notified when tasks are assigned</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.taskAssignments}
                onChange={(e) => handlePreferenceChange('taskAssignments', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Task Updates</p>
                <p className="text-sm text-slate-600">Get notified when tasks are updated</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.taskUpdates}
                onChange={(e) => handlePreferenceChange('taskUpdates', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Task Reminders</p>
                <p className="text-sm text-slate-600">Get reminded about upcoming tasks</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.taskReminders}
                onChange={(e) => handlePreferenceChange('taskReminders', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
            </div>
          </div>

          {/* Sound & Vibration */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-slate-900">Sound & Vibration</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Sound</p>
                  <p className="text-sm text-slate-600">Play sound for notifications</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Vibration</p>
                  <p className="text-sm text-slate-600">Vibrate for notifications</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.vibrationEnabled}
                onChange={(e) => handlePreferenceChange('vibrationEnabled', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Quiet Hours</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Start Time</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart || '22:00'}
                  onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">End Time</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd || '08:00'}
                  onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
            </div>
            <p className="text-sm text-slate-600">No notifications will be sent during these hours</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleTestNotification} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Send Test Notification
            </Button>
            <Button onClick={handleRequestPermission} variant="outline" className="flex-1">
              Request Permission
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      {notificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notificationHistory.map((notification, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-900 text-sm">{notification.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{notification.body}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(notification.id).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
