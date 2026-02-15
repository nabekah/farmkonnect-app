import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Bell, Clock, Send, CheckCircle } from 'lucide-react'

/**
 * Notification Preferences Page
 * Allows users to customize notification settings
 */

interface NotificationPreferences {
  shiftNotifications: boolean
  taskNotifications: boolean
  approvalNotifications: boolean
  alertNotifications: boolean
  complianceNotifications: boolean
  deliveryMethods: string[]
  notificationFrequency: string
  quietHours?: {
    enabled: boolean
    startTime?: string
    endTime?: string
  }
}

export const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    shiftNotifications: true,
    taskNotifications: true,
    approvalNotifications: true,
    alertNotifications: true,
    complianceNotifications: true,
    deliveryMethods: ['push', 'in_app'],
    notificationFrequency: 'immediate',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  /**
   * Handle notification type toggle
   */
  const handleToggleNotificationType = (type: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
    setSaved(false)
  }

  /**
   * Handle delivery method toggle
   */
  const handleToggleDeliveryMethod = (method: string) => {
    setPreferences((prev) => {
      const methods = prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter((m) => m !== method)
        : [...prev.deliveryMethods, method]
      return { ...prev, deliveryMethods: methods }
    })
    setSaved(false)
  }

  /**
   * Handle frequency change
   */
  const handleFrequencyChange = (frequency: string) => {
    setPreferences((prev) => ({
      ...prev,
      notificationFrequency: frequency,
    }))
    setSaved(false)
  }

  /**
   * Handle quiet hours toggle
   */
  const handleToggleQuietHours = () => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours?.enabled,
      },
    }))
    setSaved(false)
  }

  /**
   * Handle quiet hours time change
   */
  const handleQuietHoursTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value,
      },
    }))
    setSaved(false)
  }

  /**
   * Save preferences
   */
  const handleSavePreferences = async () => {
    try {
      setLoading(true)
      // In production, would call tRPC mutation
      // await trpc.notificationPreferences.updatePreferences.useMutation(preferences)
      console.log('Saving preferences:', preferences)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset to defaults
   */
  const handleResetDefaults = async () => {
    try {
      setLoading(true)
      setPreferences({
        shiftNotifications: true,
        taskNotifications: true,
        approvalNotifications: true,
        alertNotifications: true,
        complianceNotifications: true,
        deliveryMethods: ['push', 'in_app'],
        notificationFrequency: 'immediate',
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error resetting preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground">Customize how and when you receive notifications</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">Preferences saved successfully</span>
        </div>
      )}

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Shift Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Shift Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Get notified when shifts are assigned or changed</p>
                </div>
                <Switch
                  checked={preferences.shiftNotifications}
                  onCheckedChange={() => handleToggleNotificationType('shiftNotifications')}
                />
              </div>

              {/* Task Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Task Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Get notified when tasks are assigned or updated</p>
                </div>
                <Switch
                  checked={preferences.taskNotifications}
                  onCheckedChange={() => handleToggleNotificationType('taskNotifications')}
                />
              </div>

              {/* Approval Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Approval Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Get notified about time-off and leave approvals</p>
                </div>
                <Switch
                  checked={preferences.approvalNotifications}
                  onCheckedChange={() => handleToggleNotificationType('approvalNotifications')}
                />
              </div>

              {/* Alert Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Alert Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Get notified about system alerts and updates</p>
                </div>
                <Switch
                  checked={preferences.alertNotifications}
                  onCheckedChange={() => handleToggleNotificationType('alertNotifications')}
                />
              </div>

              {/* Compliance Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Compliance Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Get notified about compliance and safety alerts</p>
                </div>
                <Switch
                  checked={preferences.complianceNotifications}
                  onCheckedChange={() => handleToggleNotificationType('complianceNotifications')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Methods</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Receive notifications on your device</p>
                </div>
                <Switch
                  checked={preferences.deliveryMethods.includes('push')}
                  onCheckedChange={() => handleToggleDeliveryMethod('push')}
                />
              </div>

              {/* In-App Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">See notifications in the app notification center</p>
                </div>
                <Switch
                  checked={preferences.deliveryMethods.includes('in_app')}
                  onCheckedChange={() => handleToggleDeliveryMethod('in_app')}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Receive notifications via SMS text message</p>
                </div>
                <Switch
                  checked={preferences.deliveryMethods.includes('sms')}
                  onCheckedChange={() => handleToggleDeliveryMethod('sms')}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Receive notifications via email</p>
                </div>
                <Switch
                  checked={preferences.deliveryMethods.includes('email')}
                  onCheckedChange={() => handleToggleDeliveryMethod('email')}
                />
              </div>

              {/* Notification Frequency */}
              <div className="mt-6 pt-6 border-t">
                <Label className="text-base font-semibold block mb-4">Notification Frequency</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['immediate', 'hourly', 'daily', 'weekly'].map((freq) => (
                    <Button
                      key={freq}
                      variant={preferences.notificationFrequency === freq ? 'default' : 'outline'}
                      onClick={() => handleFrequencyChange(freq)}
                      className="capitalize"
                    >
                      {freq}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>Set a time period when you don't want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex-1">
                  <Label className="text-base font-semibold cursor-pointer">Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground mt-1">Pause notifications during specific times</p>
                </div>
                <Switch
                  checked={preferences.quietHours?.enabled || false}
                  onCheckedChange={handleToggleQuietHours}
                />
              </div>

              {preferences.quietHours?.enabled && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime" className="text-sm font-medium">
                        Start Time
                      </Label>
                      <input
                        id="startTime"
                        type="time"
                        value={preferences.quietHours?.startTime || '22:00'}
                        onChange={(e) => handleQuietHoursTimeChange('startTime', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="text-sm font-medium">
                        End Time
                      </Label>
                      <input
                        id="endTime"
                        type="time"
                        value={preferences.quietHours?.endTime || '08:00'}
                        onChange={(e) => handleQuietHoursTimeChange('endTime', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Notifications will be paused from {preferences.quietHours?.startTime} to {preferences.quietHours?.endTime}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Critical compliance and safety alerts will still be delivered during quiet hours to ensure your safety and compliance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleResetDefaults}
          disabled={loading}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className="gap-2"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
