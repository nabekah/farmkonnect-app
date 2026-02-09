import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Bell,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Download,
  Settings,
  Sync,
  TrendingUp,
} from "lucide-react";

/**
 * Mobile App Integration Component
 * Manages mobile app features including push notifications, offline sync, and mobile-optimized views
 */
export const MobileAppIntegration: React.FC = () => {
  const [viewMode, setViewMode] = useState<"overview" | "devices" | "offline" | "preferences" | "analytics">("overview");
  const [isOnline, setIsOnline] = useState(true);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Mock devices data
  const devices = [
    {
      id: 1,
      name: "John's iPhone 14",
      platform: "ios",
      appVersion: "2.1.0",
      osVersion: "17.2",
      lastSync: new Date(Date.now() - 3600000),
      status: "active",
      pushEnabled: true,
    },
    {
      id: 2,
      name: "Farm Tablet",
      platform: "android",
      appVersion: "2.0.9",
      osVersion: "13",
      lastSync: new Date(Date.now() - 7200000),
      status: "active",
      pushEnabled: true,
    },
    {
      id: 3,
      name: "Sarah's Android Phone",
      platform: "android",
      appVersion: "1.9.5",
      osVersion: "12",
      lastSync: new Date(Date.now() - 86400000),
      status: "inactive",
      pushEnabled: false,
    },
  ];

  // Mock offline sync data
  const offlineData = {
    workers: 8,
    equipment: 12,
    tasks: 15,
    alerts: 5,
    totalSize: "2.5 MB",
    estimatedSyncTime: "2-3 seconds",
    lastSync: new Date(Date.now() - 1800000),
  };

  // Mock push preferences
  const pushPreferences = {
    maintenanceAlerts: true,
    performanceAlerts: true,
    complianceAlerts: true,
    salesNotifications: true,
    weatherAlerts: true,
    dailyDigest: true,
    digestTime: "08:00",
    quietHours: {
      enabled: true,
      startTime: "22:00",
      endTime: "08:00",
    },
  };

  // Mock mobile dashboard data
  const mobileDashboard = {
    farmName: "Green Valley Farm",
    totalWorkers: 8,
    equipmentStatus: "12 operational, 1 maintenance due",
    productivityToday: 92,
    complianceRate: 87.5,
    alertsCount: 3,
    tasksCount: 12,
  };

  // Mock app analytics
  const appAnalytics = {
    appOpens: 45,
    averageSessionDuration: 8.5,
    tasksCompleted: 12,
    alertsViewed: 23,
    offlineSyncs: 5,
    crashesReported: 0,
    topFeatures: [
      { feature: "Alerts", usage: 35 },
      { feature: "Tasks", usage: 28 },
      { feature: "Equipment Status", usage: 22 },
      { feature: "Worker Performance", usage: 15 },
    ],
  };

  const getPlatformIcon = (platform: string) => {
    return platform === "ios" ? "📱 iOS" : "🤖 Android";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mobile App Integration</h1>
            <p className="text-gray-600 mt-1">Manage mobile devices, offline sync, and push notifications</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("overview")}
            variant={viewMode === "overview" ? "default" : "outline"}
            className={viewMode === "overview" ? "bg-blue-600 text-white" : ""}
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode("devices")}
            variant={viewMode === "devices" ? "default" : "outline"}
            className={viewMode === "devices" ? "bg-blue-600 text-white" : ""}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Devices
          </Button>
          <Button
            onClick={() => setViewMode("offline")}
            variant={viewMode === "offline" ? "default" : "outline"}
            className={viewMode === "offline" ? "bg-blue-600 text-white" : ""}
          >
            <Sync className="w-4 h-4 mr-2" />
            Offline Sync
          </Button>
          <Button
            onClick={() => setViewMode("preferences")}
            variant={viewMode === "preferences" ? "default" : "outline"}
            className={viewMode === "preferences" ? "bg-blue-600 text-white" : ""}
          >
            <Bell className="w-4 h-4 mr-2" />
            Preferences
          </Button>
          <Button
            onClick={() => setViewMode("analytics")}
            variant={viewMode === "analytics" ? "default" : "outline"}
            className={viewMode === "analytics" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Overview View */}
        {viewMode === "overview" && (
          <>
            {/* Mobile Dashboard Summary */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mobile Dashboard Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">Farm Name</p>
                  <p className="text-xl font-bold text-gray-900">{mobileDashboard.farmName}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">Productivity Today</p>
                  <p className="text-xl font-bold text-green-600">{mobileDashboard.productivityToday}%</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">Active Alerts</p>
                  <p className="text-xl font-bold text-red-600">{mobileDashboard.alertsCount}</p>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Workers</p>
                    <p className="text-3xl font-bold text-gray-900">{mobileDashboard.totalWorkers}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Equipment Status</p>
                    <p className="text-sm font-bold text-gray-900">12 operational</p>
                  </div>
                  <Zap className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Compliance Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{mobileDashboard.complianceRate}%</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">{mobileDashboard.tasksCount}</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Devices View */}
        {viewMode === "devices" && (
          <>
            <div className="mb-6">
              <Button onClick={() => setShowDeviceModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Smartphone className="w-4 h-4 mr-2" />
                Register New Device
              </Button>
            </div>

            <div className="space-y-4">
              {devices.map((device) => (
                <Card key={device.id} className={`p-6 border-l-4 ${getStatusColor(device.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{device.name}</h3>
                        <span className="text-xs font-medium">{getPlatformIcon(device.platform)}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">App Version</p>
                          <p className="font-semibold">{device.appVersion}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">OS Version</p>
                          <p className="font-semibold">{device.osVersion}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Sync</p>
                          <p className="font-semibold">{device.lastSync.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Push Enabled</p>
                          <p className="font-semibold">{device.pushEnabled ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Offline Sync View */}
        {viewMode === "offline" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Offline Sync Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">Workers</p>
                <p className="text-2xl font-bold text-gray-900">{offlineData.workers}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{offlineData.equipment}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{offlineData.tasks}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{offlineData.alerts}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Total Data Size:</strong> {offlineData.totalSize}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Estimated Sync Time:</strong> {offlineData.estimatedSyncTime}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Last Sync:</strong> {offlineData.lastSync.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download Offline Data
              </Button>
              <Button variant="outline">
                <Sync className="w-4 h-4 mr-2" />
                Force Sync
              </Button>
              <Button variant="outline" className="text-red-600 border-red-300">
                Clear Cache
              </Button>
            </div>
          </Card>
        )}

        {/* Preferences View */}
        {viewMode === "preferences" && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Push Notification Preferences</h2>
              <Button onClick={() => setShowPreferencesModal(true)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Maintenance Alerts</p>
                  <p className="text-sm text-gray-600">Get notified about equipment maintenance</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushPreferences.maintenanceAlerts}
                  readOnly
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Performance Alerts</p>
                  <p className="text-sm text-gray-600">Get notified about worker productivity</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushPreferences.performanceAlerts}
                  readOnly
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Compliance Alerts</p>
                  <p className="text-sm text-gray-600">Get notified about certification compliance</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushPreferences.complianceAlerts}
                  readOnly
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Sales Notifications</p>
                  <p className="text-sm text-gray-600">Get notified about marketplace sales</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushPreferences.salesNotifications}
                  readOnly
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Daily Digest</p>
                  <p className="text-sm text-gray-600">Receive daily summary at {pushPreferences.digestTime}</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushPreferences.dailyDigest}
                  readOnly
                  className="w-5 h-5"
                />
              </div>

              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="font-semibold text-gray-900 mb-2">Quiet Hours</p>
                <p className="text-sm text-gray-600">
                  {pushPreferences.quietHours.enabled
                    ? `Notifications muted from ${pushPreferences.quietHours.startTime} to ${pushPreferences.quietHours.endTime}`
                    : "Quiet hours disabled"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">App Opens (This Week)</p>
                <p className="text-3xl font-bold text-gray-900">{appAnalytics.appOpens}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Avg Session Duration</p>
                <p className="text-3xl font-bold text-gray-900">{appAnalytics.averageSessionDuration}m</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Crashes Reported</p>
                <p className="text-3xl font-bold text-green-600">{appAnalytics.crashesReported}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">User Actions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tasks Completed</span>
                    <span className="font-bold text-gray-900">{appAnalytics.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Alerts Viewed</span>
                    <span className="font-bold text-gray-900">{appAnalytics.alertsViewed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Offline Syncs</span>
                    <span className="font-bold text-gray-900">{appAnalytics.offlineSyncs}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Features</h3>
                <div className="space-y-3">
                  {appAnalytics.topFeatures.map((feature, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700">{feature.feature}</span>
                        <span className="font-bold text-gray-900">{feature.usage}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(feature.usage / 35) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Device Registration Modal */}
        {showDeviceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Device</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
                    <input
                      type="text"
                      placeholder="e.g., John's iPhone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>iOS</option>
                      <option>Android</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setShowDeviceModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeviceModal(false);
                        alert("Device registered successfully!");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Register
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAppIntegration;
