import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Heart, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const ANIMAL_TYPES = [
  { id: 1, name: "Cattle" },
  { id: 2, name: "Pig" },
  { id: 3, name: "Goat" },
  { id: 4, name: "Sheep" },
  { id: 5, name: "Poultry" },
  { id: 6, name: "Other" },
];

export default function LivestockManagement() {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [showNewAnimal, setShowNewAnimal] = useState(false);
  const [showHealthRecord, setShowHealthRecord] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  // Fetch farms
  const { data: farms = [] } = trpc.farms.list.useQuery();

  // Set first farm as default
  useMemo(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  // Fetch animals
  const { data: animals = [], isLoading: animalsLoading, refetch: refetchAnimals } = trpc.livestock.animals.list.useQuery(
    selectedFarmId ? { farmId: selectedFarmId } : { farmId: 0 },
    { enabled: !!selectedFarmId }
  );

  // Fetch health records
  const { data: healthRecords = [], isLoading: healthLoading, refetch: refetchHealth } = trpc.livestock.healthRecords.list.useQuery(
    selectedAnimalId ? { animalId: selectedAnimalId } : { animalId: 0 },
    { enabled: !!selectedAnimalId }
  );

  // Mutations
  const createAnimal = trpc.livestock.animals.create.useMutation({
    onSuccess: () => {
      refetchAnimals();
      setShowNewAnimal(false);
    },
  });

  const deleteAnimal = trpc.livestock.animals.delete.useMutation({
    onSuccess: () => {
      refetchAnimals();
    },
  });

  const createHealthRecord = trpc.livestock.healthRecords.create.useMutation({
    onSuccess: () => {
      refetchHealth();
      setShowHealthRecord(false);
    },
  });

  // Health records deletion not available in current router

  // Calculate stats
  const stats = {
    totalAnimals: animals.length,
    activeAnimals: animals.filter((a) => a.status === "active").length,
    soldAnimals: animals.filter((a) => a.status === "sold").length,
    totalBatches: animals.length,
  };

  const handleAddAnimal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    const formData = new FormData(e.currentTarget);
    const typeId = parseInt(formData.get("typeId") as string);

    await createAnimal.mutateAsync({
      farmId: selectedFarmId,
      typeId,
      uniqueTagId: (formData.get("uniqueTagId") as string) || undefined,
      birthDate: formData.get("birthDate") ? new Date(formData.get("birthDate") as string) : undefined,
      gender: (formData.get("gender") as any) || "unknown",
      breed: (formData.get("breed") as string) || undefined,
    });

    (e.target as HTMLFormElement).reset();
  };

  const handleAddHealthRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAnimalId) return;

    const formData = new FormData(e.currentTarget);

    await createHealthRecord.mutateAsync({
      animalId: selectedAnimalId,
      recordDate: new Date(formData.get("recordDate") as string),
      eventType: (formData.get("eventType") as any) || "checkup",
      details: (formData.get("details") as string) || undefined,
    });

    (e.target as HTMLFormElement).reset();
  };

  // Group animals by type
  const animalsByType = animals.reduce((acc: Record<string, any[]>, animal) => {
    const typeObj = ANIMAL_TYPES.find((t) => t.id === animal.typeId);
    const type = typeObj?.name || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(animal);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Livestock Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Track and manage your livestock</p>
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
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnimals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAnimals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.soldAnimals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBatches}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Animal Button */}
      <Dialog open={showNewAnimal} onOpenChange={setShowNewAnimal}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Animal</DialogTitle>
            <DialogDescription>Register a new animal to your farm</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAnimal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typeId">Animal Type</Label>
              <Select name="typeId" defaultValue="1">
                <SelectTrigger id="typeId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMAL_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" name="breed" placeholder="e.g., Holstein" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniqueTagId">Tag ID</Label>
              <Input id="uniqueTagId" name="uniqueTagId" placeholder="e.g., TAG-001" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" defaultValue="unknown">
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input id="birthDate" name="birthDate" type="date" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createAnimal.isPending}>
              {createAnimal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Animal"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Animals Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Animals</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {animalsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading animals...</p>
              </CardContent>
            </Card>
          ) : animals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No animals registered yet</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(animalsByType).map(([type, typeAnimals]) => (
              <div key={type} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize">{type}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(typeAnimals as any[]).map((animal) => (
                    <Card key={animal.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg capitalize">{animal.breed || type}</CardTitle>
                            <CardDescription>ID: {animal.uniqueTagId || animal.id}</CardDescription>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              animal.status === "active" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {animal.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Gender</p>
                            <p className="font-semibold capitalize">{animal.gender || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Birth Date</p>
                            <p className="font-semibold">
                              {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Dialog open={showHealthRecord && selectedAnimalId === animal.id} onOpenChange={setShowHealthRecord}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedAnimalId(animal.id)}
                              >
                                <Heart className="w-4 h-4 mr-1" />
                                Health
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Record Health Event</DialogTitle>
                                <DialogDescription>Add health record for {animal.breed || type}</DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleAddHealthRecord} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="recordDate">Date</Label>
                                  <Input id="recordDate" name="recordDate" type="date" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="eventType">Event Type</Label>
                                  <Select name="eventType" defaultValue="checkup">
                                    <SelectTrigger id="eventType">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="vaccination">Vaccination</SelectItem>
                                      <SelectItem value="treatment">Treatment</SelectItem>
                                      <SelectItem value="illness">Illness</SelectItem>
                                      <SelectItem value="checkup">Checkup</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="details">Details</Label>
                                  <Textarea id="details" name="details" placeholder="Details about the event..." />
                                </div>
                                <Button type="submit" className="w-full" disabled={createHealthRecord.isPending}>
                                  {createHealthRecord.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Record Event"
                                  )}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => deleteAnimal.mutate({ id: animal.id })}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {!selectedAnimalId ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Select an animal to view health records</p>
              </CardContent>
            </Card>
          ) : healthLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading health records...</p>
              </CardContent>
            </Card>
          ) : healthRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No health records yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(healthRecords as any[]).map((record) => {
                const animal = animals.find((a) => a.id === record.animalId);
                return (
                  <Card key={record.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{animal?.breed || "Animal"}</CardTitle>
                          <CardDescription>{new Date(record.recordDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.eventType}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {record.details && <p><strong>Details:</strong> {record.details}</p>}

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
                <CardTitle>Animals by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(animalsByType).map(([type, typeAnimals]) => (
                  <div key={type} className="flex justify-between items-center pb-2 border-b">
                    <span className="capitalize font-medium">{type}</span>
                    <span className="font-semibold">{(typeAnimals as any[]).length} records</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Active</span>
                  <span className="font-semibold text-green-600">{stats.activeAnimals}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Sold</span>
                  <span className="font-semibold text-orange-600">{stats.soldAnimals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{stats.totalAnimals}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
