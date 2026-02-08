import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

export function SpeciesProductionDashboard() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  // Fetch species templates
  const { data: speciesData } =
    trpc.multiSpecies.getSpeciesTemplates.useQuery({
      limit: 20,
    });

  // Fetch production metrics for species
  const { data: metricsData } =
    trpc.multiSpecies.getProductionMetrics.useQuery(
      { speciesId: selectedSpeciesId || 0 },
      { enabled: !!selectedSpeciesId }
    );

  // Fetch production history for animal
  const { data: historyData } =
    trpc.multiSpecies.getProductionHistory.useQuery(
      {
        animalId: selectedAnimalId || 0,
        days: parseInt(timeRange),
      },
      { enabled: !!selectedAnimalId }
    );

  const species = speciesData?.templates || [];
  const metrics = metricsData?.metrics || [];
  const history = historyData?.history || [];

  // Calculate production statistics
  const calculateStats = () => {
    if (history.length === 0) return null;

    const values = history.map((h) => parseFloat(String(h.value)));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend =
      values.length > 1
        ? values[values.length - 1] - values[0] > 0
          ? "up"
          : "down"
        : "stable";

    return { avg, max, min, trend };
  };

  const stats = calculateStats();

  // Prepare chart data
  const chartData = history.map((h, idx) => ({
    date: new Date(h.recordDate).toLocaleDateString(),
    value: parseFloat(String(h.value)),
    unit: h.unit,
  }));

  // Prepare metrics distribution data
  const metricsDistribution = metrics.map((m) => ({
    name: m.metricName,
    value: parseFloat(String(m.benchmarkAverage || 0)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Species Production Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor production metrics and performance by species
        </p>
      </div>

      {/* Species Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select Species</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {species.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSpeciesId(s.id);
                setSelectedAnimalId(null);
              }}
              className={`p-3 rounded-lg border-2 transition ${
                selectedSpeciesId === s.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="font-medium text-sm">{s.speciesName}</div>
              <div className="text-xs text-gray-600 mt-1">
                {s.productionType}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {selectedSpeciesId && (
        <>
          {/* Production Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.slice(0, 4).map((metric) => (
              <Card key={metric.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.metricName}</p>
                    <p className="text-2xl font-bold mt-1">
                      {metric.benchmarkAverage} {metric.unit}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Avg: {metric.benchmarkMin} - {metric.benchmarkMax}
                </div>
              </Card>
            ))}
          </div>

          {/* Production Statistics */}
          {stats && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Production Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold mt-1">{stats.avg.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Maximum</p>
                  <p className="text-2xl font-bold mt-1">{stats.max.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Minimum</p>
                  <p className="text-2xl font-bold mt-1">{stats.min.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Trend</p>
                  <div className="flex items-center mt-1">
                    {stats.trend === "up" ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                    <span className="ml-2 font-bold">
                      {stats.trend === "up" ? "Increasing" : "Decreasing"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Production Trend Chart */}
          {chartData.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Production Trend</h2>
                <div className="flex gap-2">
                  {(["7", "30", "90"] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}d
                    </Button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    dot={false}
                    name="Production"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Metrics Distribution */}
          {metricsDistribution.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Metrics Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metricsDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metricsDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Benchmark Comparison */}
          {metrics.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Benchmark Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metrics.slice(0, 5).map((m) => ({
                    name: m.metricName,
                    min: parseFloat(String(m.benchmarkMin || 0)),
                    avg: parseFloat(String(m.benchmarkAverage || 0)),
                    max: parseFloat(String(m.benchmarkMax || 0)),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="min" fill="#fca5a5" name="Minimum" />
                  <Bar dataKey="avg" fill="#60a5fa" name="Average" />
                  <Bar dataKey="max" fill="#34d399" name="Maximum" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
