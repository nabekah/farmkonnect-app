import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function FarmConsolidationDashboard() {
  const [, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState<"revenue" | "profit">("revenue");

  // Get consolidated financial data
  const { data: consolidatedFinancials, isLoading } = trpc.farmConsolidation.getConsolidatedFinancials.useQuery();
  
  // Get farm ranking
  const { data: farmRanking } = trpc.farmConsolidation.getFarmRanking.useQuery({ sortBy });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (!consolidatedFinancials) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No farm data available</p>
      </div>
    );
  }

  const handleFarmClick = (farmId: number) => {
    setLocation(`/farm/${farmId}/analytics`);
  };

  const hasNegativeProfit = consolidatedFinancials.totalProfit < 0;

  // Prepare data for charts
  const revenueVsExpensesData = [
    {
      name: "Portfolio",
      revenue: consolidatedFinancials.totalRevenue,
      expenses: consolidatedFinancials.totalExpenses,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Farm Portfolio Dashboard</h1>
        <p className="text-gray-600 mt-2">Consolidated view of all your farms</p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{consolidatedFinancials.farmCount}</div>
            <p className="text-xs text-gray-500 mt-1">farms in portfolio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{consolidatedFinancials.totalSizeHectares.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">hectares</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">GHS {consolidatedFinancials.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Across all farms</p>
          </CardContent>
        </Card>

        <Card className={hasNegativeProfit ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${hasNegativeProfit ? "text-red-700" : "text-blue-700"}`}>
              {consolidatedFinancials.totalProfit > 0 ? "+" : ""}GHS {consolidatedFinancials.totalProfit.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 ${hasNegativeProfit ? "text-red-600" : "text-blue-600"}`}>
              {consolidatedFinancials.profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>Portfolio financial summary</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueVsExpensesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Metrics</CardTitle>
          <CardDescription>Performance per hectare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Revenue per Hectare</span>
            <span className="font-semibold">GHS {consolidatedFinancials.revenuePerHectare.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Expense per Hectare</span>
            <span className="font-semibold">GHS {consolidatedFinancials.expensePerHectare.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Farm Size</span>
            <span className="font-semibold">{(consolidatedFinancials.totalSizeHectares / consolidatedFinancials.farmCount).toFixed(1)} ha</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Revenue per Farm</span>
            <span className="font-semibold">GHS {consolidatedFinancials.averageRevenuePerFarm.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Farm Performance Ranking */}
      {farmRanking && farmRanking.ranking && farmRanking.ranking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Farm Performance Ranking</CardTitle>
            <CardDescription>Sorted by {sortBy}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2 flex-wrap">
              <Button
                onClick={() => setSortBy("revenue")}
                variant={sortBy === "revenue" ? "default" : "outline"}
                size="sm"
              >
                Revenue
              </Button>
              <Button
                onClick={() => setSortBy("profit")}
                variant={sortBy === "profit" ? "default" : "outline"}
                size="sm"
              >
                Profit
              </Button>
            </div>

            <div className="space-y-3">
              {farmRanking.ranking.map((farm, idx) => (
                <div
                  key={farm.farmId}
                  onClick={() => handleFarmClick(farm.farmId)}
                  className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 font-bold text-blue-700">
                    {farm.rank}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold hover:text-blue-600 transition-colors">{farm.farmName}</h3>
                    <p className="text-sm text-gray-600">{farm.farmType} • {farm.sizeHectares} ha</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold">GHS {farm.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
