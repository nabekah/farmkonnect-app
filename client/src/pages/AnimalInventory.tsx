import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Plus, BarChart3, Filter, Download } from "lucide-react";
import { format } from "date-fns";

const ANIMAL_TYPES = [
  { id: 1, name: "Cattle" },
  { id: 2, name: "Sheep" },
  { id: 3, name: "Goat" },
  { id: 4, name: "Pig" },
  { id: 5, name: "Chicken" },
  { id: 6, name: "Duck" },
];

export function AnimalInventory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const { data: farms = [] } = trpc.livestock.farms.list.useQuery({ farmType: undefined });
  const { data: animals = [], isLoading } = trpc.livestock.animals.list.useQuery(
    { farmId: selectedFarmId || 0 },
    { enabled: !!selectedFarmId }
  );

  // Calculate statistics
  const stats = {
    total: animals.length,
    byGender: {
      male: animals.filter((a) => a.gender === "male").length,
      female: animals.filter((a) => a.gender === "female").length,
      unknown: animals.filter((a) => a.gender === "unknown").length,
    },
    bySpecies: ANIMAL_TYPES.map((type) => ({
      name: type.name,
      count: animals.filter((a) => a.typeId === type.id).length,
    })),
  };

  // Filter animals
  const filteredAnimals = animals.filter((animal) => {
    const matchesSpecies = selectedSpecies === "all" || animal.typeId.toString() === selectedSpecies;
    const matchesSearch =
      searchTerm === "" ||
      animal.uniqueTagId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Animal Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your livestock inventory</p>
        </div>

        {/* Farm Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Farm</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedFarmId?.toString() || ""} onValueChange={(val) => setSelectedFarmId(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a farm..." />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id.toString()}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedFarmId && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Animals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Female</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">{stats.byGender.female}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Male</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.byGender.male}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Unknown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-600">{stats.byGender.unknown}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Search by Tag ID or Breed
                    </label>
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Species
                    </label>
                    <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Species</SelectItem>
                        {ANIMAL_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setLocation("/bulk-animal-registration")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Animals
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Animals List */}
            <Card>
              <CardHeader>
                <CardTitle>Animals ({filteredAnimals.length})</CardTitle>
                <CardDescription>
                  Showing {filteredAnimals.length} of {animals.length} animals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredAnimals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No animals found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Tag ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Species</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Breed</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Gender</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Birth Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAnimals.map((animal) => (
                          <tr key={animal.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {animal.uniqueTagId}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {ANIMAL_TYPES.find((t) => t.id === animal.typeId)?.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{animal.breed}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                animal.gender === "male"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : animal.gender === "female"
                                    ? "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}>
                                {animal.gender}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {animal.birthDate ? format(new Date(animal.birthDate), "MMM d, yyyy") : "-"}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
