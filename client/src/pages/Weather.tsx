import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Weather() {
  const { user } = useAuth();
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [selectedAnimal, setSelectedAnimal] = useState("cattle");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: farms = [] } = trpc.farms.list.useQuery();

  // Get location from selected farm or use geolocation
  useEffect(() => {
    if (selectedFarm) {
      const farm = farms.find((f: any) => f.id === selectedFarm);
      if (farm && farm.gpsLatitude && farm.gpsLongitude) {
        setLocation({
          latitude: parseFloat(farm.gpsLatitude),
          longitude: parseFloat(farm.gpsLongitude),
        });
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, [selectedFarm, farms]);

  const { data: currentWeather, isLoading: weatherLoading } = trpc.weather.getCurrentWeather.useQuery(
    location ? { latitude: location.latitude, longitude: location.longitude } : { latitude: 0, longitude: 0 },
    { enabled: !!location }
  );

  const { data: forecast } = trpc.weather.getForecast.useQuery(
    location ? { latitude: location.latitude, longitude: location.longitude, days: 5 } : { latitude: 0, longitude: 0, days: 5 },
    { enabled: !!location }
  );

  const { data: alerts } = trpc.weather.getWeatherAlerts.useQuery(
    location ? { latitude: location.latitude, longitude: location.longitude } : { latitude: 0, longitude: 0 },
    { enabled: !!location }
  );

  const { data: cropRecs } = trpc.weather.getCropRecommendations.useQuery(
    location ? { latitude: location.latitude, longitude: location.longitude, cropType: selectedCrop } : { latitude: 0, longitude: 0, cropType: selectedCrop },
    { enabled: !!location }
  );

  const { data: livestockRecs } = trpc.weather.getLivestockRecommendations.useQuery(
    location ? { latitude: location.latitude, longitude: location.longitude, animalType: selectedAnimal } : { latitude: 0, longitude: 0, animalType: selectedAnimal },
    { enabled: !!location }
  );

  if (!user || !location) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const chartData = forecast ? {
    labels: forecast.slice(0, 24).map((f: any) => new Date(f.timestamp).toLocaleTimeString([], { hour: "2-digit" })),
    datasets: [
      {
        label: "Temperature (°C)",
        data: forecast.slice(0, 24).map((f: any) => f.temperature),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: "Humidity (%)",
        data: forecast.slice(0, 24).map((f: any) => f.humidity),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  } : null;

  const getWeatherIcon = (description: string) => {
    if (description.includes("rain")) return <CloudRain className="h-8 w-8 text-blue-500" />;
    if (description.includes("cloud")) return <Cloud className="h-8 w-8 text-gray-500" />;
    return <Sun className="h-8 w-8 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weather & Recommendations</h1>
          <p className="text-muted-foreground">Real-time weather data and farm recommendations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Select Farm</label>
          <Select value={selectedFarm?.toString() || ""} onValueChange={(v) => setSelectedFarm(parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a farm" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm: any) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Weather</span>
              {getWeatherIcon(currentWeather.description)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{currentWeather.temperature}°C</p>
                <p className="text-xs text-muted-foreground">Feels like {currentWeather.feelsLike}°C</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Droplets className="h-5 w-5" /> {currentWeather.humidity}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Wind className="h-5 w-5" /> {currentWeather.windSpeed} m/s
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cloud Cover</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Cloud className="h-5 w-5" /> {currentWeather.cloudiness}%
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm capitalize text-muted-foreground">
              {currentWeather.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert: any, idx: number) => (
            <Alert key={idx} variant={alert.severity === "critical" ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
          <TabsTrigger value="crops">Crop Recommendations</TabsTrigger>
          <TabsTrigger value="livestock">Livestock Recommendations</TabsTrigger>
        </TabsList>

        {/* Forecast */}
        <TabsContent value="forecast" className="space-y-4">
          {chartData && (
            <Card>
              <CardHeader>
                <CardTitle>Temperature & Humidity Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" as const } } }} />
              </CardContent>
            </Card>
          )}
          {forecast && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {forecast.slice(0, 5).map((day: any, idx: number) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">{new Date(day.timestamp).toLocaleDateString()}</p>
                    <div className="flex justify-center my-2">{getWeatherIcon(day.description)}</div>
                    <p className="text-lg font-bold">{day.temperature}°C</p>
                    <p className="text-xs text-muted-foreground capitalize">{day.description}</p>
                    <p className="text-xs mt-2">💧 {day.humidity}%</p>
                    <p className="text-xs">🌧️ {Math.round(day.rainProbability)}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Crop Recommendations */}
        <TabsContent value="crops" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Crop Type</label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="corn">Corn</SelectItem>
                <SelectItem value="rice">Rice</SelectItem>
                <SelectItem value="tomato">Tomato</SelectItem>
                <SelectItem value="potato">Potato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cropRecs && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations for {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cropRecs.recommendations.length > 0 ? (
                  cropRecs.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                        {rec.priority}
                      </Badge>
                      <div>
                        <p className="font-medium capitalize">{rec.action.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">{rec.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No specific recommendations at this time.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Livestock Recommendations */}
        <TabsContent value="livestock" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Animal Type</label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cattle">Cattle</SelectItem>
                <SelectItem value="sheep">Sheep</SelectItem>
                <SelectItem value="chicken">Chicken</SelectItem>
                <SelectItem value="pig">Pig</SelectItem>
                <SelectItem value="horse">Horse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {livestockRecs && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations for {selectedAnimal.charAt(0).toUpperCase() + selectedAnimal.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {livestockRecs.recommendations.length > 0 ? (
                  livestockRecs.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Badge variant={rec.priority === "critical" ? "destructive" : rec.priority === "high" ? "secondary" : "default"}>
                        {rec.priority}
                      </Badge>
                      <div>
                        <p className="font-medium capitalize">{rec.action.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">{rec.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No specific recommendations at this time.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
