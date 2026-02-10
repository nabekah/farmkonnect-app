import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Zap,
  Leaf,
  Droplet,
  Bug,
  Beaker,
} from "lucide-react";

/**
 * Crop Yield Prediction Component
 * ML-based crop yield prediction system
 */
export const CropYieldPrediction: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "prediction" | "trends" | "scenarios" | "recommendations" | "optimization"
  >("prediction");
  const [selectedCrop, setSelectedCrop] = useState("Maize");

  // Mock data
  const prediction = {
    estimatedYield: 3.2,
    confidence: 0.87,
    lowerBound: 2.72,
    upperBound: 3.68,
    factors: [
      { factor: "Rainfall", impact: "High", value: "750mm" },
      { factor: "Temperature", impact: "Medium", value: "25°C" },
      { factor: "Soil Type", impact: "High", value: "Loamy" },
      { factor: "Field Area", impact: "Low", value: "5ha" },
    ],
  };

  const trends = [
    { year: 2021, yield: 2.1, target: 2.5 },
    { year: 2022, yield: 2.8, target: 2.5 },
    { year: 2023, yield: 2.4, target: 2.5 },
    { year: 2024, yield: 3.2, target: 2.5 },
    { year: 2025, yield: 2.9, target: 2.5 },
  ];

  const recommendations = [
    {
      crop: "Maize",
      suitability: 0.92,
      yield: 3.2,
      profitability: "High",
    },
    {
      crop: "Tomato",
      suitability: 0.88,
      yield: 25,
      profitability: "High",
    },
    {
      crop: "Groundnut",
      suitability: 0.85,
      yield: 1.8,
      profitability: "Medium",
    },
  ];

  const optimizationTips = [
    {
      category: "Soil Management",
      icon: Beaker,
      tips: [
        "Conduct soil testing to optimize nutrient levels",
        "Implement crop rotation to improve soil health",
        "Use organic matter to enhance soil structure",
      ],
    },
    {
      category: "Water Management",
      icon: Droplet,
      tips: [
        "Install drip irrigation for efficient water use",
        "Monitor soil moisture regularly",
        "Schedule irrigation based on crop needs",
      ],
    },
    {
      category: "Pest & Disease Management",
      icon: Bug,
      tips: [
        "Use integrated pest management (IPM) techniques",
        "Scout fields regularly for early detection",
        "Apply preventive measures before outbreaks",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crop Yield Prediction</h1>
            <p className="text-gray-600 mt-1">ML-based predictions to optimize farm productivity</p>
          </div>
          <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("prediction")}
            variant={viewMode === "prediction" ? "default" : "outline"}
            className={viewMode === "prediction" ? "bg-blue-600 text-white" : ""}
          >
            <Target className="w-4 h-4 mr-2" />
            Prediction
          </Button>
          <Button
            onClick={() => setViewMode("trends")}
            variant={viewMode === "trends" ? "default" : "outline"}
            className={viewMode === "trends" ? "bg-blue-600 text-white" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Trends
          </Button>
          <Button
            onClick={() => setViewMode("scenarios")}
            variant={viewMode === "scenarios" ? "default" : "outline"}
            className={viewMode === "scenarios" ? "bg-blue-600 text-white" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Scenarios
          </Button>
          <Button
            onClick={() => setViewMode("recommendations")}
            variant={viewMode === "recommendations" ? "default" : "outline"}
            className={viewMode === "recommendations" ? "bg-blue-600 text-white" : ""}
          >
            <Leaf className="w-4 h-4 mr-2" />
            Recommendations
          </Button>
          <Button
            onClick={() => setViewMode("optimization")}
            variant={viewMode === "optimization" ? "default" : "outline"}
            className={viewMode === "optimization" ? "bg-blue-600 text-white" : ""}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Optimization
          </Button>
        </div>

        {/* Prediction View */}
        {viewMode === "prediction" && (
          <div className="space-y-6">
            {/* Main Prediction Card */}
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-2">Estimated Yield for {selectedCrop}</p>
                <p className="text-5xl font-bold text-blue-600 mb-2">{prediction.estimatedYield}</p>
                <p className="text-gray-600">tons/hectare</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Confidence Level</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{(prediction.confidence * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-600 mt-1">High</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Lower Bound</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{prediction.lowerBound}</p>
                  <p className="text-xs text-gray-600 mt-1">Conservative Estimate</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Upper Bound</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{prediction.upperBound}</p>
                  <p className="text-xs text-gray-600 mt-1">Optimistic Estimate</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-green-500"
                  style={{ width: `${(prediction.confidence * 100).toFixed(0)}%` }}
                />
              </div>
            </Card>

            {/* Contributing Factors */}
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Contributing Factors</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prediction.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        factor.impact === "High"
                          ? "bg-red-500"
                          : factor.impact === "Medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    >
                      {factor.impact[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{factor.factor}</p>
                      <p className="text-sm text-gray-600">{factor.value}</p>
                      <p className="text-xs text-gray-500 mt-1">Impact: {factor.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="font-bold text-gray-900 mb-3">Key Recommendations</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Ensure adequate irrigation given expected rainfall</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Monitor soil moisture levels regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Apply fertilizer at optimal growth stages</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Trends View */}
        {viewMode === "trends" && (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">5-Year Yield Trends</p>
              <div className="space-y-3">
                {trends.map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-bold text-gray-900">{trend.year}</p>
                      <p className="text-sm text-gray-600">Actual: {trend.yield} t/ha</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${(trend.yield / 3.5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{trend.yield}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  <strong>Trend Analysis:</strong> Your yields have improved by 38% over 5 years, with an average of 2.68 t/ha.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Scenarios View */}
        {viewMode === "scenarios" && (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Yield Scenarios</p>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="font-bold text-gray-900">Optimal Conditions</p>
                  <p className="text-sm text-gray-600 mt-1">Rainfall: 900mm, Temp: 26°C</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">3.68 t/ha</p>
                </div>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <p className="font-bold text-gray-900">Average Conditions</p>
                  <p className="text-sm text-gray-600 mt-1">Rainfall: 750mm, Temp: 25°C</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">3.2 t/ha</p>
                </div>
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="font-bold text-gray-900">Drought Stress</p>
                  <p className="text-sm text-gray-600 mt-1">Rainfall: 500mm, Temp: 28°C</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">2.1 t/ha</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recommendations View */}
        {viewMode === "recommendations" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-bold text-gray-900 text-lg">{rec.crop}</p>
                  <span className="text-2xl font-bold text-blue-600">{(rec.suitability * 100).toFixed(0)}%</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Suitability Score</p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Est. Yield</p>
                    <p className="font-bold text-gray-900">{rec.yield} t/ha</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Profitability</p>
                    <p className={`font-bold ${rec.profitability === "High" ? "text-green-600" : "text-yellow-600"}`}>
                      {rec.profitability}
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Select Crop</Button>
              </Card>
            ))}
          </div>
        )}

        {/* Optimization View */}
        {viewMode === "optimization" && (
          <div className="space-y-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Yield Improvement Potential: 30%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    By implementing recommended practices, you could increase yield from 3.2 to 4.16 t/ha
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {optimizationTips.map((tip, idx) => {
                const IconComponent = tip.icon;
                return (
                  <Card key={idx} className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                      <p className="font-bold text-gray-900">{tip.category}</p>
                    </div>
                    <ul className="space-y-2">
                      {tip.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span className="text-gray-700">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropYieldPrediction;
