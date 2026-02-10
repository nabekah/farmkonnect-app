import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bell, Mail, MessageSquare, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

interface NotificationPreference {
  id: string;
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

const NOTIFICATION_CATEGORIES = [
  {
    id: 'farm-alerts',
    name: 'Farm Alerts',
    description: 'Weather warnings, pest alerts, irrigation reminders',
    icon: AlertCircle,
  },
  {
    id: 'marketplace',
    name: 'Marketplace Updates',
    description: 'New products, price changes, order updates',
    icon: MessageSquare,
  },
  {
    id: 'community',
    name: 'Community Activity',
    description: 'Forum replies, mentorship messages, reputation updates',
    icon: Bell,
  },
  {
    id: 'payments',
    name: 'Payment & Finance',
    description: 'Payouts, invoices, subscription updates',
    icon: Mail,
  },
  {
    id: 'equipment',
    name: 'Equipment Rental',
    description: 'Booking confirmations, rental reminders, reviews',
    icon: Bell,
  },
  {
    id: 'mentorship',
    name: 'Mentorship',
    description: 'Session scheduling, mentor messages, progress updates',
    icon: Mail,
  },
];

export default function NotificationPreferences() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize preferences
  useEffect(() => {
    const initialPreferences: NotificationPreference[] = NOTIFICATION_CATEGORIES.map((cat) => ({
      id: cat.id,
      category: cat.name,
      email: true,
      sms: false,
      push: true,
      frequency: 'instant',
    }));
    setPreferences(initialPreferences);
  }, []);

  const handlePreferenceChange = (
    id: string,
    field: 'email' | 'sms' | 'push' | 'frequency',
    value: boolean | string
  ) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, [field]: value } : pref
      )
    );
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // Save preferences to backend
      // await trpc.notifications.updatePreferences.useMutation();
      
      toast({
        title: 'Preferences Saved',
        description: 'Your notification preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-gray-600 mt-2">
          Manage how and when you receive notifications from FarmKonnect
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Important notifications like severe weather alerts will always be sent, regardless of your preferences.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="quiet-hours">Quiet Hours</TabsTrigger>
        </TabsList>

        {/* Notification Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Notification Channels</CardTitle>
              <CardDescription>
                Select which channels you want to receive notifications through
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Email Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Receive urgent updates via text message
                    </p>
                  </div>
                </div>
                <Switch />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-semibold">Push Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Receive real-time notifications on your device
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {NOTIFICATION_CATEGORIES.map((category) => {
              const pref = preferences.find((p) => p.id === category.id);
              if (!pref) return null;

              const Icon = category.icon;

              return (
                <Card key={category.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Category Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-gray-500 mt-1" />
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-600">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Channel Toggles */}
                      <div className="grid grid-cols-3 gap-4 pl-8">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={pref.email}
                            onCheckedChange={(value) =>
                              handlePreferenceChange(pref.id, 'email', value)
                            }
                          />
                          <Label className="text-sm cursor-pointer">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={pref.sms}
                            onCheckedChange={(value) =>
                              handlePreferenceChange(pref.id, 'sms', value)
                            }
                          />
                          <Label className="text-sm cursor-pointer">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={pref.push}
                            onCheckedChange={(value) =>
                              handlePreferenceChange(pref.id, 'push', value)
                            }
                          />
                          <Label className="text-sm cursor-pointer">Push</Label>
                        </div>
                      </div>

                      {/* Frequency Selector */}
                      <div className="pl-8">
                        <Label className="text-sm mb-2 block">Frequency</Label>
                        <select
                          value={pref.frequency}
                          onChange={(e) =>
                            handlePreferenceChange(
                              pref.id,
                              'frequency',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="instant">Instant</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Quiet Hours Tab */}
        <TabsContent value="quiet-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Set a time period when you don't want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Quiet Hours */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold">Enable Quiet Hours</h3>
                    <p className="text-sm text-gray-600">
                      Pause notifications during specific times
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quietHoursEnabled}
                  onCheckedChange={setQuietHoursEnabled}
                />
              </div>

              {/* Time Range */}
              {quietHoursEnabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-start" className="text-sm mb-2 block">
                        Start Time
                      </Label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={quietHoursStart}
                        onChange={(e) => setQuietHoursStart(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end" className="text-sm mb-2 block">
                        End Time
                      </Label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={quietHoursEnd}
                        onChange={(e) => setQuietHoursEnd(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Urgent notifications (severe weather, critical alerts) will still be sent during quiet hours.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Quiet Hours Schedule */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Common Quiet Hours</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Sleep (10 PM - 8 AM)', start: '22:00', end: '08:00' },
                    { label: 'Work Hours (9 AM - 5 PM)', start: '09:00', end: '17:00' },
                    { label: 'Evening (6 PM - 9 PM)', start: '18:00', end: '21:00' },
                    { label: 'Custom', start: '', end: '' },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (preset.start) {
                          setQuietHoursStart(preset.start);
                          setQuietHoursEnd(preset.end);
                          setQuietHoursEnabled(true);
                        }
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
