import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ForecastingDashboardProps {
  farmId: string;
}

export function ForecastingDashboard({ farmId }: ForecastingDashboardProps) {
  const [selectedForecastType, setSelectedForecastType] = useState<"revenue" | "expense" | "profit">("expense");
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Fetch forecasts
  const { data: forecasts, isLoading: forecastsLoading } = trpc.financialForecasting.getForecasts.useQuery({
    farmId,
    forecastType: selectedForecastType,
    limit: 20
  });

  // Fetch variance alerts
  const { data: alerts, isLoading: alertsLoading } = trpc.financialForecasting.getVarianceAlerts.useQuery({
    farmId,
    unacknowledgedOnly: true
  });

  // Prepare forecast data for chart
  const forecastChartData = forecasts?.map((f: any) => ({
    period: f.forecastPeriod,
    historical: f.historicalAverage,
    forecasted: f.forecastedAmount,
    confidence: f.confidence,
    category: f.category
  })) || [];

  // Group alerts by severity
  const alertsBySeverity = {
    critical: alerts?.filter((a: any) => a.severity === "critical") || [],
    high: alerts?.filter((a: any) => a.severity === "high") || [],
    medium: alerts?.filter((a: any) => a.severity === "medium") || [],
    low: alerts?.filter((a: any) => a.severity === "low") || []
  };

  const COLORS = {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#eab308",
    low: "#3b82f6"
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Forecasting & Budget Analysis</h2>
        <Button onClick={() => setShowBudgetForm(true)} className="bg-blue-600 hover:bg-blue-700">
          Create Budget
        </Button>
      </div>

      {/* Forecast Type Selector */}
      <div className="flex gap-2">
        {(["expense", "revenue", "profit"] as const).map((type) => (
          <Button
            key={type}
            variant={selectedForecastType === type ? "default" : "outline"}
            onClick={() => setSelectedForecastType(type)}
            className="capitalize"
          >
            {type} Forecast
          </Button>
        ))}
      </div>

      {/* Alerts Summary */}
      {Object.values(alertsBySeverity).some((arr) => arr.length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Budget Variance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(alertsBySeverity).map(([severity, severityAlerts]: any) => (
                <div key={severity} className="p-3 bg-white rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(severity)}
                    <span className="font-semibold capitalize text-sm">{severity}</span>
                  </div>
                  <div className="text-2xl font-bold">{severityAlerts.length}</div>
                  <p className="text-xs text-gray-600">alerts</p>
                </div>
              ))}
            </div>

            {/* Alert Details */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {alerts?.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className="p-2 bg-white rounded border-l-4" style={{ borderLeftColor: COLORS[alert.severity as keyof typeof COLORS] }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.alertType.replace(/_/g, " ").toUpperCase()}</p>
                      <p className="text-xs text-gray-600">Variance: {alert.variancePercentage.toFixed(1)}%</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded capitalize">
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedForecastType.charAt(0).toUpperCase() + selectedForecastType.slice(1)} Forecast Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecastsLoading ? (
            <div className="h-80 flex items-center justify-center text-gray-500">Loading forecasts...</div>
          ) : forecastChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => `GHS ${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#3b82f6"
                  name="Historical Average"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="forecasted"
                  stroke="#10b981"
                  name="Forecasted Amount"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">No forecast data available</div>
          )}
        </CardContent>
      </Card>

      {/* Confidence Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Confidence Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastChartData.slice(0, 4).map((forecast: any, idx: number) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-700 mb-2">{forecast.category || "Overall"}</p>
                <div className="relative h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{Math.round(forecast.confidence)}%</div>
                    <p className="text-xs text-gray-600 mt-1">confidence</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${forecast.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forecastChartData.slice(0, 3).map((forecast: any, idx: number) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{forecast.category || "Category"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Forecasted Amount</p>
                  <p className="text-lg font-bold">GHS {Number(forecast.forecasted).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center gap-2">
                  {forecast.trend === "increasing" ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">+{forecast.trendPercentage?.toFixed(1)}%</span>
                    </>
                  ) : forecast.trend === "decreasing" ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">{forecast.trendPercentage?.toFixed(1)}%</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-600">Stable</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
