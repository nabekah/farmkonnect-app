import React from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface MultiF armDashboardSummaryProps {
  farmId: string | null;
}

export function MultiF armDashboardSummary({ farmId }: MultiF armDashboardSummaryProps) {
  const { data: kpis, isLoading } = trpc.financialAnalysis.getKPIs?.useQuery?.(
    { farmId: farmId || 'all' },
    { enabled: true }
  ) || { data: null, isLoading: false };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = kpis?.kpis?.[0]?.value || 0;
  const totalExpenses = kpis?.kpis?.[1]?.value || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('en-GH', {
              style: 'currency',
              currency: 'GHS',
              minimumFractionDigits: 0,
            }).format(totalRevenue)}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {farmId ? 'Selected farm' : 'All farms combined'}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('en-GH', {
              style: 'currency',
              currency: 'GHS',
              minimumFractionDigits: 0,
            }).format(totalExpenses)}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {farmId ? 'Selected farm' : 'All farms combined'}
          </p>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Net Profit</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {new Intl.NumberFormat('en-GH', {
              style: 'currency',
              currency: 'GHS',
              minimumFractionDigits: 0,
            }).format(netProfit)}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {farmId ? 'Selected farm' : 'All farms combined'}
          </p>
        </CardContent>
      </Card>

      {/* Profit Margin */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Profit Margin</span>
            <Badge variant={parseFloat(profitMargin as string) >= 0 ? 'default' : 'destructive'}>
              {profitMargin}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profitMargin}%</div>
          <p className="text-xs text-gray-600 mt-2">
            {parseFloat(profitMargin as string) >= 20 ? 'Healthy margin' : 'Monitor closely'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
