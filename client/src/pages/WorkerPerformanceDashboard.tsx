import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, AlertCircle, Award } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function WorkerPerformanceDashboard() {
  const [farmId, setFarmId] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data: logsData, isLoading } = trpc.fieldWorker.getTimeTrackerLogs.useQuery({
    farmId,
    startDate,
    endDate,
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  // Calculate performance metrics from time tracker logs
  const performanceMetrics = useMemo(() => {
    if (!logsData || typeof logsData !== 'object' || !Array.isArray(logsData)) {
      return [];
    }

    const metricsMap = new Map<number, any>();

    (logsData as any[]).forEach((log: any) => {
      const userId = log.userId;
      if (!metricsMap.has(userId)) {
        metricsMap.set(userId, {
          userId,
          totalMinutes: 0,
          totalEntries: 0,
          avgDuration: 0,
          lastActive: null,
        });
      }

      const metrics = metricsMap.get(userId);
      const duration = log.durationMinutes || 0;
      metrics.totalMinutes += duration;
      metrics.totalEntries += 1;
      metrics.lastActive = log.clockInTime;
    });

    return Array.from(metricsMap.values()).map((m: any) => ({
      ...m,
      totalHours: (m.totalMinutes / 60).toFixed(2),
      avgDuration: (m.totalMinutes / m.totalEntries).toFixed(0),
    }));
  }, [logsData]);

  // Calculate daily hours distribution
  const dailyHours = useMemo(() => {
    if (!logsData || typeof logsData !== 'object' || !Array.isArray(logsData)) {
      return [];
    }

    const dailyMap = new Map<string, number>();

    (logsData as any[]).forEach((log: any) => {
      const date = new Date(log.clockInTime).toLocaleDateString();
      const duration = log.durationMinutes || 0;
      dailyMap.set(date, (dailyMap.get(date) || 0) + duration / 60);
    });

    return Array.from(dailyMap.entries()).map(([date, hours]) => ({
      date,
      hours: parseFloat(hours.toFixed(2)),
    }));
  }, [logsData]);

  // Calculate activity distribution
  const activityDistribution = useMemo(() => {
    if (!logsData || typeof logsData !== 'object' || !Array.isArray(logsData)) {
      return [];
    }

    const activityMap = new Map<string, number>();
    (logsData as any[]).forEach((log: any) => {
      activityMap.set('Clock In/Out', (activityMap.get('Clock In/Out') || 0) + 1);
    });

    return Array.from(activityMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [logsData]);

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : undefined;
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Worker Performance Dashboard</h1>
        <p className="text-muted-foreground">Track and analyze worker productivity and time allocation</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.reduce((sum: number, m: any) => sum + parseFloat(m.totalHours || 0), 0).toFixed(1)}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Active Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.length > 0
                ? (performanceMetrics.reduce((sum: number, m: any) => sum + parseFloat(m.avgDuration || 0), 0) / performanceMetrics.length).toFixed(0)
                : 0}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.reduce((sum: number, m: any) => sum + m.totalEntries, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading performance data...</div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Hours Distribution</CardTitle>
                <CardDescription>Hours logged per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" name="Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Breakdown of activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Worker Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Performance Metrics</CardTitle>
              <CardDescription>Detailed metrics for each worker</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Worker ID</th>
                      <th className="text-left py-2 px-4 font-semibold">Total Hours</th>
                      <th className="text-left py-2 px-4 font-semibold">Entries</th>
                      <th className="text-left py-2 px-4 font-semibold">Avg Duration</th>
                      <th className="text-left py-2 px-4 font-semibold">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceMetrics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No performance data available
                        </td>
                      </tr>
                    ) : (
                      performanceMetrics.map((metric: any) => (
                        <tr key={metric.userId} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{metric.userId}</td>
                          <td className="py-2 px-4">{metric.totalHours}h</td>
                          <td className="py-2 px-4">{metric.totalEntries}</td>
                          <td className="py-2 px-4">{metric.avgDuration}m</td>
                          <td className="py-2 px-4">
                            {metric.lastActive
                              ? new Date(metric.lastActive).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
