import { useState } from "react";
import { useAuth } from "@/lib/trpc";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Plus, TrendingUp, Calendar } from "lucide-react";

export function CropManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [farmId, setFarmId] = useState<number>(user?.farmId || 0);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showYield, setShowYield] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);

  const { data: cycles, isLoading: cyclesLoading, refetch: refetchCycles } = 
    trpc.crops.cycles.list.useQuery({ farmId });
  
  const { data: stats } = trpc.crops.cycles.getStatistics.useQuery({ farmId });

  const createCycleMutation = trpc.crops.cycles.create.useMutation({
    onSuccess: () => {
      toast({ title: "Crop cycle created successfully" });
      refetchCycles();
      setShowNewCycle(false);
    },
  });

  const recordActivityMutation = trpc.crops.cycles.recordActivity.useMutation({
    onSuccess: () => {
      toast({ title: "Activity recorded successfully" });
      refetchCycles();
      setShowActivity(false);
    },
  });

  const recordYieldMutation = trpc.crops.cycles.recordYield.useMutation({
    onSuccess: () => {
      toast({ title: "Yield recorded successfully" });
      refetchCycles();
      setShowYield(false);
    },
  });

  const handleCreateCycle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCycleMutation.mutate({
      farmId,
      cropId: parseInt(formData.get("cropId") as string),
      varietyName: formData.get("varietyName") as string,
      plantingDate: new Date(formData.get("plantingDate") as string),
      expectedHarvestDate: new Date(formData.get("expectedHarvestDate") as string),
      areaPlantedHectares: formData.get("areaPlantedHectares") as string,
      expectedYieldKg: formData.get("expectedYieldKg") as string,
    });
  };

  const handleRecordActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCycle) return;
    const formData = new FormData(e.currentTarget);
    recordActivityMutation.mutate({
      cycleId: selectedCycle,
      activityType: formData.get("activityType") as any,
      activityDate: new Date(formData.get("activityDate") as string),
      details: formData.get("details") as string,
      cost: formData.get("cost") as string,
    });
  };

  const handleRecordYield = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCycle) return;
    const formData = new FormData(e.currentTarget);
    recordYieldMutation.mutate({
      cycleId: selectedCycle,
      harvestDate: new Date(formData.get("harvestDate") as string),
      yieldQuantityKg: formData.get("yieldQuantityKg") as string,
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Leaf className="w-8 h-8" />
            Crop Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your crop cycles and harvest yields</p>
        </div>
        <Dialog open={showNewCycle} onOpenChange={setShowNewCycle}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />New Cycle</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Start New Crop Cycle</DialogTitle>
              <DialogDescription>Record a new crop planting cycle</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropId">Crop Type</Label>
                <Select name="cropId" defaultValue="1">
                  <SelectTrigger id="cropId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Maize</SelectItem>
                    <SelectItem value="2">Rice</SelectItem>
                    <SelectItem value="3">Cassava</SelectItem>
                    <SelectItem value="4">Yam</SelectItem>
                    <SelectItem value="5">Tomato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="varietyName">Variety Name</Label>
                <Input id="varietyName" name="varietyName" placeholder="e.g., Hybrid 313" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input id="plantingDate" name="plantingDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestDate">Expected Harvest Date</Label>
                <Input id="expectedHarvestDate" name="expectedHarvestDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaPlantedHectares">Area Planted (hectares)</Label>
                <Input id="areaPlantedHectares" name="areaPlantedHectares" type="number" step="0.1" placeholder="0.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedYieldKg">Expected Yield (kg)</Label>
                <Input id="expectedYieldKg" name="expectedYieldKg" type="number" placeholder="500" />
              </div>
              <Button type="submit" className="w-full" disabled={createCycleMutation.isPending}>
                {createCycleMutation.isPending ? "Creating..." : "Create Cycle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCrops || 0}</div>
            <p className="text-xs text-muted-foreground">Currently growing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArea || "0"}</div>
            <p className="text-xs text-muted-foreground">Hectares planted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalYield || "0"}</div>
            <p className="text-xs text-muted-foreground">Kilograms harvested</p>
          </CardContent>
        </Card>
      </div>

      {/* Crop Cycles List */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Cycles</CardTitle>
          <CardDescription>Your active and completed crop cycles</CardDescription>
        </CardHeader>
        <CardContent>
          {cyclesLoading ? (
            <div className="text-center py-8">Loading crop cycles...</div>
          ) : cycles && cycles.length > 0 ? (
            <div className="space-y-4">
              {cycles.map((cycle: any) => (
                <div key={cycle.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-semibold text-base md:text-lg">{cycle.crop?.name || "Unknown Crop"}</h3>
                      <p className="text-sm text-muted-foreground">{cycle.varietyName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      cycle.status === "planted" ? "bg-blue-100 text-blue-800" :
                      cycle.status === "growing" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {cycle.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">Area</p>
                      <p className="font-medium">{cycle.areaPlantedHectares} ha</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Yield</p>
                      <p className="font-medium">{cycle.expectedYieldKg} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Planted</p>
                      <p className="font-medium">{new Date(cycle.plantingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Harvest</p>
                      <p className="font-medium">{cycle.expectedHarvestDate ? new Date(cycle.expectedHarvestDate).toLocaleDateString() : "TBD"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 md:flex-row">
                    <Dialog open={showActivity && selectedCycle === cycle.id} onOpenChange={(open) => {
                      setShowActivity(open);
                      if (open) setSelectedCycle(cycle.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          <Calendar className="w-4 h-4 mr-2" />
                          Record Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Crop Activity</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRecordActivity} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="activityType">Activity Type</Label>
                            <Select name="activityType" defaultValue="fertilization">
                              <SelectTrigger id="activityType">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fertilization">Fertilization</SelectItem>
                                <SelectItem value="pest_control">Pest Control</SelectItem>
                                <SelectItem value="weeding">Weeding</SelectItem>
                                <SelectItem value="irrigation">Irrigation</SelectItem>
                                <SelectItem value="harvesting">Harvesting</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityDate">Activity Date</Label>
                            <Input id="activityDate" name="activityDate" type="date" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="details">Details</Label>
                            <Textarea id="details" name="details" placeholder="Describe the activity..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cost">Cost (GHS)</Label>
                            <Input id="cost" name="cost" type="number" step="0.01" placeholder="0.00" />
                          </div>
                          <Button type="submit" className="w-full" disabled={recordActivityMutation.isPending}>
                            {recordActivityMutation.isPending ? "Recording..." : "Record Activity"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={showYield && selectedCycle === cycle.id} onOpenChange={(open) => {
                      setShowYield(open);
                      if (open) setSelectedCycle(cycle.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Record Yield
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Harvest Yield</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRecordYield} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="harvestDate">Harvest Date</Label>
                            <Input id="harvestDate" name="harvestDate" type="date" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="yieldQuantityKg">Yield Quantity (kg)</Label>
                            <Input id="yieldQuantityKg" name="yieldQuantityKg" type="number" placeholder="500" required />
                          </div>
                          <Button type="submit" className="w-full" disabled={recordYieldMutation.isPending}>
                            {recordYieldMutation.isPending ? "Recording..." : "Record Yield"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No crop cycles yet. Start by creating a new cycle.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
