import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface CampaignMetrics {
  campaignName: string;
  status: 'running' | 'completed' | 'paused';
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  startTime: string;
  progress: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CampaignMonitorUI() {
  const [campaigns] = useState<CampaignMetrics[]>([
    {
      campaignName: 'Weekly Newsletter',
      status: 'running',
      totalRecipients: 1250,
      sent: 1200,
      delivered: 1180,
      opened: 850,
      clicked: 320,
      bounced: 20,
      unsubscribed: 5,
      startTime: '2026-02-14 09:00 AM',
      progress: 96,
    },
    {
      campaignName: 'Harvest Reminder',
      status: 'completed',
      totalRecipients: 850,
      sent: 850,
      delivered: 840,
      opened: 720,
      clicked: 280,
      bounced: 10,
      unsubscribed: 2,
      startTime: '2026-02-13 06:00 AM',
      progress: 100,
    },
  ]);

  const [selectedCampaign] = useState<CampaignMetrics>(campaigns[0]);

  const deliveryData = [
    { name: 'Delivered', value: selectedCampaign.delivered, percentage: Math.round((selectedCampaign.delivered / selectedCampaign.sent) * 100) },
    { name: 'Bounced', value: selectedCampaign.bounced, percentage: Math.round((selectedCampaign.bounced / selectedCampaign.sent) * 100) },
    { name: 'Unsubscribed', value: selectedCampaign.unsubscribed, percentage: Math.round((selectedCampaign.unsubscribed / selectedCampaign.sent) * 100) },
  ];

  const engagementData = [
    { name: 'Sent', value: selectedCampaign.sent },
    { name: 'Delivered', value: selectedCampaign.delivered },
    { name: 'Opened', value: selectedCampaign.opened },
    { name: 'Clicked', value: selectedCampaign.clicked },
  ];

  const timelineData = [
    { time: '09:00', sent: 200, delivered: 195, opened: 0 },
    { time: '09:30', sent: 250, delivered: 245, opened: 45 },
    { time: '10:00', sent: 300, delivered: 295, opened: 120 },
    { time: '10:30', sent: 250, delivered: 245, opened: 185 },
    { time: '11:00', sent: 200, delivered: 200, opened: 250 },
  ];

  const calculateMetric = (value: number, total: number) => {
    return Math.round((value / total) * 100);
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Monitor</h1>
        <p className="text-gray-600 mt-1">Real-time monitoring of active campaigns</p>
      </div>

      {/* Active Campaign Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{selectedCampaign.campaignName}</CardTitle>
              <CardDescription>Started at {selectedCampaign.startTime}</CardDescription>
            </div>
            <Badge className={selectedCampaign.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {selectedCampaign.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Delivery Progress</span>
                <span className="text-sm font-semibold">{selectedCampaign.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${selectedCampaign.progress}%` }}
                />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-blue-600">{selectedCampaign.totalRecipients}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-purple-600">{selectedCampaign.sent}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{selectedCampaign.delivered}</p>
                <p className="text-xs text-gray-500">{calculateMetric(selectedCampaign.delivered, selectedCampaign.sent)}%</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600">Opened</p>
                <p className="text-2xl font-bold text-orange-600">{selectedCampaign.opened}</p>
                <p className="text-xs text-gray-500">{calculateMetric(selectedCampaign.opened, selectedCampaign.delivered)}%</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-600">Clicked</p>
                <p className="text-2xl font-bold text-red-600">{selectedCampaign.clicked}</p>
                <p className="text-xs text-gray-500">{calculateMetric(selectedCampaign.clicked, selectedCampaign.opened)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Delivery Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Funnel Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Engagement Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-time Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="opened" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{campaign.campaignName}</p>
                  <p className="text-sm text-gray-600">{campaign.sent}/{campaign.totalRecipients} sent</p>
                </div>
                <div className="text-right">
                  <Badge className={campaign.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {campaign.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">{calculateMetric(campaign.delivered, campaign.sent)}% delivered</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
