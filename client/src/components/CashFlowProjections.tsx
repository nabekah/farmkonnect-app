import React, { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface CashFlowProjectionsProps {
  farmId: number;
}

export function CashFlowProjections({ farmId }: CashFlowProjectionsProps) {
  const { data: expenses } = trpc.financialAnalysis.getExpenses.useQuery(
    { farmId: farmId.toString() },
    { enabled: !!farmId }
  );

  const { data: revenue } = trpc.financialAnalysis.getRevenue.useQuery(
    { farmId: farmId.toString() },
    { enabled: !!farmId }
  );

  const projections = useMemo(() => {
    if (!expenses || !revenue) return [];

    // Calculate monthly averages
    const monthlyExpenses: Record<string, number> = {};
    const monthlyRevenue: Record<string, number> = {};

    expenses.forEach((exp: any) => {
      const date = new Date(exp.expenseDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + parseFloat(exp.amount);
    });

    revenue.forEach((rev: any) => {
      const date = new Date(rev.revenueDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(rev.amount);
    });

    // Calculate averages
    const avgExpense = Object.values(monthlyExpenses).length > 0
      ? Object.values(monthlyExpenses).reduce((a, b) => a + b, 0) / Object.values(monthlyExpenses).length
      : 0;

    const avgRevenue = Object.values(monthlyRevenue).length > 0
      ? Object.values(monthlyRevenue).reduce((a, b) => a + b, 0) / Object.values(monthlyRevenue).length
      : 0;

    // Generate 6-month projection
    const today = new Date();
    const projectionData = [];
    let cumulativeCashFlow = 0;

    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() + i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthRevenue = monthlyRevenue[monthStr] || avgRevenue;
      const monthExpense = monthlyExpenses[monthStr] || avgExpense;
      const monthCashFlow = monthRevenue - monthExpense;
      cumulativeCashFlow += monthCashFlow;

      projectionData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Math.round(monthRevenue),
        expenses: Math.round(monthExpense),
        cashFlow: Math.round(monthCashFlow),
        cumulative: Math.round(cumulativeCashFlow),
      });
    }

    return projectionData;
  }, [expenses, revenue]);

  const totalProjectedCashFlow = projections.length > 0
    ? projections[projections.length - 1].cumulative
    : 0;

  const isPositive = totalProjectedCashFlow >= 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            6-Month Cash Flow Projection
          </CardTitle>
          <CardDescription>
            Based on historical expense and revenue patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Projected Revenue</div>
                <div className="text-2xl font-bold text-blue-600">
                  GHS {projections.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Projected Expenses</div>
                <div className="text-2xl font-bold text-red-600">
                  GHS {projections.reduce((sum, p) => sum + p.expenses, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className={isPositive ? 'bg-green-50' : 'bg-red-50'}>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Net Cash Flow</div>
                <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  GHS {totalProjectedCashFlow.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {projections.length > 0 && (
            <div className="border rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `GHS ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Expenses"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Cumulative Cash Flow"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Warnings */}
          {!isPositive && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Cash Flow Alert</p>
                <p>
                  Projected cash flow is negative. Consider increasing revenue or reducing expenses.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
