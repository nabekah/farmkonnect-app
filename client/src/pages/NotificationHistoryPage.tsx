import React, { useState, useMemo } from 'react';
import { trpc } from '../lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Bell, Mail, MessageSquare, Download, Filter, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationRecord {
  id: number;
  type: string;
  channel: 'push' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  recipient: string;
  subject: string;
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}

const notificationTypes = [
  'breeding_reminder',
  'vaccination_reminder',
  'harvest_reminder',
  'stock_alert',
  'weather_alert',
  'order_update',
  'iot_alert',
  'training_reminder',
];

const channels = [
  { value: 'push', label: 'Push Notification', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
];

const statuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
];

export default function NotificationHistoryPage() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');

  // Mock data - in production, this would come from tRPC
  const mockNotifications: NotificationRecord[] = [
    {
      id: 1,
      type: 'breeding_reminder',
      channel: 'push',
      status: 'delivered',
      recipient: 'user@example.com',
      subject: 'Breeding reminder for Cow #123',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'stock_alert',
      channel: 'email',
      status: 'delivered',
      recipient: 'user@example.com',
      subject: 'Low stock alert: Feed inventory below threshold',
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: 'weather_alert',
      channel: 'sms',
      status: 'delivered',
      recipient: '+1234567890',
      subject: 'Severe weather alert: Heavy rain expected',
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'vaccination_reminder',
      channel: 'push',
      status: 'pending',
      recipient: 'user@example.com',
      subject: 'Vaccination reminder for Sheep #456',
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      type: 'harvest_reminder',
      channel: 'email',
      status: 'failed',
      recipient: 'user@example.com',
      subject: 'Harvest reminder for Corn crop',
      sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      errorMessage: 'Invalid email address',
    },
  ];

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let result = [...mockNotifications];

    if (selectedType) {
      result = result.filter((n) => n.type === selectedType);
    }

    if (selectedChannel) {
      result = result.filter((n) => n.channel === selectedChannel);
    }

    if (selectedStatus) {
      result = result.filter((n) => n.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.subject.toLowerCase().includes(query) ||
          n.recipient.toLowerCase().includes(query)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((n) => new Date(n.sentAt).getTime() >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      result = result.filter((n) => new Date(n.sentAt).getTime() <= to);
    }

    // Sort
    result.sort((a, b) => {
      const timeA = new Date(a.sentAt).getTime();
      const timeB = new Date(b.sentAt).getTime();
      return sortBy === 'date-desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [
    selectedType,
    selectedChannel,
    selectedStatus,
    searchQuery,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedType('');
    setSelectedChannel('');
    setSelectedStatus('');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    selectedType || selectedChannel || selectedStatus || searchQuery || dateFrom || dateTo;

  const getChannelIcon = (channel: string) => {
    const ch = channels.find((c) => c.value === channel);
    return ch ? ch.icon : Bell;
  };

  const getStatusColor = (status: string) => {
    const s = statuses.find((st) => st.value === status);
    return s ? s.color : '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Notification History</h1>
          <p className="text-gray-600">View and track all notifications sent to you</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter notifications by type, channel, status, and date range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <Input
                placeholder="Search by subject or recipient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getNotificationTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Channel Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Channel</label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All channels</SelectItem>
                    {channels.map((ch) => (
                      <SelectItem key={ch.value} value={ch.value}>
                        {ch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {statuses.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort</label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date From */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredNotifications.length}</span> of{' '}
            <span className="font-semibold">{mockNotifications.length}</span> notifications
          </p>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Notifications Table */}
        {filteredNotifications.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Delivered At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => {
                      const ChannelIcon = getChannelIcon(notification.channel);
                      const statusColor = getStatusColor(notification.status);

                      return (
                        <TableRow key={notification.id}>
                          <TableCell className="font-medium">
                            {getNotificationTypeLabel(notification.type)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ChannelIcon className="w-4 h-4 text-gray-500" />
                              <span className="capitalize">{notification.channel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {notification.recipient}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {notification.subject}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColor}>
                              {notification.status === 'failed' && (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {statuses.find((s) => s.value === notification.status)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(notification.sentAt)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {notification.deliveredAt
                              ? formatDate(notification.deliveredAt)
                              : notification.status === 'failed'
                              ? notification.errorMessage || 'Failed'
                              : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No notifications found matching your filters. Try adjusting your search criteria.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {[
            {
              label: 'Total Sent',
              value: mockNotifications.length,
              color: 'bg-blue-50 border-blue-200',
            },
            {
              label: 'Delivered',
              value: mockNotifications.filter((n) => n.status === 'delivered').length,
              color: 'bg-green-50 border-green-200',
            },
            {
              label: 'Pending',
              value: mockNotifications.filter((n) => n.status === 'pending').length,
              color: 'bg-yellow-50 border-yellow-200',
            },
            {
              label: 'Failed',
              value: mockNotifications.filter((n) => n.status === 'failed').length,
              color: 'bg-red-50 border-red-200',
            },
          ].map((stat, index) => (
            <Card key={index} className={`border ${stat.color}`}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
