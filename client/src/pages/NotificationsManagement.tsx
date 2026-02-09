import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Phone, Mail, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationsManagement() {
  const [activeTab, setActiveTab] = useState<'preferences' | 'history' | 'schedules'>('preferences');
  const [notificationPreferences, setNotificationPreferences] = useState({
    breedingReminders: true,
    breedingChannel: 'both',
    vaccinationReminders: true,
    vaccinationChannel: 'both',
    financialAlerts: true,
    financialThreshold: 1000,
    weatherAlerts: true,
    weatherChannel: 'email',
    systemNotifications: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
    phoneNumber: '+233XXXXXXXXX',
    email: 'farmer@example.com'
  });

  const notificationHistory = [
    {
      id: 1,
      title: 'Breeding Reminder',
      message: 'Cow #5 (Bessie) is ready for breeding. Recommended breeding date: 2026-02-15',
      type: 'breeding',
      status: 'sent',
      channels: ['SMS', 'Email'],
      timestamp: '2026-02-09 08:30',
      read: true
    },
    {
      id: 2,
      title: 'Vaccination Due',
      message: 'Goat #12 is due for Foot and Mouth Disease vaccination.',
      type: 'vaccination',
      status: 'sent',
      channels: ['SMS', 'Email'],
      timestamp: '2026-02-08 10:15',
      read: true
    },
    {
      id: 3,
      title: 'Financial Alert',
      message: 'Monthly expenses exceeded GHS 5,000. Review your farm finances.',
      type: 'financial',
      status: 'sent',
      channels: ['Email'],
      timestamp: '2026-02-07 14:45',
      read: true
    },
    {
      id: 4,
      title: 'Weather Alert',
      message: 'Heavy rain expected in your region. Secure livestock shelters.',
      type: 'weather',
      status: 'sent',
      channels: ['SMS', 'Email'],
      timestamp: '2026-02-06 16:20',
      read: false
    },
    {
      id: 5,
      title: 'System Notification',
      message: 'Your farm data has been successfully backed up.',
      type: 'system',
      status: 'sent',
      channels: ['Email'],
      timestamp: '2026-02-05 12:00',
      read: false
    }
  ];

  const scheduledNotifications = [
    {
      id: 1,
      title: 'Daily Breeding Reminders',
      description: 'Check for animals ready for breeding',
      schedule: 'Every day at 8:00 AM',
      status: 'active',
      channels: ['SMS', 'Email']
    },
    {
      id: 2,
      title: 'Weekly Vaccination Reminders',
      description: 'Review vaccination schedules',
      schedule: 'Every Monday at 10:00 AM',
      status: 'active',
      channels: ['SMS', 'Email']
    },
    {
      id: 3,
      title: 'Monthly Financial Report',
      description: 'Receive monthly farm financial summary',
      schedule: '1st of every month at 9:00 AM',
      status: 'active',
      channels: ['Email']
    },
    {
      id: 4,
      title: 'Weekly Weather Forecast',
      description: 'Get weather forecast for your region',
      schedule: 'Every Friday at 7:00 AM',
      status: 'inactive',
      channels: ['Email']
    }
  ];

  const handlePreferenceChange = (key: string, value: any) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breeding':
        return '🐄';
      case 'vaccination':
        return '💉';
      case 'financial':
        return '💰';
      case 'weather':
        return '🌧️';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications Management</h1>
        <p className="text-gray-600 mt-2">Configure notification preferences and view notification history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 font-medium ${activeTab === 'schedules' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Scheduled
        </button>
      </div>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="grid gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your contact details for notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={notificationPreferences.phoneNumber}
                    onChange={(e) => handlePreferenceChange('phoneNumber', e.target.value)}
                    className="flex-1 border rounded-lg p-2 text-sm"
                    placeholder="+233XXXXXXXXX"
                  />
                  <Button size="sm" variant="outline">Verify</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notificationPreferences.email}
                    onChange={(e) => handlePreferenceChange('email', e.target.value)}
                    className="flex-1 border rounded-lg p-2 text-sm"
                    placeholder="farmer@example.com"
                  />
                  <Button size="sm" variant="outline">Verify</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Breeding Reminders */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">Breeding Reminders</h4>
                    <p className="text-sm text-gray-600">Get notified when animals are ready for breeding</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.breedingReminders}
                      onChange={(e) => handlePreferenceChange('breedingReminders', e.target.checked)}
                      className="rounded"
                    />
                  </label>
                </div>
                {notificationPreferences.breedingReminders && (
                  <select
                    value={notificationPreferences.breedingChannel}
                    onChange={(e) => handlePreferenceChange('breedingChannel', e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    <option value="sms">SMS Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">SMS & Email</option>
                  </select>
                )}
              </div>

              {/* Vaccination Reminders */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">Vaccination Reminders</h4>
                    <p className="text-sm text-gray-600">Get notified about upcoming vaccinations</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.vaccinationReminders}
                      onChange={(e) => handlePreferenceChange('vaccinationReminders', e.target.checked)}
                      className="rounded"
                    />
                  </label>
                </div>
                {notificationPreferences.vaccinationReminders && (
                  <select
                    value={notificationPreferences.vaccinationChannel}
                    onChange={(e) => handlePreferenceChange('vaccinationChannel', e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    <option value="sms">SMS Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">SMS & Email</option>
                  </select>
                )}
              </div>

              {/* Financial Alerts */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">Financial Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when expenses exceed threshold</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.financialAlerts}
                      onChange={(e) => handlePreferenceChange('financialAlerts', e.target.checked)}
                      className="rounded"
                    />
                  </label>
                </div>
                {notificationPreferences.financialAlerts && (
                  <input
                    type="number"
                    value={notificationPreferences.financialThreshold}
                    onChange={(e) => handlePreferenceChange('financialThreshold', parseFloat(e.target.value))}
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="Threshold amount (GHS)"
                  />
                )}
              </div>

              {/* Weather Alerts */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">Weather Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified about extreme weather conditions</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.weatherAlerts}
                      onChange={(e) => handlePreferenceChange('weatherAlerts', e.target.checked)}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>Set times when you don't want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    value={notificationPreferences.quietHoursStart}
                    onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    value={notificationPreferences.quietHoursEnd}
                    onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <Button className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {notificationHistory.map((notif) => (
            <Card key={notif.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getTypeIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{notif.title}</h4>
                      <Badge variant={notif.read ? 'outline' : 'default'}>
                        {notif.read ? 'Read' : 'New'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{notif.timestamp}</span>
                      <span>Channels: {notif.channels.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-3">
          {scheduledNotifications.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">{schedule.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{schedule.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.schedule}
                      </span>
                      <span>Channels: {schedule.channels.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                      {schedule.status}
                    </Badge>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full">+ Add New Schedule</Button>
        </div>
      )}
    </div>
  );
}
