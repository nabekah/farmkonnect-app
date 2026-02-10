import React, { useState } from 'react';
import { Users, TrendingUp, AlertCircle, Settings, BarChart3, MessageSquare, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'disputes' | 'reports' | 'analytics' | 'settings'>('overview');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  // Fetch admin data
  const { data: overviewData } = trpc.admin.getDashboardOverview.useQuery();
  const { data: usersData } = trpc.admin.getUsers.useQuery({ limit: 10 });
  const { data: transactionsData } = trpc.admin.getTransactions.useQuery({ limit: 10 });
  const { data: disputesData } = trpc.admin.getDisputes.useQuery({ limit: 10 });
  const { data: reportsData } = trpc.admin.getReports.useQuery({ limit: 10 });
  const { data: analyticsData } = trpc.admin.getAnalytics.useQuery({ period: 'monthly' });
  const { data: settingsData } = trpc.admin.getSettings.useQuery();

  // Mutations
  const suspendUserMutation = trpc.admin.suspendUser.useMutation();
  const resolveDisputeMutation = trpc.admin.resolveDispute.useMutation();
  const actionReportMutation = trpc.admin.actionReport.useMutation();

  const handleSuspendUser = async (userId: number) => {
    await suspendUserMutation.mutateAsync({
      userId,
      reason: 'Violation of terms of service',
    });
  };

  const handleResolveDispute = async (disputeId: number) => {
    await resolveDisputeMutation.mutateAsync({
      disputeId,
      resolution: 'partial_refund',
      refundAmount: 50000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, transactions, and platform settings</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'disputes', label: 'Disputes', icon: '⚖️' },
              { id: 'reports', label: 'Reports', icon: '🚩' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && overviewData && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: overviewData.stats.totalUsers, icon: '👥' },
                { label: 'Active Users', value: overviewData.stats.activeUsers, icon: '✓' },
                { label: 'Total Farms', value: overviewData.stats.totalFarms, icon: '🌾' },
                { label: 'Transactions', value: overviewData.stats.totalTransactions, icon: '💳' },
                { label: 'Total Revenue', value: `₦${(overviewData.stats.totalRevenue / 1000000).toFixed(1)}M`, icon: '💰' },
                { label: 'Monthly Growth', value: `${overviewData.stats.monthlyGrowth}%`, icon: '📈' },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className="text-3xl">{stat.icon}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewData.recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {activity.amount && (
                        <span className="font-bold text-green-600">₦{activity.amount.toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && usersData && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Transactions</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{user.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.transactions}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            Suspend
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && transactionsData && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionsData.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-sm text-gray-600">{tx.userName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₦{tx.amount.toLocaleString()}</p>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && disputesData && (
          <Card>
            <CardHeader>
              <CardTitle>Dispute Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {disputesData.disputes.map((dispute: any) => (
                  <div key={dispute.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{dispute.description}</p>
                        <p className="text-sm text-gray-600">{dispute.claimant} vs {dispute.respondent}</p>
                      </div>
                      <Badge variant={dispute.status === 'open' ? 'destructive' : 'secondary'}>
                        {dispute.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount: ₦{dispute.amount.toLocaleString()}</span>
                      {dispute.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={() => handleResolveDispute(dispute.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && reportsData && (
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportsData.reports.map((report: any) => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{report.subject}</p>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      <Badge variant={report.priority === 'high' ? 'destructive' : 'secondary'}>
                        {report.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Reported by: {report.reporter}</span>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analyticsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analyticsData.metrics).map(([key, value]: any) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData.topProducts.map((product: any) => (
                      <div key={product.name} className="flex justify-between text-sm">
                        <span>{product.name}</span>
                        <span className="font-bold">{product.sales} sales</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settingsData && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Platform Configuration</h3>
                <div className="space-y-2">
                  {Object.entries(settingsData.platform).map(([key, value]: any) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{key}</span>
                      {typeof value === 'boolean' ? (
                        <input type="checkbox" checked={value} className="w-4 h-4" />
                      ) : (
                        <span className="font-medium text-gray-900">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Fees & Commissions</h3>
                <div className="space-y-2">
                  {Object.entries(settingsData.fees).map(([key, value]: any) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{key}</span>
                      <input
                        type="number"
                        defaultValue={value}
                        className="w-20 px-2 py-1 border rounded text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
