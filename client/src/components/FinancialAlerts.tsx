import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  TrendingDown,
} from 'lucide-react';

interface FinancialAlertsProps {
  farmId: number;
}

interface Alert {
  id: string;
  type: 'budget_exceeded' | 'low_cash_flow' | 'unusual_spending' | 'payment_due';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  amount?: number;
  category?: string;
  dueDate?: string;
  read: boolean;
}

export function FinancialAlerts({ farmId }: FinancialAlertsProps) {
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const { data: expenses } = trpc.financialAnalysis.getExpenses.useQuery(
    { farmId: farmId.toString() },
    { enabled: !!farmId }
  );

  const { data: revenue } = trpc.financialAnalysis.getRevenue.useQuery(
    { farmId: farmId.toString() },
    { enabled: !!farmId }
  );

  const { data: budgetAlerts } = trpc.financialAnalysis.getFinancialKPIs.useQuery(
    { farmId: farmId.toString() },
    { enabled: !!farmId }
  );

  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];

    if (!expenses || !revenue) return generatedAlerts;

    // Calculate metrics
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
    const totalRevenue = revenue.reduce((sum: number, rev: any) => sum + parseFloat(rev.amount), 0);
    const cashFlow = totalRevenue - totalExpenses;

    // Alert 1: Budget Exceeded
    if (totalExpenses > totalRevenue * 1.1) {
      generatedAlerts.push({
        id: 'budget-exceeded',
        type: 'budget_exceeded',
        severity: 'critical',
        title: 'Budget Exceeded',
        description: `Expenses (GHS ${totalExpenses.toLocaleString()}) exceed revenue by ${((totalExpenses / totalRevenue - 1) * 100).toFixed(1)}%`,
        amount: totalExpenses - totalRevenue,
      });
    }

    // Alert 2: Low Cash Flow
    if (cashFlow < totalRevenue * 0.2) {
      generatedAlerts.push({
        id: 'low-cash-flow',
        type: 'low_cash_flow',
        severity: 'warning',
        title: 'Low Cash Flow',
        description: `Current cash flow is only GHS ${cashFlow.toLocaleString()}. Consider reducing expenses or increasing revenue.`,
        amount: cashFlow,
      });
    }

    // Alert 3: Unusual Spending Pattern
    const avgExpense = totalExpenses / (expenses.length || 1);
    const highExpenses = expenses.filter(
      (exp: any) => parseFloat(exp.amount) > avgExpense * 2
    );

    if (highExpenses.length > 0) {
      generatedAlerts.push({
        id: 'unusual-spending',
        type: 'unusual_spending',
        severity: 'warning',
        title: 'Unusual Spending Pattern',
        description: `${highExpenses.length} expense(s) exceed 2x the average. Review for accuracy.`,
        amount: highExpenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0),
      });
    }

    // Alert 4: Payment Due Soon
    const pendingPayments = revenue.filter(
      (rev: any) => rev.paymentStatus === 'pending' || rev.paymentStatus === 'partial'
    );

    if (pendingPayments.length > 0) {
      const pendingAmount = pendingPayments.reduce(
        (sum: number, rev: any) => sum + parseFloat(rev.amount),
        0
      );
      generatedAlerts.push({
        id: 'payment-due',
        type: 'payment_due',
        severity: 'info',
        title: 'Pending Payments',
        description: `You have GHS ${pendingAmount.toLocaleString()} in pending payments from ${pendingPayments.length} transaction(s).`,
        amount: pendingAmount,
      });
    }

    return generatedAlerts;
  }, [expenses, revenue]);

  const filteredAlerts = alerts.filter(
    (alert) => filterLevel === 'all' || alert.severity === filterLevel
  );

  const visibleAlerts = filteredAlerts.filter(
    (alert) => !dismissedAlerts.has(alert.id)
  );

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Financial Alerts
              </CardTitle>
              <CardDescription>
                Real-time alerts for your farm's financial health
              </CardDescription>
            </div>
            <div className="w-40">
              <Select value={filterLevel} onValueChange={(value: any) => setFilterLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warnings</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">All systems healthy!</p>
              <p className="text-sm text-gray-500">No alerts at this time</p>
            </div>
          ) : (
            visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 flex items-start gap-4 ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                  {alert.amount !== undefined && (
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      Amount: GHS {alert.amount.toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0"
                >
                  Dismiss
                </Button>
              </div>
            ))
          )}

          {dismissedAlerts.size > 0 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDismissedAlerts(new Set())}
              >
                Show Dismissed Alerts ({dismissedAlerts.size})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
