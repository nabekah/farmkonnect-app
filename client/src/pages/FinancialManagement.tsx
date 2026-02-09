import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Plus,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

/**
 * Financial Management & Accounting Component
 * Comprehensive farm financial management and reporting
 */
export const FinancialManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "expenses" | "revenue" | "budget" | "forecast" | "reports" | "tax"
  >("dashboard");
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");

  // Mock financial data
  const dashboard = {
    totalRevenue: 45000,
    totalExpenses: 28000,
    netProfit: 17000,
    profitMargin: 37.8,
    cashFlow: 12000,
    outstandingPayments: 3500,
    pendingInvoices: 5200,
    metrics: {
      revenueGrowth: 12.5,
      expenseGrowth: 8.3,
      profitGrowth: 18.7,
    },
  };

  // Mock expenses
  const expenses = [
    {
      id: 1,
      date: "2026-02-08",
      category: "Equipment Maintenance",
      description: "Tractor oil change and filter replacement",
      amount: 500,
      vendor: "Ghana Equipment Services",
      status: "paid",
    },
    {
      id: 2,
      date: "2026-02-07",
      category: "Inputs",
      description: "NPK Fertilizer - 100 bags",
      amount: 4500,
      vendor: "Ghana Agricultural Supplies",
      status: "paid",
    },
    {
      id: 3,
      date: "2026-02-06",
      category: "Labor",
      description: "Worker wages - February",
      amount: 8000,
      vendor: "Internal",
      status: "pending",
    },
    {
      id: 4,
      date: "2026-02-05",
      category: "Utilities",
      description: "Water and electricity",
      amount: 1200,
      vendor: "Utility Provider",
      status: "paid",
    },
  ];

  // Mock revenue
  const revenue = [
    {
      id: 1,
      date: "2026-02-08",
      source: "Tomato Sales",
      product: "Organic Tomatoes (5kg)",
      quantity: 50,
      unitPrice: 45,
      total: 2250,
      buyer: "Accra Market",
      status: "paid",
    },
    {
      id: 2,
      date: "2026-02-07",
      source: "Maize Sales",
      product: "Fresh Maize (10kg)",
      quantity: 30,
      unitPrice: 35,
      total: 1050,
      buyer: "Kumasi Wholesaler",
      status: "paid",
    },
    {
      id: 3,
      date: "2026-02-06",
      source: "Lettuce Sales",
      product: "Organic Lettuce (2kg)",
      quantity: 80,
      unitPrice: 25,
      total: 2000,
      buyer: "Restaurant Chain",
      status: "pending",
    },
  ];

  // Mock budget data
  const budgetData = [
    {
      category: "Inputs",
      budgeted: 6000,
      actual: 5500,
      variance: 500,
      status: "under",
    },
    {
      category: "Labor",
      budgeted: 8000,
      actual: 8200,
      variance: -200,
      status: "over",
    },
    {
      category: "Equipment",
      budgeted: 2500,
      actual: 2000,
      variance: 500,
      status: "under",
    },
    {
      category: "Utilities",
      budgeted: 1500,
      actual: 1400,
      variance: 100,
      status: "under",
    },
  ];

  // Mock forecast
  const forecast = [
    { month: 1, revenue: 45000, expenses: 28000, profit: 17000 },
    { month: 2, revenue: 48000, expenses: 29000, profit: 19000 },
    { month: 3, revenue: 52000, expenses: 30000, profit: 22000 },
    { month: 4, revenue: 50000, expenses: 29500, profit: 20500 },
    { month: 5, revenue: 55000, expenses: 31000, profit: 24000 },
    { month: 6, revenue: 58000, expenses: 32000, profit: 26000 },
  ];

  // Mock tax data
  const taxData = {
    totalIncome: 200000,
    totalDeductions: 120000,
    taxableIncome: 80000,
    estimatedTax: 12000,
    taxRate: 15,
    paymentSchedule: [
      { quarter: 1, dueDate: "2026-04-15", amount: 3000, status: "pending" },
      { quarter: 2, dueDate: "2026-07-15", amount: 3000, status: "pending" },
      { quarter: 3, dueDate: "2026-10-15", amount: 3000, status: "pending" },
      { quarter: 4, dueDate: "2027-01-15", amount: 3000, status: "pending" },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive farm accounting and financial planning</p>
          </div>
          <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
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
            onClick={() => setViewMode("revenue")}
            variant={viewMode === "revenue" ? "default" : "outline"}
            className={viewMode === "revenue" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Revenue
          </Button>
          <Button
            onClick={() => setViewMode("expenses")}
            variant={viewMode === "expenses" ? "default" : "outline"}
            className={viewMode === "expenses" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Expenses
          </Button>
          <Button
            onClick={() => setViewMode("budget")}
            variant={viewMode === "budget" ? "default" : "outline"}
            className={viewMode === "budget" ? "bg-blue-600 text-white" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Budget
          </Button>
          <Button
            onClick={() => setViewMode("forecast")}
            variant={viewMode === "forecast" ? "default" : "outline"}
            className={viewMode === "forecast" ? "bg-blue-600 text-white" : ""}
          >
            <PieChart className="w-4 h-4 mr-2" />
            Forecast
          </Button>
          <Button
            onClick={() => setViewMode("tax")}
            variant={viewMode === "tax" ? "default" : "outline"}
            className={viewMode === "tax" ? "bg-blue-600 text-white" : ""}
          >
            Tax
          </Button>
          <Button
            onClick={() => setViewMode("reports")}
            variant={viewMode === "reports" ? "default" : "outline"}
            className={viewMode === "reports" ? "bg-blue-600 text-white" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-semibold">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-900">GH₵{dashboard.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {dashboard.metrics.revenueGrowth}% growth
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-semibold">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-900">GH₵{dashboard.totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-red-700 mt-2 flex items-center gap-1">
                      <ArrowDownLeft className="w-3 h-3" />
                      {dashboard.metrics.expenseGrowth}% growth
                    </p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">Net Profit</p>
                    <p className="text-3xl font-bold text-blue-900">GH₵{dashboard.netProfit.toLocaleString()}</p>
                    <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {dashboard.metrics.profitGrowth}% growth
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-semibold">Profit Margin</p>
                    <p className="text-3xl font-bold text-purple-900">{dashboard.profitMargin}%</p>
                    <p className="text-xs text-purple-700 mt-2">Healthy margin</p>
                  </div>
                  <PieChart className="w-12 h-12 text-purple-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Cash Flow Summary */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cash Flow Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Current Cash Flow</p>
                  <p className="text-2xl font-bold text-blue-600">GH₵{dashboard.cashFlow.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Outstanding Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">GH₵{dashboard.outstandingPayments.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Pending Invoices</p>
                  <p className="text-2xl font-bold text-green-600">GH₵{dashboard.pendingInvoices.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Revenue View */}
        {viewMode === "revenue" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Revenue Transactions</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Record Revenue
              </Button>
            </div>

            {revenue.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-bold text-gray-900">{item.source}</p>
                        <p className="text-sm text-gray-600">{item.product}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                      <div>
                        <p className="text-gray-600 text-xs">Date</p>
                        <p className="font-semibold text-gray-900">{item.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Quantity</p>
                        <p className="font-semibold text-gray-900">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Unit Price</p>
                        <p className="font-semibold text-gray-900">GH₵{item.unitPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Total</p>
                        <p className="font-bold text-green-600">GH₵{item.total}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Expenses View */}
        {viewMode === "expenses" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Expense Transactions</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Record Expense
              </Button>
            </div>

            {expenses.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-bold text-gray-900">{item.category}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-gray-600 text-xs">Date</p>
                        <p className="font-semibold text-gray-900">{item.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Vendor</p>
                        <p className="font-semibold text-gray-900">{item.vendor}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Amount</p>
                        <p className="font-bold text-red-600">GH₵{item.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Budget View */}
        {viewMode === "budget" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Budget vs Actual</h2>

            {budgetData.map((item) => (
              <Card key={item.category} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-bold text-gray-900">{item.category}</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === "under"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status === "under" ? "Under" : "Over"} Budget
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-gray-600 text-sm">Budgeted</p>
                    <p className="font-bold text-gray-900">GH₵{item.budgeted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Actual</p>
                    <p className="font-bold text-gray-900">GH₵{item.actual}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Variance</p>
                    <p className={`font-bold ${item.status === "under" ? "text-green-600" : "text-red-600"}`}>
                      GH₵{Math.abs(item.variance)}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.status === "under" ? "bg-green-600" : "bg-red-600"}`}
                    style={{ width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Forecast View */}
        {viewMode === "forecast" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6-Month Financial Forecast</h2>

            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Expenses</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((item) => (
                      <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">Month {item.month}</td>
                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                          GH₵{item.revenue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600 font-semibold">
                          GH₵{item.expenses.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-blue-600 font-bold">
                          GH₵{item.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tax View */}
        {viewMode === "tax" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tax Summary</h2>

            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-blue-600">GH₵{taxData.totalIncome.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Taxable Income</p>
                  <p className="text-2xl font-bold text-yellow-600">GH₵{taxData.taxableIncome.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Estimated Tax</p>
                  <p className="text-2xl font-bold text-red-600">GH₵{taxData.estimatedTax.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quarterly Tax Payments</h3>
              <div className="space-y-3">
                {taxData.paymentSchedule.map((payment) => (
                  <div key={payment.quarter} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Q{payment.quarter} {new Date().getFullYear()}</p>
                      <p className="text-sm text-gray-600">Due: {payment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">GH₵{payment.amount}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Reports View */}
        {viewMode === "reports" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Income Statement", description: "Revenue and expenses summary" },
                { title: "Balance Sheet", description: "Assets, liabilities, and equity" },
                { title: "Cash Flow Statement", description: "Cash inflows and outflows" },
                { title: "Profit & Loss", description: "Net profit calculation" },
              ].map((report) => (
                <Card key={report.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{report.title}</p>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      CSV
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement;
