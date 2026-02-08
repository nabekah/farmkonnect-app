import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertCircle, TrendingUp, Plus } from "lucide-react";

export default function VetRecommendationTracking() {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch farms
  const { data: farms } = trpc.farms.list.useQuery();

  // Fetch vet recommendations
  const { data: recommendations } = trpc.telemedicineManagement.getVetRecommendations.useQuery({
    farmId: selectedFarmId,
  });

  // Fetch recommendation stats
  const { data: stats } = trpc.telemedicineManagement.getRecommendationStats.useQuery({
    farmId: selectedFarmId,
  });

  // Separate recommendations by status
  const pendingRecs = recommendations?.filter((r) => r.status === "pending") || [];
  const implementedRecs = recommendations?.filter((r) => r.status === "implemented") || [];
  const completedRecs = recommendations?.filter((r) => r.status === "completed") || [];
  const rejectedRecs = recommendations?.filter((r) => r.status === "rejected") || [];

  const handleImplementRecommendation = async (recId: number) => {
    // Implementation would call tRPC mutation
    console.log("Implementing recommendation:", recId);
  };

  const handleCompleteRecommendation = async (recId: number) => {
    // Implementation would call tRPC mutation
    console.log("Completing recommendation:", recId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Vet Recommendations</h1>
          <p className="text-slate-600">Track and implement veterinary recommendations for your farm</p>
        </div>

        {/* Farm Selector */}
        {farms && farms.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats?.pendingCount || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.implementedCount || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Being implemented</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.completedCount || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Successfully done</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.rejectedCount || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Not applicable</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats?.completionRate || 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Overall progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({pendingRecs.length})
            </TabsTrigger>
            <TabsTrigger value="implemented">
              In Progress ({implementedRecs.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRecs.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRecs.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Recommendations */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Recommendations</CardTitle>
                <CardDescription>Recommendations awaiting your action</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRecs.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{rec.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                          </div>
                          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div>From: {rec.veterinarianName}</div>
                          <div>Date: {new Date(rec.recommendationDate).toLocaleDateString()}</div>
                          <div>Priority: {rec.priority}</div>
                          <div>Category: {rec.category}</div>
                        </div>
                        {rec.expectedOutcome && (
                          <div className="bg-white p-2 rounded mb-3 text-sm">
                            <strong>Expected Outcome:</strong> {rec.expectedOutcome}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleImplementRecommendation(rec.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Implement
                          </Button>
                          <Button size="sm" variant="outline">
                            Defer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No pending recommendations</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* In Progress Recommendations */}
          <TabsContent value="implemented" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Recommendations being implemented</CardDescription>
              </CardHeader>
              <CardContent>
                {implementedRecs.length > 0 ? (
                  <div className="space-y-4">
                    {implementedRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{rec.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div>Started: {rec.implementationStartDate ? new Date(rec.implementationStartDate).toLocaleDateString() : "N/A"}</div>
                          <div>Expected Completion: {rec.expectedCompletionDate ? new Date(rec.expectedCompletionDate).toLocaleDateString() : "N/A"}</div>
                        </div>
                        {rec.implementationNotes && (
                          <div className="bg-white p-2 rounded mb-3 text-sm">
                            <strong>Notes:</strong> {rec.implementationNotes}
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rec.progressPercentage || 50}%` }}
                          ></div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCompleteRecommendation(rec.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="outline">
                            Update Progress
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No recommendations in progress</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Recommendations */}
          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Recommendations</CardTitle>
                <CardDescription>Successfully implemented recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {completedRecs.length > 0 ? (
                  <div className="space-y-4">
                    {completedRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="border border-green-200 bg-green-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{rec.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div>Completed: {rec.completionDate ? new Date(rec.completionDate).toLocaleDateString() : "N/A"}</div>
                          <div>Outcome: {rec.actualOutcome || "Not recorded"}</div>
                        </div>
                        {rec.completionNotes && (
                          <div className="bg-white p-2 rounded text-sm">
                            <strong>Notes:</strong> {rec.completionNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No completed recommendations yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Recommendations */}
          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Recommendations</CardTitle>
                <CardDescription>Recommendations not applicable to your farm</CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedRecs.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedRecs.map((rec) => (
                      <div
                        key={rec.id}
                        className="border border-red-200 bg-red-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{rec.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                          </div>
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        </div>
                        <div className="text-sm text-slate-600 mb-3">
                          Reason: {rec.rejectionReason || "Not specified"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No rejected recommendations</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
