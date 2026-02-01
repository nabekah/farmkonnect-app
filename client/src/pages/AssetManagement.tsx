import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Wrench, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AssetManagement() {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  // Fetch farms
  const { data: farms = [] } = trpc.farms.list.useQuery();

  // Set first farm as default
  useMemo(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  // Fetch assets
  const { data: assets = [], isLoading: assetsLoading, refetch: refetchAssets } = trpc.assets.assets.list.useQuery(
    selectedFarmId ? { farmId: selectedFarmId } : { farmId: 0 },
    { enabled: !!selectedFarmId }
  );

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading, refetch: refetchMaintenance } = trpc.assets.maintenance.getMaintenanceHistory.useQuery(
    selectedAssetId ? { assetId: selectedAssetId } : { assetId: 0 },
    { enabled: !!selectedAssetId }
  );

  // Mutations
  const createAsset = trpc.assets.assets.create.useMutation({
    onSuccess: () => {
      refetchAssets();
      setShowNewAsset(false);
    },
  });

  const deleteAsset = trpc.assets.assets.delete.useMutation({
    onSuccess: () => {
      refetchAssets();
    },
  });

  const createMaintenance = trpc.assets.maintenance.recordMaintenance.useMutation({
    onSuccess: () => {
      refetchMaintenance();
      setShowMaintenance(false);
    },
  });

  // Calculate stats
  const stats = {
    totalAssets: assets.length,
    activeAssets: assets.filter((a: any) => a.status === "active").length,
    totalValue: assets.reduce((sum: number, a: any) => sum + parseFloat(a.purchasePrice || "0"), 0),
    maintenanceNeeded: assets.filter((a: any) => a.status === "maintenance_needed").length,
  };

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    const formData = new FormData(e.currentTarget);

    await createAsset.mutateAsync({
      farmId: selectedFarmId,
      name: (formData.get("assetName") as string) || "",
      assetType: (formData.get("assetType") as string) || "equipment",
      purchaseValue: parseFloat(formData.get("purchasePrice") as string),
      purchaseDate: new Date(formData.get("purchaseDate") as string),
      notes: (formData.get("serialNumber") as string) || undefined,
      status: "active",
    });

    (e.target as HTMLFormElement).reset();
  };

  const handleAddMaintenance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    const formData = new FormData(e.currentTarget);

    await createMaintenance.mutateAsync({
      assetId: selectedAssetId,
      maintenanceDate: new Date(formData.get("maintenanceDate") as string),
      maintenanceType: (formData.get("maintenanceType") as any) || "routine",
      description: (formData.get("description") as string) || "",
      cost: parseFloat(formData.get("cost") as string) || undefined,
    });

    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            Asset Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage farm equipment and assets</p>
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
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.maintenanceNeeded}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Asset Button */}
      <Dialog open={showNewAsset} onOpenChange={setShowNewAsset}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Register a new farm asset or equipment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAsset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name</Label>
              <Input id="assetName" name="assetName" placeholder="e.g., Tractor John Deere" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select name="assetType" defaultValue="equipment">
                <SelectTrigger id="assetType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" placeholder="5000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" name="purchaseDate" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" name="serialNumber" placeholder="SN-12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g., Equipment Shed A" />
            </div>
            <Button type="submit" className="w-full" disabled={createAsset.isPending}>
              {createAsset.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Asset"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assets Tabs */}
      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          {assetsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading assets...</p>
              </CardContent>
            </Card>
          ) : assets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No assets registered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(assets as any[]).map((asset: any) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <CardDescription className="capitalize">{asset.assetType}</CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.status === "active"
                            ? "bg-green-100 text-green-800"
                            : asset.status === "maintenance_needed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {asset.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Purchase Price</p>
                            <p className="font-semibold">${parseFloat(asset.purchaseValue || "0").toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purchase Date</p>
                        <p className="font-semibold">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                      </div>
                      {asset.notes && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Notes</p>
                          <p className="font-semibold">{asset.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Dialog open={showMaintenance && selectedAssetId === asset.id} onOpenChange={setShowMaintenance}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedAssetId(asset.id)}
                          >
                            <Wrench className="w-4 h-4 mr-1" />
                            Maintain
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Record Maintenance</DialogTitle>
                            <DialogDescription>Add maintenance record for {asset.name}</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddMaintenance} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="maintenanceDate">Maintenance Date</Label>
                              <Input id="maintenanceDate" name="maintenanceDate" type="date" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maintenanceType">Maintenance Type</Label>
                              <Select name="maintenanceType" defaultValue="routine">
                                <SelectTrigger id="maintenanceType">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="routine">Routine</SelectItem>
                                  <SelectItem value="preventive">Preventive</SelectItem>
                                  <SelectItem value="repair">Repair</SelectItem>
                                  <SelectItem value="inspection">Inspection</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea id="description" name="description" placeholder="Maintenance details..." />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cost">Cost</Label>
                              <Input id="cost" name="cost" type="number" step="0.01" placeholder="0" />
                            </div>
                            <Button type="submit" className="w-full" disabled={createMaintenance.isPending}>
                              {createMaintenance.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Record Maintenance"
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => deleteAsset.mutate({ id: asset.id })}
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

        <TabsContent value="maintenance" className="space-y-4">
          {!selectedAssetId ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Select an asset to view maintenance records</p>
              </CardContent>
            </Card>
          ) : maintenanceLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading maintenance records...</p>
              </CardContent>
            </Card>
          ) : maintenanceRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No maintenance records yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(maintenanceRecords as any[]).map((record: any) => {
                const asset = assets.find((a: any) => a.id === record.assetId);
                return (
                  <Card key={record.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{asset?.name}</CardTitle>
                          <CardDescription>{new Date(record.maintenanceDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.maintenanceType}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {record.description && <p><strong>Description:</strong> {record.description}</p>}
                      {record.cost && <p><strong>Cost:</strong> ${parseFloat(record.cost || "0").toFixed(2)}</p>}
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
                <CardTitle>Asset Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Active</span>
                  <span className="font-semibold text-green-600">{stats.activeAssets}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Maintenance Needed</span>
                  <span className="font-semibold text-red-600">{stats.maintenanceNeeded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{stats.totalAssets}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Asset Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Total Value</span>
                  <span className="font-semibold">${stats.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Average Value</span>
                  <span className="font-semibold">
                    ${(stats.totalAssets > 0 ? stats.totalValue / stats.totalAssets : 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
