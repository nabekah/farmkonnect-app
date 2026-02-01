import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Droplet, TrendingUp, AlertTriangle } from "lucide-react";

export default function FishFarming() {
  const [ponds, setPonds] = useState<any[]>([]);
  const [showNewPond, setShowNewPond] = useState(false);
  const [waterQualityRecords, setWaterQualityRecords] = useState<any[]>([]);

  const handleAddPond = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pond = {
      id: Date.now(),
      name: formData.get("name"),
      size: formData.get("size"),
      waterSource: formData.get("waterSource"),
      species: formData.get("species"),
      stockingDensity: formData.get("stockingDensity"),
      fingerlings: formData.get("fingerlings"),
      stockingDate: formData.get("stockingDate"),
      status: "active",
      createdAt: new Date(),
    };
    setPonds([...ponds, pond]);
    setShowNewPond(false);
    (e.target as HTMLFormElement).reset();
  };

  const addWaterQualityRecord = (pondId: number) => {
    const record = {
      id: Date.now(),
      pondId,
      date: new Date().toISOString().split("T")[0],
      pH: 7.0,
      temperature: 28,
      dissolvedOxygen: 5.5,
      ammonia: 0.02,
      status: "good",
    };
    setWaterQualityRecords([...waterQualityRecords, record]);
  };

  const deletePond = (id: number) => {
    setPonds(ponds.filter(p => p.id !== id));
  };

  const stats = {
    totalPonds: ponds.length,
    totalFingerlings: ponds.reduce((sum, p) => sum + parseInt(p.fingerlings || 0), 0),
    activePonds: ponds.filter(p => p.status === "active").length,
    averageSize: ponds.length > 0 ? (ponds.reduce((sum, p) => sum + parseInt(p.size || 0), 0) / ponds.length).toFixed(1) : 0,
  };

  const PondCard = ({ pond }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{pond.name}</CardTitle>
            <CardDescription>{pond.species}</CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            pond.status === "active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}>
            {pond.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Size</p>
            <p className="font-semibold">{pond.size} m²</p>
          </div>
          <div>
            <p className="text-muted-foreground">Water Source</p>
            <p className="font-semibold text-xs capitalize">{pond.waterSource}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fingerlings</p>
            <p className="font-semibold">{pond.fingerlings}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stocking Date</p>
            <p className="font-semibold text-xs">{pond.stockingDate}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => addWaterQualityRecord(pond.id)}
          >
            <Droplet className="w-4 h-4 mr-1" />
            Water Check
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deletePond(pond.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Droplet className="w-8 h-8" />
            Fish Farming
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage aquaculture operations</p>
        </div>
        <Dialog open={showNewPond} onOpenChange={setShowNewPond}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Add Pond</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Fish Pond</DialogTitle>
              <DialogDescription>Register a new aquaculture pond</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPond} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pond Name</Label>
                <Input id="name" name="name" placeholder="e.g., Pond A, Tilapia Pond 1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Pond Size (m²)</Label>
                <Input id="size" name="size" type="number" placeholder="e.g., 500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterSource">Water Source</Label>
                <Select name="waterSource" defaultValue="borehole">
                  <SelectTrigger id="waterSource">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borehole">Borehole</SelectItem>
                    <SelectItem value="river">River</SelectItem>
                    <SelectItem value="rainwater">Rainwater</SelectItem>
                    <SelectItem value="well">Well</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Fish Species</Label>
                <Select name="species" defaultValue="tilapia">
                  <SelectTrigger id="species">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tilapia">Tilapia</SelectItem>
                    <SelectItem value="catfish">Catfish</SelectItem>
                    <SelectItem value="carp">Carp</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fingerlings">Number of Fingerlings</Label>
                <Input id="fingerlings" name="fingerlings" type="number" placeholder="e.g., 5000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockingDensity">Stocking Density (fish/m²)</Label>
                <Input id="stockingDensity" name="stockingDensity" type="number" step="0.1" placeholder="e.g., 10" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockingDate">Stocking Date</Label>
                <Input id="stockingDate" name="stockingDate" type="date" required />
              </div>
              <Button type="submit" className="w-full">Add Pond</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Ponds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPonds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fingerlings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFingerlings.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Ponds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activePonds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Pond Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSize} m²</div>
          </CardContent>
        </Card>
      </div>

      {/* Ponds List */}
      {ponds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ponds.map((pond) => (
            <PondCard key={pond.id} pond={pond} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Droplet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No ponds registered yet</p>
          </CardContent>
        </Card>
      )}

      {/* Water Quality Records */}
      {waterQualityRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Water Quality Monitoring</CardTitle>
            <CardDescription>Recent water quality checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {waterQualityRecords.slice(-10).map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold">Water Quality Check</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.status === "good" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">pH</p>
                      <p className="font-semibold">{record.pH}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temperature</p>
                      <p className="font-semibold">{record.temperature}°C</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dissolved O₂</p>
                      <p className="font-semibold">{record.dissolvedOxygen} mg/L</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ammonia</p>
                      <p className="font-semibold">{record.ammonia} mg/L</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{record.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
