import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export const weatherRouter = router({
  getCurrentWeather: protectedProcedure
    .input(z.object({ latitude: z.number(), longitude: z.number() }))
    .query(async ({ input }) => {
      try {
        if (!OPENWEATHER_API_KEY) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Weather API not configured",
          });
        }

        const response = await fetch(
          `${OPENWEATHER_BASE_URL}/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        return {
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          cloudiness: data.clouds.all,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000),
        };
      } catch (error) {
        console.error("Weather API error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch weather data",
        });
      }
    }),

  getForecast: protectedProcedure
    .input(z.object({ latitude: z.number(), longitude: z.number(), days: z.number().default(5) }))
    .query(async ({ input }) => {
      try {
        if (!OPENWEATHER_API_KEY) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Weather API not configured",
          });
        }

        const response = await fetch(
          `${OPENWEATHER_BASE_URL}/forecast?lat=${input.latitude}&lon=${input.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const data = await response.json();
        const forecasts = data.list.slice(0, input.days * 8).map((item: any) => ({
          timestamp: new Date(item.dt * 1000),
          temperature: item.main.temp,
          feelsLike: item.main.feels_like,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          windSpeed: item.wind.speed,
          cloudiness: item.clouds.all,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          rainProbability: item.pop * 100,
          rainVolume: item.rain?.["3h"] || 0,
        }));

        return forecasts;
      } catch (error) {
        console.error("Forecast API error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch forecast data",
        });
      }
    }),

  getWeatherAlerts: protectedProcedure
    .input(z.object({ latitude: z.number(), longitude: z.number() }))
    .query(async ({ input }) => {
      try {
        if (!OPENWEATHER_API_KEY) {
          return [];
        }

        const response = await fetch(
          `${OPENWEATHER_BASE_URL}/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        const alerts = [];

        // Temperature alerts
        if (data.main.temp < 0) {
          alerts.push({
            type: "frost_risk",
            severity: "critical",
            message: "Frost risk detected. Protect sensitive crops.",
            temperature: data.main.temp,
          });
        }
        if (data.main.temp > 35) {
          alerts.push({
            type: "heat_stress",
            severity: "critical",
            message: "High temperature alert. Increase irrigation.",
            temperature: data.main.temp,
          });
        }

        // Humidity alerts
        if (data.main.humidity > 90) {
          alerts.push({
            type: "high_humidity",
            severity: "warning",
            message: "High humidity. Monitor for fungal diseases.",
            humidity: data.main.humidity,
          });
        }
        if (data.main.humidity < 30) {
          alerts.push({
            type: "low_humidity",
            severity: "warning",
            message: "Low humidity. Increase watering frequency.",
            humidity: data.main.humidity,
          });
        }

        // Wind alerts
        if (data.wind.speed > 10) {
          alerts.push({
            type: "high_wind",
            severity: "warning",
            message: "Strong winds. Secure loose structures.",
            windSpeed: data.wind.speed,
          });
        }

        // Rain alerts
        if (data.clouds.all > 80) {
          alerts.push({
            type: "heavy_clouds",
            severity: "info",
            message: "Heavy cloud cover. Reduced sunlight expected.",
            cloudiness: data.clouds.all,
          });
        }

        return alerts;
      } catch (error) {
        console.error("Weather alerts error:", error);
        return [];
      }
    }),

  getCropRecommendations: protectedProcedure
    .input(z.object({ cropType: z.string(), latitude: z.number(), longitude: z.number() }))
    .query(async ({ input }) => {
      try {
        if (!OPENWEATHER_API_KEY) {
          return { recommendations: [] };
        }

        const response = await fetch(
          `${OPENWEATHER_BASE_URL}/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          return { recommendations: [] };
        }

        const data = await response.json();
        const recommendations = [];

        // Crop-specific recommendations
        const cropThresholds: Record<string, any> = {
          wheat: { minTemp: 0, maxTemp: 25, optimalHumidity: 60 },
          corn: { minTemp: 10, maxTemp: 30, optimalHumidity: 65 },
          rice: { minTemp: 15, maxTemp: 35, optimalHumidity: 80 },
          tomato: { minTemp: 15, maxTemp: 28, optimalHumidity: 70 },
          potato: { minTemp: 5, maxTemp: 25, optimalHumidity: 75 },
        };

        const thresholds = cropThresholds[input.cropType.toLowerCase()] || cropThresholds.wheat;

        if (data.main.temp < thresholds.minTemp) {
          recommendations.push({
            action: "protect",
            message: `Temperature below optimal range for ${input.cropType}. Consider frost protection.`,
            priority: "high",
          });
        }

        if (data.main.temp > thresholds.maxTemp) {
          recommendations.push({
            action: "irrigate",
            message: `Temperature above optimal range. Increase irrigation to cool plants.`,
            priority: "high",
          });
        }

        if (Math.abs(data.main.humidity - thresholds.optimalHumidity) > 20) {
          recommendations.push({
            action: "adjust_irrigation",
            message: `Humidity outside optimal range. Adjust watering schedule.`,
            priority: "medium",
          });
        }

        if (data.wind.speed > 8) {
          recommendations.push({
            action: "stake_plants",
            message: `Strong winds detected. Ensure plants are properly supported.`,
            priority: "medium",
          });
        }

        return { recommendations, currentConditions: data.main };
      } catch (error) {
        console.error("Crop recommendations error:", error);
        return { recommendations: [] };
      }
    }),

  getLivestockRecommendations: protectedProcedure
    .input(z.object({ animalType: z.string(), latitude: z.number(), longitude: z.number() }))
    .query(async ({ input }) => {
      try {
        if (!OPENWEATHER_API_KEY) {
          return { recommendations: [] };
        }

        const response = await fetch(
          `${OPENWEATHER_BASE_URL}/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          return { recommendations: [] };
        }

        const data = await response.json();
        const recommendations = [];

        // Livestock-specific recommendations
        const animalThresholds: Record<string, any> = {
          cattle: { comfortTemp: 15, heatStressTemp: 28, coldStressTemp: -5 },
          sheep: { comfortTemp: 10, heatStressTemp: 25, coldStressTemp: -10 },
          chicken: { comfortTemp: 20, heatStressTemp: 30, coldStressTemp: 0 },
          pig: { comfortTemp: 18, heatStressTemp: 28, coldStressTemp: -5 },
          horse: { comfortTemp: 12, heatStressTemp: 27, coldStressTemp: -15 },
        };

        const thresholds = animalThresholds[input.animalType.toLowerCase()] || animalThresholds.cattle;

        if (data.main.temp > thresholds.heatStressTemp) {
          recommendations.push({
            action: "provide_shade",
            message: `Heat stress risk for ${input.animalType}. Provide shade and increase water availability.`,
            priority: "critical",
            temperature: data.main.temp,
          });
        }

        if (data.main.temp < thresholds.coldStressTemp) {
          recommendations.push({
            action: "provide_shelter",
            message: `Cold stress risk for ${input.animalType}. Ensure adequate shelter and bedding.`,
            priority: "critical",
            temperature: data.main.temp,
          });
        }

        if (data.main.humidity > 85) {
          recommendations.push({
            action: "improve_ventilation",
            message: `High humidity increases disease risk. Improve shelter ventilation.`,
            priority: "high",
          });
        }

        if (data.wind.speed > 12) {
          recommendations.push({
            action: "secure_shelter",
            message: `Strong winds detected. Ensure shelter is secure and windproof.`,
            priority: "medium",
          });
        }

        return { recommendations, currentConditions: data.main };
      } catch (error) {
        console.error("Livestock recommendations error:", error);
        return { recommendations: [] };
      }
    }),
});
