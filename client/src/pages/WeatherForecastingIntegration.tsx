import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Eye,
  Gauge,
  Zap,
} from "lucide-react";

/**
 * Weather Forecasting Integration Component
 * Real-time weather data with automated alerts for farm operations
 */
export const WeatherForecastingIntegration: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "current" | "forecast" | "alerts" | "seasonal" | "impact" | "irrigation"
  >("current");

  // Mock data
  const currentWeather = {
    temperature: 26.5,
    humidity: 72,
    windSpeed: 12,
    rainfall: 0,
    cloudCover: 45,
    condition: "Partly Cloudy",
    feelsLike: 25.8,
    uvIndex: 7,
  };

  const forecast = [
    {
      date: "2026-02-11",
      high: 28,
      low: 20,
      condition: "Sunny",
      rainfall: 0,
      windSpeed: 10,
      humidity: 65,
    },
    {
      date: "2026-02-12",
      high: 27,
      low: 19,
      condition: "Partly Cloudy",
      rainfall: 2,
      windSpeed: 12,
      humidity: 70,
    },
    {
      date: "2026-02-13",
      high: 25,
      low: 18,
      condition: "Rainy",
      rainfall: 15,
      windSpeed: 15,
      humidity: 85,
    },
    {
      date: "2026-02-14",
      high: 26,
      low: 19,
      condition: "Cloudy",
      rainfall: 5,
      windSpeed: 11,
      humidity: 75,
    },
    {
      date: "2026-02-15",
      high: 29,
      low: 21,
      condition: "Sunny",
      rainfall: 0,
      windSpeed: 8,
      humidity: 60,
    },
    {
      date: "2026-02-16",
      high: 30,
      low: 22,
      condition: "Sunny",
      rainfall: 0,
      windSpeed: 7,
      humidity: 55,
    },
    {
      date: "2026-02-17",
      high: 28,
      low: 20,
      condition: "Partly Cloudy",
      rainfall: 1,
      windSpeed: 9,
      humidity: 62,
    },
  ];

  const alerts = [
    {
      type: "Heavy Rain",
      severity: "high",
      startTime: "2026-02-13 2:00 PM",
      description: "Heavy rainfall expected with 15mm precipitation",
      recommendation: "Postpone field operations, ensure drainage",
    },
    {
      type: "Frost Warning",
      severity: "medium",
      startTime: "2026-02-15 3:00 AM",
      description: "Temperature may drop to 15°C",
      recommendation: "Protect sensitive crops, consider irrigation",
    },
    {
      type: "High Wind",
      severity: "low",
      startTime: "2026-02-14 10:00 AM",
      description: "Wind speed up to 20 km/h",
      recommendation: "Secure equipment and structures",
    },
  ];

  const irrigationRecs = [
    {
      date: "2026-02-11",
      waterNeeded: 25,
      expectedRainfall: 0,
      irrigationRequired: 25,
      timing: "Evening (6-8 PM)",
    },
    {
      date: "2026-02-12",
      waterNeeded: 23,
      expectedRainfall: 2,
      irrigationRequired: 21,
      timing: "Morning (6-8 AM)",
    },
    {
      date: "2026-02-13",
      waterNeeded: 20,
      expectedRainfall: 15,
      irrigationRequired: 0,
      timing: "No irrigation needed",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weather Forecasting Integration</h1>
            <p className="text-gray-600 mt-1">Real-time weather data and automated alerts</p>
          </div>
          <Cloud className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("current")}
            variant={viewMode === "current" ? "default" : "outline"}
            className={viewMode === "current" ? "bg-blue-600 text-white" : ""}
          >
            <Cloud className="w-4 h-4 mr-2" />
            Current
          </Button>
          <Button
            onClick={() => setViewMode("forecast")}
            variant={viewMode === "forecast" ? "default" : "outline"}
            className={viewMode === "forecast" ? "bg-blue-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            7-Day Forecast
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
            onClick={() => setViewMode("seasonal")}
            variant={viewMode === "seasonal" ? "default" : "outline"}
            className={viewMode === "seasonal" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Seasonal
          </Button>
          <Button
            onClick={() => setViewMode("impact")}
            variant={viewMode === "impact" ? "default" : "outline"}
            className={viewMode === "impact" ? "bg-blue-600 text-white" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Crop Impact
          </Button>
          <Button
            onClick={() => setViewMode("irrigation")}
            variant={viewMode === "irrigation" ? "default" : "outline"}
            className={viewMode === "irrigation" ? "bg-blue-600 text-white" : ""}
          >
            <Droplets className="w-4 h-4 mr-2" />
            Irrigation
          </Button>
        </div>

        {/* Current Weather View */}
        {viewMode === "current" && (
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="text-center mb-6">
                <Cloud className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">{currentWeather.condition}</p>
                <p className="text-gray-600">Ashanti Region, Ghana</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-gray-600 text-sm">Temperature</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{currentWeather.temperature}°C</p>
                  <p className="text-xs text-gray-500 mt-1">Feels like {currentWeather.feelsLike}°C</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-cyan-200">
                  <p className="text-gray-600 text-sm">Humidity</p>
                  <p className="text-3xl font-bold text-cyan-600 mt-1">{currentWeather.humidity}%</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-gray-600 text-sm">Wind Speed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{currentWeather.windSpeed} km/h</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-sm">UV Index</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{currentWeather.uvIndex}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CloudRain className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Rainfall</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{currentWeather.rainfall} mm</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <p className="text-sm text-gray-600">Cloud Cover</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{currentWeather.cloudCover}%</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-gray-600">Pressure</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">1013 mb</p>
              </Card>
            </div>
          </div>
        )}

        {/* Forecast View */}
        {viewMode === "forecast" && (
          <div className="space-y-4">
            {forecast.map((day, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.condition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{day.high}°C</p>
                    <p className="text-sm text-gray-600">Low: {day.low}°C</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Rainfall</p>
                    <p className="font-bold text-gray-900">{day.rainfall} mm</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Wind</p>
                    <p className="font-bold text-gray-900">{day.windSpeed} km/h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Humidity</p>
                    <p className="font-bold text-gray-900">{day.humidity}%</p>
                  </div>
                  <div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Alerts View */}
        {viewMode === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <Card
                key={idx}
                className={`p-6 border-l-4 ${
                  alert.severity === "high"
                    ? "bg-red-50 border-l-red-600"
                    : alert.severity === "medium"
                    ? "bg-yellow-50 border-l-yellow-600"
                    : "bg-blue-50 border-l-blue-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-6 h-6 mt-1 flex-shrink-0 ${
                      alert.severity === "high"
                        ? "text-red-600"
                        : alert.severity === "medium"
                        ? "text-yellow-600"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{alert.type}</p>
                    <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-600 mt-2">Starts: {alert.startTime}</p>
                    <p className="text-sm text-gray-700 mt-2 font-semibold">
                      ✓ {alert.recommendation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Seasonal View */}
        {viewMode === "seasonal" && (
          <Card className="p-6">
            <p className="font-bold text-gray-900 mb-4">Seasonal Forecast</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-600 text-sm">Average Temperature</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">26°C</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-gray-600 text-sm">Total Rainfall</p>
                  <p className="text-2xl font-bold text-cyan-600 mt-1">450 mm</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-600 text-sm">Rainy Days</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">65 days</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-900 mb-2">Outlook</p>
                <p className="text-gray-700">
                  Normal rainfall expected with occasional dry spells. Northeast trade winds will dominate.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-bold text-gray-900 mb-3">Recommendations</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Plan irrigation for dry periods</li>
                  <li>• Prepare for heavy rains in mid-season</li>
                  <li>• Monitor pest activity during humid period</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Crop Impact View */}
        {viewMode === "impact" && (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Weather Impact on Maize</p>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-gray-900">Rainfall</p>
                    <span className="text-green-600 font-bold">OPTIMAL</span>
                  </div>
                  <p className="text-sm text-gray-700">450mm received vs 400mm required</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-gray-900">Temperature</p>
                    <span className="text-green-600 font-bold">GOOD</span>
                  </div>
                  <p className="text-sm text-gray-700">Average 26°C vs optimal 25°C</p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-gray-900">Humidity</p>
                    <span className="text-yellow-600 font-bold">MODERATE</span>
                  </div>
                  <p className="text-sm text-gray-700">70% humidity - Low disease risk</p>
                </div>
              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <p className="font-bold text-gray-900 mb-2">Yield Projection</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Baseline Yield</p>
                    <p className="text-lg font-bold text-gray-900">2.5 tons/ha</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">→</div>
                  <div>
                    <p className="text-sm text-gray-600">Projected Yield</p>
                    <p className="text-lg font-bold text-green-600">2.65 tons/ha (+6%)</p>
                  </div>
                </div>
              </Card>
            </Card>
          </div>
        )}

        {/* Irrigation View */}
        {viewMode === "irrigation" && (
          <div className="space-y-4">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="font-bold text-gray-900 mb-3">Water Savings</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Estimated Savings</p>
                  <p className="text-2xl font-bold text-blue-600">150 m³</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Cost Savings</p>
                  <p className="text-2xl font-bold text-green-600">GH₵450</p>
                </div>
              </div>
            </Card>

            {irrigationRecs.map((rec, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{rec.date}</p>
                    <p className="text-sm text-gray-600">{rec.timing}</p>
                  </div>
                  <Droplets className="w-6 h-6 text-blue-600 opacity-50" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Water Needed</p>
                    <p className="font-bold text-gray-900">{rec.waterNeeded} mm</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Rain</p>
                    <p className="font-bold text-gray-900">{rec.expectedRainfall} mm</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Irrigation</p>
                    <p className="font-bold text-blue-600">{rec.irrigationRequired} mm</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherForecastingIntegration;
