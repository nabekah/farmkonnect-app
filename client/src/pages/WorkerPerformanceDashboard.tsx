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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: logsData, isLoading } = trpc.fieldWorker.getTimeTrackerLogs.useQuery({
    farmId,
    startDate,
    endDate,
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  // Calculate worker performance metrics
  const workerMetrics = useMemo(() => {
    if (!logsData?.entries) return [];

    const metricsMap = new Map<string, any>();

    logsData.entries.forEach((entry: any) => {
      const key = `${entry.workerId}-${entry.workerName}`;
      if (!metricsMap.has(key)) {
        metricsMap.set(key, {
          workerId: entry.workerId,
          workerName: entry.workerName,
          totalHours: 0,
          totalEntries: 0,
          avgDuration: 0,
          activityTypes: new Set<string>(),
          lastActive: null,
        });
      }

      const metrics = metricsMap.get(key);
      metrics.totalHours += (entry.duration || 0) / 60;
      metrics.totalEntries += 1;
      metrics.activityTypes.add(entry.activityType);
      metrics.lastActive = entry.date;
    });

    return Array.from(metricsMap.values())
      .map((m) => ({
        ...m,
        avgDuration: (m.totalHours * 60) / m.totalEntries,
        activityTypes: m.activityTypes.size,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [logsData]);

  // Calculate activity type distribution
  const activityDistribution = useMemo(() => {
    if (!logsData?.entries) return [];

    const distributionMap = new Map<string, number>();
    logsData.entries.forEach((entry: any) => {
      const current = distributionMap.get(entry.activityType) || 0;
      distributionMap.set(entry.activityType, current + (entry.duration || 0));
    });

    return Array.from(distributionMap.entries())
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value: Math.round(value / 60), // Convert to hours
      }))
      .sort((a, b) => b.value - a.value);
  }, [logsData]);

  // Calculate daily activity trend
  const dailyTrend = useMemo(() => {
    if (!logsData?.entries) return [];

    const trendMap = new Map<string, number>();
    logsData.entries.forEach((entry: any) => {
      const date = entry.date;
      const current = trendMap.get(date) || 0;
      trendMap.set(date, current + (entry.duration || 0) / 60);
    });

    return Array.from(trendMap.entries())
      .map(([date, hours]) => ({
        date,
        hours: Math.round(hours * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [logsData]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!logsData?.entries) return { totalHours: 0, avgHoursPerWorker: 0, totalWorkers: 0, totalActivities: 0 };

    const totalHours = logsData.entries.reduce((sum, entry: any) => sum + (entry.duration || 0) / 60, 0);
    const totalWorkers = new Set(logsData.entries.map((e: any) => e.workerId)).size;
    const totalActivities = logsData.entries.length;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      avgHoursPerWorker: totalWorkers > 0 ? Math.round((totalHours / totalWorkers) * 10) / 10 : 0,
      totalWorkers,
      totalActivities,
    };
  }, [logsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading worker performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Worker Performance Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track worker productivity and activity metrics</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Farm ID</Label>
                <Input
                  type="number"
                  value={farmId}
                  onChange={(e) => setFarmId(parseInt(e.target.value) || 1)}
                  placeholder="Farm ID"
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalHours}</div>
              <p className="text-xs text-muted-foreground mt-1">Hours logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Workers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalWorkers}</div>
              <p className="text-xs text-muted-foreground mt-1">Workers on farm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Hours/Worker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgHoursPerWorker}</div>
              <p className="text-xs text-muted-foreground mt-1">Average per worker</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalActivities}</div>
              <p className="text-xs text-muted-foreground mt-1">Log entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Worker Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Hours</CardTitle>
              <CardDescription>Total hours logged per worker</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workerMetrics.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workerName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalHours" fill="#3b82f6" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>Time spent on each activity type</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}h`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Activity Trend</CardTitle>
              <CardDescription>Hours logged per day (last 14 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" name="Hours" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Worker Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Worker Performance Details</CardTitle>
            <CardDescription>Individual worker metrics and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4 font-semibold">Worker Name</th>
                    <th className="text-right py-2 px-4 font-semibold">Total Hours</th>
                    <th className="text-right py-2 px-4 font-semibold">Entries</th>
                    <th className="text-right py-2 px-4 font-semibold">Avg Duration</th>
                    <th className="text-right py-2 px-4 font-semibold">Activity Types</th>
                    <th className="text-left py-2 px-4 font-semibold">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {workerMetrics.map((worker, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{worker.workerName}</td>
                      <td className="text-right py-3 px-4 font-semibold">{worker.totalHours.toFixed(1)}h</td>
                      <td className="text-right py-3 px-4">{worker.totalEntries}</td>
                      <td className="text-right py-3 px-4">{Math.round(worker.avgDuration)} min</td>
                      <td className="text-right py-3 px-4">{worker.activityTypes}</td>
                      <td className="py-3 px-4 text-muted-foreground">{worker.lastActive || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {workerMetrics.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No worker data available for the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
