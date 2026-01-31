import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sprout, TrendingUp, MapPin, ThermometerSun, Droplets, AlertCircle } from "lucide-react";

export default function CropPlanning() {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [compareCrops, setCompareCrops] = useState<string[]>([]);

  // Queries
  const { data: farmsData } = trpc.farms.list.useQuery();
  const { data: availableCrops } = trpc.cropPlanning.getAvailableCrops.useQuery();

  const selectedFarm = farmsData?.find((f: any) => f.id === selectedFarmId);

  const { data: plantingRecommendations, isLoading: loadingRecommendations } =
    trpc.cropPlanning.getOptimalPlantingDates.useQuery(
      {
        cropType: selectedCrop,
        latitude: parseFloat(selectedFarm?.gpsLatitude || "0"),
        longitude: parseFloat(selectedFarm?.gpsLongitude || "0"),
      },
      {
        enabled: !!selectedCrop && !!selectedFarm?.gpsLatitude && !!selectedFarm?.gpsLongitude,
      }
    );

  const { data: comparison, isLoading: loadingComparison } = trpc.cropPlanning.compareCrops.useQuery(
    {
      cropTypes: compareCrops,
      latitude: parseFloat(selectedFarm?.gpsLatitude || "0"),
      longitude: parseFloat(selectedFarm?.gpsLongitude || "0"),
    },
    {
      enabled: compareCrops.length > 0 && !!selectedFarm?.gpsLatitude && !!selectedFarm?.gpsLongitude,
    }
  );

  const handleAddCropToCompare = (crop: string) => {
    if (!compareCrops.includes(crop) && compareCrops.length < 4) {
      setCompareCrops([...compareCrops, crop]);
    }
  };

  const handleRemoveCropFromCompare = (crop: string) => {
    setCompareCrops(compareCrops.filter((c) => c !== crop));
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sprout className="h-8 w-8" />
          Crop Planning & Weather Integration
        </h1>
        <p className="text-muted-foreground mt-2">
          Get weather-based planting recommendations for optimal crop yields
        </p>
      </div>

      {/* Farm Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Farm Location
          </CardTitle>
          <CardDescription>Choose a farm to get location-specific recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedFarmId?.toString() || ""}
            onValueChange={(value) => setSelectedFarmId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a farm" />
            </SelectTrigger>
            <SelectContent>
              {farmsData?.map((farm: any) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName} - {farm.location}
                  {farm.gpsLatitude && farm.gpsLongitude && " ✓"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFarm && !selectedFarm.gpsLatitude && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  GPS coordinates not set
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Please add GPS coordinates to this farm to get weather-based recommendations.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFarm && selectedFarm.gpsLatitude && (
        <Tabs defaultValue="single" className="space-y-4">
          <TabsList>
            <TabsTrigger value="single">Single Crop Analysis</TabsTrigger>
            <TabsTrigger value="compare">Compare Crops</TabsTrigger>
          </TabsList>

          {/* Single Crop Analysis */}
          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Crop</CardTitle>
                <CardDescription>Choose a crop to analyze optimal planting dates</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCrops?.map((crop) => (
                      <SelectItem key={crop.name} value={crop.name}>
                        {crop.displayName} ({crop.growingDays} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {loadingRecommendations && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Analyzing weather patterns and crop requirements...
                </CardContent>
              </Card>
            )}

            {plantingRecommendations && !("error" in plantingRecommendations) && plantingRecommendations.cropInfo && (
              <>
                {/* Crop Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">{plantingRecommendations.cropType} Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3">
                        <ThermometerSun className="h-5 w-5 text-orange-600 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Optimal Temperature</p>
                          <p className="font-semibold">{plantingRecommendations.cropInfo.optimalTempRange}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Droplets className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Rainfall Requirement</p>
                          <p className="font-semibold">{plantingRecommendations.cropInfo.rainfallRequirement}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Growing Period</p>
                          <p className="font-semibold">{plantingRecommendations.cropInfo.growingPeriod}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Sprout className="h-5 w-5 text-purple-600 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Preferred Months</p>
                          <p className="font-semibold text-sm">{plantingRecommendations.cropInfo.preferredMonths}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Planting Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Planting Dates</CardTitle>
                    <CardDescription>
                      Based on weather forecast and crop requirements
                      {"note" in plantingRecommendations && plantingRecommendations.note && ` • ${plantingRecommendations.note}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plantingRecommendations.recommendations?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No optimal planting dates found in the forecast period. Consider checking again later or
                        consulting traditional planting calendars.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {plantingRecommendations.recommendations?.map((rec: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold text-lg">
                                  {new Date(rec.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expected harvest: {new Date(rec.expectedHarvestDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                variant={rec.suitabilityScore >= 80 ? "default" : "secondary"}
                                className="text-lg px-3 py-1"
                              >
                                {rec.suitabilityScore}%
                              </Badge>
                            </div>

                            {rec.temperature !== undefined && (
                              <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Temperature:</span>{" "}
                                  <span className="font-medium">{rec.temperature.toFixed(1)}°C</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Rainfall:</span>{" "}
                                  <span className="font-medium">{rec.rainfall.toFixed(1)}mm</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Humidity:</span>{" "}
                                  <span className="font-medium">{rec.humidity}%</span>
                                </div>
                              </div>
                            )}

                            <div className="space-y-1">
                              {rec.reasons.map((reason: string, i: number) => (
                                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5">•</span>
                                  {reason}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Compare Crops */}
          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Crops to Compare</CardTitle>
                <CardDescription>Compare up to 4 crops for the same location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {compareCrops.map((crop) => (
                      <Badge key={crop} variant="secondary" className="px-3 py-1">
                        {crop}
                        <button
                          onClick={() => handleRemoveCropFromCompare(crop)}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <Select
                    value=""
                    onValueChange={handleAddCropToCompare}
                    disabled={compareCrops.length >= 4}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add a crop to compare" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCrops
                        ?.filter((crop) => !compareCrops.includes(crop.name))
                        .map((crop) => (
                          <SelectItem key={crop.name} value={crop.name}>
                            {crop.displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loadingComparison && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Comparing crops...
                </CardContent>
              </Card>
            )}

            {comparison && (
              <>
                {/* Best Crop Recommendation */}
                {comparison.bestCrop && (
                  <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Best Crop for Current Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold capitalize">{comparison.bestCrop.cropType}</p>
                          <p className="text-muted-foreground">
                            Suitability Score:{" "}
                            {comparison.bestCrop.recommendations?.[0]?.suitabilityScore || 0}%
                          </p>
                        </div>
                        <Badge variant="default" className="text-lg px-4 py-2">
                          Recommended
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparison.comparisons.map((comp: any) => (
                        <div key={comp.cropType} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg capitalize">{comp.cropType}</h3>
                            <Badge variant="secondary">
                              {comp.recommendations?.[0]?.suitabilityScore || 0}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Temp Range:</span>{" "}
                              <span className="font-medium">{comp.cropInfo.optimalTempRange}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rainfall:</span>{" "}
                              <span className="font-medium">{comp.cropInfo.rainfallRequirement}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Growing Period:</span>{" "}
                              <span className="font-medium">{comp.cropInfo.growingPeriod}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Best Date:</span>{" "}
                              <span className="font-medium">
                                {comp.recommendations?.[0]?.date
                                  ? new Date(comp.recommendations[0].date).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
