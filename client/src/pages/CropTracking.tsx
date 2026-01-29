import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, TrendingUp, Droplets, Leaf } from "lucide-react";
import { format } from "date-fns";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function CropTracking() {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState("cycles");

  // Fetch farms
  const { data: farms = [], isLoading: farmsLoading } = trpc.farms.list.useQuery();

  // Fetch crop cycles
  const { data: cycles = [], isLoading: cyclesLoading } = trpc.crops.cycles.list.useQuery(
    { farmId: selectedFarmId! },
    { enabled: !!selectedFarmId }
  );

  // Fetch soil tests
  const { data: soilTests = [], isLoading: soilTestsLoading } = trpc.crops.soilTests.list.useQuery(
    { farmId: selectedFarmId! },
    { enabled: !!selectedFarmId }
  );

  // Fetch yield records
  const { data: yields = [], isLoading: yieldsLoading } = trpc.crops.yields.listByFarm.useQuery(
    { farmId: selectedFarmId! },
    { enabled: !!selectedFarmId }
  );

  // Fetch crops list
  const { data: crops = [] } = trpc.crops.list.useQuery();

  // Mutations
  const createCycleMutation = trpc.crops.cycles.create.useMutation();
  const createSoilTestMutation = trpc.crops.soilTests.create.useMutation();
  const createYieldMutation = trpc.crops.yields.create.useMutation();

  // Form states
  const [cycleForm, setCycleForm] = useState({ cropId: "", plantingDate: "", varietyName: "" });
  const [soilForm, setSoilForm] = useState({ testDate: "", phLevel: "", nitrogenLevel: "" });
  const [yieldForm, setYieldForm] = useState({ cycleId: "", yieldQuantityKg: "", qualityGrade: "" });

  const handleCreateCycle = async () => {
    if (!selectedFarmId || !cycleForm.cropId || !cycleForm.plantingDate) return;

    await createCycleMutation.mutateAsync({
      farmId: selectedFarmId,
      cropId: parseInt(cycleForm.cropId),
      plantingDate: new Date(cycleForm.plantingDate),
      varietyName: cycleForm.varietyName,
    });

    setCycleForm({ cropId: "", plantingDate: "", varietyName: "" });
  };

  const handleCreateSoilTest = async () => {
    if (!selectedFarmId || !soilForm.testDate) return;

    await createSoilTestMutation.mutateAsync({
      farmId: selectedFarmId,
      testDate: new Date(soilForm.testDate),
      phLevel: soilForm.phLevel,
      nitrogenLevel: soilForm.nitrogenLevel,
    });

    setSoilForm({ testDate: "", phLevel: "", nitrogenLevel: "" });
  };

  const handleCreateYield = async () => {
    if (!yieldForm.cycleId || !yieldForm.yieldQuantityKg) return;

    await createYieldMutation.mutateAsync({
      cycleId: parseInt(yieldForm.cycleId),
      yieldQuantityKg: yieldForm.yieldQuantityKg,
      qualityGrade: yieldForm.qualityGrade,
      recordedDate: new Date(),
    });

    setYieldForm({ cycleId: "", yieldQuantityKg: "", qualityGrade: "" });
  };

  // Chart data
  const yieldChartData = {
    labels: yields.map((y, i) => `Harvest ${i + 1}`),
    datasets: [
      {
        label: "Yield (kg)",
        data: yields.map(y => parseFloat(y.yieldQuantityKg)),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const phTrendData = {
    labels: soilTests.map(s => format(new Date(s.testDate), "MMM d")),
    datasets: [
      {
        label: "Soil pH Level",
        data: soilTests.map(s => parseFloat(s.phLevel || "0")),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crop Tracking</h1>
          <p className="text-muted-foreground">Manage crop cycles, soil health, and yield records</p>
        </div>
      </div>

      {/* Farm Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Farm</CardTitle>
        </CardHeader>
        <CardContent>
          {farmsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading farms...</span>
            </div>
          ) : (
            <Select value={selectedFarmId?.toString() || ""} onValueChange={(v) => setSelectedFarmId(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map(farm => (
                  <SelectItem key={farm.id} value={farm.id.toString()}>
                    {farm.farmName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedFarmId && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Crop Cycles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycles.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently growing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Yield This Season</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {yields.reduce((sum, y) => sum + parseFloat(y.yieldQuantityKg), 0).toFixed(1)} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all harvests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Soil Tests Recorded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{soilTests.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Health assessments</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Interface */}
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cycles">
                <Leaf className="h-4 w-4 mr-2" />
                Crop Cycles
              </TabsTrigger>
              <TabsTrigger value="soil">
                <Droplets className="h-4 w-4 mr-2" />
                Soil Tests
              </TabsTrigger>
              <TabsTrigger value="yields">
                <TrendingUp className="h-4 w-4 mr-2" />
                Yields
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Crop Cycles Tab */}
            <TabsContent value="cycles" className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Crop Cycle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Crop Cycle</DialogTitle>
                      <DialogDescription>Register a new crop cycle for your farm</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Crop</Label>
                        <Select value={cycleForm.cropId} onValueChange={(v) => setCycleForm({ ...cycleForm, cropId: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                          <SelectContent>
                            {crops.map(crop => (
                              <SelectItem key={crop.id} value={crop.id.toString()}>
                                {crop.cropName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Planting Date</Label>
                        <Input
                          type="date"
                          value={cycleForm.plantingDate}
                          onChange={(e) => setCycleForm({ ...cycleForm, plantingDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Variety Name</Label>
                        <Input
                          placeholder="e.g., Hybrid F1"
                          value={cycleForm.varietyName}
                          onChange={(e) => setCycleForm({ ...cycleForm, varietyName: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreateCycle} disabled={createCycleMutation.isPending} className="w-full">
                        {createCycleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create Cycle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {cyclesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : cycles.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No crop cycles recorded yet. Create one to get started.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {cycles.map(cycle => (
                    <Card key={cycle.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">Cycle #{cycle.id}</CardTitle>
                        <CardDescription>Planted: {format(new Date(cycle.plantingDate), "MMM d, yyyy")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium capitalize">{cycle.status}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Variety</p>
                            <p className="font-medium">{cycle.varietyName || "—"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Soil Tests Tab */}
            <TabsContent value="soil" className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Soil Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Soil Test</DialogTitle>
                      <DialogDescription>Log soil health measurements</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Test Date</Label>
                        <Input
                          type="date"
                          value={soilForm.testDate}
                          onChange={(e) => setSoilForm({ ...soilForm, testDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>pH Level (0-14)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          placeholder="7.0"
                          value={soilForm.phLevel}
                          onChange={(e) => setSoilForm({ ...soilForm, phLevel: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Nitrogen Level (mg/kg)</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={soilForm.nitrogenLevel}
                          onChange={(e) => setSoilForm({ ...soilForm, nitrogenLevel: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreateSoilTest} disabled={createSoilTestMutation.isPending} className="w-full">
                        {createSoilTestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Test
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {soilTestsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : soilTests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No soil tests recorded yet. Start monitoring your soil health.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {soilTests.map(test => (
                    <Card key={test.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">Test - {format(new Date(test.testDate), "MMM d, yyyy")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">pH Level</p>
                            <p className="font-medium">{test.phLevel || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Nitrogen</p>
                            <p className="font-medium">{test.nitrogenLevel || "—"} mg/kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phosphorus</p>
                            <p className="font-medium">{test.phosphorusLevel || "—"} mg/kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Potassium</p>
                            <p className="font-medium">{test.potassiumLevel || "—"} mg/kg</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Yields Tab */}
            <TabsContent value="yields" className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Harvest
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Harvest</DialogTitle>
                      <DialogDescription>Log yield and quality information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Crop Cycle</Label>
                        <Select value={yieldForm.cycleId} onValueChange={(v) => setYieldForm({ ...yieldForm, cycleId: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            {cycles.map(cycle => (
                              <SelectItem key={cycle.id} value={cycle.id.toString()}>
                                Cycle #{cycle.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Yield Quantity (kg)</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={yieldForm.yieldQuantityKg}
                          onChange={(e) => setYieldForm({ ...yieldForm, yieldQuantityKg: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Quality Grade</Label>
                        <Select value={yieldForm.qualityGrade} onValueChange={(v) => setYieldForm({ ...yieldForm, qualityGrade: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Grade A (Premium)</SelectItem>
                            <SelectItem value="B">Grade B (Good)</SelectItem>
                            <SelectItem value="C">Grade C (Fair)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateYield} disabled={createYieldMutation.isPending} className="w-full">
                        {createYieldMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Record Harvest
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {yieldsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : yields.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No harvest records yet. Record your first harvest.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {yields.map(y => (
                    <Card key={y.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">Harvest - {format(new Date(y.recordedDate), "MMM d, yyyy")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Yield</p>
                            <p className="font-medium">{y.yieldQuantityKg} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quality Grade</p>
                            <p className="font-medium">{y.qualityGrade || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Post-Harvest Loss</p>
                            <p className="font-medium">{y.postHarvestLossKg || "—"} kg</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {yields.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Yield Distribution</CardTitle>
                      <CardDescription>Harvest quantities over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Bar data={yieldChartData} options={{ maintainAspectRatio: false }} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {soilTests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Soil pH Trend</CardTitle>
                      <CardDescription>pH level changes over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Line data={phTrendData} options={{ maintainAspectRatio: false }} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {yields.length === 0 && soilTests.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No data available for analytics yet.</p>
                    <p className="text-sm mt-2">Record soil tests and harvests to see performance trends.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
