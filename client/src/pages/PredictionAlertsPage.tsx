import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, TrendingDown, Activity, Zap, CheckCircle, X, Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PredictionAlert {
  id: string;
  type: "high_disease_risk" | "low_yield_prediction" | "market_opportunity" | "urgent_action";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  cropType?: string;
  productType?: string;
  createdAt: string;
  expiresAt: string;
  recommendedActions: string[];
  read: boolean;
}

export default function PredictionAlertsPage() {
  const [alerts, setAlerts] = useState<PredictionAlert[]>([
    {
      id: "alert-1",
      type: "high_disease_risk",
      severity: "critical",
      title: "⚠️ Critical: High Disease Risk - Poultry",
      message: "Disease risk for Poultry is 85% (threshold: 70%). Confidence: 92%. Immediate action recommended.",
      cropType: "Poultry",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      recommendedActions: [
        "Increase monitoring frequency to every 4 hours",
        "Review and strengthen biosecurity protocols",
        "Contact veterinarian immediately for consultation",
        "Prepare preventive treatment options",
        "Isolate any affected animals from healthy stock",
      ],
      read: false,
    },
    {
      id: "alert-2",
      type: "low_yield_prediction",
      severity: "high",
      title: "📉 High: Low Yield Prediction - Maize",
      message: "Predicted yield for Maize is 2.1 tons/ha (expected: 3.5 tons/ha). Confidence: 78%.",
      cropType: "Maize",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      recommendedActions: [
        "Review soil health and nutrient levels immediately",
        "Increase irrigation frequency if drought conditions present",
        "Check pest and disease management strategies",
        "Consult with agronomist for field assessment",
        "Adjust fertilizer application rates",
      ],
      read: false,
    },
    {
      id: "alert-3",
      type: "market_opportunity",
      severity: "low",
      title: "💰 Market Opportunity - Maize",
      message: "Predicted price for Maize is $195/ton (above target: $180/ton). Consider selling soon.",
      productType: "Maize",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      recommendedActions: [
        "Monitor market trends closely for next 48 hours",
        "Contact potential buyers to gauge interest",
        "Prepare product for sale and arrange logistics",
        "Check storage conditions to ensure quality",
        "Review pricing strategy with market advisors",
      ],
      read: true,
    },
  ]);

  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [filterType, setFilterType] = useState<"all" | "disease" | "yield" | "market">("all");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "medium":
        return <Activity className="w-5 h-5 text-yellow-600" />;
      default:
        return <Zap className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "high_disease_risk":
        return "Disease Risk";
      case "low_yield_prediction":
        return "Yield Warning";
      case "market_opportunity":
        return "Market Opportunity";
      default:
        return "Action Required";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false;
    if (filterType !== "all") {
      const alertType = alert.type.includes("disease") ? "disease" : alert.type.includes("yield") ? "yield" : "market";
      if (alertType !== filterType) return false;
    }
    return true;
  });

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prediction Alerts</h1>
        <p className="text-gray-600 mt-2">Monitor and manage high-risk predictions and recommended actions</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{alerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Unread</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{unreadCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Critical</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="disease">Disease Risk</option>
                <option value="yield">Yield Warning</option>
                <option value="market">Market Opportunity</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-600 font-medium">No alerts match your filters</p>
              <p className="text-gray-500 text-sm mt-1">All predictions are within safe thresholds</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        {!alert.read && (
                          <Badge variant="default" className="bg-blue-600">
                            New
                          </Badge>
                        )}
                        <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{alert.message}</p>

                      {/* Recommended Actions */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {alert.recommendedActions.map((action, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Timestamps */}
                      <p className="text-xs text-gray-500">
                        Created: {new Date(alert.createdAt).toLocaleString()} • Expires: {new Date(alert.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {!alert.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
