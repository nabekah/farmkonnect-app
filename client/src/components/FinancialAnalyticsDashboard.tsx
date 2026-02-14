'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Calendar } from 'lucide-react';

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CropProfitability {
  crop: string;
  revenue: number;
  expenses: number;
  profit: number;
  roi: number;
}

export const FinancialAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [cropProfitability, setCropProfitability] = useState<CropProfitability[]>([]);

  useEffect(() => {
    // Simulate financial data
    const mockFinancialData: FinancialData[] = [
      { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000 },
      { month: 'Feb', revenue: 52000, expenses: 31000, profit: 21000 },
      { month: 'Mar', revenue: 48000, expenses: 29000, profit: 19000 },
      { month: 'Apr', revenue: 61000, expenses: 35000, profit: 26000 },
      { month: 'May', revenue: 58000, expenses: 32000, profit: 26000 },
      { month: 'Jun', revenue: 72000, expenses: 40000, profit: 32000 },
      { month: 'Jul', revenue: 68000, expenses: 38000, profit: 30000 },
      { month: 'Aug', revenue: 75000, expenses: 42000, profit: 33000 },
      { month: 'Sep', revenue: 70000, expenses: 39000, profit: 31000 },
      { month: 'Oct', revenue: 82000, expenses: 45000, profit: 37000 },
      { month: 'Nov', revenue: 88000, expenses: 48000, profit: 40000 },
      { month: 'Dec', revenue: 95000, expenses: 52000, profit: 43000 }
    ];
    setFinancialData(mockFinancialData);

    // Simulate expense categories
    const mockExpenseCategories: ExpenseCategory[] = [
      { name: 'Labor', amount: 420000, percentage: 28, color: '#3b82f6' },
      { name: 'Seeds & Fertilizer', amount: 315000, percentage: 21, color: '#10b981' },
      { name: 'Equipment & Maintenance', amount: 270000, percentage: 18, color: '#f59e0b' },
      { name: 'Water & Irrigation', amount: 180000, percentage: 12, color: '#06b6d4' },
      { name: 'Pesticides & Chemicals', amount: 135000, percentage: 9, color: '#ef4444' },
      { name: 'Transportation', amount: 105000, percentage: 7, color: '#8b5cf6' },
      { name: 'Other', amount: 75000, percentage: 5, color: '#6b7280' }
    ];
    setExpenseCategories(mockExpenseCategories);

    // Simulate crop profitability
    const mockCropProfitability: CropProfitability[] = [
      { crop: 'Corn', revenue: 240000, expenses: 140000, profit: 100000, roi: 71.4 },
      { crop: 'Wheat', revenue: 180000, expenses: 105000, profit: 75000, roi: 71.4 },
      { crop: 'Rice', revenue: 220000, expenses: 130000, profit: 90000, roi: 69.2 },
      { crop: 'Soybean', revenue: 160000, expenses: 95000, profit: 65000, roi: 68.4 },
      { crop: 'Cotton', revenue: 140000, expenses: 85000, profit: 55000, roi: 64.7 }
    ];
    setCropProfitability(mockCropProfitability);
  }, [selectedYear]);

  const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = financialData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#6b7280'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Analytics Dashboard</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          <option value={2022}>2022</option>
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">+12.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">${(totalExpenses / 1000).toFixed(0)}K</div>
              <div className="flex items-center gap-1 text-red-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">+8.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">${(totalProfit / 1000).toFixed(0)}K</div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">+15.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{profitMargin}%</div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">+2.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="crops">Crop Profitability</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Monthly Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenseCategories.map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${(category.amount / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crops" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crop Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cropProfitability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crop" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ROI by Crop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cropProfitability.map((crop, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{crop.crop}</p>
                      <p className="text-xs text-gray-600">Revenue: ${(crop.revenue / 1000).toFixed(0)}K | Profit: ${(crop.profit / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{crop.roi.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">ROI</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>12-Month Profit Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Actual Profit" />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Projected Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Projected Annual Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">${(totalProfit / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500 mt-2">Based on current trends</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Break-even Point</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Month 3</p>
                <p className="text-xs text-gray-500 mt-2">Cumulative profit positive</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">+18.5%</p>
                <p className="text-xs text-gray-500 mt-2">YoY growth projection</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAnalyticsDashboard;
