import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Zap,
  Download,
  Filter,
  Eye,
  Settings,
  BarChart3,
} from "lucide-react";

/**
 * Multi-Farm Management Portal Component
 * Centralized management of multiple farms with cross-farm comparisons and consolidated reporting
 */
export const MultiFarmManagementPortal: React.FC = () => {
  const [viewMode, setViewMode] = useState<"overview" | "comparison" | "financial" | "alerts" | "ranking">("overview");
  const [selectedFarms, setSelectedFarms] = useState<number[]>([1, 2, 3]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock farms data
  const farms = [
    {
      id: 1,
      name: "Green Valley Farm",
      location: "Ashanti Region",
      size: 250,
      workers: 8,
      equipment: 12,
      productivity: 92,
      compliance: 87.5,
      revenue: 5230.0,
      status: "active",
    },
    {
      id: 2,
      name: "Sunny Acres",
      location: "Eastern Region",
      size: 180,
      workers: 6,
      equipment: 8,
      productivity: 88,
      compliance: 92,
      revenue: 3850.0,
      status: "active",
    },
    {
      id: 3,
      name: "Heritage Farm",
      location: "Central Region",
      size: 320,
      workers: 10,
      equipment: 15,
      productivity: 95,
      compliance: 100,
      revenue: 7200.0,
      status: "active",
    },
  ];

  // Mock consolidated metrics
  const consolidatedMetrics = {
    totalRevenue: 16280.0,
    totalExpenses: 10050.0,
    totalProfit: 6230.0,
    averageProfitMargin: 38.2,
    totalWorkers: 24,
    totalEquipment: 35,
  };

  // Mock cross-farm comparison
  const comparison = [
    {
      farmId: 1,
      farmName: "Green Valley Farm",
      productivity: 92,
      compliance: 87.5,
      revenue: 5230.0,
      profitMargin: 34,
    },
    {
      farmId: 2,
      farmName: "Sunny Acres",
      productivity: 88,
      compliance: 92,
      revenue: 3850.0,
      profitMargin: 37.7,
    },
    {
      farmId: 3,
      farmName: "Heritage Farm",
      productivity: 95,
      compliance: 100,
      revenue: 7200.0,
      profitMargin: 41.7,
    },
  ];

  // Mock alerts
  const alerts = [
    {
      id: 1,
      farmId: 1,
      farmName: "Green Valley Farm",
      type: "maintenance",
      title: "Tractor A maintenance overdue",
      priority: "critical",
    },
    {
      id: 2,
      farmId: 1,
      farmName: "Green Valley Farm",
      type: "compliance",
      title: "Worker certification expiring",
      priority: "high",
    },
    {
      id: 3,
      farmId: 2,
      farmName: "Sunny Acres",
      type: "performance",
      title: "Productivity below target",
      priority: "high",
    },
    {
      id: 4,
      farmId: 3,
      farmName: "Heritage Farm",
      type: "sales",
      title: "Inventory low for Tomatoes",
      priority: "medium",
    },
  ];

  // Mock ranking
  const ranking = [
    {
      rank: 1,
      farmId: 3,
      farmName: "Heritage Farm",
      score: 95,
      productivity: 95,
      compliance: 100,
      profitMargin: 41.7,
    },
    {
      rank: 2,
      farmId: 1,
      farmName: "Green Valley Farm",
      score: 88,
      productivity: 92,
      compliance: 87.5,
      profitMargin: 34,
    },
    {
      rank: 3,
      farmId: 2,
      farmName: "Sunny Acres",
      score: 85,
      productivity: 88,
      compliance: 92,
      profitMargin: 37.7,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const toggleFarmSelection = (farmId: number) => {
    setSelectedFarms((prev) =>
      prev.includes(farmId) ? prev.filter((id) => id !== farmId) : [...prev, farmId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Farm Management Portal</h1>
            <p className="text-gray-600 mt-1">Centralized management of {farms.length} farms</p>
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Farm Selection Filter */}
        {showFilters && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Farms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {farms.map((farm) => (
                <label
                  key={farm.id}
                  className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFarms.includes(farm.id)}
                    onChange={() => toggleFarmSelection(farm.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{farm.name}</p>
                    <p className="text-sm text-gray-600">{farm.location}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        )}

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
            onClick={() => setViewMode("comparison")}
            variant={viewMode === "comparison" ? "default" : "outline"}
            className={viewMode === "comparison" ? "bg-blue-600 text-white" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Comparison
          </Button>
          <Button
            onClick={() => setViewMode("financial")}
            variant={viewMode === "financial" ? "default" : "outline"}
            className={viewMode === "financial" ? "bg-blue-600 text-white" : ""}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Financial
          </Button>
          <Button
            onClick={() => setViewMode("alerts")}
            variant={viewMode === "alerts" ? "default" : "outline"}
            className={viewMode === "alerts" ? "bg-blue-600 text-white" : ""}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button
            onClick={() => setViewMode("ranking")}
            variant={viewMode === "ranking" ? "default" : "outline"}
            className={viewMode === "ranking" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Ranking
          </Button>
        </div>

        {/* Overview View */}
        {viewMode === "overview" && (
          <>
            {/* Consolidated Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">GH₵{consolidatedMetrics.totalRevenue.toFixed(0)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Profit</p>
                    <p className="text-3xl font-bold text-blue-600">GH₵{consolidatedMetrics.totalProfit.toFixed(0)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Workers</p>
                    <p className="text-3xl font-bold text-gray-900">{consolidatedMetrics.totalWorkers}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Farms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {farms
                .filter((farm) => selectedFarms.includes(farm.id))
                .map((farm) => (
                  <Card key={farm.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{farm.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {farm.location}
                        </p>
                      </div>
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Size</span>
                        <span className="font-bold">{farm.size} hectares</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Workers</span>
                        <span className="font-bold">{farm.workers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Equipment</span>
                        <span className="font-bold">{farm.equipment}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Productivity</span>
                        <span className="font-bold text-green-600">{farm.productivity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Compliance</span>
                        <span className="font-bold text-blue-600">{farm.compliance}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-bold text-gray-900">GH₵{farm.revenue.toFixed(0)}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Card>
                ))}
            </div>
          </>
        )}

        {/* Comparison View */}
        {viewMode === "comparison" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cross-Farm Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Farm Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Productivity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Compliance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Profit Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison
                    .filter((c) => selectedFarms.includes(c.farmId))
                    .map((comp) => (
                      <tr key={comp.farmId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{comp.farmName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-600" style={{ width: `${comp.productivity}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{comp.productivity}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${comp.compliance}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{comp.compliance}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">GH₵{comp.revenue.toFixed(0)}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{comp.profitMargin}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Financial View */}
        {viewMode === "financial" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">GH₵{consolidatedMetrics.totalRevenue.toFixed(0)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">GH₵{consolidatedMetrics.totalExpenses.toFixed(0)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Profit</p>
                <p className="text-2xl font-bold text-blue-600">GH₵{consolidatedMetrics.totalProfit.toFixed(0)}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{consolidatedMetrics.averageProfitMargin}%</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Breakdown by Farm</h3>
              <div className="space-y-4">
                {comparison
                  .filter((c) => selectedFarms.includes(c.farmId))
                  .map((comp) => (
                    <div key={comp.farmId} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-gray-900">{comp.farmName}</p>
                        <p className="text-lg font-bold text-gray-900">GH₵{comp.revenue.toFixed(0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${(comp.revenue / 7200) * 100}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Margin: {comp.profitMargin}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}

        {/* Alerts View */}
        {viewMode === "alerts" && (
          <div className="space-y-3">
            {alerts
              .filter((a) => selectedFarms.includes(a.farmId))
              .map((alert) => (
                <Card key={alert.id} className={`p-4 border-l-4 ${getPriorityColor(alert.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.farmName}</p>
                    </div>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50">
                      {alert.type}
                    </span>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Ranking View */}
        {viewMode === "ranking" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Performance Ranking</h2>
            <div className="space-y-4">
              {ranking
                .filter((r) => selectedFarms.includes(r.farmId))
                .map((farm) => (
                  <div key={farm.farmId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg">
                          {farm.rank}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{farm.farmName}</p>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-600">Productivity</p>
                            <p className="font-bold">{farm.productivity}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Compliance</p>
                            <p className="font-bold">{farm.compliance}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Profit Margin</p>
                            <p className="font-bold">{farm.profitMargin}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-gray-600 text-sm">Overall Score</p>
                        <p className="text-3xl font-bold text-blue-600">{farm.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiFarmManagementPortal;
