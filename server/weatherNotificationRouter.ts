import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { farms } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

interface WeatherAlert {
  farmId: number;
  farmName: string;
  alertType: string;
  severity: "info" | "warning" | "critical";
  message: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
}

export const weatherNotificationRouter = router({
  checkAllFarmsWeather: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));
      const alerts: WeatherAlert[] = [];

      for (const farm of userFarms) {
        if (!farm.gpsLatitude || !farm.gpsLongitude) continue;

        const lat = parseFloat(farm.gpsLatitude);
        const lon = parseFloat(farm.gpsLongitude);

        if (!OPENWEATHER_API_KEY) {
          console.log("Weather API key not configured, skipping weather checks");
          continue;
        }

        try {
          const response = await fetch(
            `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );

          if (!response.ok) continue;

          const data = await response.json();

          // Frost warning
          if (data.main.temp < 5) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "frost_risk",
              severity: data.main.temp < 0 ? "critical" : "warning",
              message: `Frost risk detected at ${farm.farmName}. Current temperature: ${data.main.temp}°C. Protect sensitive crops immediately.`,
              temperature: data.main.temp,
            });
          }

          // Heat stress warning
          if (data.main.temp > 35) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "heat_stress",
              severity: "critical",
              message: `Extreme heat at ${farm.farmName}. Current temperature: ${data.main.temp}°C. Increase irrigation and provide shade for livestock.`,
              temperature: data.main.temp,
            });
          }

          // High humidity warning
          if (data.main.humidity > 90) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "high_humidity",
              severity: "warning",
              message: `High humidity at ${farm.farmName} (${data.main.humidity}%). Monitor for fungal diseases and improve ventilation.`,
              humidity: data.main.humidity,
            });
          }

          // Strong wind warning
          if (data.wind.speed > 12) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "high_wind",
              severity: "warning",
              message: `Strong winds at ${farm.farmName} (${data.wind.speed} m/s). Secure loose structures and stake plants.`,
              windSpeed: data.wind.speed,
            });
          }

          // Heavy rain warning (based on clouds and forecast)
          if (data.clouds.all > 90) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "heavy_clouds",
              severity: "info",
              message: `Heavy cloud cover at ${farm.farmName}. Heavy rain likely. Ensure proper drainage and postpone field operations.`,
            });
          }
        } catch (error) {
          console.error(`Error checking weather for farm ${farm.id}:`, error);
        }
      }

      // Send notifications for critical and warning alerts
      if (alerts.length > 0) {
        const criticalAlerts = alerts.filter(a => a.severity === "critical");
        const warningAlerts = alerts.filter(a => a.severity === "warning");

        if (criticalAlerts.length > 0) {
          const message = criticalAlerts.map(a => `🚨 ${a.message}`).join("\n\n");
          await notifyOwner({
            title: `⚠️ ${criticalAlerts.length} Critical Weather Alert${criticalAlerts.length > 1 ? "s" : ""}`,
            content: message,
          });
        }

        if (warningAlerts.length > 0) {
          const message = warningAlerts.map(a => `⚠️ ${a.message}`).join("\n\n");
          await notifyOwner({
            title: `${warningAlerts.length} Weather Warning${warningAlerts.length > 1 ? "s" : ""}`,
            content: message,
          });
        }
      }

      return {
        success: true,
        alertsFound: alerts.length,
        alerts,
      };
    } catch (error) {
      console.error("Error checking farm weather:", error);
      return {
        success: false,
        alertsFound: 0,
        alerts: [],
      };
    }
  }),

  getWeatherAlerts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));
      const alerts: WeatherAlert[] = [];

      for (const farm of userFarms) {
        if (!farm.gpsLatitude || !farm.gpsLongitude) continue;

        const lat = parseFloat(farm.gpsLatitude);
        const lon = parseFloat(farm.gpsLongitude);

        if (!OPENWEATHER_API_KEY) continue;

        try {
          const response = await fetch(
            `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );

          if (!response.ok) continue;

          const data = await response.json();

          // Check for alerts
          if (data.main.temp < 5) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "frost_risk",
              severity: data.main.temp < 0 ? "critical" : "warning",
              message: `Frost risk. Temperature: ${data.main.temp}°C`,
              temperature: data.main.temp,
            });
          }

          if (data.main.temp > 35) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "heat_stress",
              severity: "critical",
              message: `Extreme heat. Temperature: ${data.main.temp}°C`,
              temperature: data.main.temp,
            });
          }

          if (data.main.humidity > 90) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "high_humidity",
              severity: "warning",
              message: `High humidity: ${data.main.humidity}%`,
              humidity: data.main.humidity,
            });
          }

          if (data.wind.speed > 12) {
            alerts.push({
              farmId: farm.id,
              farmName: farm.farmName,
              alertType: "high_wind",
              severity: "warning",
              message: `Strong winds: ${data.wind.speed} m/s`,
              windSpeed: data.wind.speed,
            });
          }
        } catch (error) {
          console.error(`Error getting alerts for farm ${farm.id}:`, error);
        }
      }

      return alerts;
    } catch (error) {
      console.error("Error getting weather alerts:", error);
      return [];
    }
  }),
});
