import React, { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function FarmDetailedAnalytics() {
  const [, params] = useRoute("/farm/:farmId/analytics");
  const farmId = params?.farmId ? parseInt(params.farmId) : null;

  // Get farm details from portfolio
  const { data: portfolioOverview } = trpc.farmConsolidation.getPortfolioOverview.useQuery();
  const farm = portfolioOverview?.farmList.find(f => f.farmId === farmId);

  // Get consolidated data for comparison
  const { data: consolidatedFinancials } = trpc.farmConsolidation.getConsolidatedFinancials.useQuery();

  if (!farm || !consolidatedFinancials) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portfolio
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading farm details...</p>
        </div>
      </div>
    );
  }

  const profitMargin = farm.totalRevenue > 0
    ? ((farm.totalRevenue - farm.totalExpenses) / farm.totalRevenue * 100).toFixed(1)
    : 0;

  const portfolioMargin = consolidatedFinancials.totalRevenue > 0
    ? ((consolidatedFinancials.totalRevenue - consolidatedFinancials.totalExpenses) / consolidatedFinancials.totalRevenue * 100).toFixed(1)
    : 0;

  const marginDifference = parseFloat(profitMargin as string) - parseFloat(portfolioMargin as string);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold">{farm.farmName}</h1>
          <p className="text-gray-600 mt-1">{farm.farmType} • {farm.sizeHectares} hectares</p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {farm.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Farm revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {farm.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Farm expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${farm.totalRevenue - farm.totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}>
              GHS {(farm.totalRevenue - farm.totalExpenses).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Profit/Loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(profitMargin as string) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {profitMargin}%
            </div>
            <p className="text-xs text-gray-500 mt-1">vs Portfolio: {marginDifference >= 0 ? "+" : ""}{marginDifference.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Farm Comparison with Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle>Farm vs Portfolio Comparison</CardTitle>
          <CardDescription>How this farm compares to your portfolio average</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  metric: "Revenue",
                  farm: farm.totalRevenue,
                  portfolio: consolidatedFinancials.totalRevenue / consolidatedFinancials.farmCount,
                },
                {
                  metric: "Expenses",
                  farm: farm.totalExpenses,
                  portfolio: consolidatedFinancials.totalExpenses / consolidatedFinancials.farmCount,
                },
                {
                  metric: "Profit",
                  farm: farm.totalRevenue - farm.totalExpenses,
                  portfolio: (consolidatedFinancials.totalRevenue - consolidatedFinancials.totalExpenses) / consolidatedFinancials.farmCount,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip formatter={(value) => `GHS ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="farm" fill="#3b82f6" name="This Farm" />
              <Bar dataKey="portfolio" fill="#10b981" name="Portfolio Avg" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Farm Details */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Information</CardTitle>
          <CardDescription>Key details about this farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Farm Type</p>
              <p className="text-lg font-semibold">{farm.farmType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Farm Size</p>
              <p className="text-lg font-semibold">{farm.sizeHectares} hectares</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Efficiency (Revenue/Ha)</p>
              <p className="text-lg font-semibold">GHS {(farm.totalRevenue / farm.sizeHectares).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Efficiency (Profit/Ha)</p>
              <p className={`text-lg font-semibold ${(farm.totalRevenue - farm.totalExpenses) / farm.sizeHectares >= 0 ? "text-green-600" : "text-red-600"}`}>
                GHS {((farm.totalRevenue - farm.totalExpenses) / farm.sizeHectares).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>




    </div>
  );
}
