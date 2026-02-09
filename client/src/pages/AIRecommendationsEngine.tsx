import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Zap,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Users,
  DollarSign,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";

/**
 * AI-Powered Recommendations Engine Component
 * Provides intelligent recommendations using LLM based on farm data
 */
export const AIRecommendationsEngine: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "overview" | "maintenance" | "crops" | "training" | "costs" | "query" | "weather" | "productivity" | "risks"
  >("overview");
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock recommendations data
  const maintenanceRecommendations = [
    {
      id: 1,
      equipment: "Tractor A",
      action: "Schedule oil change",
      urgency: "critical",
      cost: 500,
      time: "2 hours",
      impact: "Prevents engine failure",
      confidence: 0.95,
    },
    {
      id: 2,
      equipment: "Pump System",
      action: "Replace filter cartridge",
      urgency: "high",
      cost: 150,
      time: "1 hour",
      impact: "Improves water flow efficiency by 15%",
      confidence: 0.88,
    },
  ];

  const cropRecommendations = [
    {
      id: 1,
      nextCrop: "Legumes (Beans)",
      benefits: ["Nitrogen fixation", "Reduces fertilizer costs by 30%", "Breaks pest cycle"],
      yield: "2.5 tons",
      revenue: 3750,
      confidence: 0.92,
    },
    {
      id: 2,
      nextCrop: "Maize",
      benefits: ["High market demand", "Good companion crop", "Less water needed"],
      yield: "4 tons",
      revenue: 4800,
      confidence: 0.85,
    },
  ];

  const trainingRecommendations = [
    {
      id: 1,
      worker: "Sarah Johnson",
      training: "Pesticide Safety",
      reason: "Certification expiring in 5 days",
      cost: 150,
      impact: "Maintains compliance",
      urgency: "critical",
    },
    {
      id: 2,
      worker: "John Smith",
      training: "Equipment Operation",
      reason: "Productivity 8% below average",
      cost: 200,
      impact: "Expected 12% productivity increase",
      urgency: "high",
    },
  ];

  const costRecommendations = [
    {
      id: 1,
      category: "Equipment Maintenance",
      action: "Preventive maintenance schedule",
      savings: 900,
      savingsPercent: 30,
      impact: "Reduces emergency repairs",
    },
    {
      id: 2,
      category: "Input Costs",
      action: "Bulk purchase fertilizer",
      savings: 625,
      savingsPercent: 25,
      impact: "Better pricing",
    },
  ];

  const weatherRecommendations = [
    {
      id: 1,
      action: "Postpone pesticide application",
      reason: "Rain expected in 24 hours",
      timing: "Wait 3 days",
      impact: "Saves 500 GHS",
    },
    {
      id: 2,
      action: "Increase irrigation frequency",
      reason: "High temperature and humidity",
      timing: "Immediate",
      impact: "Maintains optimal soil moisture",
    },
  ];

  const productivityRecommendations = [
    {
      id: 1,
      area: "Equipment Efficiency",
      action: "Reduce equipment idle time by 15%",
      improvement: 1.2,
      timeframe: "2 weeks",
    },
    {
      id: 2,
      area: "Worker Performance",
      action: "Implement performance incentive program",
      improvement: 1.5,
      timeframe: "1 month",
    },
  ];

  const risks = [
    {
      id: 1,
      type: "Equipment Failure",
      probability: 0.45,
      impact: "High",
      score: 7.5,
      mitigation: "Implement preventive maintenance",
    },
    {
      id: 2,
      type: "Compliance Violation",
      probability: 0.25,
      impact: "High",
      score: 5.8,
      mitigation: "Schedule worker certifications",
    },
  ];

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    // Simulate LLM response
    setTimeout(() => {
      setAiResponse(
        `Based on your farm data and the question "${query}", I recommend: 1) Implement preventive maintenance for equipment to reduce costs by 30%, 2) Schedule worker certifications to maintain compliance, 3) Optimize crop rotation to improve soil health and yield. These actions are expected to improve overall farm productivity by 8-12% within the next quarter.`
      );
      setIsLoading(false);
    }, 2000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.8) return "text-blue-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Recommendations Engine</h1>
            <p className="text-gray-600 mt-1">Intelligent recommendations powered by machine learning</p>
          </div>
          <Lightbulb className="w-12 h-12 text-yellow-500 opacity-30" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("overview")}
            variant={viewMode === "overview" ? "default" : "outline"}
            className={viewMode === "overview" ? "bg-blue-600 text-white" : ""}
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode("maintenance")}
            variant={viewMode === "maintenance" ? "default" : "outline"}
            className={viewMode === "maintenance" ? "bg-blue-600 text-white" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Maintenance
          </Button>
          <Button
            onClick={() => setViewMode("crops")}
            variant={viewMode === "crops" ? "default" : "outline"}
            className={viewMode === "crops" ? "bg-blue-600 text-white" : ""}
          >
            <Leaf className="w-4 h-4 mr-2" />
            Crops
          </Button>
          <Button
            onClick={() => setViewMode("training")}
            variant={viewMode === "training" ? "default" : "outline"}
            className={viewMode === "training" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Training
          </Button>
          <Button
            onClick={() => setViewMode("costs")}
            variant={viewMode === "costs" ? "default" : "outline"}
            className={viewMode === "costs" ? "bg-blue-600 text-white" : ""}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Costs
          </Button>
          <Button
            onClick={() => setViewMode("query")}
            variant={viewMode === "query" ? "default" : "outline"}
            className={viewMode === "query" ? "bg-blue-600 text-white" : ""}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
        </div>

        {/* Overview View */}
        {viewMode === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Maintenance Recommendations</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                  </div>
                  <Zap className="w-10 h-10 text-red-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Potential Savings</p>
                    <p className="text-3xl font-bold text-green-600">GH₵2,325</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Productivity Gain</p>
                    <p className="text-3xl font-bold text-blue-600">+3.5%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Risk Score</p>
                    <p className="text-3xl font-bold text-orange-600">6.2/10</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-orange-600 opacity-20" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Recommendations</h2>
              <div className="space-y-3">
                <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Schedule Tractor A Oil Change</p>
                      <p className="text-sm text-gray-600 mt-1">Prevents engine failure - Critical urgency</p>
                    </div>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-200 text-red-800">
                      Critical
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-orange-300 bg-orange-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Schedule Worker Certifications</p>
                      <p className="text-sm text-gray-600 mt-1">Sarah Johnson - Expiring in 5 days</p>
                    </div>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-200 text-orange-800">
                      High
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-green-300 bg-green-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Implement Crop Rotation</p>
                      <p className="text-sm text-gray-600 mt-1">Plant legumes next season - Improves soil health</p>
                    </div>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                      Medium
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Maintenance View */}
        {viewMode === "maintenance" && (
          <div className="space-y-4">
            {maintenanceRecommendations.map((rec) => (
              <Card key={rec.id} className={`p-6 border-l-4 ${getUrgencyColor(rec.urgency)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{rec.equipment}</h3>
                    <p className="text-gray-700 mt-1">{rec.action}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600">Cost</p>
                        <p className="font-semibold">GH₵{rec.cost}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time</p>
                        <p className="font-semibold">{rec.time}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Impact</p>
                        <p className="font-semibold">{rec.impact}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Confidence</p>
                        <p className={`font-semibold ${getConfidenceColor(rec.confidence)}`}>{(rec.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4">
                    Schedule
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Crops View */}
        {viewMode === "crops" && (
          <div className="space-y-4">
            {cropRecommendations.map((rec) => (
              <Card key={rec.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{rec.nextCrop}</h3>
                    <p className={`text-sm font-semibold ${getConfidenceColor(rec.confidence)}`}>
                      {(rec.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                  <Leaf className="w-8 h-8 text-green-600 opacity-20" />
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {rec.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Expected Yield</p>
                    <p className="font-bold text-gray-900">{rec.yield}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">Expected Revenue</p>
                    <p className="font-bold text-green-600">GH₵{rec.revenue}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Training View */}
        {viewMode === "training" && (
          <div className="space-y-4">
            {trainingRecommendations.map((rec) => (
              <Card key={rec.id} className={`p-6 border-l-4 ${getUrgencyColor(rec.urgency)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{rec.worker}</h3>
                    <p className="text-gray-700 mt-1">{rec.training}</p>
                    <p className="text-sm text-gray-600 mt-2">{rec.reason}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-gray-600 text-sm">Cost</p>
                        <p className="font-semibold">GH₵{rec.cost}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Impact</p>
                        <p className="font-semibold">{rec.impact}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4">
                    Schedule
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Costs View */}
        {viewMode === "costs" && (
          <div className="space-y-4">
            {costRecommendations.map((rec) => (
              <Card key={rec.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{rec.category}</h3>
                    <p className="text-gray-700 mt-1">{rec.action}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-gray-600 text-sm">Annual Savings</p>
                    <p className="font-bold text-green-600">GH₵{rec.savings}</p>
                    <p className="text-xs text-gray-600 mt-1">{rec.savingsPercent}% reduction</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-600 text-sm">Impact</p>
                    <p className="font-bold text-blue-600">{rec.impact}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Query View */}
        {viewMode === "query" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ask AI Assistant</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask any question about your farm..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleQuerySubmit()}
                />
                <Button
                  onClick={handleQuerySubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {isLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700">Analyzing your farm data and generating recommendations...</p>
                </div>
              )}

              {aiResponse && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-gray-900">{aiResponse}</p>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Suggested Questions:</p>
                <div className="space-y-2">
                  {[
                    "How can I reduce maintenance costs?",
                    "What crops should I plant next season?",
                    "How can I improve worker productivity?",
                    "What are the biggest risks for my farm?",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(suggestion)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-gray-700">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Weather View */}
        {viewMode === "weather" && (
          <div className="space-y-4">
            {weatherRecommendations.map((rec) => (
              <Card key={rec.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{rec.action}</h3>
                    <p className="text-gray-700 mt-1">{rec.reason}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-gray-600 text-sm">Timing</p>
                        <p className="font-semibold">{rec.timing}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Impact</p>
                        <p className="font-semibold">{rec.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Productivity View */}
        {viewMode === "productivity" && (
          <div className="space-y-4">
            {productivityRecommendations.map((rec) => (
              <Card key={rec.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{rec.area}</h3>
                    <p className="text-gray-700 mt-1">{rec.action}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-gray-600 text-sm">Expected Improvement</p>
                        <p className="font-semibold text-green-600">+{rec.improvement}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Timeframe</p>
                        <p className="font-semibold">{rec.timeframe}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Risks View */}
        {viewMode === "risks" && (
          <div className="space-y-4">
            {risks.map((risk) => (
              <Card key={risk.id} className="p-6 border-l-4 border-orange-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{risk.type}</h3>
                    <p className="text-gray-700 mt-1">Mitigation: {risk.mitigation}</p>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-gray-600 text-sm">Probability</p>
                        <p className="font-semibold">{(risk.probability * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Impact</p>
                        <p className="font-semibold">{risk.impact}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Risk Score</p>
                        <p className="font-semibold text-orange-600">{risk.score}/10</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsEngine;
