import React, { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface BudgetVarianceAnalysisProps {
  farmId: string;
  startDate: Date;
  endDate: Date;
}

export const BudgetVarianceAnalysis: React.FC<BudgetVarianceAnalysisProps> = ({
  farmId,
  startDate,
  endDate
}) => {
  const { data: budgets = [] } = trpc.financialManagement.getBudgets.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const { data: expenses = [] } = trpc.financialManagement.getExpenses.useQuery(
    { farmId, startDate, endDate },
    { enabled: !!farmId }
  );

  const varianceData = useMemo(() => {
    return budgets.map(budget => {
      const categoryExpenses = expenses.filter(
        (exp: any) => exp.expenseType === budget.category
      );
      const actualSpent = categoryExpenses.reduce(
        (sum: number, exp: any) => sum + parseFloat(exp.amount || 0),
        0
      );
      const variance = actualSpent - budget.allocatedAmount;
      const variancePercent = (variance / budget.allocatedAmount) * 100;
      const remaining = Math.max(0, budget.allocatedAmount - actualSpent);

      return {
        category: budget.category,
        budgeted: budget.allocatedAmount,
        actual: actualSpent,
        variance,
        variancePercent,
        remaining,
        status: variance > 0 ? "over" : variance < 0 ? "under" : "on-track"
      };
    });
  }, [budgets, expenses]);

  const totals = useMemo(() => {
    return {
      totalBudgeted: varianceData.reduce((sum, item) => sum + item.budgeted, 0),
      totalActual: varianceData.reduce((sum, item) => sum + item.actual, 0),
      totalVariance: varianceData.reduce((sum, item) => sum + item.variance, 0),
      overBudgetCount: varianceData.filter(item => item.status === "over").length,
      underBudgetCount: varianceData.filter(item => item.status === "under").length
    };
  }, [varianceData]);

  const getVarianceColor = (status: string) => {
    switch (status) {
      case "over":
        return "text-red-600";
      case "under":
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  const getVarianceBgColor = (status: string) => {
    switch (status) {
      case "over":
        return "bg-red-50";
      case "under":
        return "bg-green-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {totals.totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {totals.totalActual.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">Total spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
            <AlertCircle className={`h-4 w-4 ${totals.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              GHS {Math.abs(totals.totalVariance).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">{totals.totalVariance > 0 ? "Over budget" : "Under budget"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{varianceData.length} categories</div>
            <p className="text-xs text-gray-500">
              {totals.overBudgetCount} over, {totals.underBudgetCount} under
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budgeted vs Actual Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
          <CardDescription>Comparison by category</CardDescription>
        </CardHeader>
        <CardContent>
          {varianceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={varianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `GHS ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                <Bar dataKey="actual" fill="#ef4444" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No budget data available</p>
          )}
        </CardContent>
      </Card>

      {/* Variance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Variance by Category</CardTitle>
          <CardDescription>Positive = Over budget, Negative = Under budget</CardDescription>
        </CardHeader>
        <CardContent>
          {varianceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={varianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `GHS ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
                <Bar dataKey="variance" fill="#8b5cf6" name="Variance" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No variance data</p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Variance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Variance Analysis</CardTitle>
          <CardDescription>Category-by-category breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {varianceData.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getVarianceBgColor(item.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{item.category}</h3>
                  <span className={`font-bold ${getVarianceColor(item.status)}`}>
                    {item.status === "over" ? "+" : ""}{item.variancePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Budgeted</p>
                    <p className="font-semibold">GHS {item.budgeted.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Actual</p>
                    <p className="font-semibold">GHS {item.actual.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining</p>
                    <p className={`font-semibold ${item.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      GHS {item.remaining.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {item.status === "over" && (
                  <p className="text-xs text-red-600 mt-2">
                    <AlertCircle className="inline mr-1 h-3 w-3" />
                    Over budget by GHS {Math.abs(item.variance).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {totals.overBudgetCount > 0 && (
              <li className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>{totals.overBudgetCount} category(ies)</strong> are over budget. Consider adjusting spending or reallocating budget.</span>
              </li>
            )}
            {totals.underBudgetCount > 0 && (
              <li className="flex gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>{totals.underBudgetCount} category(ies)</strong> are under budget. You may have room to invest in these areas.</span>
              </li>
            )}
            {totals.totalVariance === 0 && (
              <li className="flex gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Your spending is perfectly aligned with your budget. Excellent budget management!</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
