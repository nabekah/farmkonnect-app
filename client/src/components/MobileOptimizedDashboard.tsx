import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Menu, X } from "lucide-react";

interface MobileOptimizedDashboardProps {
  summary: any;
  expenseBreakdown: any[];
  revenueBreakdown: any[];
  costPerAnimal: any;
  onAddExpense: () => void;
  onAddRevenue: () => void;
}

export const MobileOptimizedDashboard: React.FC<MobileOptimizedDashboardProps> = ({
  summary,
  expenseBreakdown,
  revenueBreakdown,
  costPerAnimal,
  onAddExpense,
  onAddRevenue
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="w-full">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b md:hidden">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">Financial Dashboard</h1>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t p-4 space-y-2">
            <Button onClick={onAddExpense} className="w-full" variant="outline">
              Add Expense
            </Button>
            <Button onClick={onAddRevenue} className="w-full" variant="outline">
              Add Revenue
            </Button>
          </div>
        )}
      </div>

      {/* Key Metrics - Compact for Mobile */}
      <div className="p-4 space-y-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  GHS {(summary?.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  GHS {(summary?.totalExpenses || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit</p>
                <p className={`text-2xl font-bold ${(summary?.profit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  GHS {(summary?.profit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Margin</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(summary?.profitMargin || 0).toFixed(1)}%
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <div className="p-4">
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="breakdown" className="text-xs">Breakdown</TabsTrigger>
            <TabsTrigger value="costs" className="text-xs">Costs</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
          </TabsList>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {expenseBreakdown && expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `GHS ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No expense data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueBreakdown && revenueBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `GHS ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No revenue data</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Animals</span>
                  <span className="font-bold">{costPerAnimal?.totalAnimals || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Cost per Animal</span>
                  <span className="font-bold">
                    GHS {(costPerAnimal?.averageCostPerAnimal || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Expenses</span>
                  <span className="font-bold">
                    GHS {(costPerAnimal?.totalExpenses || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-3">
            <Button onClick={onAddExpense} className="w-full" size="lg">
              Add Expense
            </Button>
            <Button onClick={onAddRevenue} className="w-full" size="lg" variant="outline">
              Add Revenue
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
