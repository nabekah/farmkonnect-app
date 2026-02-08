import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader,
} from "lucide-react";

interface SpeciesSelection {
  speciesId: number;
  speciesName: string;
  breeds: number[];
  productionType: string;
}

export function SpeciesSelectionWizard({
  onComplete,
  onCancel,
}: {
  onComplete: (selections: SpeciesSelection[]) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesSelection[]>([]);
  const [currentSpeciesId, setCurrentSpeciesId] = useState<number | null>(null);
  const [selectedBreeds, setSelectedBreeds] = useState<number[]>([]);

  // tRPC hooks
  const { data: speciesData, isLoading: speciesLoading } =
    trpc.multiSpecies.getSpeciesTemplates.useQuery({
      limit: 20,
    });

  const { data: breedsData, isLoading: breedsLoading } =
    trpc.multiSpecies.getBreedsBySpecies.useQuery(
      { speciesId: currentSpeciesId || 0 },
      { enabled: !!currentSpeciesId }
    );

  const species = speciesData?.templates || [];
  const breeds = breedsData?.breeds || [];

  const handleSelectSpecies = (speciesId: number, speciesName: string) => {
    setCurrentSpeciesId(speciesId);
    setSelectedBreeds([]);
    setStep(2);
  };

  const handleSelectBreed = (breedId: number) => {
    setSelectedBreeds((prev) =>
      prev.includes(breedId)
        ? prev.filter((id) => id !== breedId)
        : [...prev, breedId]
    );
  };

  const handleConfirmSpecies = () => {
    if (!currentSpeciesId) return;

    const currentSpecies = species.find((s) => s.id === currentSpeciesId);
    if (currentSpecies) {
      setSelectedSpecies((prev) => [
        ...prev,
        {
          speciesId: currentSpeciesId,
          speciesName: currentSpecies.speciesName,
          breeds: selectedBreeds,
          productionType: currentSpecies.productionType || "",
        },
      ]);
    }

    setCurrentSpeciesId(null);
    setSelectedBreeds([]);
    setStep(1);
  };

  const handleRemoveSpecies = (speciesId: number) => {
    setSelectedSpecies((prev) =>
      prev.filter((s) => s.speciesId !== speciesId)
    );
  };

  const handleComplete = () => {
    if (selectedSpecies.length > 0) {
      onComplete(selectedSpecies);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Select Your Livestock Species</h2>
            <p className="text-gray-600">
              Choose the species you raise on your farm. You can add multiple species.
            </p>
          </div>

          {/* Step 1: Species Selection */}
          {step === 1 && (
            <div>
              {speciesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {species.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSpecies(s.id, s.speciesName)}
                      className="p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                    >
                      <div className="text-lg font-semibold">{s.speciesName}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {s.productionType}
                      </div>
                      {s.description && (
                        <div className="text-xs text-gray-500 mt-2">
                          {s.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Species Summary */}
              {selectedSpecies.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Selected Species</h3>
                  <div className="space-y-2">
                    {selectedSpecies.map((s) => (
                      <div
                        key={s.speciesId}
                        className="flex items-center justify-between p-2 bg-white rounded"
                      >
                        <div>
                          <div className="font-medium">{s.speciesName}</div>
                          {s.breeds.length > 0 && (
                            <div className="text-sm text-gray-600">
                              {s.breeds.length} breed(s) selected
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveSpecies(s.speciesId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Breed Selection */}
          {step === 2 && currentSpeciesId && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Select Breeds (Optional)
                </h3>
                <p className="text-sm text-gray-600">
                  Choose specific breeds you raise. Leave empty to select all breeds.
                </p>
              </div>

              {breedsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 mb-6 max-h-96 overflow-y-auto">
                  {breeds.map((breed) => (
                    <button
                      key={breed.id}
                      onClick={() => handleSelectBreed(breed.id)}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        selectedBreeds.includes(breed.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{breed.breedName}</div>
                          {breed.origin && (
                            <div className="text-sm text-gray-600">
                              Origin: {breed.origin}
                            </div>
                          )}
                        </div>
                        {selectedBreeds.includes(breed.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>

            <div className="flex gap-3">
              {step === 2 && (
                <Button onClick={handleConfirmSpecies} className="gap-2">
                  Confirm Species
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {step === 1 && selectedSpecies.length > 0 && (
                <Button
                  onClick={handleComplete}
                  variant="default"
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Complete Setup
                </Button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            {step === 1 && "Step 1: Select Species"}
            {step === 2 && "Step 2: Select Breeds (Optional)"}
          </div>
        </div>
      </Card>
    </div>
  );
}
