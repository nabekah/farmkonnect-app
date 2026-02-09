import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Zap,
  Calendar,
  Settings,
} from "lucide-react";

/**
 * Advanced Reporting & Analytics Dashboard Component
 * Comprehensive farm analytics with custom reports, predictive analytics, and benchmarking
 */
export const AdvancedReportingAnalytics: React.FC = () => {
  const [viewMode, setViewMode] = useState<"overview" | "reports" | "predictions" | "financial" | "benchmarks">("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  // Mock overview data
  const overview = {
    totalEquipment: 12,
    maintenanceOverdue: 2,
    totalWorkers: 8,
    complianceRate: 87.5,
    totalProducts: 4,
    totalRevenue: 5230.0,
    averageProductivity: 92,
    safetyIncidents: 0,
  };

  // Mock key metrics
  const keyMetrics = [
    { label: "Equipment Utilization", value: 85, target: 80, status: "above" },
    { label: "Worker Productivity", value: 92, target: 85, status: "above" },
    { label: "Compliance Rate", value: 87.5, target: 90, status: "below" },
    { label: "Maintenance Efficiency", value: 78, target: 85, status: "below" },
  ];

  // Mock predictions
  const predictions = [
    {
      type: "equipment_failure",
      title: "Equipment Failure Risk",
      risk: "high",
      confidence: 87,
      prediction: "Tractor A oil change overdue - 95% failure risk in 7 days",
      action: "Schedule immediate maintenance",
    },
    {
      type: "productivity",
      title: "Productivity Trend",
      risk: "medium",
      confidence: 72,
      prediction: "Overall productivity expected to drop 5% next month",
      action: "Increase training and supervision",
    },
    {
      type: "revenue",
      title: "Sales Revenue Forecast",
      risk: "low",
      confidence: 91,
      prediction: "Revenue expected to increase 12% next quarter",
      action: "Increase inventory for top products",
    },
  ];

  // Mock financial data
  const financialData = {
    totalRevenue: 5230.0,
    totalExpenses: 3450.0,
    netProfit: 1780.0,
    profitMargin: 34.0,
    roi: 51.6,
    expenses: [
      { category: "Equipment Maintenance", amount: 1200, percentage: 35 },
      { category: "Labor", amount: 1000, percentage: 29 },
      { category: "Supplies", amount: 800, percentage: 23 },
      { category: "Utilities", amount: 450, percentage: 13 },
    ],
    revenue: [
      { product: "Organic Tomatoes", amount: 2250, percentage: 43 },
      { product: "Free-Range Eggs", amount: 1500, percentage: 29 },
      { product: "Honey", amount: 1200, percentage: 23 },
      { product: "Maize", amount: 280, percentage: 5 },
    ],
  };

  // Mock benchmarks
  const benchmarks = [
    {
      metric: "Equipment Utilization",
      farmValue: 85,
      industryAverage: 78,
      topPerformer: 95,
      rating: "above_average",
    },
    {
      metric: "Worker Productivity",
      farmValue: 92,
      industryAverage: 85,
      topPerformer: 98,
      rating: "above_average",
    },
    {
      metric: "Compliance Rate",
      farmValue: 87.5,
      industryAverage: 82,
      topPerformer: 100,
      rating: "above_average",
    },
    {
      metric: "Profit Margin",
      farmValue: 34,
      industryAverage: 28,
      topPerformer: 42,
      rating: "above_average",
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
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
    return status === "above" ? (
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics & Reporting</h1>
            <p className="text-gray-600 mt-1">Comprehensive farm analytics with predictive insights</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button onClick={() => setShowReportBuilder(true)} className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Build Report
            </Button>
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
            onClick={() => setViewMode("predictions")}
            variant={viewMode === "predictions" ? "default" : "outline"}
            className={viewMode === "predictions" ? "bg-blue-600 text-white" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Predictions
          </Button>
          <Button
            onClick={() => setViewMode("financial")}
            variant={viewMode === "financial" ? "default" : "outline"}
            className={viewMode === "financial" ? "bg-blue-600 text-white" : ""}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Financial
          </Button>
          <Button
            onClick={() => setViewMode("benchmarks")}
            variant={viewMode === "benchmarks" ? "default" : "outline"}
            className={viewMode === "benchmarks" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Benchmarks
          </Button>
        </div>

        {/* Overview View */}
        {viewMode === "overview" && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Equipment</p>
                    <p className="text-3xl font-bold text-gray-900">{overview.totalEquipment}</p>
                  </div>
                  <Zap className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Maintenance Overdue</p>
                    <p className="text-3xl font-bold text-red-600">{overview.maintenanceOverdue}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Workers</p>
                    <p className="text-3xl font-bold text-gray-900">{overview.totalWorkers}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Compliance Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{overview.complianceRate}%</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Key Metrics Comparison */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance vs Target</h2>
              <div className="space-y-4">
                {keyMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{metric.label}</p>
                      <p className="text-sm text-gray-600">Target: {metric.target}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${metric.status === "above" ? "bg-green-600" : "bg-red-600"}`}
                          style={{ width: `${Math.min(metric.value, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <span className="font-bold text-gray-900 w-12">{metric.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Predictions View */}
        {viewMode === "predictions" && (
          <div className="space-y-4">
            {predictions.map((pred, idx) => (
              <Card key={idx} className={`p-6 border-l-4 ${getRiskColor(pred.risk)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{pred.title}</h3>
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50">
                        {pred.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{pred.prediction}</p>
                    <div className="flex items-center gap-2 p-3 bg-white bg-opacity-50 rounded">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{pred.action}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{pred.confidence}%</p>
                      <p className="text-xs font-medium">Confidence</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Financial View */}
        {viewMode === "financial" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">GH₵{financialData.totalRevenue.toFixed(0)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">GH₵{financialData.totalExpenses.toFixed(0)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600">GH₵{financialData.netProfit.toFixed(0)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{financialData.profitMargin}%</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">ROI</p>
                <p className="text-2xl font-bold text-gray-900">{financialData.roi}%</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h3>
                <div className="space-y-3">
                  {financialData.expenses.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-gray-700 font-medium">{exp.category}</p>
                        <p className="text-gray-900 font-bold">GH₵{exp.amount}</p>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${exp.percentage}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{exp.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  {financialData.revenue.map((rev, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-gray-700 font-medium">{rev.product}</p>
                        <p className="text-gray-900 font-bold">GH₵{rev.amount}</p>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600" style={{ width: `${rev.percentage}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{rev.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Benchmarks View */}
        {viewMode === "benchmarks" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Benchmarks</h2>
            <div className="space-y-6">
              {benchmarks.map((bench, idx) => (
                <div key={idx} className="pb-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{bench.metric}</h3>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Above Average
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Your Farm</span>
                      <span className="font-bold text-gray-900">{bench.farmValue}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${bench.farmValue}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">Industry Average</span>
                      <span className="font-bold text-gray-900">{bench.industryAverage}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400" style={{ width: `${bench.industryAverage}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">Top Performer</span>
                      <span className="font-bold text-gray-900">{bench.topPerformer}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: `${bench.topPerformer}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Report Builder Modal */}
        {showReportBuilder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Report Builder</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Equipment Report</option>
                      <option>Workers Report</option>
                      <option>Sales Report</option>
                      <option>Compliance Report</option>
                      <option>Financial Report</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="format" value="pdf" defaultChecked className="w-4 h-4" />
                        <span className="text-sm">PDF</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="format" value="csv" className="w-4 h-4" />
                        <span className="text-sm">CSV</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="format" value="excel" className="w-4 h-4" />
                        <span className="text-sm">Excel</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setShowReportBuilder(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowReportBuilder(false);
                        alert("Report generated successfully!");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
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

export default AdvancedReportingAnalytics;
