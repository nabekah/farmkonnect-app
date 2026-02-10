import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  TrendingUp,
  BarChart3,
  Leaf,
  Zap,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  LineChart,
} from "lucide-react";

/**
 * Crop Rotation Planning Tool Component
 * Intelligent crop rotation recommendations based on soil health, pest history, and market prices
 */
export const CropRotationPlanning: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "recommendations" | "soil" | "pests" | "prices" | "plans" | "analytics"
  >("recommendations");

  // Mock data
  const recommendations = [
    {
      year: 1,
      crop: "Legumes (Beans)",
      reason: "Nitrogen fixation to restore soil",
      expectedYield: 1.8,
      marketPrice: 450,
      revenue: 810,
      profitability: "high",
    },
    {
      year: 2,
      crop: "Maize",
      reason: "Benefits from nitrogen-rich soil",
      expectedYield: 2.5,
      marketPrice: 350,
      revenue: 875,
      profitability: "high",
    },
    {
      year: 3,
      crop: "Rice",
      reason: "Breaks pest cycle, improves soil structure",
      expectedYield: 2.0,
      marketPrice: 400,
      revenue: 800,
      profitability: "medium",
    },
  ];

  const soilAnalysis = {
    type: "Loamy soil",
    pH: 6.5,
    nitrogen: 45,
    phosphorus: 22,
    potassium: 180,
    organicMatter: 3.2,
  };

  const pestHistory = [
    {
      year: 2024,
      crop: "Maize",
      pests: ["Armyworm", "Fall armyworm"],
      severity: "high",
    },
    {
      year: 2023,
      crop: "Rice",
      pests: ["Leaf spot", "Blast"],
      severity: "medium",
    },
    {
      year: 2022,
      crop: "Beans",
      pests: ["Aphids", "Spider mites"],
      severity: "low",
    },
  ];

  const marketPrices = [
    { crop: "Maize", price: 350, trend: "increasing", forecast: 380 },
    { crop: "Beans", price: 450, trend: "decreasing", forecast: 420 },
    { crop: "Rice", price: 400, trend: "stable", forecast: 400 },
    { crop: "Sorghum", price: 280, trend: "increasing", forecast: 320 },
  ];

  const savedPlans = [
    {
      id: 1,
      fieldName: "North Field",
      cropSequence: ["Beans", "Maize", "Rice"],
      startYear: 2025,
      status: "active",
    },
    {
      id: 2,
      fieldName: "South Field",
      cropSequence: ["Maize", "Sorghum", "Beans"],
      startYear: 2024,
      status: "active",
    },
  ];

  const analytics = {
    averageYieldImprovement: 18,
    costSavingsPercentage: 22,
    diseaseReductionPercentage: 35,
    totalRevenuIncrease: 45000,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crop Rotation Planning</h1>
            <p className="text-gray-600 mt-1">Intelligent recommendations for sustainable farming</p>
          </div>
          <Sprout className="w-12 h-12 text-green-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("recommendations")}
            variant={viewMode === "recommendations" ? "default" : "outline"}
            className={viewMode === "recommendations" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Recommendations
          </Button>
          <Button
            onClick={() => setViewMode("soil")}
            variant={viewMode === "soil" ? "default" : "outline"}
            className={viewMode === "soil" ? "bg-blue-600 text-white" : ""}
          >
            <Leaf className="w-4 h-4 mr-2" />
            Soil Analysis
          </Button>
          <Button
            onClick={() => setViewMode("pests")}
            variant={viewMode === "pests" ? "default" : "outline"}
            className={viewMode === "pests" ? "bg-blue-600 text-white" : ""}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Pest History
          </Button>
          <Button
            onClick={() => setViewMode("prices")}
            variant={viewMode === "prices" ? "default" : "outline"}
            className={viewMode === "prices" ? "bg-blue-600 text-white" : ""}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Market Prices
          </Button>
          <Button
            onClick={() => setViewMode("plans")}
            variant={viewMode === "plans" ? "default" : "outline"}
            className={viewMode === "plans" ? "bg-blue-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            My Plans
          </Button>
          <Button
            onClick={() => setViewMode("analytics")}
            variant={viewMode === "analytics" ? "default" : "outline"}
            className={viewMode === "analytics" ? "bg-blue-600 text-white" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Recommendations View */}
        {viewMode === "recommendations" && (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">3-Year Rotation Plan</p>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">Year {rec.year}: {rec.crop}</p>
                        <p className="text-sm text-gray-700 mt-1">{rec.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-bold ${
                        rec.profitability === "high" ? "bg-green-200 text-green-800" :
                        "bg-yellow-200 text-yellow-800"
                      }`}>
                        {rec.profitability.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600">Expected Yield</p>
                        <p className="font-bold text-gray-900">{rec.expectedYield} tons/ha</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Market Price</p>
                        <p className="font-bold text-gray-900">GH₵{rec.marketPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue (per ha)</p>
                        <p className="font-bold text-green-600">GH₵{rec.revenue}</p>
                      </div>
                      <div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Expected Benefits</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-600 text-sm">Soil Health</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">↑ 28%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-600 text-sm">Disease Control</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">↓ 35%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-sm">Cost Savings</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">↓ 22%</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-gray-600 text-sm">Yield Increase</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">↑ 18%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Soil Analysis View */}
        {viewMode === "soil" && (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Soil Analysis Report</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Soil Type</p>
                  <p className="font-bold text-gray-900 mt-1">{soilAnalysis.type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">pH Level</p>
                  <p className="font-bold text-gray-900 mt-1">{soilAnalysis.pH}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Organic Matter</p>
                  <p className="font-bold text-gray-900 mt-1">{soilAnalysis.organicMatter}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Drainage</p>
                  <p className="font-bold text-gray-900 mt-1">Well-drained</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-bold text-gray-900 text-sm">Nitrogen (N)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "45%"}}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{soilAnalysis.nitrogen} mg/kg - Adequate</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-bold text-gray-900 text-sm">Phosphorus (P)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: "22%"}}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{soilAnalysis.phosphorus} mg/kg - Low</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-bold text-gray-900 text-sm">Potassium (K)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: "90%"}}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{soilAnalysis.potassium} mg/kg - High</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pest History View */}
        {viewMode === "pests" && (
          <div className="space-y-4">
            {pestHistory.map((item, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{item.year}: {item.crop}</p>
                    <p className="text-sm text-gray-600 mt-1">Severity: {item.severity}</p>
                  </div>
                  <AlertCircle className="w-6 h-6 text-red-600 opacity-50" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.pests.map((pest, pidx) => (
                    <span key={pidx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {pest}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Market Prices View */}
        {viewMode === "prices" && (
          <div className="space-y-4">
            {marketPrices.map((item, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{item.crop}</p>
                    <p className="text-sm text-gray-600 mt-1">Current: GH₵{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      item.trend === "increasing" ? "text-green-600" :
                      item.trend === "decreasing" ? "text-red-600" :
                      "text-gray-600"
                    }`}>
                      {item.trend === "increasing" ? "↑" : item.trend === "decreasing" ? "↓" : "→"} {item.trend}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Forecast: GH₵{item.forecast}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Plans View */}
        {viewMode === "plans" && (
          <div className="space-y-4">
            {savedPlans.map((plan) => (
              <Card key={plan.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{plan.fieldName}</p>
                    <p className="text-sm text-gray-600">Starting {plan.startYear}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-bold">
                    {plan.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {plan.cropSequence.map((crop, idx) => (
                    <React.Fragment key={idx}>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                        {crop}
                      </span>
                      {idx < plan.cropSequence.length - 1 && <span className="text-gray-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Full Plan
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-green-50 border-green-200">
                <p className="text-gray-600 text-sm">Yield Improvement</p>
                <p className="text-3xl font-bold text-green-600 mt-2">+{analytics.averageYieldImprovement}%</p>
              </Card>
              <Card className="p-6 bg-blue-50 border-blue-200">
                <p className="text-gray-600 text-sm">Cost Savings</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">-{analytics.costSavingsPercentage}%</p>
              </Card>
              <Card className="p-6 bg-red-50 border-red-200">
                <p className="text-gray-600 text-sm">Disease Reduction</p>
                <p className="text-3xl font-bold text-red-600 mt-2">-{analytics.diseaseReductionPercentage}%</p>
              </Card>
              <Card className="p-6 bg-purple-50 border-purple-200">
                <p className="text-gray-600 text-sm">Revenue Increase</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">GH₵{(analytics.totalRevenuIncrease / 1000).toFixed(0)}K</p>
              </Card>
            </div>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">4-Year Trend</p>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">2022</span>
                    <span className="text-sm">2.0 tons/ha | GH₵70K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "50%"}}></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">2023</span>
                    <span className="text-sm">2.3 tons/ha | GH₵80.5K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "60%"}}></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">2024</span>
                    <span className="text-sm">2.6 tons/ha | GH₵91K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "70%"}}></div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">2025 (Projected)</span>
                    <span className="text-sm font-bold text-green-600">3.0 tons/ha | GH₵105K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: "100%"}}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRotationPlanning;
