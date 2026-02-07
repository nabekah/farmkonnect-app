import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, AlertCircle, Award, Download, FileText, Printer } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { usePerformanceUpdates, PerformanceUpdate } from '@/hooks/usePerformanceUpdates';
import { exportPerformanceCSV, exportPerformanceJSON, exportPerformanceHTML, printPerformanceReport } from '@/lib/performanceExport';

interface WorkerMetric {
  userId: number;
  totalHours: string;
  totalEntries: number;
  avgDuration: string;
  lastActive: Date;
}

export default function WorkerPerformanceDashboard() {
  const [farmId, setFarmId] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [workerMetrics, setWorkerMetrics] = useState<Map<number, WorkerMetric>>(new Map());

  const { data: logsData, isLoading } = trpc.fieldWorker.getTimeTrackerLogs.useQuery({
    farmId,
    startDate,
    endDate,
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  // Initialize metrics from initial data
  const initialMetrics = useMemo(() => {
    const metricsMap = new Map<number, WorkerMetric>();
    
    if (logsData && Array.isArray(logsData)) {
      (logsData as any[]).forEach((log: any) => {
        const userId = log.userId;
        if (!metricsMap.has(userId)) {
          metricsMap.set(userId, {
            userId,
            totalHours: '0',
            totalEntries: 0,
            avgDuration: '0',
            lastActive: new Date(),
          });
        }

        const metric = metricsMap.get(userId)!;
        const duration = log.durationMinutes || 0;
        const totalMinutes = parseFloat(metric.totalHours) * 60 + duration;
        const totalEntries = metric.totalEntries + 1;

        metric.totalHours = (totalMinutes / 60).toFixed(2);
        metric.totalEntries = totalEntries;
        metric.avgDuration = (totalMinutes / totalEntries).toFixed(0);
        metric.lastActive = new Date(log.clockInTime);
      });
    }

    return metricsMap;
  }, [logsData]);

  // Initialize worker metrics on mount
  useMemo(() => {
    setWorkerMetrics(initialMetrics);
  }, [initialMetrics]);

  // Handle real-time performance updates
  const handlePerformanceUpdate = useCallback((update: PerformanceUpdate) => {
    setWorkerMetrics((prev) => {
      const newMetrics = new Map(prev);
      const existing = newMetrics.get(update.userId);

      if (existing) {
        const totalMinutes = parseFloat(existing.totalHours) * 60 + update.avgDuration;
        const totalEntries = existing.totalEntries + update.totalEntries;

        newMetrics.set(update.userId, {
          userId: update.userId,
          totalHours: (totalMinutes / 60).toFixed(2),
          totalEntries,
          avgDuration: (totalMinutes / totalEntries).toFixed(0),
          lastActive: update.lastActive,
        });
      } else {
        newMetrics.set(update.userId, {
          userId: update.userId,
          totalHours: (update.totalHours).toFixed(2),
          totalEntries: update.totalEntries,
          avgDuration: update.avgDuration.toFixed(0),
          lastActive: update.lastActive,
        });
      }

      return newMetrics;
    });
  }, []);

  // Set up real-time updates
  usePerformanceUpdates({
    onUpdate: handlePerformanceUpdate,
    enabled: true,
  });

  // Calculate daily hours distribution
  const dailyHours = useMemo(() => {
    if (!logsData || !Array.isArray(logsData)) return [];

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
    if (!logsData || !Array.isArray(logsData)) return [];

    const activityMap = new Map<string, number>();
    (logsData as any[]).forEach(() => {
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

  // Export performance data as CSV
  const handleExportCSV = useCallback(() => {
    const metrics = Array.from(workerMetrics.values());
    const headers = ['Worker ID', 'Total Hours', 'Total Entries', 'Avg Duration (min)', 'Last Active'];
    const rows = metrics.map((m) => [
      m.userId,
      m.totalHours,
      m.totalEntries,
      m.avgDuration,
      m.lastActive.toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [workerMetrics]);

  const performanceArray = Array.from(workerMetrics.values());
  const totalHours = performanceArray.reduce((sum, m) => sum + parseFloat(m.totalHours), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Worker Performance Dashboard</h1>
          <p className="text-muted-foreground">Real-time tracking and analytics for worker productivity</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => exportPerformanceCSV(performanceArray)}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            onClick={() => exportPerformanceJSON(performanceArray, dailyHours)}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            JSON
          </Button>
          <Button
            onClick={() => exportPerformanceHTML(performanceArray, dailyHours)}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            HTML
          </Button>
          <Button
            onClick={() => printPerformanceReport(performanceArray, dailyHours)}
            variant="outline"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
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
              <Button
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                variant="outline"
                className="w-full"
              >
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
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
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
            <div className="text-2xl font-bold">{performanceArray.length}</div>
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
              {performanceArray.length > 0
                ? (performanceArray.reduce((sum, m) => sum + parseFloat(m.avgDuration), 0) / performanceArray.length).toFixed(0)
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
              {performanceArray.reduce((sum, m) => sum + m.totalEntries, 0)}
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
              <CardDescription>Detailed metrics for each worker (Real-time updates)</CardDescription>
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
                    {performanceArray.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No performance data available
                        </td>
                      </tr>
                    ) : (
                      performanceArray.map((metric) => (
                        <tr key={metric.userId} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{metric.userId}</td>
                          <td className="py-2 px-4">{metric.totalHours}h</td>
                          <td className="py-2 px-4">{metric.totalEntries}</td>
                          <td className="py-2 px-4">{metric.avgDuration}m</td>
                          <td className="py-2 px-4">
                            {metric.lastActive.toLocaleDateString()}
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
