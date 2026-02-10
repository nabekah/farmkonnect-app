import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ComparisonData {
  farm: string;
  season: string;
  cropType: string;
  predictedYield: number;
  actualYield?: number;
  accuracy: number;
  confidence: number;
  diseaseRisk: number;
  marketPrice: number;
}

export default function PredictionComparisonTool() {
  const [selectedFarms, setSelectedFarms] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [comparisonType, setComparisonType] = useState<"farms" | "seasons" | "crops">("farms");
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockComparisonData: ComparisonData[] = [
    {
      farm: "Farm A",
      season: "2024 Spring",
      cropType: "Maize",
      predictedYield: 3.5,
      actualYield: 3.8,
      accuracy: 92,
      confidence: 0.85,
      diseaseRisk: 0.15,
      marketPrice: 185,
    },
    {
      farm: "Farm B",
      season: "2024 Spring",
      cropType: "Maize",
      predictedYield: 3.2,
      actualYield: 3.1,
      accuracy: 97,
      confidence: 0.88,
      diseaseRisk: 0.22,
      marketPrice: 180,
    },
    {
      farm: "Farm A",
      season: "2024 Summer",
      cropType: "Maize",
      predictedYield: 4.1,
      actualYield: 4.3,
      accuracy: 95,
      confidence: 0.82,
      diseaseRisk: 0.18,
      marketPrice: 195,
    },
    {
      farm: "Farm B",
      season: "2024 Summer",
      cropType: "Maize",
      predictedYield: 3.8,
      actualYield: 3.9,
      accuracy: 97,
      confidence: 0.85,
      diseaseRisk: 0.25,
      marketPrice: 190,
    },
  ];

  const farms = Array.from(new Set(mockComparisonData.map((d) => d.farm)));
  const seasons = Array.from(new Set(mockComparisonData.map((d) => d.season)));

  const getFilteredData = () => {
    let filtered = mockComparisonData;

    if (selectedFarms.length > 0) {
      filtered = filtered.filter((d) => selectedFarms.includes(d.farm));
    }

    if (selectedSeasons.length > 0) {
      filtered = filtered.filter((d) => selectedSeasons.includes(d.season));
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  const calculateStats = () => {
    if (filteredData.length === 0) return null;

    const avgAccuracy = (filteredData.reduce((sum, d) => sum + d.accuracy, 0) / filteredData.length).toFixed(1);
    const avgConfidence = (filteredData.reduce((sum, d) => sum + d.confidence, 0) / filteredData.length * 100).toFixed(1);
    const avgDiseaseRisk = (filteredData.reduce((sum, d) => sum + d.diseaseRisk, 0) / filteredData.length * 100).toFixed(1);
    const avgYield = (filteredData.reduce((sum, d) => sum + d.predictedYield, 0) / filteredData.length).toFixed(2);

    return { avgAccuracy, avgConfidence, avgDiseaseRisk, avgYield };
  };

  const stats = calculateStats();

  const handleToggleFarm = (farm: string) => {
    setSelectedFarms((prev) =>
      prev.includes(farm) ? prev.filter((f) => f !== farm) : [...prev, farm]
    );
  };

  const handleToggleSeason = (season: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );
  };

  const handleExportComparison = () => {
    // TODO: Implement export functionality
    alert("Export comparison data to CSV");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prediction Comparison Tool</h1>
        <p className="text-gray-600 mt-2">Compare predictions across farms, seasons, and crops to identify patterns and optimize strategies</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Filters</CardTitle>
          <CardDescription>Select farms and seasons to compare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Farm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Farms</label>
              <div className="space-y-2">
                {farms.map((farm) => (
                  <label key={farm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFarms.includes(farm)}
                      onChange={() => handleToggleFarm(farm)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{farm}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Season Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Seasons</label>
              <div className="space-y-2">
                {seasons.map((season) => (
                  <label key={season} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSeasons.includes(season)}
                      onChange={() => handleToggleSeason(season)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{season}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Average Accuracy</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.avgAccuracy}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Average Confidence</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{stats.avgConfidence}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Average Disease Risk</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{stats.avgDiseaseRisk}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Average Yield</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{stats.avgYield} t/ha</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Yield Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Yield Predictions Comparison</CardTitle>
          <CardDescription>Predicted vs. Actual Yields across selected farms and seasons</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(d) => `${d.farm} - ${d.season}`} angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: "Yield (tons/ha)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="predictedYield" fill="#3b82f6" name="Predicted Yield" />
              <Bar dataKey="actualYield" fill="#10b981" name="Actual Yield" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Accuracy Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Accuracy Trends</CardTitle>
          <CardDescription>Model accuracy improvements over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(d) => `${d.farm} - ${d.season}`} angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy %" strokeWidth={2} />
              <Line type="monotone" dataKey={(d) => d.confidence * 100} stroke="#3b82f6" name="Confidence %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disease Risk Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Disease Risk Analysis</CardTitle>
          <CardDescription>Disease risk levels across different farms and seasons</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="predictedYield" name="Predicted Yield" />
              <YAxis dataKey="diseaseRisk" name="Disease Risk" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Disease Risk vs Yield" data={filteredData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
          <CardDescription>Complete prediction data for all selected items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Farm</th>
                  <th className="px-4 py-2 text-left font-semibold">Season</th>
                  <th className="px-4 py-2 text-left font-semibold">Crop</th>
                  <th className="px-4 py-2 text-right font-semibold">Predicted Yield</th>
                  <th className="px-4 py-2 text-right font-semibold">Actual Yield</th>
                  <th className="px-4 py-2 text-right font-semibold">Accuracy</th>
                  <th className="px-4 py-2 text-right font-semibold">Disease Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.farm}</td>
                    <td className="px-4 py-2">{row.season}</td>
                    <td className="px-4 py-2">{row.cropType}</td>
                    <td className="px-4 py-2 text-right">{row.predictedYield} t/ha</td>
                    <td className="px-4 py-2 text-right">
                      {row.actualYield ? `${row.actualYield} t/ha` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant={row.accuracy >= 95 ? "default" : row.accuracy >= 90 ? "secondary" : "outline"}>
                        {row.accuracy}%
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant={row.diseaseRisk > 0.3 ? "destructive" : row.diseaseRisk > 0.15 ? "secondary" : "outline"}>
                        {(row.diseaseRisk * 100).toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExportComparison} className="gap-2">
          <Download className="w-4 h-4" />
          Export Comparison
        </Button>
      </div>
    </div>
  );
}
