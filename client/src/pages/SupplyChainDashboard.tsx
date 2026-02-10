import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { QrCode, MapPin, CheckCircle, AlertCircle, Package, Truck, Wifi, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSupplyChainUpdates, useWebSocketStatus } from "@/hooks/useRealtimeUpdates";

export default function SupplyChainDashboard() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const wsConnected = useWebSocketStatus();

  // Subscribe to supply chain updates via WebSocket
  useSupplyChainUpdates((data) => {
    setRecentUpdates(prev => [data, ...prev.slice(0, 9)]);
  });

  // Fetch supply chain dashboard
  const { data: dashboard, isLoading: dashboardLoading } = trpc.supplyChain.getSupplyChainDashboard.useQuery();

  // Fetch product tracking
  const { data: productTracking } = trpc.supplyChain.trackProduct.useQuery(
    { productId: selectedProductId || "" },
    { enabled: !!selectedProductId }
  );

  // Fetch blockchain verification
  const { data: blockchainData } = trpc.supplyChain.getBlockchainVerification.useQuery(
    { productId: selectedProductId || "" },
    { enabled: !!selectedProductId }
  );

  // Fetch supply chain stats
  const { data: stats } = trpc.supplyChain.getSupplyChainStats.useQuery();

  // Fetch transparency report
  const { data: transparencyReport } = trpc.supplyChain.generateTransparencyReport.useQuery(
    { productId: selectedProductId || "" },
    { enabled: !!selectedProductId }
  );

  // Prepare chart data
  const statusDistribution = dashboard ? [
    { name: "Harvested", value: dashboard.statusCounts.harvested, color: "#10b981" },
    { name: "Processing", value: dashboard.statusCounts.processing, color: "#3b82f6" },
    { name: "Packaged", value: dashboard.statusCounts.packaged, color: "#f59e0b" },
    { name: "Shipped", value: dashboard.statusCounts.shipped, color: "#8b5cf6" },
    { name: "Delivered", value: dashboard.statusCounts.delivered, color: "#06b6d4" },
  ] : [];

  const supplyChainHealth = stats ? [
    { metric: "Temperature Compliance", value: stats.supplyChainHealth.temperature_compliance },
    { metric: "Humidity Compliance", value: stats.supplyChainHealth.humidity_compliance },
    { metric: "On-Time Delivery", value: stats.supplyChainHealth.delivery_on_time },
  ] : [];

  const topCrops = stats?.topCrops || [];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600">Loading supply chain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supply Chain Dashboard</h1>
          <p className="text-gray-600">Track products from farm to buyer with blockchain verification</p>
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

      {/* Recent Real-time Updates */}
      {recentUpdates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Real-time Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {recentUpdates.map((update, idx) => (
                <div key={idx} className="text-xs text-gray-700 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Product {update.productId}: {update.status} at {update.location}</span>
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
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalProducts || 0}</div>
            <p className="text-xs text-gray-600">Registered for tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalQuantity || 0} kg</div>
            <p className="text-xs text-gray-600">All products combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageDeliveryTime || 0} days</div>
            <p className="text-xs text-gray-600">Farm to buyer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Integrity Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.integrityRate || 0}%</div>
            <p className="text-xs text-gray-600">Blockchain verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Product Status</TabsTrigger>
          <TabsTrigger value="tracking">Track Product</TabsTrigger>
          <TabsTrigger value="health">Supply Chain Health</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Product Status Distribution</CardTitle>
              <CardDescription>Current status of all tracked products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {statusDistribution.map((status) => (
                    <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <span className="text-lg font-bold">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Track Product Journey</CardTitle>
              <CardDescription>Select a product to view its complete supply chain journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recent Products */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Recent Products</label>
                <div className="space-y-2">
                  {dashboard?.recentProducts?.map((product: any) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full text-left p-3 rounded border-2 transition ${
                        selectedProductId === product.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.cropName}</p>
                          <p className="text-sm text-gray-600">{product.quantity} {product.unit}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          product.status === "delivered" ? "bg-green-100 text-green-800" :
                          product.status === "shipped" ? "bg-blue-100 text-blue-800" :
                          product.status === "packaged" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Journey */}
              {productTracking && (
                <div className="space-y-4 mt-6 pt-6 border-t">
                  <h3 className="font-semibold">Product Journey</h3>
                  <div className="space-y-3">
                    {productTracking.journey.map((step: any, index: number) => (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          {index < productTracking.journey.length - 1 && (
                            <div className="w-0.5 h-12 bg-blue-200 mt-2" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium">{step.from} → {step.to}</p>
                          <p className="text-sm text-gray-600">{new Date(step.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">📍 {step.location}</p>
                          {step.temperature && (
                            <p className="text-sm text-gray-600">🌡️ {step.temperature}°C</p>
                          )}
                          <p className="text-xs text-blue-600 mt-1 font-mono">{step.blockchainHash.slice(0, 16)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  <Button
                    onClick={() => setShowQRModal(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    View QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Health Metrics</CardTitle>
              <CardDescription>System-wide compliance and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supplyChainHealth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#3b82f6" name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplyChainHealth.map((item) => (
                  <div key={item.metric} className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">{item.metric}</p>
                    <p className="text-2xl font-bold text-blue-600">{item.value}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transparency">
          <Card>
            <CardHeader>
              <CardTitle>Transparency Report</CardTitle>
              <CardDescription>Buyer verification and product authenticity</CardDescription>
            </CardHeader>
            <CardContent>
              {transparencyReport ? (
                <div className="space-y-4">
                  {/* Product Info */}
                  <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Product Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Crop</p>
                        <p className="font-medium">{transparencyReport.cropName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-medium">{transparencyReport.quantity} {transparencyReport.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Harvest Date</p>
                        <p className="font-medium">{new Date(transparencyReport.harvestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-medium">{transparencyReport.currentStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="p-4 bg-green-50 rounded border border-green-200">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {transparencyReport.transparency.certifications.map((cert: string) => (
                        <span key={cert} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                          ✓ {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div className="p-4 bg-blue-50 rounded">
                    <h3 className="font-semibold mb-2">Quality Assessment</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{transparencyReport.transparency.qualityScore}</div>
                        <p className="text-sm text-gray-600">Quality Score</p>
                      </div>
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Temperature Maintained:</span>
                          <span className={transparencyReport.transparency.temperature_maintained ? "text-green-600 font-medium" : "text-red-600"}>
                            {transparencyReport.transparency.temperature_maintained ? "✓ Yes" : "✗ No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Humidity Maintained:</span>
                          <span className={transparencyReport.transparency.humidity_maintained ? "text-green-600 font-medium" : "text-red-600"}>
                            {transparencyReport.transparency.humidity_maintained ? "✓ Yes" : "✗ No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  Select a product to view transparency report
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Crops */}
      {topCrops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Tracked Crops</CardTitle>
            <CardDescription>Most frequently tracked products</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCrops}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Products Tracked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
