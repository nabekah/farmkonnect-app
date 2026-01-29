import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, MapPin, Leaf } from "lucide-react";

export default function FarmManagement() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ farmName: "", location: "", sizeHectares: "", farmType: "mixed" });
  const [open, setOpen] = useState(false);

  // Fetch farms
  const { data: farms = [], isLoading } = trpc.farms.list.useQuery();

  // Create farm mutation
  const createFarmMutation = trpc.farms.create.useMutation({
    onSuccess: () => {
      setFormData({ farmName: "", location: "", sizeHectares: "", farmType: "mixed" });
      setOpen(false);
    },
  });

  const handleCreateFarm = async () => {
    if (!formData.farmName) return;

    await createFarmMutation.mutateAsync({
      farmName: formData.farmName,
      location: formData.location,
      sizeHectares: formData.sizeHectares,
      farmType: formData.farmType as "crop" | "livestock" | "mixed",
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Management</h1>
          <p className="text-muted-foreground">Manage your farms and agricultural operations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Farm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Farm</DialogTitle>
              <DialogDescription>Register a new farm to your account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input
                  id="farmName"
                  placeholder="e.g., Green Valley Farm"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., District, Region"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sizeHectares">Size (Hectares)</Label>
                <Input
                  id="sizeHectares"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 10.5"
                  value={formData.sizeHectares}
                  onChange={(e) => setFormData({ ...formData, sizeHectares: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="farmType">Farm Type</Label>
                <Select value={formData.farmType} onValueChange={(v) => setFormData({ ...formData, farmType: v })}>
                  <SelectTrigger id="farmType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop">Crop Production</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="mixed">Mixed Farming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateFarm} disabled={createFarmMutation.isPending} className="w-full">
                {createFarmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Farm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farms.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered farms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farms.reduce((sum, f) => sum + (parseFloat(f.sizeHectares || "0") || 0), 0).toFixed(1)} ha
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined farm size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Farm Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(farms.map(f => f.farmType)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Farms Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : farms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No farms yet</p>
            <p className="text-muted-foreground mb-6">Create your first farm to get started</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Farm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Farm</DialogTitle>
                  <DialogDescription>Register a new farm to your account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="farmName">Farm Name *</Label>
                    <Input
                      id="farmName"
                      placeholder="e.g., Green Valley Farm"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., District, Region"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sizeHectares">Size (Hectares)</Label>
                    <Input
                      id="sizeHectares"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 10.5"
                      value={formData.sizeHectares}
                      onChange={(e) => setFormData({ ...formData, sizeHectares: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select value={formData.farmType} onValueChange={(v) => setFormData({ ...formData, farmType: v })}>
                      <SelectTrigger id="farmType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crop">Crop Production</SelectItem>
                        <SelectItem value="livestock">Livestock</SelectItem>
                        <SelectItem value="mixed">Mixed Farming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateFarm} disabled={createFarmMutation.isPending} className="w-full">
                    {createFarmMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Farm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map(farm => (
            <Card key={farm.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="flex-1">{farm.farmName}</span>
                  <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                    {farm.farmType}
                  </span>
                </CardTitle>
                {farm.location && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {farm.location}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {farm.sizeHectares && (
                    <div>
                      <p className="text-xs text-muted-foreground">Farm Size</p>
                      <p className="font-medium">{farm.sizeHectares} hectares</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Registered</p>
                    <p className="font-medium text-sm">
                      {new Date(farm.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
