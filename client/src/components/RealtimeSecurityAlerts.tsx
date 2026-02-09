import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, CheckCircle, Zap, Trash2, Eye } from "lucide-react";

interface SecurityAlert {
  id: number;
  type: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  isRead: boolean;
  details?: Record<string, any>;
}

interface RealtimeSecurityAlertsProps {
  farmId: string;
}

export const RealtimeSecurityAlerts: React.FC<RealtimeSecurityAlertsProps> = ({ farmId }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: 1,
      type: "critical",
      title: "Multiple Failed Login Attempts",
      description: "User account 'john_doe' has 5 failed login attempts in the last 10 minutes",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      source: "Authentication System",
      isRead: false,
      details: { userId: "john_doe", attempts: 5, timeWindow: "10 minutes" }
    },
    {
      id: 2,
      type: "high",
      title: "Suspicious Device Access",
      description: "New device detected from IP 192.168.1.100 (Unknown location)",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: "Device Fingerprinting",
      isRead: false,
      details: { ip: "192.168.1.100", device: "Chrome on Windows" }
    },
    {
      id: 3,
      type: "medium",
      title: "Unusual Access Time",
      description: "User 'admin' accessed system at 2:30 AM (unusual time)",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      source: "Access Control",
      isRead: true,
      details: { userId: "admin", time: "2:30 AM" }
    },
    {
      id: 4,
      type: "low",
      title: "Session Timeout Warning",
      description: "Session for user 'manager' will expire in 5 minutes",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      source: "Session Management",
      isRead: true,
      details: { userId: "manager", expiresIn: "5 minutes" }
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new alerts (simulating WebSocket updates)
      if (Math.random() > 0.7) {
        const newAlert: SecurityAlert = {
          id: Math.max(...alerts.map(a => a.id), 0) + 1,
          type: ["critical", "high", "medium", "low"][Math.floor(Math.random() * 4)] as any,
          title: "New Security Event Detected",
          description: "A new security event has been detected in the system",
          timestamp: new Date(),
          source: "Real-time Monitor",
          isRead: false
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [alerts]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "high":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <Zap className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "high":
        return "bg-orange-50 border-orange-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const handleMarkAsRead = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === "critical" && !a.isRead).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-time Security Alerts</CardTitle>
              <CardDescription>Live security events and notifications</CardDescription>
            </div>
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {criticalCount} Critical
                </Badge>
              )}
              {unreadCount > 0 && (
                <Badge variant="secondary">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No security alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${getAlertColor(alert.type)} ${!alert.isRead ? "border-l-4" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{alert.title}</h3>
                          {!alert.isRead && (
                            <div className="h-2 w-2 bg-red-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{alert.source}</span>
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!alert.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      {showDetails && selectedAlert && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedAlert.title}</h3>
                <p className="text-gray-600">{selectedAlert.description}</p>
              </div>
              {selectedAlert.details && (
                <div>
                  <h4 className="font-semibold mb-2">Details:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    {Object.entries(selectedAlert.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={() => setShowDetails(false)} className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
