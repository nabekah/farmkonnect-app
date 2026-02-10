import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Download,
  Upload,
  Zap,
  TrendingUp,
  Award,
  Navigation,
  Bell,
  Settings,
  RefreshCw,
} from "lucide-react";

/**
 * Mobile-First Dashboard Component
 * Offline-first dashboard with task assignments, notifications, and low-bandwidth optimization
 */
export const MobileFirstDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "tasks" | "notifications" | "offline" | "performance" | "location"
  >("dashboard");
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);

  // Mock data
  const summary = {
    tasksToday: 5,
    tasksCompleted: 2,
    tasksOverdue: 1,
    pendingNotifications: 3,
  };

  const tasks = [
    {
      id: 1,
      title: "Field A - Soil Preparation",
      fieldName: "Field A",
      status: "in_progress",
      priority: "high",
      dueTime: "14:00",
      estimatedDuration: 120,
      progress: 60,
    },
    {
      id: 2,
      title: "Field B - Irrigation Check",
      fieldName: "Field B",
      status: "pending",
      priority: "medium",
      dueTime: "16:00",
      estimatedDuration: 60,
      progress: 0,
    },
    {
      id: 3,
      title: "Field C - Pest Monitoring",
      fieldName: "Field C",
      status: "pending",
      priority: "medium",
      dueTime: "17:30",
      estimatedDuration: 45,
      progress: 0,
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "task_assigned",
      title: "New Task Assigned",
      message: "Field maintenance task assigned to you",
      timestamp: "10 min ago",
      read: false,
    },
    {
      id: 2,
      type: "weather_alert",
      title: "Weather Alert",
      message: "Rain expected in 2 hours",
      timestamp: "30 min ago",
      read: false,
    },
    {
      id: 3,
      type: "task_reminder",
      title: "Task Reminder",
      message: "Field B irrigation check due in 1 hour",
      timestamp: "1 hour ago",
      read: true,
    },
  ];

  const metrics = {
    tasksCompleted: 42,
    efficiency: 87,
    safetyScore: 95,
    attendanceRate: 98,
    qualityScore: 92,
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-gray-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">FarmKonnect</h1>
            <p className="text-xs text-gray-600">Field Worker Dashboard</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-xs">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-gray-600">{signalStrength}/5</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Battery className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">{batteryLevel}%</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-blue-50">
            <p className="text-gray-600 text-xs">Tasks Today</p>
            <p className="text-2xl font-bold text-blue-600">{summary.tasksToday}</p>
          </Card>
          <Card className="p-4 bg-green-50">
            <p className="text-gray-600 text-xs">Completed</p>
            <p className="text-2xl font-bold text-green-600">{summary.tasksCompleted}</p>
          </Card>
          <Card className="p-4 bg-red-50">
            <p className="text-gray-600 text-xs">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{summary.tasksOverdue}</p>
          </Card>
          <Card className="p-4 bg-purple-50">
            <p className="text-gray-600 text-xs">Alerts</p>
            <p className="text-2xl font-bold text-purple-600">{summary.pendingNotifications}</p>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setViewMode("dashboard")}
            variant={viewMode === "dashboard" ? "default" : "outline"}
            size="sm"
            className={viewMode === "dashboard" ? "bg-blue-600 text-white" : ""}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("tasks")}
            variant={viewMode === "tasks" ? "default" : "outline"}
            size="sm"
            className={viewMode === "tasks" ? "bg-blue-600 text-white" : ""}
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("notifications")}
            variant={viewMode === "notifications" ? "default" : "outline"}
            size="sm"
            className={viewMode === "notifications" ? "bg-blue-600 text-white" : ""}
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("offline")}
            variant={viewMode === "offline" ? "default" : "outline"}
            size="sm"
            className={viewMode === "offline" ? "bg-blue-600 text-white" : ""}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("performance")}
            variant={viewMode === "performance" ? "default" : "outline"}
            size="sm"
            className={viewMode === "performance" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode("location")}
            variant={viewMode === "location" ? "default" : "outline"}
            size="sm"
            className={viewMode === "location" ? "bg-blue-600 text-white" : ""}
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-900">Current Task</p>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-2">Field A - Soil Preparation</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: "60%" }} />
              </div>
              <p className="text-xs text-gray-600">60% Complete • Due at 14:00</p>
            </Card>

            <Card className="p-4">
              <p className="font-bold text-gray-900 mb-3">Next Tasks</p>
              <div className="space-y-2">
                {tasks.slice(1).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600">{task.dueTime}</p>
                    </div>
                    <span className={`text-xs font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">Task Overdue</p>
                  <p className="text-xs text-gray-600">Field maintenance task overdue by 2 hours</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tasks View */}
        {viewMode === "tasks" && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.fieldName}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{task.progress}% Complete</span>
                  <span>{task.dueTime}</span>
                </div>
                {task.status === "pending" && (
                  <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                    Start Task
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Notifications View */}
        {viewMode === "notifications" && (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-4 ${notif.read ? "bg-gray-50" : "bg-blue-50 border-blue-200"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${notif.read ? "text-gray-600" : "text-gray-900"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{notif.timestamp}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Offline View */}
        {viewMode === "offline" && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-5 h-5 text-orange-600" />
                <p className="font-bold text-gray-900">Offline Sync</p>
              </div>
              <p className="text-xs text-gray-600 mb-3">Download data for offline access</p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download Data (2.3 MB)
              </Button>
            </Card>

            <Card className="p-4">
              <p className="font-bold text-gray-900 mb-3">Offline Data</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks</span>
                  <span className="font-bold text-gray-900">5 items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fields</span>
                  <span className="font-bold text-gray-900">3 items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weather</span>
                  <span className="font-bold text-gray-900">Current</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Used</span>
                  <span className="font-bold text-gray-900">2.3 MB / 50 MB</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-bold text-gray-900">Sync Status</p>
              </div>
              <p className="text-xs text-gray-600">Last synced: 5 minutes ago</p>
              <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 h-8 text-xs">
                <RefreshCw className="w-3 h-3 mr-2" />
                Sync Now
              </Button>
            </Card>
          </div>
        )}

        {/* Performance View */}
        {viewMode === "performance" && (
          <div className="space-y-3">
            <Card className="p-4">
              <p className="font-bold text-gray-900 mb-4">Today's Performance</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-600">Efficiency</p>
                    <p className="text-xs font-bold text-gray-900">{metrics.efficiency}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${metrics.efficiency}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-600">Safety Score</p>
                    <p className="text-xs font-bold text-gray-900">{metrics.safetyScore}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${metrics.safetyScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-600">Quality Score</p>
                    <p className="text-xs font-bold text-gray-900">{metrics.qualityScore}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: `${metrics.qualityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <p className="font-bold text-gray-900">Badges Earned</p>
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-gray-600">🏆 Safety Champion</p>
                <p className="text-gray-600">⚡ Efficiency Expert</p>
              </div>
            </Card>
          </div>
        )}

        {/* Location View */}
        {viewMode === "location" && (
          <div className="space-y-4">
            <Card className="p-4">
              <p className="font-bold text-gray-900 mb-3">Today's Route</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Field A</p>
                    <p className="text-gray-600">08:00 - 10:30</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Field B</p>
                    <p className="text-gray-600">10:30 - 13:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Field C</p>
                    <p className="text-gray-600">13:00 - Current</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <p className="font-bold text-gray-900 mb-2">Distance Covered</p>
              <p className="text-2xl font-bold text-blue-600 mb-1">2.5 km</p>
              <p className="text-xs text-gray-600">Estimated remaining: 1.2 km</p>
            </Card>
          </div>
        )}

        {/* Mobile Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto flex gap-2">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-10">
              <Upload className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button variant="outline" className="flex-1 h-10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFirstDashboard;
