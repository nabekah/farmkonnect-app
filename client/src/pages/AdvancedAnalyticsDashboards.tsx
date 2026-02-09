import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  AlertTriangle,
  Target,
  Users,
  Download,
  Plus,
  Settings,
  RefreshCw,
} from "lucide-react";

/**
 * Advanced Analytics & Dashboards Component
 * Predictive analytics, custom dashboards, and performance benchmarking
 */
export const AdvancedAnalyticsDashboards: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "yield" | "equipment" | "productivity" | "benchmarking" | "trends"
  >("dashboard");
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  // Mock crop yield prediction
  const yieldPrediction = {
    estimatedYield: 2500,
    confidence: 87,
    unit: "kg",
    factors: [
      { name: "Weather", impact: 35, trend: "positive" },
      { name: "Soil Quality", impact: 28, trend: "stable" },
      { name: "Pest Pressure", impact: 20, trend: "negative" },
      { name: "Irrigation", impact: 17, trend: "positive" },
    ],
    recommendations: [
      "Increase irrigation frequency by 10%",
      "Apply pest control treatment",
      "Add nitrogen fertilizer",
    ],
  };

  // Mock equipment failure predictions
  const equipmentPredictions = [
    {
      id: 1,
      name: "Tractor A",
      riskLevel: "low",
      failureRisk: 15,
      estimatedFailureDate: "60 days",
      recommendation: "Routine maintenance",
    },
    {
      id: 2,
      name: "Pump B",
      riskLevel: "medium",
      failureRisk: 42,
      estimatedFailureDate: "20 days",
      recommendation: "Urgent maintenance needed",
    },
    {
      id: 3,
      name: "Generator C",
      riskLevel: "high",
      failureRisk: 78,
      estimatedFailureDate: "5 days",
      recommendation: "Critical maintenance required",
    },
  ];

  // Mock worker productivity
  const workerProductivity = [
    {
      id: 1,
      name: "John Doe",
      role: "Field Worker",
      tasksCompleted: 45,
      qualityScore: 92,
      productivity: 94,
      trend: "up",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Supervisor",
      tasksCompleted: 38,
      qualityScore: 88,
      productivity: 85,
      trend: "stable",
    },
    {
      id: 3,
      name: "Peter Johnson",
      role: "Field Worker",
      tasksCompleted: 52,
      qualityScore: 95,
      productivity: 98,
      trend: "up",
    },
  ];

  // Mock benchmarking data
  const benchmarking = [
    {
      metric: "Crop Yield",
      yourFarm: 2500,
      regionAverage: 2200,
      topPerformer: 3100,
      percentile: 75,
    },
    {
      metric: "Water Efficiency",
      yourFarm: 92,
      regionAverage: 85,
      topPerformer: 98,
      percentile: 82,
    },
    {
      metric: "Cost per Unit",
      yourFarm: 120,
      regionAverage: 140,
      topPerformer: 100,
      percentile: 88,
    },
    {
      metric: "Labor Productivity",
      yourFarm: 94,
      regionAverage: 80,
      topPerformer: 98,
      percentile: 90,
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : trend === "down" ? (
      <TrendingDown className="w-5 h-5 text-red-600" />
    ) : (
      <RefreshCw className="w-5 h-5 text-gray-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-1">Predictive analytics, custom dashboards, and performance insights</p>
          </div>
          <BarChart3 className="w-12 h-12 text-blue-600 opacity-20" />
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
            onClick={() => setViewMode("yield")}
            variant={viewMode === "yield" ? "default" : "outline"}
            className={viewMode === "yield" ? "bg-blue-600 text-white" : ""}
          >
            <Target className="w-4 h-4 mr-2" />
            Yield Prediction
          </Button>
          <Button
            onClick={() => setViewMode("equipment")}
            variant={viewMode === "equipment" ? "default" : "outline"}
            className={viewMode === "equipment" ? "bg-blue-600 text-white" : ""}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Equipment
          </Button>
          <Button
            onClick={() => setViewMode("productivity")}
            variant={viewMode === "productivity" ? "default" : "outline"}
            className={viewMode === "productivity" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Productivity
          </Button>
          <Button
            onClick={() => setViewMode("benchmarking")}
            variant={viewMode === "benchmarking" ? "default" : "outline"}
            className={viewMode === "benchmarking" ? "bg-blue-600 text-white" : ""}
          >
            <LineChart className="w-4 h-4 mr-2" />
            Benchmarking
          </Button>
          <Button
            onClick={() => setViewMode("trends")}
            variant={viewMode === "trends" ? "default" : "outline"}
            className={viewMode === "trends" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </Button>
        </div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setViewMode("yield")}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Crop Yield Prediction</p>
                  <Target className="w-6 h-6 text-blue-600 opacity-20" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{yieldPrediction.estimatedYield}kg</p>
                <p className="text-sm text-gray-600 mt-2">Confidence: {yieldPrediction.confidence}%</p>
              </Card>

              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setViewMode("equipment")}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Equipment Health</p>
                  <AlertTriangle className="w-6 h-6 text-red-600 opacity-20" />
                </div>
                <p className="text-3xl font-bold text-red-600">1</p>
                <p className="text-sm text-gray-600 mt-2">Critical maintenance needed</p>
              </Card>

              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setViewMode("productivity")}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Team Productivity</p>
                  <Users className="w-6 h-6 text-green-600 opacity-20" />
                </div>
                <p className="text-3xl font-bold text-green-600">92%</p>
                <p className="text-sm text-gray-600 mt-2">Average team score</p>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Custom Dashboards</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Dashboard
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Farm Overview", "Financial Summary", "Worker Performance", "Equipment Status"].map((dashboard) => (
                  <div key={dashboard} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <p className="font-semibold text-gray-900">{dashboard}</p>
                    <p className="text-sm text-gray-600 mt-1">Last updated: 5 min ago</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Yield Prediction View */}
        {viewMode === "yield" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Estimated Crop Yield</p>
                  <p className="text-4xl font-bold text-gray-900">{yieldPrediction.estimatedYield} kg</p>
                  <p className="text-sm text-gray-600 mt-2">Confidence Level: {yieldPrediction.confidence}%</p>
                </div>
                <Target className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contributing Factors</h3>
              <div className="space-y-3">
                {yieldPrediction.factors.map((factor) => (
                  <div key={factor.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{factor.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="font-bold text-gray-900">{factor.impact}%</span>
                      {getTrendIcon(factor.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {yieldPrediction.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-gray-900">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Equipment Failure Prediction View */}
        {viewMode === "equipment" && (
          <div className="space-y-4">
            {equipmentPredictions.map((equipment) => (
              <Card key={equipment.id} className={`p-6 border-l-4 ${getRiskColor(equipment.riskLevel)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{equipment.name}</p>
                    <p className="text-sm text-gray-600">{equipment.recommendation}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getRiskColor(equipment.riskLevel)}`}>
                    {equipment.riskLevel.charAt(0).toUpperCase() + equipment.riskLevel.slice(1)} Risk
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-gray-600 text-xs">Failure Risk</p>
                    <p className="font-bold text-gray-900">{equipment.failureRisk}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Est. Failure Date</p>
                    <p className="font-bold text-gray-900">{equipment.estimatedFailureDate}</p>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">
                      Schedule Service
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Worker Productivity View */}
        {viewMode === "productivity" && (
          <div className="space-y-4">
            {workerProductivity.map((worker) => (
              <Card key={worker.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{worker.name}</p>
                    <p className="text-sm text-gray-600">{worker.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{worker.productivity}%</span>
                    {getTrendIcon(worker.trend)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-gray-600 text-xs">Tasks Completed</p>
                    <p className="font-bold text-gray-900">{worker.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Quality Score</p>
                    <p className="font-bold text-gray-900">{worker.qualityScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Productivity</p>
                    <p className="font-bold text-gray-900">{worker.productivity}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Benchmarking View */}
        {viewMode === "benchmarking" && (
          <div className="space-y-4">
            {benchmarking.map((item) => (
              <Card key={item.metric} className="p-6">
                <p className="font-bold text-gray-900 mb-4">{item.metric}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-gray-600 text-xs">Your Farm</p>
                    <p className="text-2xl font-bold text-blue-600">{item.yourFarm}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs">Region Avg</p>
                    <p className="text-2xl font-bold text-gray-600">{item.regionAverage}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-gray-600 text-xs">Top Performer</p>
                    <p className="text-2xl font-bold text-green-600">{item.topPerformer}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-gray-600 text-xs">Percentile</p>
                    <p className="text-2xl font-bold text-purple-600">{item.percentile}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Trends View */}
        {viewMode === "trends" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Trend Analysis</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="space-y-6">
              {["Revenue", "Expenses", "Yield", "Productivity"].map((metric) => (
                <div key={metric} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-900">{metric}</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-bold">+15.5%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Upward trend over the past 3 months</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboards;
