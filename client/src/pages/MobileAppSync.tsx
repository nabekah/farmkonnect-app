import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Wifi,
  WifiOff,
  Zap,
  Activity,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * Mobile App Sync Component
 * Mobile app integration with offline-first sync and push notifications
 */
export const MobileAppSync: React.FC = () => {
  const [viewMode, setViewMode] = useState<"dashboard" | "tasks" | "notifications" | "devices" | "settings">(
    "dashboard"
  );
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("idle");

  // Mock mobile devices
  const devices = [
    {
      id: 1,
      name: "iPhone 14 Pro",
      type: "ios",
      osVersion: "17.2",
      appVersion: "2.1.0",
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      status: "active",
      battery: 85,
      storage: "2.3 GB",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      type: "android",
      osVersion: "14.0",
      appVersion: "2.1.0",
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      status: "active",
      battery: 62,
      storage: "1.8 GB",
    },
    {
      id: 3,
      name: "iPad Air",
      type: "ios",
      osVersion: "17.1",
      appVersion: "2.0.5",
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "inactive",
      battery: 45,
      storage: "3.1 GB",
    },
  ];

  // Mock tasks
  const tasks = [
    {
      id: 1,
      title: "Water Field A",
      description: "Irrigate Field A for 30 minutes",
      status: "pending",
      priority: "high",
      dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      assignedTo: "John Doe",
      location: "Field A",
    },
    {
      id: 2,
      title: "Check Soil pH",
      description: "Test soil pH in Field B",
      status: "pending",
      priority: "medium",
      dueTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      assignedTo: "Jane Smith",
      location: "Field B",
    },
    {
      id: 3,
      title: "Harvest Tomatoes",
      description: "Pick ripe tomatoes from greenhouse",
      status: "in_progress",
      priority: "high",
      dueTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
      assignedTo: "John Doe",
      location: "Greenhouse",
    },
  ];

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Soil Moisture Low",
      message: "Soil moisture in Field A is below threshold",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
    {
      id: 2,
      type: "task",
      title: "Task Assigned",
      message: "You have been assigned a new task",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: 3,
      type: "revenue",
      title: "Sale Recorded",
      message: "New sale: 50 units of Tomatoes for GH₵2,250",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "in_progress":
        return <Activity className="w-5 h-5 text-blue-600" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "task":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "revenue":
        return <Zap className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mobile App Management</h1>
            <p className="text-gray-600 mt-1">Offline-first sync, push notifications, and mobile analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {isOnline ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <Wifi className="w-5 h-5" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                <WifiOff className="w-5 h-5" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("dashboard")}
            variant={viewMode === "dashboard" ? "default" : "outline"}
            className={viewMode === "dashboard" ? "bg-blue-600 text-white" : ""}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setViewMode("tasks")}
            variant={viewMode === "tasks" ? "default" : "outline"}
            className={viewMode === "tasks" ? "bg-blue-600 text-white" : ""}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Tasks
          </Button>
          <Button
            onClick={() => setViewMode("notifications")}
            variant={viewMode === "notifications" ? "default" : "outline"}
            className={viewMode === "notifications" ? "bg-blue-600 text-white" : ""}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
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
            onClick={() => setViewMode("settings")}
            variant={viewMode === "settings" ? "default" : "outline"}
            className={viewMode === "settings" ? "bg-blue-600 text-white" : ""}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Devices</p>
                    <p className="text-3xl font-bold text-gray-900">2</p>
                  </div>
                  <Smartphone className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">5</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-yellow-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Unread Notifications</p>
                    <p className="text-3xl font-bold text-gray-900">2</p>
                  </div>
                  <Bell className="w-10 h-10 text-red-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Sync Status</p>
                    <p className="text-lg font-bold text-green-600">Synced</p>
                  </div>
                  <Zap className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Sync Control */}
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Data Synchronization</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Last sync: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  onClick={() => setSyncStatus("syncing")}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={syncStatus === "syncing"}
                >
                  {syncStatus === "syncing" ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Tasks View */}
        {viewMode === "tasks" && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className={`p-6 border-l-4 ${getPriorityColor(task.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-bold text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-gray-600 text-xs">Assigned To</p>
                    <p className="font-semibold text-gray-900">{task.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Location</p>
                    <p className="font-semibold text-gray-900">{task.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{task.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Due Time</p>
                    <p className="font-semibold text-gray-900">{task.dueTime.toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Start Task
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Notifications View */}
        {viewMode === "notifications" && (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-6 border-l-4 ${notif.read ? "bg-gray-50 border-gray-300" : "bg-blue-50 border-blue-300"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notif.type)}
                    <div>
                      <p className="font-bold text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {!notif.read && (
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Devices View */}
        {viewMode === "devices" && (
          <div className="space-y-4">
            {devices.map((device) => (
              <Card key={device.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-8 h-8 text-blue-600 mt-1" />
                    <div>
                      <p className="font-bold text-gray-900">{device.name}</p>
                      <p className="text-sm text-gray-600">
                        {device.type.toUpperCase()} • {device.osVersion}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      device.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">App Version</p>
                    <p className="font-semibold text-gray-900">{device.appVersion}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Battery</p>
                    <p className="font-semibold text-gray-900">{device.battery}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Storage</p>
                    <p className="font-semibold text-gray-900">{device.storage}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Last Sync</p>
                    <p className="font-semibold text-gray-900">
                      {Math.floor((Date.now() - device.lastSync.getTime()) / 60000)} min ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Force Sync
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Analytics
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Settings View */}
        {viewMode === "settings" && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Push Notifications</h2>
              <div className="space-y-4">
                {[
                  { label: "Alerts", enabled: true },
                  { label: "Tasks", enabled: true },
                  { label: "Messages", enabled: true },
                  { label: "Promotions", enabled: false },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">{setting.label}</p>
                    <input
                      type="checkbox"
                      defaultChecked={setting.enabled}
                      className="w-5 h-5 rounded"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sound & Vibration</h2>
              <div className="space-y-4">
                {[
                  { label: "Sound Enabled", enabled: true },
                  { label: "Vibration Enabled", enabled: true },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">{setting.label}</p>
                    <input
                      type="checkbox"
                      defaultChecked={setting.enabled}
                      className="w-5 h-5 rounded"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAppSync;
