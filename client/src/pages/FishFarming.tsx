import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Droplet, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function FishFarming() {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [showNewPond, setShowNewPond] = useState(false);
  const [showWaterQuality, setShowWaterQuality] = useState(false);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);

  // Fetch farms
  const { data: farms = [] } = trpc.farms.list.useQuery();

  // Set first farm as default
  useMemo(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  // Fetch ponds
  const { data: ponds = [], isLoading: pondsLoading, refetch: refetchPonds } = trpc.fishFarming.ponds.list.useQuery(
    selectedFarmId ? { farmId: selectedFarmId } : { farmId: 0 },
    { enabled: !!selectedFarmId }
  );

  // Fetch water quality records
  const { data: waterQualityRecords = [], isLoading: waterQualityLoading, refetch: refetchWaterQuality } = trpc.fishFarming.waterQuality.getMeasurementHistory.useQuery(
    selectedPondId ? { pondId: selectedPondId, startDate: new Date(new Date().setDate(new Date().getDate() - 30)), endDate: new Date() } : { pondId: 0, startDate: new Date(), endDate: new Date() },
    { enabled: !!selectedPondId }
  );

  // Mutations
  const createPond = trpc.fishFarming.ponds.create.useMutation({
    onSuccess: () => {
      refetchPonds();
      setShowNewPond(false);
    },
  });

  const deletePond = trpc.fishFarming.ponds.delete.useMutation({
    onSuccess: () => {
      refetchPonds();
    },
  });

  const createWaterQuality = trpc.fishFarming.waterQuality.recordMeasurement.useMutation({
    onSuccess: () => {
      refetchWaterQuality();
      setShowWaterQuality(false);
    },
  });

  // Calculate stats
  const stats = {
    totalPonds: ponds.length,
    activePonds: ponds.filter((p) => p.status === "active").length,
    totalArea: ponds.reduce((sum, p) => sum + parseFloat(p.sizeSquareMeters || "0"), 0),
    averageArea: ponds.length > 0 ? ponds.reduce((sum, p) => sum + parseFloat(p.sizeSquareMeters || "0"), 0) / ponds.length : 0,
  };

  const handleAddPond = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    const formData = new FormData(e.currentTarget);

    await createPond.mutateAsync({
      farmId: selectedFarmId,
      pondName: (formData.get("pondName") as string) || "",
      sizeSquareMeters: parseFloat(formData.get("area") as string),
      depthMeters: parseFloat(formData.get("depth") as string),
      waterSource: (formData.get("waterSource") as string) || undefined,
      stockingDensity: (formData.get("species") as string) || undefined,
      status: "active",
    });

    (e.target as HTMLFormElement).reset();
  };

  const handleAddWaterQuality = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPondId) return;

    const formData = new FormData(e.currentTarget);

    await createWaterQuality.mutateAsync({
      pondId: selectedPondId,
      measurementDate: new Date(formData.get("recordDate") as string),
      temperature: parseFloat(formData.get("temperature") as string),
      pH: parseFloat(formData.get("pH") as string),
      dissolvedOxygen: parseFloat(formData.get("dissolvedOxygen") as string),
      ammonia: parseFloat(formData.get("ammonia") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });

    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Droplet className="w-8 h-8" />
            Fish Farming Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage fish ponds and water quality</p>
        </div>
        <div className="flex flex-col gap-2">
          <Select value={selectedFarmId?.toString() || ""} onValueChange={(val) => setSelectedFarmId(parseInt(val))}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select farm" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ponds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPonds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activePonds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArea.toFixed(1)} m²</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageArea.toFixed(1)} m²</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Pond Button */}
      <Dialog open={showNewPond} onOpenChange={setShowNewPond}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Pond
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pond</DialogTitle>
            <DialogDescription>Register a new fish pond to your farm</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPond} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pondName">Pond Name</Label>
              <Input id="pondName" name="pondName" placeholder="e.g., Pond A" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="area">Area (m²)</Label>
                <Input id="area" name="area" type="number" step="0.1" placeholder="1000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depth">Depth (m)</Label>
                <Input id="depth" name="depth" type="number" step="0.1" placeholder="1.5" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterSource">Water Source</Label>
              <Select name="waterSource">
                <SelectTrigger id="waterSource">
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borehole">Borehole</SelectItem>
                  <SelectItem value="river">River</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="rainwater">Rainwater</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Fish Species</Label>
              <Select name="species">
                <SelectTrigger id="species">
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tilapia">Tilapia</SelectItem>
                  <SelectItem value="catfish">Catfish</SelectItem>
                  <SelectItem value="carp">Carp</SelectItem>
                  <SelectItem value="trout">Trout</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createPond.isPending}>
              {createPond.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Pond"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ponds Tabs */}
      <Tabs defaultValue="ponds" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ponds">Ponds</TabsTrigger>
          <TabsTrigger value="waterquality">Water Quality</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="ponds" className="space-y-4">
          {pondsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading ponds...</p>
              </CardContent>
            </Card>
          ) : ponds.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No ponds registered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(ponds as any[]).map((pond) => (
                <Card key={pond.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pond.pondName}</CardTitle>
                        <CardDescription>{pond.species || "Fish Pond"}</CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pond.status === "active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pond.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Area</p>
                            <p className="font-semibold">{pond.sizeSquareMeters} m²</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Depth</p>
                            <p className="font-semibold">{pond.depthMeters} m</p>
                          </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Water Source</p>
                        <p className="font-semibold capitalize">{pond.waterSource || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Dialog open={showWaterQuality && selectedPondId === pond.id} onOpenChange={setShowWaterQuality}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedPondId(pond.id)}
                          >
                            <Droplet className="w-4 h-4 mr-1" />
                            Quality
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Record Water Quality</DialogTitle>
                            <DialogDescription>Add water quality record for {pond.pondName}</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddWaterQuality} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="recordDate">Date</Label>
                              <Input id="recordDate" name="recordDate" type="date" required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label htmlFor="temperature">Temperature (°C)</Label>
                                <Input id="temperature" name="temperature" type="number" step="0.1" placeholder="28" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pH">pH Level</Label>
                                <Input id="pH" name="pH" type="number" step="0.1" placeholder="7.0" required />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label htmlFor="dissolvedOxygen">Dissolved Oxygen (mg/L)</Label>
                                <Input id="dissolvedOxygen" name="dissolvedOxygen" type="number" step="0.1" placeholder="5.5" required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ammonia">Ammonia (mg/L)</Label>
                                <Input id="ammonia" name="ammonia" type="number" step="0.01" placeholder="0.02" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea id="notes" name="notes" placeholder="Observations..." />
                            </div>
                            <Button type="submit" className="w-full" disabled={createWaterQuality.isPending}>
                              {createWaterQuality.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Record Quality"
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => deletePond.mutate({ id: pond.id })}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waterquality" className="space-y-4">
          {!selectedPondId ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Select a pond to view water quality records</p>
              </CardContent>
            </Card>
          ) : waterQualityLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading water quality records...</p>
              </CardContent>
            </Card>
          ) : waterQualityRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No water quality records yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(waterQualityRecords as any[]).map((record) => {
                const pond = ponds.find((p) => p.id === record.pondId);
                return (
                  <Card key={record.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{pond?.pondName}</CardTitle>
                          <CardDescription>{new Date(record.recordDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Recorded
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-muted-foreground">Temperature</p>
                          <p className="font-semibold">{record.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">pH</p>
                          <p className="font-semibold">{record.pH}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dissolved Oxygen</p>
                          <p className="font-semibold">{record.dissolvedOxygen} mg/L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Ammonia</p>
                          <p className="font-semibold">{record.ammonia || "N/A"} mg/L</p>
                        </div>
                      </div>
                      {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pond Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Active</span>
                  <span className="font-semibold text-blue-600">{stats.activePonds}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Inactive</span>
                  <span className="font-semibold">{stats.totalPonds - stats.activePonds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{stats.totalPonds}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Area Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Total Area</span>
                  <span className="font-semibold">{stats.totalArea.toFixed(1)} m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Average Area</span>
                  <span className="font-semibold">{stats.averageArea.toFixed(1)} m²</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
