import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, TrendingUp, Beaker, Leaf, Droplet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from '@/lib/trpc';

export function SoilHealthRecommendations() {
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedSoilTestId, setSelectedSoilTestId] = useState<number | null>(null);
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);

  // Queries
  const { data: recommendations = [] } = trpc.fertilizerManagement.soilHealth.getRecommendationsForCycle.useQuery(
    { cycleId: selectedCycleId || 0 },
    { enabled: !!selectedCycleId }
  );

  // Mutations
  const analyzeMutation = trpc.fertilizerManagement.soilHealth.analyze.useMutation({
    onSuccess: () => {
      setIsAnalyzeDialogOpen(false);
    },
  });

  const updateStatusMutation = trpc.fertilizerManagement.soilHealth.updateRecommendationStatus.useMutation();

  const handleAnalyze = () => {
    if (selectedCycleId && selectedSoilTestId) {
      analyzeMutation.mutate({
        soilTestId: selectedSoilTestId,
        cycleId: selectedCycleId,
      });
    }
  };

  const handleUpdateStatus = (recommendationId: number, status: 'pending' | 'applied' | 'completed' | 'cancelled') => {
    updateStatusMutation.mutate({
      recommendationId,
      status,
    });
  };

  // Sample data for visualization
  const deficiencyData = [
    { nutrient: 'Nitrogen', current: 15, optimal: 30, unit: 'mg/kg' },
    { nutrient: 'Phosphorus', current: 12, optimal: 20, unit: 'mg/kg' },
    { nutrient: 'Potassium', current: 120, optimal: 200, unit: 'mg/kg' },
    { nutrient: 'pH', current: 5.8, optimal: 6.5, unit: 'pH' },
  ];

  const healthScoreData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 68 },
    { month: 'Mar', score: 72 },
    { month: 'Apr', score: 75 },
    { month: 'May', score: 78 },
    { month: 'Jun', score: 82 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Soil Health Recommendations</h1>
          <p className="text-gray-600">Analyze soil tests and get fertilizer recommendations</p>
        </div>
        <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Beaker className="w-4 h-4" />
              Analyze Soil Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Analyze Soil Test</DialogTitle>
              <DialogDescription>Select a soil test to analyze and get recommendations</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Crop Cycle</label>
                <Select value={selectedCycleId?.toString() || ''} onValueChange={(val) => setSelectedCycleId(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cycle 1 - 2024</SelectItem>
                    <SelectItem value="2">Cycle 2 - 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Soil Test</label>
                <Select value={selectedSoilTestId?.toString() || ''} onValueChange={(val) => setSelectedSoilTestId(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Test 1 - March 2024</SelectItem>
                    <SelectItem value="2">Test 2 - June 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAnalyze} className="w-full">
                Analyze
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overall Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">82/100</div>
            <p className="text-xs text-gray-500 mt-1">Excellent soil condition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Deficiencies Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">3</div>
            <p className="text-xs text-gray-500 mt-1">Nutrients below optimal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Pending actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Nutrient Deficiency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrient Levels vs Optimal</CardTitle>
          <CardDescription>Current soil nutrient status compared to optimal levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nutrient" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#ef4444" name="Current Level" />
                <Bar dataKey="optimal" fill="#10b981" name="Optimal Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Soil Health Score Trend</CardTitle>
          <CardDescription>Improvement over time with recommended actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Health Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Recommendations</CardTitle>
              <CardDescription>Actions recommended based on soil analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.filter((r: any) => r.implementationStatus === 'pending').map((rec: any) => (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{rec.recommendedFertilizerType}</h3>
                        <p className="text-sm text-gray-600">{rec.deficiencyType} Deficiency ({rec.deficiencySeverity})</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {rec.recommendedQuantityKg} kg
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Application Timing:</strong> {rec.applicationTiming}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Expected Yield Improvement:</strong> {rec.expectedYieldImprovement}%
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(rec.id, 'applied')}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Applied
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(rec.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applied">
          <Card>
            <CardHeader>
              <CardTitle>Applied Recommendations</CardTitle>
              <CardDescription>Recommendations that have been applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.filter((r: any) => r.implementationStatus === 'applied').map((rec: any) => (
                  <div key={rec.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{rec.recommendedFertilizerType}</h3>
                        <p className="text-sm text-gray-600">{rec.recommendedQuantityKg} kg applied</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Applied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Recommendations</CardTitle>
              <CardDescription>Recommendations with visible results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.filter((r: any) => r.implementationStatus === 'completed').map((rec: any) => (
                  <div key={rec.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{rec.recommendedFertilizerType}</h3>
                        <p className="text-sm text-gray-600">
                          Yield improvement: {rec.expectedYieldImprovement}%
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deficiency Details */}
      <Card>
        <CardHeader>
          <CardTitle>Deficiency Analysis</CardTitle>
          <CardDescription>Detailed breakdown of soil deficiencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Nitrogen Deficiency (Moderate)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Current level: 15 mg/kg | Optimal: 30 mg/kg
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    Nitrogen deficiency affects plant growth and leaf development. Apply Urea (46-0-0) in split applications during the growing season.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Droplet className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Phosphorus Deficiency (Moderate)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Current level: 12 mg/kg | Optimal: 20 mg/kg
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    Phosphorus deficiency impacts root development and energy transfer. Apply DAP (18-46-0) before planting or at early growth stage.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">pH Imbalance (Moderate)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Current pH: 5.8 | Optimal: 6.5
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    Acidic soil reduces nutrient availability. Apply lime (Calcium Carbonate) 2-3 months before planting to raise pH.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
