import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Package, TrendingUp, DollarSign, Plus, UserPlus, Share2, Wifi, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useMarketplaceUpdates, useWebSocketStatus } from "@/hooks/useRealtimeUpdates";

export default function CooperativeDashboard() {
  const [selectedCooperativeId, setSelectedCooperativeId] = useState<number>(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [marketplaceUpdates, setMarketplaceUpdates] = useState<any[]>([]);
  const wsConnected = useWebSocketStatus();

  // Subscribe to marketplace updates via WebSocket
  useMarketplaceUpdates((data) => {
    setMarketplaceUpdates(prev => [data, ...prev.slice(0, 4)]);
  });

  // Fetch cooperative dashboard
  const { data: cooperative, isLoading: coopLoading } = trpc.cooperative.getCooperativeDashboard.useQuery(
    { cooperativeId: selectedCooperativeId },
    { enabled: !!selectedCooperativeId }
  );

  // Fetch members
  const { data: members } = trpc.cooperative.getMembers.useQuery(
    { cooperativeId: selectedCooperativeId },
    { enabled: !!selectedCooperativeId }
  );

  // Fetch shared resources
  const { data: resources } = trpc.cooperative.getSharedResources.useQuery(
    { cooperativeId: selectedCooperativeId },
    { enabled: !!selectedCooperativeId }
  );

  // Fetch marketplace
  const { data: marketplace } = trpc.cooperative.getCooperativeMarketplace.useQuery(
    { cooperativeId: selectedCooperativeId },
    { enabled: !!selectedCooperativeId }
  );

  // Fetch analytics
  const { data: analytics } = trpc.cooperative.getCooperativeAnalytics.useQuery(
    { cooperativeId: selectedCooperativeId },
    { enabled: !!selectedCooperativeId }
  );

  // Create cooperative mutation
  const createCooperative = trpc.cooperative.createCooperative.useMutation();

  // Add member mutation
  const addMember = trpc.cooperative.addMember.useMutation();

  const handleCreateCooperative = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createCooperative.mutateAsync({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        location: formData.get("location") as string,
      });
      setShowCreateModal(false);
      setSelectedCooperativeId(result.cooperativeId);
    } catch (error) {
      console.error("Error creating cooperative:", error);
    }
  };

  // Prepare chart data
  const memberGrowthData = [
    { month: "Jan", members: 5 },
    { month: "Feb", members: 8 },
    { month: "Mar", members: 12 },
    { month: "Apr", members: 15 },
    { month: "May", members: 18 },
    { month: "Jun", members: 22 },
  ];

  const revenueDistributionData = [
    { member: "Member 1", revenue: 45000 },
    { member: "Member 2", revenue: 38000 },
    { member: "Member 3", revenue: 52000 },
    { member: "Member 4", revenue: 41000 },
    { member: "Member 5", revenue: 48000 },
  ];

  const resourceUtilizationData = [
    { name: "Utilized", value: 65, color: "#10b981" },
    { name: "Available", value: 35, color: "#e5e7eb" },
  ];

  if (coopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600">Loading cooperative data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cooperative Management</h1>
          <p className="text-gray-600">Manage shared resources, members, and revenue distribution</p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
              <Wifi className="h-4 w-4" />
              Live Updates
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
              <WifiOff className="h-4 w-4" />
              Offline
            </div>
          )}
        </div>
      </div>

      {/* Marketplace Updates */}
      {marketplaceUpdates.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Marketplace Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-20 overflow-y-auto">
              {marketplaceUpdates.map((update, idx) => (
                <div key={idx} className="text-xs text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>Product {update.productId}: {update.action} - ₦{update.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cooperative?.memberCount || 0}</div>
            <p className="text-xs text-gray-600">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cooperative?.resourceCount || 0}</div>
            <p className="text-xs text-gray-600">Shared assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{cooperative?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-600">All members combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Total Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cooperative?.totalShares || 0}</div>
            <p className="text-xs text-gray-600">Equity units</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Member Growth Trend</CardTitle>
                <CardDescription>Cooperative expansion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={2} name="Active Members" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Shared asset usage rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resourceUtilizationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resourceUtilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cooperative Members</CardTitle>
                  <CardDescription>Manage member information and roles</CardDescription>
                </div>
                <Button onClick={() => setShowAddMemberModal(true)} size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members?.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">Member #{member.userId}</p>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                        <span>Shares: {member.sharesOwned}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          member.role === "founder" ? "bg-purple-100 text-purple-800" :
                          member.role === "admin" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₦{member.contribution?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-600">Contribution</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Shared Resources</CardTitle>
              <CardDescription>Equipment and assets available for member use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources?.resources?.map((resource: any) => (
                  <div key={resource.id} className="p-4 border rounded-lg hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{resource.name}</p>
                        <p className="text-sm text-gray-600">{resource.type}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {resource.type}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Quantity:</span>
                        <span className="font-medium">{resource.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{resource.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rental Price:</span>
                        <span className="font-medium">₦{resource.rentalPrice}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium text-xs">{resource.owner}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Rent Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Cooperative Marketplace</CardTitle>
              <CardDescription>Products from member farms available for purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplace?.products?.map((product: any) => (
                  <div key={product.id} className="p-4 border rounded-lg hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.producer}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        product.quality === "Grade A" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {product.quality}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{product.quantity} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-lg">₦{product.price}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-3">
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Income by member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="member" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Cooperative health indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.analytics && (
                  <>
                    <div className="p-4 bg-blue-50 rounded">
                      <p className="text-sm text-gray-600">Member Growth</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.analytics.memberGrowth}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                      <p className="text-sm text-gray-600">Resource Utilization</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.analytics.resourceUtilization.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded">
                      <p className="text-sm text-gray-600">Avg Contribution</p>
                      <p className="text-2xl font-bold text-purple-600">₦{analytics.analytics.averageContribution.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded">
                      <p className="text-sm text-gray-600">Total Assets</p>
                      <p className="text-2xl font-bold text-orange-600">{analytics.analytics.totalAssets}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
