import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, ShoppingCart, Star, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export default function SellerDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Fetch seller data
  const { data: overview } = trpc.sellerDashboard.getSellerOverview.useQuery();
  const { data: analytics } = trpc.sellerDashboard.getSalesAnalytics.useQuery({ period });
  const { data: products } = trpc.sellerDashboard.getProductPerformance.useQuery({ limit: 10 });
  const { data: inventory } = trpc.sellerDashboard.getInventoryStatus.useQuery();
  const { data: feedback } = trpc.sellerDashboard.getCustomerFeedback.useQuery();
  const { data: campaigns } = trpc.sellerDashboard.getPromotionalCampaigns.useQuery();
  const { data: payouts } = trpc.sellerDashboard.getPayoutHistory.useQuery();

  if (!overview) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your products and sales</p>
        </div>
        <Button className="gap-2">
          <Package className="w-4 h-4" />
          Add New Product
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overview.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sold This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overview.soldThisMonth}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₦{(overview.revenue.thisMonth / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 mt-1">↑ {overview.revenue.growth}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{overview.rating}</p>
                <p className="text-xs text-gray-600 mt-1">{overview.reviews} reviews</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sales Trend</CardTitle>
              <div className="flex gap-2">
                {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod(p)}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analytics && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.data.map((value, index) => ({ name: `Day ${index + 1}`, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Inventory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {inventory && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventory.categories}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {inventory.categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        {/* Top Products */}
        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products?.topProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.sold} sold</p>
                      <p className="text-sm text-gray-600">₦{(product.revenue / 1000000).toFixed(1)}M</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Orders */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{order.product}</h4>
                      <p className="text-sm text-gray-600">From {order.buyer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₦{order.total.toLocaleString()}</p>
                      <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Feedback */}
        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback?.recentReviews.map((review: any) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{review.buyer}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.campaigns.map((campaign: any) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <Badge>{campaign.discount}% OFF</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Impressions</p>
                        <p className="font-bold text-gray-900">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clicks</p>
                        <p className="font-bold text-gray-900">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Conversions</p>
                        <p className="font-bold text-gray-900">{campaign.conversions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">₦{(payouts?.totalEarnings / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Payout</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">₦{(payouts?.pendingPayout / 1000000).toFixed(2)}M</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Next Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-2">In 3 days</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Recent Payouts</h4>
            {payouts?.payouts.map((payout: any) => (
              <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">₦{(payout.amount / 1000000).toFixed(2)}M</p>
                  <p className="text-sm text-gray-600">{payout.method}</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
