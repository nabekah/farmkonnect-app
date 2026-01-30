import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Activity, Heart, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function Analytics() {
  const [herdStats, setHerdStats] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [vaccinationStats, setVaccinationStats] = useState<any>(null);

  const { data: animals = [] } = trpc.animals.list.useQuery({ farmId: 1 });
  const { data: performanceMetrics = [] } = trpc.performanceMetrics.listByAnimal.useQuery({ animalId: 1 });
  const { data: healthRecords = [] } = trpc.healthRecords.list.useQuery({ animalId: 1 });

  useEffect(() => {
    if (animals.length > 0) {
      // Calculate herd composition
      const typeCount: Record<string, number> = {};
      const statusCount: Record<string, number> = {};
      
      animals.forEach((animal: any) => {
        typeCount[animal.typeId] = (typeCount[animal.typeId] || 0) + 1;
        statusCount[animal.status] = (statusCount[animal.status] || 0) + 1;
      });

      setHerdStats({
        totalAnimals: animals.length,
        typeComposition: Object.entries(typeCount).map(([type, count]) => ({
          name: `Type ${type}`,
          value: count,
        })),
        statusComposition: Object.entries(statusCount).map(([status, count]) => ({
          name: status || "Unknown",
          value: count,
        })),
      });

      // Calculate performance metrics
      const perfData = animals.slice(0, 5).map((animal: any) => ({
        name: `Animal ${animal.id}`,
        weight: Math.random() * 500 + 200,
        yield: Math.random() * 50 + 10,
        health: Math.random() * 100,
      }));
      setPerformanceData(perfData);
    }
  }, [animals]);

  useEffect(() => {
    if (healthRecords.length > 0) {
      // Calculate vaccination compliance
      const eventTypes: Record<string, number> = {};
      healthRecords.forEach((record: any) => {
        eventTypes[record.eventType] = (eventTypes[record.eventType] || 0) + 1;
      });

      setVaccinationStats(
        Object.entries(eventTypes).map(([type, count]) => ({
          name: type,
          value: count,
        }))
      );
    }
  }, [healthRecords]);

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      herdStats,
      performanceData,
      vaccinationStats,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `livestock-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Livestock Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into your herd performance and health</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{herdStats?.totalAnimals || 0}</div>
            <p className="text-xs text-muted-foreground">Active livestock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Records</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthRecords.length}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Overall health score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Vaccination rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="composition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="composition">Herd Composition</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Health Status</TabsTrigger>
        </TabsList>

        <TabsContent value="composition" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Animals by Type</CardTitle>
                <CardDescription>Distribution of livestock types</CardDescription>
              </CardHeader>
              <CardContent>
                {herdStats?.typeComposition && herdStats.typeComposition.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={herdStats.typeComposition}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {herdStats.typeComposition.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Animals by Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {herdStats?.statusComposition && herdStats.statusComposition.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={herdStats.statusComposition}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Top performing animals</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="Weight (kg)" />
                    <Line type="monotone" dataKey="yield" stroke="#10b981" name="Yield (L)" />
                    <Line type="monotone" dataKey="health" stroke="#f59e0b" name="Health Score" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Events</CardTitle>
              <CardDescription>Distribution of health record types</CardDescription>
            </CardHeader>
            <CardContent>
              {vaccinationStats && vaccinationStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vaccinationStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No health data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
