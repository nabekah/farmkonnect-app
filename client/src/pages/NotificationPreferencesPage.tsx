import React, { useState, useEffect } from 'react';
import { useAuth } from '../_core/hooks/useAuth';
import { trpc } from '../lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bell, Mail, MessageSquare, Clock, Globe } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationPreferences {
  breedingReminders: boolean;
  stockAlerts: boolean;
  weatherAlerts: boolean;
  vaccinationReminders: boolean;
  harvestReminders: boolean;
  marketplaceUpdates: boolean;
  iotSensorAlerts: boolean;
  trainingReminders: boolean;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Australia/Sydney',
  'Australia/Melbourne',
];

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: preferencesData, isLoading } = trpc.pushNotifications.getPreferences.useQuery();
  const updatePreferencesMutation = trpc.pushNotifications.updatePreferences.useMutation();

  useEffect(() => {
    if (preferencesData?.preferences) {
      setPreferences(preferencesData.preferences);
    }
  }, [preferencesData]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleInputChange = (key: keyof NotificationPreferences, value: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updatePreferencesMutation.mutateAsync(preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !preferences) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
          <p className="text-gray-600">Manage how and when you receive notifications from FarmKonnect</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your notification preferences have been saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notification Types</TabsTrigger>
            <TabsTrigger value="channels">Delivery Channels</TabsTrigger>
            <TabsTrigger value="schedule">Schedule & Timezone</TabsTrigger>
          </TabsList>

          {/* Notification Types Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>Choose which notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Breeding Reminders */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Breeding Reminders</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified when animals are due for breeding</p>
                  </div>
                  <Switch
                    checked={preferences.breedingReminders}
                    onCheckedChange={() => handleToggle('breedingReminders')}
                  />
                </div>

                {/* Stock Alerts */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Stock Alerts</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified when inventory levels are low</p>
                  </div>
                  <Switch
                    checked={preferences.stockAlerts}
                    onCheckedChange={() => handleToggle('stockAlerts')}
                  />
                </div>

                {/* Weather Alerts */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Weather Alerts</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified about extreme weather conditions</p>
                  </div>
                  <Switch
                    checked={preferences.weatherAlerts}
                    onCheckedChange={() => handleToggle('weatherAlerts')}
                  />
                </div>

                {/* Vaccination Reminders */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Vaccination Reminders</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified when animals need vaccinations</p>
                  </div>
                  <Switch
                    checked={preferences.vaccinationReminders}
                    onCheckedChange={() => handleToggle('vaccinationReminders')}
                  />
                </div>

                {/* Harvest Reminders */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Harvest Reminders</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified when crops are ready for harvest</p>
                  </div>
                  <Switch
                    checked={preferences.harvestReminders}
                    onCheckedChange={() => handleToggle('harvestReminders')}
                  />
                </div>

                {/* Marketplace Updates */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Marketplace Updates</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified about orders and marketplace activities</p>
                  </div>
                  <Switch
                    checked={preferences.marketplaceUpdates}
                    onCheckedChange={() => handleToggle('marketplaceUpdates')}
                  />
                </div>

                {/* IoT Sensor Alerts */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">IoT Sensor Alerts</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified about sensor anomalies and alerts</p>
                  </div>
                  <Switch
                    checked={preferences.iotSensorAlerts}
                    onCheckedChange={() => handleToggle('iotSensorAlerts')}
                  />
                </div>

                {/* Training Reminders */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">Training Reminders</Label>
                    <p className="text-sm text-gray-600 mt-1">Get notified about upcoming training sessions</p>
                  </div>
                  <Switch
                    checked={preferences.trainingReminders}
                    onCheckedChange={() => handleToggle('trainingReminders')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Channels Tab */}
          <TabsContent value="channels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Channels</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <Label className="text-base font-semibold cursor-pointer">Push Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Receive notifications in your browser</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotificationsEnabled}
                    onCheckedChange={() => handleToggle('pushNotificationsEnabled')}
                  />
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-600" />
                      <Label className="text-base font-semibold cursor-pointer">Email Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotificationsEnabled}
                    onCheckedChange={() => handleToggle('emailNotificationsEnabled')}
                  />
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <Label className="text-base font-semibold cursor-pointer">SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Receive notifications via text message</p>
                  </div>
                  <Switch
                    checked={preferences.smsNotificationsEnabled}
                    onCheckedChange={() => handleToggle('smsNotificationsEnabled')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule & Timezone Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Timezone</CardTitle>
                <CardDescription>Set quiet hours and your timezone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timezone */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Timezone
                  </Label>
                  <Select value={preferences.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quiet Hours */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                      <Clock className="w-4 h-4" />
                      Quiet Hours
                    </Label>
                    <Switch
                      checked={preferences.quietHoursEnabled}
                      onCheckedChange={() => handleToggle('quietHoursEnabled')}
                    />
                  </div>

                  {preferences.quietHoursEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quietStart">Start Time</Label>
                          <Input
                            id="quietStart"
                            type="time"
                            value={preferences.quietHoursStart || '22:00'}
                            onChange={(e) => handleInputChange('quietHoursStart', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quietEnd">End Time</Label>
                          <Input
                            id="quietEnd"
                            type="time"
                            value={preferences.quietHoursEnd || '08:00'}
                            onChange={(e) => handleInputChange('quietHoursEnd', e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Notifications will not be sent between {preferences.quietHoursStart || '22:00'} and{' '}
                        {preferences.quietHoursEnd || '08:00'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
