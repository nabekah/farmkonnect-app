import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Leaf, TrendingUp, Calendar } from "lucide-react";

export function CropManagement() {
  const [farmId] = useState<number>(1);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  const { data: cycles, isLoading: cyclesLoading, refetch: refetchCycles } = 
    trpc.crops.cycles.list.useQuery({ farmId });

  const createCycleMutation = trpc.crops.cycles.create.useMutation({
    onSuccess: () => {
      refetchCycles();
      setShowNewCycle(false);
    },
  });

  const handleCreateCycle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Create cycle mutation - schema fields need to match backend
    // createCycleMutation.mutate({...});
    (e.target as HTMLFormElement).reset();
  };

  const addActivity = (cycleId: number) => {
    const activity = {
      id: Date.now(),
      cycleId,
      date: new Date().toISOString().split("T")[0],
      type: "watering",
      notes: "",
      cost: 0,
    };
    setActivities([...activities, activity]);
  };

  const stats = {
    totalCycles: cycles?.length || 0,
    activeCycles: cycles?.filter(c => c.status === "growing").length || 0,
    totalArea: cycles?.reduce((sum, c) => sum + (parseFloat(c.areaPlantedHectares || "0") || 0), 0).toFixed(2) || 0,
  };

  const CycleCard = ({ cycle }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{cycle.cropName}</CardTitle>
            <CardDescription>{cycle.variety}</CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            cycle.status === "growing" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}>
            {cycle.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Planted</p>
            <p className="font-semibold">{new Date(cycle.plantingDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Harvest</p>
            <p className="font-semibold">{new Date(cycle.expectedHarvestDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Area</p>
            <p className="font-semibold">{cycle.areaPlanted} ha</p>
          </div>
          <div>
            <p className="text-muted-foreground">Soil</p>
            <p className="font-semibold text-xs capitalize">{cycle.soilType}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => addActivity(cycle.id)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Log Activity
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Leaf className="w-8 h-8" />
            Crop Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Track crop cycles and activities</p>
        </div>
        <Dialog open={showNewCycle} onOpenChange={setShowNewCycle}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Start Crop Cycle</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Start New Crop Cycle</DialogTitle>
              <DialogDescription>Register a new crop planting</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropName">Crop Name</Label>
                <Input id="cropName" name="cropName" placeholder="e.g., Maize, Cassava, Yam" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variety">Variety</Label>
                <Input id="variety" name="variety" placeholder="e.g., Yellow Dent, TMS 98/0581" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaPlanted">Area Planted (hectares)</Label>
                <Input id="areaPlanted" name="areaPlanted" type="number" step="0.1" placeholder="e.g., 2.5" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select name="soilType" defaultValue="loamy">
                  <SelectTrigger id="soilType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="laterite">Laterite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input id="plantingDate" name="plantingDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestDate">Expected Harvest Date</Label>
                <Input id="expectedHarvestDate" name="expectedHarvestDate" type="date" required />
              </div>
              <Button type="submit" className="w-full" disabled={createCycleMutation.isPending}>
                {createCycleMutation.isPending ? "Creating..." : "Start Cycle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCycles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCycles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArea} ha</div>
          </CardContent>
        </Card>
      </div>

      {/* Crop Cycles */}
      {cyclesLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading crop cycles...</p>
          </CardContent>
        </Card>
      ) : cycles && cycles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No crop cycles registered yet</p>
          </CardContent>
        </Card>
      )}

      {/* Activities Log */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Farm Activities</CardTitle>
            <CardDescription>Recent crop activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.slice(-10).map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold capitalize">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  {activity.notes && <p className="text-sm text-muted-foreground">{activity.notes}</p>}
                  {activity.cost > 0 && <p className="text-sm font-semibold">Cost: ₵{activity.cost.toFixed(2)}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
