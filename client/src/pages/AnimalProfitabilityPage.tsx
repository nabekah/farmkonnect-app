import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";

export function AnimalProfitabilityPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedAnimalType, setSelectedAnimalType] = useState<string>("");
  const [farmId, setFarmId] = useState<string>("1");

  // Fetch farms
  const { data: farms } = trpc.livestock.getFarms.useQuery({ userId: user?.id || "" });

  // Fetch profitability analysis
  const { data: profitability, isLoading: profitabilityLoading } = trpc.animalProfitability.getProfitabilityAnalysis.useQuery(
    { farmId, period: selectedPeriod, limit: 12 },
    { enabled: !!farmId }
  );

  // Get unique periods
  const periods = Array.from(new Set(profitability?.map((p: any) => p.period) || []));
  const currentPeriod = periods[0] || "";

  // Fetch animal type comparison
  const { data: comparison } = trpc.animalProfitability.getAnimalTypeComparison.useQuery(
    { farmId, period: selectedPeriod || currentPeriod },
    { enabled: !!farmId && !!(selectedPeriod || currentPeriod) }
  );

  // Fetch trends
  const { data: trends } = trpc.animalProfitability.getAnimalTypeTrends.useQuery(
    { farmId, animalType: selectedAnimalType, periods: 12 },
    { enabled: !!farmId && !!selectedAnimalType }
  );

  // Fetch recommendations
  const { data: recommendations } = trpc.animalProfitability.getProfitabilityRecommendations.useQuery(
    { farmId, period: selectedPeriod || currentPeriod },
    { enabled: !!farmId && !!(selectedPeriod || currentPeriod) }
  );

  // Calculate mutation
  const calculateMutation = trpc.animalProfitability.calculateAnimalProfitability.useMutation();

  const handleCalculateProfitability = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();

    await calculateMutation.mutateAsync({
      farmId,
      startDate,
      endDate
    });
  };

  const comparisonData = comparison?.map((c: any) => ({
    animalType: c.animalType,
    profitMargin: Number(c.profitMargin),
    netProfit: Number(c.netProfit),
    roi: Number(c.roi),
    costPerAnimal: Number(c.costPerAnimal),
    revenuePerAnimal: Number(c.revenuePerAnimal)
  })) || [];

  const trendData = trends?.trends?.map((t: any) => ({
    period: t.period,
    profitMargin: Number(t.profitMargin),
    netProfit: Number(t.netProfit),
    roi: Number(t.roi),
    totalAnimals: t.totalAnimals
  })) || [];

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "expand":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "reduce":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Animal Profitability Analysis</h1>
        <Button onClick={handleCalculateProfitability} disabled={calculateMutation.isPending}>
          {calculateMutation.isPending ? "Calculating..." : "Calculate Profitability"}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Farm</label>
          <select
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {farms?.map((farm: any) => (
              <option key={farm.id} value={farm.id.toString()}>
                {farm.farmName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Period</label>
          <select
            value={selectedPeriod || currentPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {periods.map((period: string) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Animal Type</label>
          <select
            value={selectedAnimalType}
            onChange={(e) => setSelectedAnimalType(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            {comparison?.map((c: any) => (
              <option key={c.animalType} value={c.animalType}>
                {c.animalType}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Animal Type Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisonData.map((animal: any) => (
          <Card
            key={animal.animalType}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedAnimalType(animal.animalType)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{animal.animalType}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Profit Margin */}
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded">
                <p className="text-xs text-gray-600">Profit Margin</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-bold text-blue-600">{animal.profitMargin.toFixed(1)}%</p>
                  {animal.profitMargin > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded">
                <p className="text-xs text-gray-600">Net Profit</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  GHS {animal.netProfit.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* ROI & Cost Per Animal */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-600">ROI</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{animal.roi.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-600">Cost/Animal</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    GHS {animal.costPerAnimal.toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedAnimalType(animal.animalType)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profitability Comparison Chart */}
      {comparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profitability Comparison by Animal Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="animalType" />
                <YAxis />
                <Tooltip formatter={(value: any) => value.toFixed(2)} />
                <Legend />
                <Bar dataKey="profitMargin" fill="#3b82f6" name="Profit Margin %" />
                <Bar dataKey="roi" fill="#10b981" name="ROI %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {selectedAnimalType && trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedAnimalType} - Profitability Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trend Summary */}
            {trends?.trendAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-gray-600">Trend</p>
                  <p className="text-lg font-bold capitalize text-blue-600 mt-1">
                    {trends.trendAnalysis.profitTrend}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-gray-600">Profit Change</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {trends.trendAnalysis.profitChangePercentage > 0 ? "+" : ""}
                    {trends.trendAnalysis.profitChangePercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-gray-600">Avg Margin</p>
                  <p className="text-lg font-bold text-yellow-600 mt-1">
                    {trends.trendAnalysis.avgProfitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <p className="text-xs text-gray-600">Best Period</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">{trends.trendAnalysis.bestPeriod}</p>
                </div>
              </div>
            )}

            {/* Trend Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: any) => value.toFixed(2)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profitMargin"
                  stroke="#3b82f6"
                  name="Profit Margin %"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#10b981"
                  name="ROI %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-4 bg-white rounded border-l-4 border-yellow-400">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getRecommendationIcon(rec.type)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm capitalize">{rec.type.replace(/_/g, " ")}</p>
                      <p className="text-sm text-gray-700 mt-1">{rec.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Priority: <span className="font-semibold capitalize">{rec.priority}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!profitabilityLoading && (!comparisonData || comparisonData.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-center">
              No profitability data available. Calculate profitability to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
