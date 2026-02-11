import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart, Activity, AlertCircle, TrendingUp, Users, Server, Database } from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * Admin Analytics Dashboard
 * System health, user activity, API performance, and error monitoring
 */
export const AdminAnalytics: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'health' | 'activity' | 'performance' | 'errors'>('health');
  const [refreshInterval, setRefreshInterval] = useState<number>(30);

  // Fetch system health metrics
  const { data: healthData, isLoading: healthLoading } = trpc.adminAnalytics.getSystemHealth.useQuery();

  // Fetch user activity
  const { data: activityData, isLoading: activityLoading } = trpc.adminAnalytics.getUserActivity.useQuery({
    days: 30,
    limit: 50,
  });

  // Fetch API performance
  const { data: performanceData, isLoading: performanceLoading } = trpc.adminAnalytics.getApiPerformance.useQuery();

  // Fetch error metrics
  const { data: errorData, isLoading: errorLoading } = trpc.adminAnalytics.getErrorMetrics.useQuery({
    days: 7,
  });

  // Fetch realtime metrics
  const { data: realtimeData, isLoading: realtimeLoading } = trpc.adminAnalytics.getRealtimeMetrics.useQuery();

  // Fetch system stats
  const { data: statsData, isLoading: statsLoading } = trpc.adminAnalytics.getSystemStats.useQuery();

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System health, user activity, and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground mt-2">{statsData?.statistics?.users || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Farms</p>
              <p className="text-2xl font-bold text-foreground mt-2">{statsData?.statistics?.farms || 0}</p>
            </div>
            <Database className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Animals</p>
              <p className="text-2xl font-bold text-foreground mt-2">{statsData?.statistics?.animals || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{healthData?.status === 'healthy' ? 'Healthy' : 'Error'}</p>
            </div>
            <Server className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Metric Selection Tabs */}
      <div className="flex gap-2 border-b border-border">
        {['health', 'activity', 'performance', 'errors'].map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedMetric === metric
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Health Metrics */}
      {selectedMetric === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-600">{healthData?.status || 'Loading...'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium text-foreground">{Math.round((healthData?.uptime || 0) / 3600)} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Memory Usage</span>
                <span className="text-sm font-medium text-foreground">
                  {Math.round((healthData?.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resource Counts</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Farms</span>
                <span className="text-sm font-medium text-foreground">{healthData?.metrics?.totalFarms || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Animals</span>
                <span className="text-sm font-medium text-foreground">{healthData?.metrics?.totalAnimals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <span className="text-sm font-medium text-foreground">{healthData?.metrics?.totalExpenses || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Activity */}
      {selectedMetric === 'activity' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Activity (Last 30 Days)</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold text-foreground mt-2">{activityData?.totalActions || 0}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground mt-2">{activityData?.activeUsers || 0}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Actions/User</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {activityData?.activeUsers ? Math.round((activityData?.totalActions || 0) / activityData.activeUsers) : 0}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* API Performance */}
      {selectedMetric === 'performance' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">API Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(performanceData?.metrics || {}).map(([key, value]) => (
              <div key={key} className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-lg font-bold text-foreground mt-2">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Metrics */}
      {selectedMetric === 'errors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Error Summary (Last 7 Days)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Errors</span>
                <span className="text-sm font-medium text-red-600">{errorData?.totalErrors || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="text-sm font-medium text-red-600">{errorData?.errorRate || '0%'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Errors</h3>
            <div className="space-y-2">
              {(errorData?.topErrors || []).map(([error, count]) => (
                <div key={error} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">{error}</span>
                  <span className="text-sm font-medium text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Realtime Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Real-time Metrics (Last Hour)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Actions</p>
            <p className="text-2xl font-bold text-foreground mt-2">{realtimeData?.lastHour?.totalActions || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{realtimeData?.lastHour?.successfulActions || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{realtimeData?.lastHour?.failedActions || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold text-foreground mt-2">{realtimeData?.lastHour?.successRate || '0%'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
