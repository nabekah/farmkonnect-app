import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Zap,
  Activity,
  Clock,
  Battery,
  Signal,
} from "lucide-react";

/**
 * IoT Sensor Integration Component
 * Real-time monitoring of farm sensors with automated irrigation controls
 */
export const IoTSensorIntegration: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "sensors" | "alerts" | "irrigation" | "analytics" | "maintenance"
  >("dashboard");
  const [selectedSensor, setSelectedSensor] = useState<number | null>(null);

  // Mock sensor data
  const sensors = [
    {
      id: 1,
      name: "Soil Moisture - Field A",
      type: "soil_moisture",
      location: "Field A",
      value: 65,
      unit: "%",
      threshold: { min: 40, max: 80 },
      status: "normal",
      battery: 92,
      lastUpdated: "5 min ago",
    },
    {
      id: 2,
      name: "Temperature - Field A",
      type: "temperature",
      location: "Field A",
      value: 28.5,
      unit: "°C",
      threshold: { min: 15, max: 35 },
      status: "normal",
      battery: 88,
      lastUpdated: "3 min ago",
    },
    {
      id: 3,
      name: "Humidity - Field A",
      type: "humidity",
      location: "Field A",
      value: 72,
      unit: "%",
      threshold: { min: 50, max: 90 },
      status: "normal",
      battery: 85,
      lastUpdated: "2 min ago",
    },
    {
      id: 4,
      name: "pH - Field B",
      type: "ph",
      location: "Field B",
      value: 6.2,
      unit: "pH",
      threshold: { min: 6.0, max: 7.5 },
      status: "warning",
      battery: 78,
      lastUpdated: "8 min ago",
    },
    {
      id: 5,
      name: "Rainfall Gauge",
      type: "rainfall",
      location: "Central",
      value: 12.5,
      unit: "mm",
      threshold: { min: 0, max: 100 },
      status: "normal",
      battery: 95,
      lastUpdated: "15 min ago",
    },
  ];

  // Mock alerts data
  const alerts = [
    {
      id: 1,
      sensor: "pH Sensor - Field B",
      severity: "warning",
      message: "pH level slightly low (6.2)",
      time: "30 min ago",
      resolved: false,
    },
    {
      id: 2,
      sensor: "Soil Moisture - Field A",
      severity: "info",
      message: "Soil moisture approaching optimal range",
      time: "2 hours ago",
      resolved: false,
    },
  ];

  // Mock irrigation schedule
  const irrigationSchedules = [
    {
      id: 1,
      field: "Field A",
      trigger: "Soil Moisture < 40%",
      duration: 30,
      flowRate: 50,
      lastTriggered: "2 hours ago",
      nextScheduled: "4 hours from now",
      waterSaved: 1200,
      status: "active",
    },
    {
      id: 2,
      field: "Field B",
      trigger: "Soil Moisture < 35%",
      duration: 45,
      flowRate: 60,
      lastTriggered: "6 hours ago",
      nextScheduled: "8 hours from now",
      waterSaved: 1800,
      status: "active",
    },
  ];

  // Mock analytics data
  const analytics = {
    totalWaterUsed: 5000,
    totalCost: 750,
    waterSaved: 1200,
    costSaved: 180,
    efficiency: 92,
    dailyUsage: 714,
  };

  // Mock maintenance alerts
  const maintenanceAlerts = [
    {
      id: 1,
      sensor: "Rainfall Gauge",
      type: "battery_low",
      message: "Battery at 78%, replace within 2 weeks",
      priority: "low",
    },
    {
      id: 2,
      sensor: "pH Sensor - Field B",
      type: "calibration",
      message: "Sensor calibration recommended",
      priority: "medium",
    },
  ];

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "soil_moisture":
        return <Droplets className="w-6 h-6 text-blue-600" />;
      case "temperature":
        return <Thermometer className="w-6 h-6 text-red-600" />;
      case "humidity":
        return <Wind className="w-6 h-6 text-cyan-600" />;
      case "ph":
        return <Gauge className="w-6 h-6 text-purple-600" />;
      case "rainfall":
        return <Droplets className="w-6 h-6 text-blue-600" />;
      default:
        return <Activity className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IoT Sensor Integration</h1>
            <p className="text-gray-600 mt-1">Real-time farm monitoring and automated irrigation control</p>
          </div>
          <Activity className="w-12 h-12 text-blue-600 opacity-20" />
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
            onClick={() => setViewMode("sensors")}
            variant={viewMode === "sensors" ? "default" : "outline"}
            className={viewMode === "sensors" ? "bg-blue-600 text-white" : ""}
          >
            <Activity className="w-4 h-4 mr-2" />
            Sensors
          </Button>
          <Button
            onClick={() => setViewMode("alerts")}
            variant={viewMode === "alerts" ? "default" : "outline"}
            className={viewMode === "alerts" ? "bg-blue-600 text-white" : ""}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button
            onClick={() => setViewMode("irrigation")}
            variant={viewMode === "irrigation" ? "default" : "outline"}
            className={viewMode === "irrigation" ? "bg-blue-600 text-white" : ""}
          >
            <Droplets className="w-4 h-4 mr-2" />
            Irrigation
          </Button>
          <Button
            onClick={() => setViewMode("analytics")}
            variant={viewMode === "analytics" ? "default" : "outline"}
            className={viewMode === "analytics" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => setViewMode("maintenance")}
            variant={viewMode === "maintenance" ? "default" : "outline"}
            className={viewMode === "maintenance" ? "bg-blue-600 text-white" : ""}
          >
            Maintenance
          </Button>
        </div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Sensors</p>
                    <p className="text-3xl font-bold text-gray-900">5/5</p>
                  </div>
                  <Signal className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Network Health</p>
                    <p className="text-3xl font-bold text-green-600">98%</p>
                  </div>
                  <Activity className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Alerts</p>
                    <p className="text-3xl font-bold text-yellow-600">2</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-yellow-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Water Saved</p>
                    <p className="text-3xl font-bold text-blue-600">1,200L</p>
                  </div>
                  <Droplets className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Quick Status */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sensor Status Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {sensors.map((sensor) => (
                  <div key={sensor.id} className={`p-4 rounded-lg border-2 ${getStatusColor(sensor.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      {getSensorIcon(sensor.type)}
                      <Battery className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold mb-1">{sensor.name}</p>
                    <p className="text-2xl font-bold">
                      {sensor.value}
                      <span className="text-sm">{sensor.unit}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-2">{sensor.battery}% battery</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Sensors View */}
        {viewMode === "sensors" && (
          <div className="space-y-4">
            {sensors.map((sensor) => (
              <Card key={sensor.id} className={`p-6 border-l-4 ${getStatusColor(sensor.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getSensorIcon(sensor.type)}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{sensor.name}</h3>
                      <p className="text-gray-600">{sensor.location}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-gray-600 text-sm">Current Value</p>
                          <p className="font-bold text-gray-900">
                            {sensor.value}
                            {sensor.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Range</p>
                          <p className="font-bold text-gray-900">
                            {sensor.threshold.min}-{sensor.threshold.max}
                            {sensor.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Battery</p>
                          <p className="font-bold text-gray-900">{sensor.battery}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Last Updated</p>
                          <p className="font-bold text-gray-900">{sensor.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedSensor(sensor.id)}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Alerts View */}
        {viewMode === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-6 border-l-4 ${
                  alert.severity === "warning"
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {alert.severity === "warning" ? (
                      <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{alert.sensor}</p>
                      <p className="text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-2">{alert.time}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4">
                    Acknowledge
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Irrigation View */}
        {viewMode === "irrigation" && (
          <div className="space-y-4">
            {irrigationSchedules.map((schedule) => (
              <Card key={schedule.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{schedule.field}</h3>
                    <p className="text-gray-600">{schedule.trigger}</p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Duration</p>
                    <p className="font-bold text-gray-900">{schedule.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Flow Rate</p>
                    <p className="font-bold text-gray-900">{schedule.flowRate} L/min</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Triggered</p>
                    <p className="font-bold text-gray-900">{schedule.lastTriggered}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Water Saved</p>
                    <p className="font-bold text-blue-600">{schedule.waterSaved}L</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Droplets className="w-4 h-4 mr-2" />
                    Manual Trigger
                  </Button>
                  <Button variant="outline">Configure</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Water Used</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalWaterUsed}L</p>
                <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
              </Card>

              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Cost</p>
                <p className="text-3xl font-bold text-gray-900">GH₵{analytics.totalCost}</p>
                <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
              </Card>

              <Card className="p-6">
                <p className="text-gray-600 text-sm">Efficiency</p>
                <p className="text-3xl font-bold text-green-600">{analytics.efficiency}%</p>
                <p className="text-sm text-gray-600 mt-2">System optimization</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Water Savings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Water Saved</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.waterSaved}L</p>
                  <p className="text-xs text-gray-600 mt-1">Through automation</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Cost Saved</p>
                  <p className="text-2xl font-bold text-green-600">GH₵{analytics.costSaved}</p>
                  <p className="text-xs text-gray-600 mt-1">Through optimization</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Maintenance View */}
        {viewMode === "maintenance" && (
          <div className="space-y-4">
            {maintenanceAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-6 border-l-4 ${
                  alert.priority === "high"
                    ? "border-red-300 bg-red-50"
                    : alert.priority === "medium"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-blue-300 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{alert.sensor}</p>
                    <p className="text-gray-700 mt-1">{alert.message}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        alert.priority === "high"
                          ? "bg-red-200 text-red-800"
                          : alert.priority === "medium"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
                    </span>
                  </div>
                  <Button variant="outline">Schedule Service</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTSensorIntegration;
