import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetVsActualItem {
  expenseType: string;
  description?: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  percentageUsed: number;
  isOverBudget: boolean;
  remaining: number;
}

interface BudgetTrendItem {
  period: string;
  actual: number;
  budgeted: number;
  variance: number;
  variancePercent: number;
}

interface BudgetAlert {
  id: number;
  expenseType: string;
  description?: string;
  budgeted: number;
  actual: number;
  percentageUsed: number;
  severity: "critical" | "warning" | "normal";
  message: string;
}

interface BudgetPerformanceMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetUtilization: number;
  overBudgetCategories: number;
  underBudgetCategories: number;
  budgetHealth: "healthy" | "caution" | "over_budget" | "under_utilized" | "no_budget";
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

/**
 * Budget vs Actual Spending Visualization Component
 * Displays multiple charts and metrics for budget analysis
 */
export const BudgetVisualization: React.FC<{
  data?: BudgetVsActualItem[];
  trendData?: BudgetTrendItem[];
  alerts?: BudgetAlert[];
  metrics?: BudgetPerformanceMetrics;
  isLoading?: boolean;
}> = ({ data = [], trendData = [], alerts = [], metrics, isLoading = false }) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Prepare data for variance chart
  const varianceChartData = useMemo(() => {
    return data.map((item) => ({
      name: item.description || item.expenseType,
      variance: item.variance,
      budgeted: item.budgeted,
      actual: item.actual,
      isOverBudget: item.isOverBudget,
    }));
  }, [data]);

  // Prepare data for utilization gauge
  const utilizationData = useMemo(() => {
    return data.map((item) => ({
      name: item.description || item.expenseType,
      value: item.percentageUsed,
      budgeted: item.budgeted,
      actual: item.actual,
    }));
  }, [data]);

  // Get budget health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600";
      case "caution":
        return "text-yellow-600";
      case "over_budget":
        return "text-red-600";
      case "under_utilized":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalBudget)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalSpent)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRemaining)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.budgetHealth)}`}>
                  {metrics.budgetUtilization.toFixed(1)}%
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  metrics.budgetHealth === "healthy"
                    ? "bg-green-100"
                    : metrics.budgetHealth === "caution"
                      ? "bg-yellow-100"
                      : metrics.budgetHealth === "over_budget"
                        ? "bg-red-100"
                        : "bg-blue-100"
                }`}
              >
                <span className="text-xs font-bold">{metrics.budgetUtilization.toFixed(0)}%</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Budget Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Budget Alerts ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn("p-3 rounded-lg border flex items-start gap-3", getSeverityColor(alert.severity))}
              >
                <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.description || alert.expenseType}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                  <div className="mt-1 flex justify-between text-xs">
                    <span>Budget: {formatCurrency(alert.budgeted)}</span>
                    <span>Spent: {formatCurrency(alert.actual)}</span>
                    <span className="font-semibold">{alert.percentageUsed}% used</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget vs Actual Bar Chart */}
      {data.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Budget vs Actual Spending by Category</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={varianceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              />
              <Legend />
              <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
              <Bar dataKey="actual" fill="#ef4444" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Budget Variance Chart */}
      {data.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Budget Variance (Remaining/Over)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={varianceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              />
              <Bar
                dataKey="variance"
                fill="#10b981"
                name="Variance"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Budget Utilization Gauge */}
      {data.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Budget Utilization by Category</h3>
          <div className="space-y-3">
            {utilizationData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(item.actual)} / {formatCurrency(item.budgeted)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      item.value > 100 ? "bg-red-500" : item.value > 80 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{item.value.toFixed(1)}% used</span>
                  {item.value > 100 && (
                    <span className="text-xs text-red-600 font-semibold">
                      {(item.value - 100).toFixed(1)}% over
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trend Analysis Chart */}
      {trendData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Budget Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              />
              <Legend />
              <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
              <Bar dataKey="actual" fill="#ef4444" name="Actual" />
              <Line
                type="monotone"
                dataKey="variance"
                stroke="#10b981"
                name="Variance"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Summary Statistics */}
      {data.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Categories Over Budget</p>
              <p className="text-2xl font-bold text-red-600">
                {data.filter((d) => d.isOverBudget).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories Under Budget</p>
              <p className="text-2xl font-bold text-green-600">
                {data.filter((d) => !d.isOverBudget).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Variance %</p>
              <p className="text-2xl font-bold">
                {(data.reduce((sum, d) => sum + d.variancePercent, 0) / data.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Variance</p>
              <p className={`text-2xl font-bold ${data.reduce((sum, d) => sum + d.variance, 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(data.reduce((sum, d) => sum + d.variance, 0))}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {data.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No budget data available for the selected period</p>
        </Card>
      )}
    </div>
  );
};
