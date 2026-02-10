import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface DeliveryMetrics {
  total: number;
  delivered: number;
  pending: number;
  failed: number;
  successRate: number;
  averageRetries: number;
}

interface NotificationTrend {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
}

interface ChannelMetrics {
  channel: 'push' | 'email' | 'sms';
  sent: number;
  delivered: number;
  failed: number;
  successRate: number;
}

interface NotificationTypeMetrics {
  type: string;
  sent: number;
  delivered: number;
  failed: number;
  successRate: number;
}

// Sample data - in production, this would come from the API
const SAMPLE_METRICS: DeliveryMetrics = {
  total: 1250,
  delivered: 1087,
  pending: 95,
  failed: 68,
  successRate: 86.96,
  averageRetries: 1.2,
};

const SAMPLE_TRENDS: NotificationTrend[] = [
  { date: 'Mon', sent: 180, delivered: 156, failed: 12 },
  { date: 'Tue', sent: 220, delivered: 195, failed: 15 },
  { date: 'Wed', sent: 195, delivered: 172, failed: 10 },
  { date: 'Thu', sent: 240, delivered: 210, failed: 18 },
  { date: 'Fri', sent: 210, delivered: 185, failed: 14 },
  { date: 'Sat', sent: 160, delivered: 140, failed: 8 },
  { date: 'Sun', sent: 145, delivered: 129, failed: 7 },
];

const CHANNEL_METRICS: ChannelMetrics[] = [
  { channel: 'push', sent: 500, delivered: 450, failed: 20, successRate: 90 },
  { channel: 'email', sent: 450, delivered: 387, failed: 35, successRate: 86 },
  { channel: 'sms', sent: 300, delivered: 250, failed: 13, successRate: 83.33 },
];

const NOTIFICATION_TYPES: NotificationTypeMetrics[] = [
  { type: 'Breeding Reminder', sent: 250, delivered: 220, failed: 15, successRate: 88 },
  { type: 'Vaccination Reminder', sent: 200, delivered: 175, failed: 12, successRate: 87.5 },
  { type: 'Harvest Reminder', sent: 300, delivered: 270, failed: 18, successRate: 90 },
  { type: 'Stock Alert', sent: 200, delivered: 165, failed: 15, successRate: 82.5 },
  { type: 'Weather Alert', sent: 150, delivered: 135, failed: 8, successRate: 90 },
  { type: 'Order Update', sent: 150, delivered: 122, failed: 0, successRate: 81.33 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function NotificationDeliveryTrackingDashboard() {
  const [selectedChannel, setSelectedChannel] = useState<'push' | 'email' | 'sms' | 'all'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const filteredChannelMetrics = useMemo(() => {
    if (selectedChannel === 'all') {
      return CHANNEL_METRICS;
    }
    return CHANNEL_METRICS.filter((m) => m.channel === selectedChannel);
  }, [selectedChannel]);

  const chartData = useMemo(() => {
    return SAMPLE_TRENDS;
  }, []);

  const pieData = [
    { name: 'Delivered', value: SAMPLE_METRICS.delivered, color: '#10b981' },
    { name: 'Pending', value: SAMPLE_METRICS.pending, color: '#f59e0b' },
    { name: 'Failed', value: SAMPLE_METRICS.failed, color: '#ef4444' },
  ];

  const channelPieData = CHANNEL_METRICS.map((m) => ({
    name: m.channel.toUpperCase(),
    value: m.sent,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notification Delivery Tracking</h1>
          <p className="text-slate-600">Monitor notification delivery success rates, trends, and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm font-medium">Total Sent</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{SAMPLE_METRICS.total}</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">All Time</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{SAMPLE_METRICS.delivered}</p>
                <p className="text-xs text-slate-500 mt-1">{SAMPLE_METRICS.successRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-yellow-600 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{SAMPLE_METRICS.pending}</p>
                <p className="text-xs text-slate-500 mt-1">{((SAMPLE_METRICS.pending / SAMPLE_METRICS.total) * 100).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-red-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{SAMPLE_METRICS.failed}</p>
                <p className="text-xs text-slate-500 mt-1">{((SAMPLE_METRICS.failed / SAMPLE_METRICS.total) * 100).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-blue-600 mb-2">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Avg Retries</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{SAMPLE_METRICS.averageRetries}</p>
                <p className="text-xs text-slate-500 mt-1">Per Notification</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="channels">By Channel</TabsTrigger>
            <TabsTrigger value="types">By Type</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Delivery Trend</CardTitle>
                <CardDescription>Notifications sent, delivered, and failed over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Sent" />
                    <Line type="monotone" dataKey="delivered" stroke="#10b981" name="Delivered" />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery by Channel</CardTitle>
                <CardDescription>Performance metrics for each notification channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {CHANNEL_METRICS.map((metric) => (
                    <Card key={metric.channel}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Badge className="mb-2">{metric.channel.toUpperCase()}</Badge>
                          <p className="text-2xl font-bold text-slate-900 mt-2">{metric.successRate}%</p>
                          <p className="text-xs text-slate-500 mt-1">Success Rate</p>
                          <div className="mt-3 space-y-1 text-xs">
                            <p className="text-slate-600">Sent: {metric.sent}</p>
                            <p className="text-green-600">Delivered: {metric.delivered}</p>
                            <p className="text-red-600">Failed: {metric.failed}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={CHANNEL_METRICS}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Types Tab */}
          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery by Notification Type</CardTitle>
                <CardDescription>Success rates for each notification type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {NOTIFICATION_TYPES.map((type) => (
                    <div key={type.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{type.type}</p>
                        <p className="text-xs text-slate-500">Sent: {type.sent} | Delivered: {type.delivered} | Failed: {type.failed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{type.successRate}%</p>
                        <Badge variant={type.successRate >= 90 ? 'default' : 'secondary'}>
                          {type.successRate >= 90 ? 'Excellent' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Overall notification status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Distribution</CardTitle>
                  <CardDescription>Notifications sent by channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
