import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface FarmComparisonReportProps {
  selectedFarms: string[];
}

export function FarmComparisonReport({ selectedFarms }: FarmComparisonReportProps) {
  const [comparisonMetric, setComparisonMetric] = useState<'revenue' | 'expenses' | 'profit'>('revenue');

  // Mock data for comparison
  const comparisonData = selectedFarms.map((farmId, index) => ({
    farm: `Farm ${index + 1}`,
    revenue: Math.random() * 500000 + 100000,
    expenses: Math.random() * 300000 + 50000,
    profit: Math.random() * 200000 + 20000,
  }));

  const calculateMetrics = (data: typeof comparisonData) => {
    return data.map((farm) => ({
      ...farm,
      profitMargin: farm.revenue > 0 ? ((farm.profit / farm.revenue) * 100).toFixed(1) : 0,
      expenseRatio: farm.revenue > 0 ? ((farm.expenses / farm.revenue) * 100).toFixed(1) : 0,
    }));
  };

  const metricsData = calculateMetrics(comparisonData);
  const topPerformer = metricsData.reduce((prev, current) =>
    current.profit > prev.profit ? current : prev
  );

  return (
    <div className="space-y-6">
      {/* Comparison Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant={comparisonMetric === 'revenue' ? 'default' : 'outline'}
              onClick={() => setComparisonMetric('revenue')}
              className="w-full"
            >
              Revenue
            </Button>
            <Button
              variant={comparisonMetric === 'expenses' ? 'default' : 'outline'}
              onClick={() => setComparisonMetric('expenses')}
              className="w-full"
            >
              Expenses
            </Button>
            <Button
              variant={comparisonMetric === 'profit' ? 'default' : 'outline'}
              onClick={() => setComparisonMetric('profit')}
              className="w-full"
            >
              Profit
            </Button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="farm" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('en-GH', {
                    style: 'currency',
                    currency: 'GHS',
                    minimumFractionDigits: 0,
                  }).format(value as number)
                }
              />
              <Legend />
              {comparisonMetric === 'revenue' && <Bar dataKey="revenue" fill="#10b981" />}
              {comparisonMetric === 'expenses' && <Bar dataKey="expenses" fill="#ef4444" />}
              {comparisonMetric === 'profit' && <Bar dataKey="profit" fill="#3b82f6" />}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4">Farm</th>
                  <th className="text-right py-2 px-4">Revenue</th>
                  <th className="text-right py-2 px-4">Expenses</th>
                  <th className="text-right py-2 px-4">Profit</th>
                  <th className="text-right py-2 px-4">Profit Margin</th>
                  <th className="text-right py-2 px-4">Expense Ratio</th>
                </tr>
              </thead>
              <tbody>
                {metricsData.map((farm, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {farm.farm}
                      {farm.farm === topPerformer.farm && (
                        <Badge className="ml-2" variant="default">
                          Top
                        </Badge>
                      )}
                    </td>
                    <td className="text-right py-3 px-4">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 0,
                      }).format(farm.revenue)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 0,
                      }).format(farm.expenses)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={farm.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {new Intl.NumberFormat('en-GH', {
                          style: 'currency',
                          currency: 'GHS',
                          minimumFractionDigits: 0,
                        }).format(farm.profit)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {parseFloat(farm.profitMargin as string) >= 20 ? (
                          <ArrowUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-600" />
                        )}
                        {farm.profitMargin}%
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{farm.expenseRatio}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="farm" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('en-GH', {
                    style: 'currency',
                    currency: 'GHS',
                    minimumFractionDigits: 0,
                  }).format(value as number)
                }
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
