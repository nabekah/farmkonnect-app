import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  X,
  Check,
  Trash2,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  ShoppingCart,
  Clock,
} from "lucide-react";

/**
 * Real-time Notifications Component
 * Displays and manages real-time notifications with WebSocket support
 */
export const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    maintenanceAlerts: true,
    performanceAlerts: true,
    salesAlerts: true,
    complianceAlerts: true,
    digestFrequency: "daily",
  });

  // Mock notifications data
  const mockNotifications = [
    {
      id: "maint-001",
      type: "maintenance",
      title: "Maintenance Alert: Tractor Engine",
      message: "Oil change is 5 days overdue. Please schedule immediately.",
      priority: "high",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      data: { equipmentName: "Tractor Engine", daysOverdue: 5 },
    },
    {
      id: "perf-001",
      type: "performance",
      title: "Performance Alert: John Smith",
      message: "On-time rate has dropped to 85% (threshold: 90%)",
      priority: "medium",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      data: { workerName: "John Smith", metric: "On-time Rate", value: 85 },
    },
    {
      id: "sale-001",
      type: "sales",
      title: "New Sale: Organic Tomatoes",
      message: "10 kg sold for GH₵450",
      priority: "low",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false,
      data: { productName: "Organic Tomatoes", quantity: 10, amount: 450 },
    },
    {
      id: "comp-001",
      type: "compliance",
      title: "Compliance Alert: Sarah Johnson",
      message: "Missing certifications: Pesticide Handling, First Aid",
      priority: "high",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      data: { workerName: "Sarah Johnson", missingCertifications: ["Pesticide Handling", "First Aid"] },
    },
    {
      id: "alert-001",
      type: "alert",
      title: "System Alert",
      message: "Database backup completed successfully",
      priority: "low",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      data: {},
    },
  ];

  useEffect(() => {
    // Initialize with mock data
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter((n) => !n.read).length);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Zap className="w-5 h-5 text-red-600" />;
      case "performance":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "sales":
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case "compliance":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "alert":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-4 border-red-600 bg-red-50";
      case "high":
        return "border-l-4 border-orange-600 bg-orange-50";
      case "medium":
        return "border-l-4 border-yellow-600 bg-yellow-50";
      case "low":
        return "border-l-4 border-green-600 bg-green-50";
      default:
        return "border-l-4 border-gray-600 bg-gray-50";
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, read: true, readAt: new Date() }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleDelete = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const filteredNotifications =
    selectedFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === selectedFilter);

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          <Button
            onClick={() => setShowPreferences(!showPreferences)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
        </div>

        {/* Notification Preferences Modal */}
        {showPreferences && (
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              <button onClick={() => setShowPreferences(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, emailNotifications: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Email Notifications</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, pushNotifications: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Push Notifications</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, smsNotifications: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">SMS Notifications (Critical Only)</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <select
                    value={preferences.digestFrequency}
                    onChange={(e) =>
                      setPreferences({ ...preferences, digestFrequency: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </label>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Alert Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.maintenanceAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, maintenanceAlerts: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Maintenance Alerts</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.performanceAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, performanceAlerts: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Performance Alerts</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.salesAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, salesAlerts: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Sales Alerts</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.complianceAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, complianceAlerts: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Compliance Alerts</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowPreferences(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setSelectedFilter("all")}
            variant={selectedFilter === "all" ? "default" : "outline"}
            className={selectedFilter === "all" ? "bg-blue-600 text-white" : ""}
          >
            All ({notifications.length})
          </Button>
          <Button
            onClick={() => setSelectedFilter("maintenance")}
            variant={selectedFilter === "maintenance" ? "default" : "outline"}
            className={selectedFilter === "maintenance" ? "bg-blue-600 text-white" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Maintenance
          </Button>
          <Button
            onClick={() => setSelectedFilter("performance")}
            variant={selectedFilter === "performance" ? "default" : "outline"}
            className={selectedFilter === "performance" ? "bg-blue-600 text-white" : ""}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Performance
          </Button>
          <Button
            onClick={() => setSelectedFilter("sales")}
            variant={selectedFilter === "sales" ? "default" : "outline"}
            className={selectedFilter === "sales" ? "bg-blue-600 text-white" : ""}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Sales
          </Button>
          <Button
            onClick={() => setSelectedFilter("compliance")}
            variant={selectedFilter === "compliance" ? "default" : "outline"}
            className={selectedFilter === "compliance" ? "bg-blue-600 text-white" : ""}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Compliance
          </Button>
        </div>

        {/* Action Buttons */}
        {unreadNotifications.length > 0 && (
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No notifications</p>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 hover:shadow-md transition-shadow ${getPriorityColor(notification.priority)} ${
                  !notification.read ? "ring-1 ring-blue-400" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.createdAt.toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeNotifications;
