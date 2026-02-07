import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DailyHoursData {
  date: string;
  hours: number;
}

interface PerformanceTrendsChartProps {
  dailyHours: DailyHoursData[];
}

export function PerformanceTrendsChart({ dailyHours }: PerformanceTrendsChartProps) {
  // Calculate week-over-week data
  const weekOverWeekData = useMemo(() => {
    if (!dailyHours || dailyHours.length === 0) return [];

    const weeks = new Map<number, number[]>();

    dailyHours.forEach((item) => {
      const date = new Date(item.date);
      const weekNumber = getWeekNumber(date);
      if (!weeks.has(weekNumber)) {
        weeks.set(weekNumber, []);
      }
      weeks.get(weekNumber)!.push(item.hours);
    });

    return Array.from(weeks.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([week, hours]) => ({
        week: `Week ${week}`,
        totalHours: parseFloat(hours.reduce((a, b) => a + b, 0).toFixed(2)),
        avgHours: parseFloat((hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(2)),
        days: hours.length,
      }));
  }, [dailyHours]);

  // Calculate month-over-month data
  const monthOverMonthData = useMemo(() => {
    if (!dailyHours || dailyHours.length === 0) return [];

    const months = new Map<string, number[]>();

    dailyHours.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months.has(monthKey)) {
        months.set(monthKey, []);
      }
      months.get(monthKey)!.push(item.hours);
    });

    return Array.from(months.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, hours]) => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        return {
          month: monthName,
          totalHours: parseFloat(hours.reduce((a, b) => a + b, 0).toFixed(2)),
          avgHours: parseFloat((hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(2)),
          days: hours.length,
        };
      });
  }, [dailyHours]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (weekOverWeekData.length < 2) {
      return {
        weekTrend: 0,
        weekTrendDirection: 'stable' as const,
        monthTrend: 0,
        monthTrendDirection: 'stable' as const,
      };
    }

    const lastWeek = weekOverWeekData[weekOverWeekData.length - 1];
    const prevWeek = weekOverWeekData[weekOverWeekData.length - 2];
    const weekTrend = ((lastWeek.totalHours - prevWeek.totalHours) / prevWeek.totalHours) * 100;

    let monthTrend = 0;
    let monthTrendDirection: 'up' | 'down' | 'stable' = 'stable';

    if (monthOverMonthData.length >= 2) {
      const lastMonth = monthOverMonthData[monthOverMonthData.length - 1];
      const prevMonth = monthOverMonthData[monthOverMonthData.length - 2];
      monthTrend = ((lastMonth.totalHours - prevMonth.totalHours) / prevMonth.totalHours) * 100;
    }

    return {
      weekTrend,
      weekTrendDirection: weekTrend > 0 ? 'up' : weekTrend < 0 ? 'down' : 'stable',
      monthTrend,
      monthTrendDirection: monthTrend > 0 ? 'up' : monthTrend < 0 ? 'down' : 'stable',
    };
  }, [weekOverWeekData, monthOverMonthData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>Week-over-week and month-over-month analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          </TabsList>

          {/* Weekly Trends */}
          <TabsContent value="weekly" className="space-y-4">
            {weekOverWeekData.length > 0 && (
              <>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Week Trend</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold">
                        {Math.abs(trendStats.weekTrend).toFixed(1)}%
                      </span>
                      {trendStats.weekTrendDirection === 'up' && (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                      {trendStats.weekTrendDirection === 'down' && (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Week Total</p>
                    <p className="text-2xl font-bold mt-2">
                      {weekOverWeekData[weekOverWeekData.length - 1]?.totalHours || 0}h
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weekOverWeekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}h`, 'Hours']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalHours"
                      stroke="#3b82f6"
                      name="Total Hours"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgHours"
                      stroke="#10b981"
                      name="Avg Hours/Day"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
            {weekOverWeekData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No weekly data available
              </div>
            )}
          </TabsContent>

          {/* Monthly Trends */}
          <TabsContent value="monthly" className="space-y-4">
            {monthOverMonthData.length > 0 && (
              <>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Month Trend</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold">
                        {Math.abs(trendStats.monthTrend).toFixed(1)}%
                      </span>
                      {trendStats.monthTrendDirection === 'up' && (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                      {trendStats.monthTrendDirection === 'down' && (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Month Total</p>
                    <p className="text-2xl font-bold mt-2">
                      {monthOverMonthData[monthOverMonthData.length - 1]?.totalHours || 0}h
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthOverMonthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}h`, 'Hours']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Bar dataKey="totalHours" fill="#3b82f6" name="Total Hours" />
                    <Bar dataKey="avgHours" fill="#10b981" name="Avg Hours/Day" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            {monthOverMonthData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No monthly data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Get ISO week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
