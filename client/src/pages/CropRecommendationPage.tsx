import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, Droplet, Thermometer, Leaf, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

interface Recommendation {
  cropName: string;
  suitability: number;
  expectedYield: number;
  estimatedRevenue: number;
  riskFactors: string[];
  benefits: string[];
}

export default function CropRecommendationPage() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [selectedCrop, setSelectedCrop] = useState<Recommendation | null>(null);

  // Mock recommendations
  const recommendations: Recommendation[] = [
    {
      cropName: "Maize",
      suitability: 92,
      expectedYield: 3.8,
      estimatedRevenue: 760,
      riskFactors: ["Drought sensitivity", "Pest pressure in July-August"],
      benefits: ["High market demand", "Good rotation crop", "Established supply chain"],
    },
    {
      cropName: "Soybean",
      suitability: 85,
      expectedYield: 2.4,
      estimatedRevenue: 600,
      riskFactors: ["Pod shattering risk", "Disease pressure"],
      benefits: ["Nitrogen fixation", "Organic market premium", "Animal feed demand"],
    },
    {
      cropName: "Wheat",
      suitability: 78,
      expectedYield: 3.1,
      estimatedRevenue: 558,
      riskFactors: ["Frost damage potential", "Rust diseases"],
      benefits: ["Winter crop utilization", "Soil improvement", "Export opportunities"],
    },
    {
      cropName: "Rice",
      suitability: 72,
      expectedYield: 4.2,
      estimatedRevenue: 840,
      riskFactors: ["Waterlogging risk", "High water requirement"],
      benefits: ["Highest yield potential", "Staple crop demand", "Organic premium"],
    },
    {
      cropName: "Vegetables",
      suitability: 68,
      expectedYield: 18,
      estimatedRevenue: 3600,
      riskFactors: ["High labor requirement", "Market volatility"],
      benefits: ["Highest revenue", "Quick returns", "Local market opportunity"],
    },
  ];

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 90) return "text-green-600 bg-green-50";
    if (suitability >= 80) return "text-blue-600 bg-blue-50";
    if (suitability >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getSuitabilityLabel = (suitability: number) => {
    if (suitability >= 90) return "Excellent";
    if (suitability >= 80) return "Very Good";
    if (suitability >= 70) return "Good";
    return "Moderate";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crop Recommendation Engine</h1>
        <p className="text-gray-600 mt-2">AI-powered recommendations based on your farm conditions and market opportunities</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedCrop(rec);
                  setActiveTab("analysis");
                }}
              >
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Crop Name & Suitability */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900">{rec.cropName}</h3>
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Suitability</span>
                          <Badge className={getSuitabilityColor(rec.suitability)}>
                            {rec.suitability}% - {getSuitabilityLabel(rec.suitability)}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              rec.suitability >= 90
                                ? "bg-green-600"
                                : rec.suitability >= 80
                                ? "bg-blue-600"
                                : rec.suitability >= 70
                                ? "bg-yellow-600"
                                : "bg-orange-600"
                            }`}
                            style={{ width: `${rec.suitability}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Yield */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Expected Yield</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{rec.expectedYield}</p>
                      <p className="text-xs text-gray-500">tons/hectare</p>
                    </div>

                    {/* Revenue */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Est. Revenue</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">${rec.estimatedRevenue}</p>
                      <p className="text-xs text-gray-500">per hectare</p>
                    </div>

                    {/* Action */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedCrop(rec);
                          setActiveTab("analysis");
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Benefits & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Benefits
                      </p>
                      <ul className="space-y-1">
                        {rec.benefits.map((benefit, bidx) => (
                          <li key={bidx} className="text-sm text-gray-600">• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        Risk Factors
                      </p>
                      <ul className="space-y-1">
                        {rec.riskFactors.map((risk, ridx) => (
                          <li key={ridx} className="text-sm text-gray-600">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {selectedCrop ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCrop.cropName} - Detailed Analysis</CardTitle>
                <CardDescription>Complete growing guide and profitability analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Suitability Score</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{selectedCrop.suitability}%</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Expected Yield</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{selectedCrop.expectedYield} t/ha</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Est. Revenue</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">${selectedCrop.estimatedRevenue}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">Medium</p>
                  </div>
                </div>

                {/* Growing Guide */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Growing Guide</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        Soil Preparation
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Prepare soil 2-3 weeks before planting. Ensure proper drainage and incorporate organic matter. Target pH: 6.0-7.0. Apply basal fertilizer as recommended.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-600" />
                        Irrigation Schedule
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Provide 25-30mm water per week during growing season. Increase frequency during flowering and grain filling stages. Avoid waterlogging.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-600" />
                        Temperature Requirements
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Optimal temperature: 20-30°C. Avoid frost during early growth stages. Monitor weather forecasts during critical periods.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disease Management */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease & Pest Management</h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Monitor for leaf blight starting from V6 stage. Use fungicide if disease pressure detected.</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Scout for armyworms and fall armyworms during V4-V8 stages. Economic threshold: 25% plants affected.</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Implement crop rotation to reduce soil-borne diseases. Avoid planting in same field for 2 years.</span>
                    </li>
                  </ul>
                </div>

                {/* Harvesting */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvesting & Post-Harvest</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Harvest when grain moisture reaches 20-25%. Use combine harvester for efficiency. Dry grain to 12-14% moisture for storage.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Store in cool, dry place. Use proper containers to prevent pest infestation. Monitor storage conditions regularly.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-600">Select a crop from the recommendations to view detailed analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop Comparison</CardTitle>
              <CardDescription>Compare key metrics across recommended crops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Crop</th>
                      <th className="px-4 py-2 text-right font-semibold">Suitability</th>
                      <th className="px-4 py-2 text-right font-semibold">Yield (t/ha)</th>
                      <th className="px-4 py-2 text-right font-semibold">Revenue ($/ha)</th>
                      <th className="px-4 py-2 text-right font-semibold">ROI Potential</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((rec, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{rec.cropName}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge className={getSuitabilityColor(rec.suitability)}>
                            {rec.suitability}%
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">{rec.expectedYield}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">${rec.estimatedRevenue}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={rec.estimatedRevenue > 1000 ? "default" : "secondary"}>
                            {rec.estimatedRevenue > 1000 ? "High" : "Moderate"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
