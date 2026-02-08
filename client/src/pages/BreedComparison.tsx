import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Plus, X, Download } from "lucide-react";

export function BreedComparison() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null);
  const [selectedBreedIds, setSelectedBreedIds] = useState<number[]>([]);

  // Fetch species
  const { data: speciesData } =
    trpc.multiSpecies.getSpeciesTemplates.useQuery({
      limit: 20,
    });

  // Fetch breeds for selected species
  const { data: breedsData } =
    trpc.multiSpecies.getBreedsBySpecies.useQuery(
      { speciesId: selectedSpeciesId || 0, limit: 100 },
      { enabled: !!selectedSpeciesId }
    );

  const species = speciesData?.templates || [];
  const breeds = breedsData?.breeds || [];
  const selectedBreeds = breeds.filter((b) => selectedBreedIds.includes(b.id));

  const handleSelectBreed = (breedId: number) => {
    setSelectedBreedIds((prev) =>
      prev.includes(breedId)
        ? prev.filter((id) => id !== breedId)
        : [...prev, breedId]
    );
  };

  const handleRemoveBreed = (breedId: number) => {
    setSelectedBreedIds((prev) => prev.filter((id) => id !== breedId));
  };

  const handleExport = () => {
    const csv = [
      ["Breed Comparison Report"],
      [],
      ["Breed Name", "Origin", "Rarity", "Characteristics"],
      ...selectedBreeds.map((b) => [
        b.breedName,
        b.origin || "N/A",
        b.rarity || "N/A",
        b.characteristics ? JSON.stringify(b.characteristics) : "N/A",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "breed-comparison.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Breed Comparison Tool</h1>
        <p className="text-gray-600 mt-1">
          Compare characteristics and production capabilities across breeds
        </p>
      </div>

      {/* Species Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select Species</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {species.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSpeciesId(s.id);
                setSelectedBreedIds([]);
              }}
              className={`p-3 rounded-lg border-2 transition ${
                selectedSpeciesId === s.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="font-medium text-sm">{s.speciesName}</div>
            </button>
          ))}
        </div>
      </Card>

      {selectedSpeciesId && (
        <>
          {/* Breed Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Select Breeds to Compare</h2>
              <Badge variant="secondary">
                {selectedBreedIds.length} selected
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {breeds.map((breed) => (
                <button
                  key={breed.id}
                  onClick={() => handleSelectBreed(breed.id)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedBreedIds.includes(breed.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{breed.breedName}</div>
                      {breed.origin && (
                        <div className="text-sm text-gray-600 mt-1">
                          Origin: {breed.origin}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {breed.rarity}
                        </Badge>
                        {breed.adaptability && (
                          <Badge variant="outline" className="text-xs">
                            {breed.adaptability}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Selected Breeds Summary */}
          {selectedBreeds.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Comparison Summary</h2>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>

              {/* Breed Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedBreeds.map((breed) => (
                  <div
                    key={breed.id}
                    className="p-4 border rounded-lg relative"
                  >
                    <button
                      onClick={() => handleRemoveBreed(breed.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h3 className="font-semibold text-lg mb-3">
                      {breed.breedName}
                    </h3>

                    <div className="space-y-2 text-sm">
                      {breed.origin && (
                        <div>
                          <span className="font-medium">Origin:</span>{" "}
                          {breed.origin}
                        </div>
                      )}
                      {breed.rarity && (
                        <div>
                          <span className="font-medium">Rarity:</span>{" "}
                          <Badge variant="outline" className="text-xs ml-1">
                            {breed.rarity}
                          </Badge>
                        </div>
                      )}
                      {breed.adaptability && (
                        <div>
                          <span className="font-medium">Adaptability:</span>{" "}
                          {breed.adaptability}
                        </div>
                      )}
                      {breed.description && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          {breed.description}
                        </div>
                      )}
                    </div>

                    {/* Characteristics */}
                    {breed.characteristics && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium text-sm mb-2">
                          Characteristics
                        </p>
                        <div className="text-xs space-y-1">
                          {Object.entries(breed.characteristics as Record<string, any>).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">
                                  {key}:
                                </span>{" "}
                                {String(value)}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Production Capabilities */}
                    {breed.productionCapabilities && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium text-sm mb-2">
                          Production Capabilities
                        </p>
                        <div className="text-xs space-y-1">
                          {Object.entries(breed.productionCapabilities as Record<string, any>).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">
                                  {key}:
                                </span>{" "}
                                {String(value)}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 text-left font-semibold">Attribute</th>
                      {selectedBreeds.map((breed) => (
                        <th
                          key={breed.id}
                          className="p-2 text-left font-semibold"
                        >
                          {breed.breedName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Origin</td>
                      {selectedBreeds.map((breed) => (
                        <td key={breed.id} className="p-2">
                          {breed.origin || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Rarity</td>
                      {selectedBreeds.map((breed) => (
                        <td key={breed.id} className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {breed.rarity || "N/A"}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Adaptability</td>
                      {selectedBreeds.map((breed) => (
                        <td key={breed.id} className="p-2">
                          {breed.adaptability || "N/A"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
