import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Leaf } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Analytics() {
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30");

  // Queries
  const { data: farms = [] } = trpc.farms.list.useQuery();
  const { data: cropCycles = [] } = trpc.crops.cycles.list.useQuery({ farmId: 1 });
  const { data: livestock = [] } = trpc.animals.list.useQuery({ farmId: 1 });
  const { data: products = [] } = trpc.marketplace.listProducts.useQuery({ limit: 100 });
  const { data: orders = [] } = trpc.marketplace.listOrders.useQuery({ role: "seller" });

  // Calculate analytics data
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalLivestock = livestock.length;
  const healthyLivestock = livestock.filter((l: any) => l.healthStatus === "healthy").length;
  const sickLivestock = livestock.filter((l: any) => l.healthStatus === "sick").length;
  const underTreatmentLivestock = livestock.filter((l: any) => l.healthStatus === "under_treatment").length;
  const totalCropCycles = cropCycles.length;
  const activeCropCycles = cropCycles.filter((c: any) => c.status === "active").length;

  // Crop Yield Trends Data
  const cropYieldData = {
    labels: cropCycles.slice(0, 10).map((cycle: any) => cycle.varietyName || "Unknown"),
    datasets: [
      {
        label: "Yield (kg)",
        data: cropCycles.slice(0, 10).map((cycle: any) => parseFloat(cycle.actualYield || 0)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Livestock Health Metrics Data
  const livestockHealthData = {
    labels: ["Healthy", "Sick", "Under Treatment"],
    datasets: [
      {
        label: "Livestock Count",
        data: [
          livestock.filter((l: any) => l.healthStatus === "healthy").length,
          livestock.filter((l: any) => l.healthStatus === "sick").length,
          livestock.filter((l: any) => l.healthStatus === "under_treatment").length,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Marketplace Sales Performance Data
  const salesData = {
    labels: orders.slice(0, 10).map((order: any) => 
      order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
    ),
    datasets: [
      {
        label: "Sales Amount (₹)",
        data: orders.slice(0, 10).map((order: any) => parseFloat(order.totalAmount || 0)),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Product Category Distribution
  const categoryData = {
    labels: ["Vegetables", "Dairy", "Meat", "Grains", "Fruits", "Other"],
    datasets: [
      {
        label: "Products by Category",
        data: [
          products.filter((p: any) => p.category === "Vegetables").length,
          products.filter((p: any) => p.category === "Dairy").length,
          products.filter((p: any) => p.category === "Meat").length,
          products.filter((p: any) => p.category === "Grains").length,
          products.filter((p: any) => p.category === "Fruits").length,
          products.filter((p: any) => !["Vegetables", "Dairy", "Meat", "Grains", "Fruits"].includes(p.category)).length,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights across all farm operations</p>
        </div>
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label>Farm</Label>
            <Select value={selectedFarm} onValueChange={setSelectedFarm}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                {farms.map((farm: any) => (
                  <SelectItem key={farm.id} value={String(farm.id)}>
                    {farm.farmName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Crop Cycles</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCropCycles}</div>
            <p className="text-xs text-muted-foreground">of {totalCropCycles} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Livestock Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLivestock}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              -2 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="crops" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crops">Crop Analytics</TabsTrigger>
          <TabsTrigger value="livestock">Livestock Analytics</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Crop Yield Trends</CardTitle>
                <CardDescription>Actual yields from recent crop cycles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line data={cropYieldData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Crop Cycle Status</CardTitle>
                <CardDescription>Distribution of crop cycle statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: ["Active", "Completed", "Harvested"],
                      datasets: [
                        {
                          data: [
                            cropCycles.filter((c: any) => c.status === "active").length,
                            cropCycles.filter((c: any) => c.status === "completed").length,
                            cropCycles.filter((c: any) => c.status === "harvested").length,
                          ],
                          backgroundColor: [
                            "rgba(75, 192, 192, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 206, 86, 0.6)",
                          ],
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="livestock" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Livestock Health Status</CardTitle>
                <CardDescription>Current health distribution of livestock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar data={livestockHealthData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Livestock by Type</CardTitle>
                <CardDescription>Distribution of animal types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: ["Cattle", "Poultry", "Goats", "Sheep", "Other"],
                      datasets: [
                        {
                          data: [
                            livestock.filter((l: any) => l.animalType === "cattle").length,
                            livestock.filter((l: any) => l.animalType === "poultry").length,
                            livestock.filter((l: any) => l.animalType === "goat").length,
                            livestock.filter((l: any) => l.animalType === "sheep").length,
                            livestock.filter((l: any) => !["cattle", "poultry", "goat", "sheep"].includes(l.animalType)).length,
                          ],
                          backgroundColor: [
                            "rgba(255, 99, 132, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 206, 86, 0.6)",
                            "rgba(75, 192, 192, 0.6)",
                            "rgba(153, 102, 255, 0.6)",
                          ],
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Recent order values over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar data={salesData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Product Category Distribution</CardTitle>
                <CardDescription>Products listed by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut data={categoryData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue from marketplace sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Line
                    data={{
                      labels: orders.slice(0, 12).map((order: any) => 
                        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
                      ),
                      datasets: [
                        {
                          label: "Revenue (₹)",
                          data: orders.slice(0, 12).map((order: any) => parseFloat(order.totalAmount || 0)),
                          borderColor: "rgb(75, 192, 192)",
                          backgroundColor: "rgba(75, 192, 192, 0.2)",
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
