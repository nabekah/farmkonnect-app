import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface SelectedFarms {
  [key: number]: boolean;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function FarmComparison() {
  const [selectedFarms, setSelectedFarms] = useState<SelectedFarms>({});
  const [comparisonType, setComparisonType] = useState<"financials" | "budget" | "expenses" | "revenue" | "efficiency">("financials");

  // Get all user farms
  const { data: farmsData } = trpc.farms.list.useQuery();

  // Comparison queries
  const { data: financialComparison } = trpc.farmComparison.compareFinancials.useQuery(
    { farmIds: Object.keys(selectedFarms).filter((id) => selectedFarms[Number(id)]).map(Number) },
    { enabled: Object.values(selectedFarms).some((v) => v) && comparisonType === "financials" }
  );

  const { data: budgetComparison } = trpc.farmComparison.compareBudgetPerformance.useQuery(
    { farmIds: Object.keys(selectedFarms).filter((id) => selectedFarms[Number(id)]).map(Number) },
    { enabled: Object.values(selectedFarms).some((v) => v) && comparisonType === "budget" }
  );

  const { data: expenseComparison } = trpc.farmComparison.compareExpenseBreakdown.useQuery(
    { farmIds: Object.keys(selectedFarms).filter((id) => selectedFarms[Number(id)]).map(Number) },
    { enabled: Object.values(selectedFarms).some((v) => v) && comparisonType === "expenses" }
  );

  const { data: revenueComparison } = trpc.farmComparison.compareRevenueBreakdown.useQuery(
    { farmIds: Object.keys(selectedFarms).filter((id) => selectedFarms[Number(id)]).map(Number) },
    { enabled: Object.values(selectedFarms).some((v) => v) && comparisonType === "revenue" }
  );

  const { data: efficiencyComparison } = trpc.farmComparison.compareEfficiencyMetrics.useQuery(
    { farmIds: Object.keys(selectedFarms).filter((id) => selectedFarms[Number(id)]).map(Number) },
    { enabled: Object.values(selectedFarms).some((v) => v) && comparisonType === "efficiency" }
  );

  const toggleFarmSelection = (farmId: number) => {
    setSelectedFarms((prev) => ({
      ...prev,
      [farmId]: !prev[farmId],
    }));
  };

  const selectedCount = Object.values(selectedFarms).filter((v) => v).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Farm Comparison</h1>
        <p className="text-gray-600 mt-2">Compare metrics across multiple farms to identify best performers</p>
      </div>

      {/* Farm Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Farms to Compare</CardTitle>
          <CardDescription>Choose 2-5 farms for side-by-side analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmsData?.map((farm) => (
              <button
                key={farm.id}
                onClick={() => toggleFarmSelection(farm.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFarms[farm.id]
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">{farm.farmName}</div>
                <div className="text-sm text-gray-600">{farm.farmType}</div>
                <div className="text-xs text-gray-500 mt-1">{farm.sizeHectares} hectares</div>
              </button>
            ))}
          </div>
          {selectedCount === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">Select at least 2 farms to start comparison</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCount >= 2 && (
        <>
          {/* Comparison Type Selector */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "financials", label: "Financials" },
              { value: "budget", label: "Budget" },
              { value: "expenses", label: "Expenses" },
              { value: "revenue", label: "Revenue" },
              { value: "efficiency", label: "Efficiency" },
            ].map((type) => (
              <Button
                key={type.value}
                onClick={() => setComparisonType(type.value as any)}
                variant={comparisonType === type.value ? "default" : "outline"}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Financial Comparison */}
          {comparisonType === "financials" && financialComparison && (
            <div className="space-y-6">
              {/* Comparison Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">GHS {financialComparison.comparison.averageRevenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">GHS {financialComparison.comparison.averageExpenses.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">GHS {financialComparison.comparison.averageProfit.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{financialComparison.comparison.averageProfitMargin}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialComparison.farms}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="farmName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `GHS ${value.toLocaleString()}`} />
                      <Bar dataKey="totalRevenue" fill="#10b981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Profit Margin Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Profit Margin Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialComparison.farms}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="farmName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="profitMargin" fill="#3b82f6" name="Profit Margin %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Top Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-lg">{financialComparison.comparison.topFarmByRevenue.farmName}</div>
                    <div className="text-sm text-green-700">GHS {financialComparison.comparison.topFarmByRevenue.totalRevenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Top Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-lg">{financialComparison.comparison.topFarmByProfit.farmName}</div>
                    <div className="text-sm text-blue-700">GHS {financialComparison.comparison.topFarmByProfit.profit.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Best Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-lg">{financialComparison.comparison.topFarmByMargin.farmName}</div>
                    <div className="text-sm text-purple-700">{financialComparison.comparison.topFarmByMargin.profitMargin}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-2">Farm</th>
                          <th className="text-right py-2 px-2">Revenue</th>
                          <th className="text-right py-2 px-2">Expenses</th>
                          <th className="text-right py-2 px-2">Profit</th>
                          <th className="text-right py-2 px-2">Margin</th>
                          <th className="text-right py-2 px-2">Rev/Ha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialComparison.farms.map((farm) => (
                          <tr key={farm.farmId} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{farm.farmName}</td>
                            <td className="text-right py-2 px-2">GHS {farm.totalRevenue.toLocaleString()}</td>
                            <td className="text-right py-2 px-2">GHS {farm.totalExpenses.toLocaleString()}</td>
                            <td className="text-right py-2 px-2 font-semibold">{farm.profit > 0 ? "+" : ""}GHS {farm.profit.toLocaleString()}</td>
                            <td className="text-right py-2 px-2">{farm.profitMargin}%</td>
                            <td className="text-right py-2 px-2">GHS {farm.revenuePerHectare}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Budget Comparison */}
          {comparisonType === "budget" && budgetComparison && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Budgeted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">GHS {budgetComparison.comparison.averageBudgeted.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">GHS {budgetComparison.comparison.averageSpent.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold">{budgetComparison.comparison.bestBudgetPerformer.farmName}</div>
                    <div className="text-sm text-gray-600">{budgetComparison.comparison.bestBudgetPerformer.variancePercentage}% variance</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetComparison.farms}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="farmName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `GHS ${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="totalBudgeted" fill="#3b82f6" name="Budgeted" />
                      <Bar dataKey="totalSpent" fill="#ef4444" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expense Breakdown */}
          {comparisonType === "expenses" && expenseComparison && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {expenseComparison.farms.map((farm, idx) => (
                  <Card key={farm.farmId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{farm.farmName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">GHS {farm.totalExpenses.toLocaleString()}</div>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={farm.breakdown}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                          >
                            {farm.breakdown.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Breakdown */}
          {comparisonType === "revenue" && revenueComparison && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {revenueComparison.farms.map((farm, idx) => (
                  <Card key={farm.farmId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{farm.farmName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">GHS {farm.totalRevenue.toLocaleString()}</div>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={farm.breakdown}
                            dataKey="amount"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                          >
                            {farm.breakdown.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Efficiency Metrics */}
          {comparisonType === "efficiency" && efficiencyComparison && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Metrics Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-2">Farm</th>
                          <th className="text-right py-2 px-2">Size (Ha)</th>
                          <th className="text-right py-2 px-2">Rev/Ha</th>
                          <th className="text-right py-2 px-2">Exp/Ha</th>
                          <th className="text-right py-2 px-2">Profit/Ha</th>
                          <th className="text-right py-2 px-2">Exp Ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {efficiencyComparison.farms.map((farm) => (
                          <tr key={farm.farmId} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{farm.farmName}</td>
                            <td className="text-right py-2 px-2">{farm.sizeHectares}</td>
                            <td className="text-right py-2 px-2">GHS {farm.revenuePerHectare}</td>
                            <td className="text-right py-2 px-2">GHS {farm.expensePerHectare}</td>
                            <td className="text-right py-2 px-2 font-semibold">{farm.profitPerHectare > 0 ? "+" : ""}GHS {farm.profitPerHectare}</td>
                            <td className="text-right py-2 px-2">{farm.expenseRatio}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Per Hectare</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={efficiencyComparison.farms}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="farmName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `GHS ${value}`} />
                      <Bar dataKey="revenuePerHectare" fill="#10b981" name="Revenue/Ha" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
