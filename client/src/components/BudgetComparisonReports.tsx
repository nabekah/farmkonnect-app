import React, { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell } from "recharts";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetComparisonReportsProps {
  farmId: string;
  isLoading?: boolean;
}

/**
 * Budget Comparison Reports Component
 * Displays year-over-year and period-over-period budget comparisons with export options
 */
export const BudgetComparisonReports: React.FC<BudgetComparisonReportsProps> = ({ farmId, isLoading = false }) => {
  const [selectedBudget1, setSelectedBudget1] = useState<string>("");
  const [selectedBudget2, setSelectedBudget2] = useState<string>("");

  // Fetch all budgets for the farm
  const { data: budgets = [], isLoading: budgetsLoading } = trpc.budgetManagement.listBudgets.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  // Fetch comparison data
  const { data: comparison, isLoading: comparisonLoading } = trpc.budgetManagement.compareBudgets.useQuery(
    {
      farmId,
      budgetId1: selectedBudget1,
      budgetId2: selectedBudget2,
    },
    { enabled: !!selectedBudget1 && !!selectedBudget2 && selectedBudget1 !== selectedBudget2 }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const comparisonChartData = useMemo(() => {
    if (!comparison) return [];
    return [
      {
        name: "Budgeted",
        [comparison.period1.name]: comparison.period1.budgeted,
        [comparison.period2.name]: comparison.period2.budgeted,
      },
      {
        name: "Actual Spent",
        [comparison.period1.name]: comparison.period1.actual,
        [comparison.period2.name]: comparison.period2.actual,
      },
      {
        name: "Variance",
        [comparison.period1.name]: Math.abs(comparison.period1.budgeted - comparison.period1.actual),
        [comparison.period2.name]: Math.abs(comparison.period2.budgeted - comparison.period2.actual),
      },
    ];
  }, [comparison]);

  const utilizationChartData = useMemo(() => {
    if (!comparison) return [];
    return [
      {
        period: comparison.period1.name,
        utilization: comparison.period1.utilization,
      },
      {
        period: comparison.period2.name,
        utilization: comparison.period2.utilization,
      },
    ];
  }, [comparison]);

  const handleExportPDF = () => {
    if (!comparison) return;

    // Create a simple text-based PDF export
    const reportContent = `
BUDGET COMPARISON REPORT
========================

Period 1: ${comparison.period1.name}
Date Range: ${new Date(comparison.period1.startDate).toLocaleDateString()} - ${new Date(comparison.period1.endDate).toLocaleDateString()}
Budgeted: ${formatCurrency(comparison.period1.budgeted)}
Actual: ${formatCurrency(comparison.period1.actual)}
Utilization: ${comparison.period1.utilization.toFixed(1)}%

Period 2: ${comparison.period2.name}
Date Range: ${new Date(comparison.period2.startDate).toLocaleDateString()} - ${new Date(comparison.period2.endDate).toLocaleDateString()}
Budgeted: ${formatCurrency(comparison.period2.budgeted)}
Actual: ${formatCurrency(comparison.period2.actual)}
Utilization: ${comparison.period2.utilization.toFixed(1)}%

COMPARISON METRICS
==================
Variance: ${formatCurrency(comparison.comparison.variance)}
Variance %: ${comparison.comparison.variancePercent.toFixed(2)}%
Trend: ${comparison.comparison.trend.toUpperCase()}
    `;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent));
    element.setAttribute("download", `budget-comparison-${new Date().toISOString().split("T")[0]}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportCSV = () => {
    if (!comparison) return;

    const csvContent = `Budget Comparison Report
Generated: ${new Date().toLocaleString()}

Period 1,${comparison.period1.name}
Start Date,${new Date(comparison.period1.startDate).toLocaleDateString()}
End Date,${new Date(comparison.period1.endDate).toLocaleDateString()}
Budgeted,${comparison.period1.budgeted}
Actual,${comparison.period1.actual}
Utilization %,${comparison.period1.utilization.toFixed(2)}

Period 2,${comparison.period2.name}
Start Date,${new Date(comparison.period2.startDate).toLocaleDateString()}
End Date,${new Date(comparison.period2.endDate).toLocaleDateString()}
Budgeted,${comparison.period2.budgeted}
Actual,${comparison.period2.actual}
Utilization %,${comparison.period2.utilization.toFixed(2)}

Comparison Metrics
Variance,${comparison.comparison.variance}
Variance %,${comparison.comparison.variancePercent.toFixed(2)}
Trend,${comparison.comparison.trend}
    `;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", `budget-comparison-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (budgetsLoading || isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading budgets...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compare Budgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Budget Period</label>
            <Select value={selectedBudget1} onValueChange={setSelectedBudget1}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget..." />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.budgetName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Second Budget Period</label>
            <Select value={selectedBudget2} onValueChange={setSelectedBudget2}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget..." />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id} disabled={budget.id === selectedBudget1}>
                    {budget.budgetName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button disabled={!selectedBudget1 || !selectedBudget2} className="w-full">
              Compare
            </Button>
          </div>
        </div>
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Period 1 Variance</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(Math.abs(comparison.period1.budgeted - comparison.period1.actual))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.period1.utilization > 100 ? "Over" : "Under"} budget
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Period 2 Variance</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(Math.abs(comparison.period2.budgeted - comparison.period2.actual))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.period2.utilization > 100 ? "Over" : "Under"} budget
              </p>
            </Card>

            <Card className={cn("p-4", comparison.comparison.variance > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
              <p className="text-sm text-gray-600 mb-1">Total Variance</p>
              <p className={cn("text-2xl font-bold", comparison.comparison.variance > 0 ? "text-red-600" : "text-green-600")}>
                {formatCurrency(Math.abs(comparison.comparison.variance))}
              </p>
              <p className="text-xs text-gray-500 mt-1">{comparison.comparison.variancePercent.toFixed(1)}% change</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Trend</p>
              <div className="flex items-center gap-2 mt-1">
                {comparison.comparison.trend === "increase" ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <p className="text-lg font-bold text-red-600">Increasing</p>
                  </>
                ) : comparison.comparison.trend === "decrease" ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <p className="text-lg font-bold text-green-600">Decreasing</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-600">Stable</p>
                )}
              </div>
            </Card>
          </div>

          {/* Comparison Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget vs Actual Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey={comparison.period1.name} fill="#3b82f6" />
                <Bar dataKey={comparison.period2.name} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Utilization Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Utilization Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={utilizationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis label={{ value: "Utilization %", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="utilization" stroke="#8b5cf6" strokeWidth={2} name="Utilization %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Detailed Comparison Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Metric</th>
                    <th className="text-right py-2 px-3 font-semibold">{comparison.period1.name}</th>
                    <th className="text-right py-2 px-3 font-semibold">{comparison.period2.name}</th>
                    <th className="text-right py-2 px-3 font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">Budgeted Amount</td>
                    <td className="text-right py-3 px-3 font-medium">{formatCurrency(comparison.period1.budgeted)}</td>
                    <td className="text-right py-3 px-3 font-medium">{formatCurrency(comparison.period2.budgeted)}</td>
                    <td className="text-right py-3 px-3 font-medium">
                      {formatCurrency(comparison.period2.budgeted - comparison.period1.budgeted)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">Actual Spent</td>
                    <td className="text-right py-3 px-3 font-medium">{formatCurrency(comparison.period1.actual)}</td>
                    <td className="text-right py-3 px-3 font-medium">{formatCurrency(comparison.period2.actual)}</td>
                    <td className="text-right py-3 px-3 font-medium">
                      {formatCurrency(comparison.period2.actual - comparison.period1.actual)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">Utilization %</td>
                    <td className="text-right py-3 px-3 font-medium">{comparison.period1.utilization.toFixed(1)}%</td>
                    <td className="text-right py-3 px-3 font-medium">{comparison.period2.utilization.toFixed(1)}%</td>
                    <td className="text-right py-3 px-3 font-medium">
                      {(comparison.period2.utilization - comparison.period1.utilization).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Export Options */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Export Report
            </h3>
            <div className="flex gap-3">
              <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export as PDF
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export as CSV
              </Button>
            </div>
          </Card>
        </>
      )}

      {!comparison && selectedBudget1 && selectedBudget2 && (
        <Card className="p-6 text-center">
          {comparisonLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <p className="text-gray-600">Select two different budgets to compare</p>
          )}
        </Card>
      )}
    </div>
  );
};
