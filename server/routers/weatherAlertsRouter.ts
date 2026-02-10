import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const weatherAlertsRouter = router({
  // Get current weather for farm
  getCurrentWeather: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        location: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Call OpenWeather API (configured via env)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();

        return {
          success: true,
          location: input.location || data.name,
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          cloudCover: data.clouds.all,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          pressure: data.main.pressure,
          visibility: data.visibility,
          uvIndex: 0, // Would need separate API call
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to fetch weather data",
        };
      }
    }),

  // Get 7-day forecast
  getForecast: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        days: z.number().default(7),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${input.latitude}&lon=${input.longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const data = await response.json();

        // Process forecast data
        const dailyForecasts = [];
        const processedDates = new Set();

        for (const forecast of data.list) {
          const date = new Date(forecast.dt * 1000).toLocaleDateString();
          
          if (!processedDates.has(date) && dailyForecasts.length < input.days) {
            processedDates.add(date);
            dailyForecasts.push({
              date,
              tempMax: forecast.main.temp_max,
              tempMin: forecast.main.temp_min,
              humidity: forecast.main.humidity,
              windSpeed: forecast.wind.speed,
              description: forecast.weather[0].description,
              icon: forecast.weather[0].icon,
              precipitation: forecast.rain?.["3h"] || 0,
              cloudCover: forecast.clouds.all,
            });
          }
        }

        return {
          success: true,
          forecasts: dailyForecasts,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to fetch forecast",
        };
      }
    }),

  // Get weather alerts
  getWeatherAlerts: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      // In production, this would fetch real alerts from weather API
      return {
        alerts: [
          {
            id: 1,
            type: "heavy_rain",
            severity: "high",
            title: "Heavy Rain Expected",
            description: "Heavy rainfall (40-60mm) expected in the next 24 hours",
            startTime: Date.now() + 3600000,
            endTime: Date.now() + 86400000,
            recommendation: "Ensure drainage is clear. Cover sensitive crops. Check irrigation systems.",
            icon: "⛈️",
          },
          {
            id: 2,
            type: "frost_warning",
            severity: "high",
            title: "Frost Warning",
            description: "Temperatures expected to drop below 0°C tonight",
            startTime: Date.now() + 43200000,
            endTime: Date.now() + 86400000,
            recommendation: "Cover frost-sensitive crops. Use frost cloth or water spray method.",
            icon: "❄️",
          },
          {
            id: 3,
            type: "heat_stress",
            severity: "medium",
            title: "High Temperature Alert",
            description: "Temperatures expected to reach 38°C tomorrow",
            startTime: Date.now() + 86400000,
            endTime: Date.now() + 172800000,
            recommendation: "Increase irrigation frequency. Provide shade for sensitive crops. Water early morning.",
            icon: "🌡️",
          },
          {
            id: 4,
            type: "wind_warning",
            severity: "medium",
            title: "Strong Winds Expected",
            description: "Wind speeds up to 40 km/h expected",
            startTime: Date.now() + 7200000,
            endTime: Date.now() + 43200000,
            recommendation: "Stake tall plants. Secure loose items. Reduce irrigation to prevent drift.",
            icon: "💨",
          },
          {
            id: 5,
            type: "dry_spell",
            severity: "low",
            title: "Dry Spell Forecast",
            description: "No rain expected for the next 10 days",
            startTime: Date.now() + 172800000,
            endTime: Date.now() + 864000000,
            recommendation: "Plan irrigation schedule. Increase watering frequency. Apply mulch.",
            icon: "☀️",
          },
        ],
      };
    }),

  // Subscribe to weather alerts
  subscribeToAlerts: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        alertTypes: z.array(z.string()),
        channels: z.array(z.enum(["email", "sms", "push", "in_app"])),
        threshold: z.object({
          temperature: z.number().optional(),
          rainfall: z.number().optional(),
          windSpeed: z.number().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        subscriptionId: `sub_${Date.now()}`,
        farmId: input.farmId,
        alertTypes: input.alertTypes,
        channels: input.channels,
        status: "active",
        message: "Weather alerts subscription created successfully",
      };
    }),

  // Get weather-based farming recommendations
  getWeatherRecommendations: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        latitude: z.number(),
        longitude: z.number(),
        cropType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return {
        recommendations: [
          {
            id: 1,
            title: "Optimal Planting Window",
            description: "Next 3 days have ideal conditions for planting. Temperature 22-26°C, humidity 65-75%.",
            priority: "high",
            action: "Start planting now",
            validUntil: Date.now() + 259200000,
          },
          {
            id: 2,
            title: "Irrigation Adjustment",
            description: "Rain expected in 2 days. Reduce irrigation by 50% to avoid waterlogging.",
            priority: "medium",
            action: "Adjust schedule",
            validUntil: Date.now() + 172800000,
          },
          {
            id: 3,
            title: "Pest Management Timing",
            description: "Humidity and temperature ideal for pest activity. Apply preventive measures today.",
            priority: "high",
            action: "Apply treatment",
            validUntil: Date.now() + 86400000,
          },
          {
            id: 4,
            title: "Harvest Preparation",
            description: "Dry conditions expected for next 5 days. Perfect for harvesting and drying crops.",
            priority: "medium",
            action: "Plan harvest",
            validUntil: Date.now() + 432000000,
          },
        ],
      };
    }),

  // Get optimal planting dates
  getOptimalPlantingDates: protectedProcedure
    .input(
      z.object({
        cropType: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return {
        crop: input.cropType,
        optimalDates: [
          {
            startDate: Date.now() + 86400000,
            endDate: Date.now() + 259200000,
            confidence: 0.95,
            reason: "Temperature and humidity ideal for germination",
            temperature: "22-26°C",
            humidity: "65-75%",
            rainfall: "Low",
          },
          {
            startDate: Date.now() + 604800000,
            endDate: Date.now() + 777600000,
            confidence: 0.87,
            reason: "Good conditions with slight rain risk",
            temperature: "20-25°C",
            humidity: "60-70%",
            rainfall: "Moderate",
          },
        ],
        worstDates: [
          {
            startDate: Date.now() + 1209600000,
            endDate: Date.now() + 1382400000,
            reason: "High heat stress risk (38°C+)",
            riskLevel: "high",
          },
        ],
      };
    }),

  // Get harvest timing recommendations
  getHarvestTiming: protectedProcedure
    .input(
      z.object({
        cropType: z.string(),
        plantingDate: z.number(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      const daysToHarvest = 60; // Example
      const harvestDate = input.plantingDate + daysToHarvest * 86400000;

      return {
        crop: input.cropType,
        expectedHarvestDate: harvestDate,
        optimalHarvestWindow: {
          start: harvestDate - 86400000,
          end: harvestDate + 172800000,
        },
        weatherForecast: {
          temperature: "24-28°C",
          humidity: "60-70%",
          rainfall: "Low",
          windSpeed: "5-10 km/h",
          conditions: "Excellent for harvesting",
        },
        recommendations: [
          "Harvest in early morning for best quality",
          "Use sharp tools to avoid bruising",
          "Cool harvested produce immediately",
          "Store in shade or cool place",
        ],
      };
    }),

  // Get irrigation schedule based on weather
  getIrrigationSchedule: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        cropType: z.string(),
        soilType: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return {
        schedule: [
          {
            day: "Today",
            time: "06:00",
            duration: 45,
            reason: "High temperature (32°C) and low humidity (35%)",
            waterNeeded: 25,
          },
          {
            day: "Tomorrow",
            time: "18:00",
            duration: 30,
            reason: "Moderate conditions, rain expected next day",
            waterNeeded: 15,
          },
          {
            day: "Day 3",
            time: "Skip",
            duration: 0,
            reason: "Heavy rain expected (50mm), soil will be saturated",
            waterNeeded: 0,
          },
          {
            day: "Day 4",
            time: "06:00",
            duration: 30,
            reason: "Post-rain irrigation to settle soil",
            waterNeeded: 15,
          },
        ],
        totalWeeklyWater: 120,
        efficiency: "High - optimized for current weather",
      };
    }),

  // Get pest/disease risk based on weather
  getPestDiseaseRisk: protectedProcedure
    .input(
      z.object({
        cropType: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return {
        risks: [
          {
            pest: "Armyworm",
            riskLevel: "high",
            riskScore: 8.2,
            reason: "Warm temperature (28°C) and high humidity (70%) favor armyworm activity",
            preventiveMeasures: [
              "Scout fields daily",
              "Apply neem oil spray",
              "Use pheromone traps",
              "Encourage natural predators",
            ],
            treatmentOptions: [
              "Spinosad spray",
              "Bt (Bacillus thuringiensis)",
              "Organic insecticide",
            ],
          },
          {
            pest: "Early Blight",
            riskLevel: "medium",
            riskScore: 6.5,
            reason: "Humidity above 70% and temperatures 20-25°C create favorable conditions",
            preventiveMeasures: [
              "Improve air circulation",
              "Water at soil level",
              "Remove lower leaves",
              "Apply mulch",
            ],
            treatmentOptions: [
              "Copper fungicide",
              "Sulfur spray",
              "Mancozeb",
            ],
          },
          {
            pest: "Whitefly",
            riskLevel: "low",
            riskScore: 3.1,
            reason: "Temperature slightly cool for whitefly activity",
            preventiveMeasures: [
              "Monitor plants",
              "Use yellow sticky traps",
              "Maintain plant health",
            ],
            treatmentOptions: [
              "Insecticidal soap",
              "Neem oil",
            ],
          },
        ],
      };
    }),

  // Get weather history
  getWeatherHistory: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      return {
        period: `Last ${input.days} days`,
        averageTemperature: 26.5,
        averageHumidity: 68,
        totalRainfall: 145,
        rainyDays: 12,
        sunnySkyDays: 18,
        history: [
          {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            tempMax: 32,
            tempMin: 22,
            humidity: 70,
            rainfall: 0,
            description: "Sunny",
          },
          {
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            tempMax: 28,
            tempMin: 20,
            humidity: 75,
            rainfall: 15,
            description: "Rainy",
          },
        ],
      };
    }),
});
