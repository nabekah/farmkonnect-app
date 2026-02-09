import React, { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface BudgetForecastingProps {
  farmId: string;
  budgetAmount: number;
  currentSpent: number;
  startDate: Date;
  endDate: Date;
}

export const BudgetForecasting: React.FC<BudgetForecastingProps> = ({
  farmId,
  budgetAmount,
  currentSpent,
  startDate,
  endDate
}) => {
  // Fetch expense history for forecasting
  const { data: expenses = [] } = trpc.financialManagement.getExpenses.useQuery(
    { farmId, startDate, endDate },
    { enabled: !!farmId }
  );

  // Calculate forecast data
  const forecastData = useMemo(() => {
    if (expenses.length === 0) return [];

    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate daily average spending
    const totalSpent = expenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || 0), 0);
    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;

    // Generate forecast
    const forecast = [];
    let cumulativeSpent = currentSpent;

    for (let i = 0; i <= daysRemaining; i += 7) {
      const forecastDate = new Date(today);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const weeklyForecast = cumulativeSpent + (dailyAverage * 7);
      const percentageUsed = (weeklyForecast / budgetAmount) * 100;
      const remainingBudget = Math.max(0, budgetAmount - weeklyForecast);

      forecast.push({
        date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: cumulativeSpent,
        forecast: Math.min(weeklyForecast, budgetAmount * 1.2),
        budget: budgetAmount,
        percentageUsed: Math.min(percentageUsed, 120),
        remainingBudget
      });

      cumulativeSpent = weeklyForecast;
    }

    return forecast;
  }, [expenses, budgetAmount, currentSpent, startDate, endDate]);

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    if (forecastData.length === 0) {
      return {
        riskLevel: 'low',
        projectedOverrun: 0,
        daysUntilBudgetExceeded: null,
        recommendedDailySpend: 0
      };
    }

    const lastForecast = forecastData[forecastData.length - 1];
    const projectedTotal = lastForecast.forecast;
    const projectedOverrun = Math.max(0, projectedTotal - budgetAmount);
    const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    let daysUntilExceeded = null;
    for (const data of forecastData) {
      if (data.percentageUsed >= 100) {
        daysUntilExceeded = forecastData.indexOf(data) * 7;
        break;
      }
    }

    const remainingBudget = budgetAmount - currentSpent;
    const recommendedDailySpend = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

    let riskLevel = 'low';
    if (lastForecast.percentageUsed >= 100) {
      riskLevel = 'critical';
    } else if (lastForecast.percentageUsed >= 80) {
      riskLevel = 'high';
    } else if (lastForecast.percentageUsed >= 60) {
      riskLevel = 'medium';
    }

    return {
      riskLevel,
      projectedOverrun,
      daysUntilBudgetExceeded: daysUntilExceeded,
      recommendedDailySpend: Math.max(0, recommendedDailySpend)
    };
  }, [forecastData, budgetAmount, currentSpent, endDate]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Alert */}
      {riskMetrics.riskLevel !== 'low' && (
        <Card className={`border-l-4 ${riskMetrics.riskLevel === 'critical' ? 'border-l-red-600' : riskMetrics.riskLevel === 'high' ? 'border-l-orange-600' : 'border-l-yellow-600'}`}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="flex gap-3">
              <AlertCircle className={`h-5 w-5 mt-1 ${getRiskColor(riskMetrics.riskLevel)}`} />
              <div>
                <CardTitle className="text-lg">Budget Risk Alert</CardTitle>
                <CardDescription>
                  Your spending pattern indicates a {riskMetrics.riskLevel} risk of exceeding budget
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Projected Overrun</p>
                <p className={`text-2xl font-bold ${getRiskColor(riskMetrics.riskLevel)}`}>
                  GHS {riskMetrics.projectedOverrun.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              {riskMetrics.daysUntilBudgetExceeded && (
                <div>
                  <p className="text-sm text-gray-600">Days Until Exceeded</p>
                  <p className={`text-2xl font-bold ${getRiskColor(riskMetrics.riskLevel)}`}>
                    {riskMetrics.daysUntilBudgetExceeded} days
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {currentSpent.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">
              {((currentSpent / budgetAmount) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {Math.max(0, budgetAmount - currentSpent).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">
              {(((budgetAmount - currentSpent) / budgetAmount) * 100).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommended Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {riskMetrics.recommendedDailySpend.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">To stay within budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Forecast</CardTitle>
          <CardDescription>Projected spending vs budget allocation</CardDescription>
        </CardHeader>
        <CardContent>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `GHS ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
                <Legend />
                <Area type="monotone" dataKey="forecast" stroke="#3b82f6" fillOpacity={1} fill="url(#colorForecast)" name="Forecast" />
                <Line type="monotone" dataKey="budget" stroke="#ef4444" strokeDasharray="5 5" name="Budget Limit" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data available for forecasting</p>
          )}
        </CardContent>
      </Card>

      {/* Usage Percentage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Usage Projection</CardTitle>
          <CardDescription>Percentage of budget used over time</CardDescription>
        </CardHeader>
        <CardContent>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="percentageUsed" fill="#8b5cf6" name="Usage %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data available</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Recommendations</CardTitle>
          <CardDescription>Actions to optimize your budget</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {riskMetrics.riskLevel === 'critical' && (
              <li className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Immediate Action Required</p>
                  <p className="text-sm text-red-700">Your budget is projected to be exceeded. Review and reduce spending immediately.</p>
                </div>
              </li>
            )}
            {riskMetrics.riskLevel === 'high' && (
              <li className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">Reduce Spending</p>
                  <p className="text-sm text-orange-700">Consider reducing expenses to {riskMetrics.recommendedDailySpend.toLocaleString('en-US', { maximumFractionDigits: 2 })} GHS per day.</p>
                </div>
              </li>
            )}
            {riskMetrics.riskLevel === 'medium' && (
              <li className="flex gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">Monitor Closely</p>
                  <p className="text-sm text-yellow-700">Keep an eye on spending. Maintain daily expenses at or below {riskMetrics.recommendedDailySpend.toLocaleString('en-US', { maximumFractionDigits: 2 })} GHS.</p>
                </div>
              </li>
            )}
            {riskMetrics.riskLevel === 'low' && (
              <li className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">On Track</p>
                  <p className="text-sm text-green-700">Your spending is within normal parameters. Continue monitoring your budget.</p>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetForecasting;
