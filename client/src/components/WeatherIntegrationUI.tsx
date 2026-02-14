'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, TrendingUp } from 'lucide-react';

interface WeatherData {
  date: string;
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
}

interface RiskFactor {
  name: string;
  risk: number;
  crops: string[];
  recommendation: string;
}

export const WeatherIntegrationUI = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('Farm A');
  const [forecastDays, setForecastDays] = useState(7);

  useEffect(() => {
    // Simulate weather data
    const mockWeatherData: WeatherData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      temp: 22 + Math.random() * 8,
      humidity: 60 + Math.random() * 30,
      rainfall: Math.random() * 50,
      windSpeed: 5 + Math.random() * 15,
      uvIndex: 3 + Math.random() * 7,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
    }));
    setWeatherData(mockWeatherData);

    // Simulate risk factors
    const mockRiskFactors: RiskFactor[] = [
      {
        name: 'Pest Risk',
        risk: 65,
        crops: ['Corn', 'Wheat'],
        recommendation: 'Monitor for armyworms. Consider preventive spray if humidity stays above 70%.'
      },
      {
        name: 'Disease Risk',
        risk: 45,
        crops: ['Rice', 'Potato'],
        recommendation: 'Fungal disease risk moderate. Ensure proper drainage and ventilation.'
      },
      {
        name: 'Frost Risk',
        risk: 15,
        crops: ['Tomato', 'Cucumber'],
        recommendation: 'Low frost risk. Safe to plant tender crops.'
      },
      {
        name: 'Drought Risk',
        risk: 25,
        crops: ['Wheat', 'Barley'],
        recommendation: 'Moderate drought risk. Increase irrigation frequency.'
      }
    ];
    setRiskFactors(mockRiskFactors);
  }, [selectedLocation, forecastDays]);

  const currentWeather = weatherData[weatherData.length - 1] || {};
  const forecastData = weatherData.slice(-forecastDays);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Weather Integration & Risk Planning</h1>
        <div className="flex gap-4">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option>Farm A</option>
            <option>Farm B</option>
            <option>Farm C</option>
          </select>
          <select
            value={forecastDays}
            onChange={(e) => setForecastDays(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Temperature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{currentWeather.temp?.toFixed(1)}°C</div>
                  <Sun className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Optimal for most crops</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Humidity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{currentWeather.humidity?.toFixed(0)}%</div>
                  <Droplets className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Moderate disease risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Wind Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{currentWeather.windSpeed?.toFixed(1)} km/h</div>
                  <Wind className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Good for spray application</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">UV Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{currentWeather.uvIndex?.toFixed(1)}</div>
                  <Sun className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Moderate exposure</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Temperature & Humidity Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" fill="#fef3c7" name="Temperature (°C)" />
                  <Area yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" fill="#dbeafe" name="Humidity (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{forecastDays}-Day Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="temp" fill="#f59e0b" name="Temperature (°C)" />
                  <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (mm)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {forecastData.map((day, idx) => (
              <Card key={idx} className="p-3">
                <p className="text-xs font-semibold text-center">{day.date}</p>
                <div className="flex justify-center my-2">
                  {day.condition === 'Sunny' && <Sun className="w-6 h-6 text-yellow-500" />}
                  {day.condition === 'Rainy' && <CloudRain className="w-6 h-6 text-blue-500" />}
                  {day.condition === 'Cloudy' && <Cloud className="w-6 h-6 text-gray-500" />}
                  {day.condition === 'Partly Cloudy' && <Cloud className="w-6 h-6 text-gray-400" />}
                </div>
                <p className="text-xs text-center">{day.temp.toFixed(0)}°C</p>
                <p className="text-xs text-center text-blue-600">{day.rainfall.toFixed(1)}mm</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          {riskFactors.map((factor, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {factor.risk > 60 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {factor.risk > 40 && factor.risk <= 60 && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    {factor.risk <= 40 && <AlertTriangle className="w-5 h-5 text-green-500" />}
                    {factor.name}
                  </CardTitle>
                  <span className={`text-2xl font-bold ${factor.risk > 60 ? 'text-red-600' : factor.risk > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {factor.risk}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Affected Crops:</p>
                  <div className="flex flex-wrap gap-2">
                    {factor.crops.map((crop, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
                <Alert>
                  <AlertDescription>{factor.recommendation}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="w-4 h-4" />
                <AlertDescription>
                  <strong>Irrigation:</strong> Current humidity at {currentWeather.humidity?.toFixed(0)}%. Reduce irrigation frequency by 20% to prevent waterlogging.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Pest Management:</strong> High pest risk detected. Monitor crops daily and consider preventive spray in next 3 days.
                </AlertDescription>
              </Alert>

              <Alert>
                <Cloud className="w-4 h-4" />
                <AlertDescription>
                  <strong>Spray Application:</strong> Wind speed optimal for spray application today. Apply pesticides/fungicides between 6-10 AM.
                </AlertDescription>
              </Alert>

              <Alert>
                <Sun className="w-4 h-4" />
                <AlertDescription>
                  <strong>Harvesting:</strong> Forecast shows 3 days of clear weather. Ideal window for harvesting wheat and barley.
                </AlertDescription>
              </Alert>

              <Alert>
                <Droplets className="w-4 h-4" />
                <AlertDescription>
                  <strong>Disease Prevention:</strong> Humidity trending upward. Increase ventilation and reduce leaf wetness duration to prevent fungal diseases.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherIntegrationUI;
