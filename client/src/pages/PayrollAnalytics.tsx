import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PayrollAnalytics() {
  const [selectedFarm, setSelectedFarm] = useState("1");
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  // Mock data for payroll analytics
  const payrollSummary = {
    totalEmployees: 45,
    totalGrossPay: 125000,
    totalDeductions: 28500,
    totalNetPay: 96500,
    averageNetPay: 2144,
  };

  const deductionBreakdown = [
    { name: "SSNIT (5.5%)", value: 6875, fill: "#3b82f6" },
    { name: "Income Tax", value: 15200, fill: "#ef4444" },
    { name: "Health Insurance", value: 3125, fill: "#10b981" },
    { name: "Other", value: 3300, fill: "#f59e0b" },
  ];

  const payrollTrend = [
    { month: "Jan", grossPay: 120000, netPay: 92000, deductions: 28000 },
    { month: "Feb", grossPay: 122000, netPay: 93500, deductions: 28500 },
    { month: "Mar", grossPay: 125000, netPay: 96500, deductions: 28500 },
    { month: "Apr", grossPay: 123000, netPay: 94500, deductions: 28500 },
    { month: "May", grossPay: 126000, netPay: 97000, deductions: 29000 },
    { month: "Jun", grossPay: 128000, netPay: 98500, deductions: 29500 },
  ];

  const employeeDistribution = [
    { department: "Field", count: 25, salary: 45000 },
    { department: "Management", count: 8, salary: 35000 },
    { department: "Support", count: 12, salary: 25000 },
  ];

  const taxSummary = {
    totalSsnitEmployee: 6875,
    totalSsnitEmployer: 16875,
    totalIncomeTax: 15200,
    totalHealthInsurance: 3125,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Analytics</h1>
          <p className="text-gray-600">Comprehensive payroll and tax compliance dashboard</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFarm} onValueChange={setSelectedFarm}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Farm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Farm 1</SelectItem>
              <SelectItem value="2">Farm 2</SelectItem>
              <SelectItem value="3">Farm 3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollSummary.totalEmployees}</div>
            <p className="text-xs text-gray-500">Active workers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {payrollSummary.totalGrossPay.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total gross pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {payrollSummary.totalDeductions.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{((payrollSummary.totalDeductions / payrollSummary.totalGrossPay) * 100).toFixed(1)}% of gross</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {payrollSummary.totalNetPay.toLocaleString()}</div>
            <p className="text-xs text-gray-500">After deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Net Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {payrollSummary.averageNetPay.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Per employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deduction Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Deduction Breakdown</CardTitle>
            <CardDescription>Distribution of all payroll deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deductionBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: GHS ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {deductionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `GHS ${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payroll Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Trend</CardTitle>
            <CardDescription>Gross pay vs net pay over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `GHS ${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="grossPay" stroke="#3b82f6" name="Gross Pay" />
                <Line type="monotone" dataKey="netPay" stroke="#10b981" name="Net Pay" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution</CardTitle>
            <CardDescription>Workers by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Employee Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tax Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Compliance Summary</CardTitle>
            <CardDescription>Ghana tax obligations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">SSNIT (Employee 5.5%)</span>
                <span className="font-bold">GHS {taxSummary.totalSsnitEmployee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">SSNIT (Employer 13.5%)</span>
                <span className="font-bold">GHS {taxSummary.totalSsnitEmployer.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Income Tax</span>
                <span className="font-bold">GHS {taxSummary.totalIncomeTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Health Insurance</span>
                <span className="font-bold">GHS {taxSummary.totalHealthInsurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold">Total Obligations</span>
                <span className="font-bold text-lg">GHS {(taxSummary.totalSsnitEmployee + taxSummary.totalSsnitEmployer + taxSummary.totalIncomeTax + taxSummary.totalHealthInsurance).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="bg-blue-600 hover:bg-blue-700">Generate Payroll Report</Button>
        <Button variant="outline">Export to Excel</Button>
        <Button variant="outline">Tax Compliance Report</Button>
        <Button variant="outline">Payment Summary</Button>
      </div>
    </div>
  );
}
