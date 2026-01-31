import { getDb } from "./db";
import { farms, weatherHistory, alerts } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import cron from "node-cron";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

interface WeatherAlert {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  farmId: number;
  farmName: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
}

/**
 * Fetch weather data for a specific farm location
 */
async function fetchWeatherForFarm(farmId: number, latitude: number, longitude: number) {
  if (!OPENWEATHER_API_KEY) {
    console.log(`[WeatherCron] API key not configured, skipping farm ${farmId}`);
    return null;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      console.warn(`[WeatherCron] Weather API request failed for farm ${farmId}`);
      return null;
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
    };
  } catch (error) {
    console.error(`[WeatherCron] Error fetching weather for farm ${farmId}:`, error);
    return null;
  }
}

/**
 * Analyze weather data and generate alerts
 */
function analyzeWeatherForAlerts(
  weatherData: any,
  farmId: number,
  farmName: string
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Temperature alerts
  if (weatherData.temperature < 0) {
    alerts.push({
      type: "frost_risk",
      severity: "critical",
      message: `Frost risk detected at ${farmName}. Protect sensitive crops.`,
      farmId,
      farmName,
      temperature: weatherData.temperature,
    });
  }
  if (weatherData.temperature > 35) {
    alerts.push({
      type: "heat_stress",
      severity: "critical",
      message: `High temperature alert at ${farmName}. Increase irrigation.`,
      farmId,
      farmName,
      temperature: weatherData.temperature,
    });
  }

  // Humidity alerts
  if (weatherData.humidity > 90) {
    alerts.push({
      type: "high_humidity",
      severity: "warning",
      message: `High humidity at ${farmName}. Monitor for fungal diseases.`,
      farmId,
      farmName,
      humidity: weatherData.humidity,
    });
  }
  if (weatherData.humidity < 30) {
    alerts.push({
      type: "low_humidity",
      severity: "warning",
      message: `Low humidity at ${farmName}. Increase watering frequency.`,
      farmId,
      farmName,
      humidity: weatherData.humidity,
    });
  }

  // Wind alerts
  if (weatherData.windSpeed > 10) {
    alerts.push({
      type: "high_wind",
      severity: "warning",
      message: `Strong winds at ${farmName}. Secure loose structures.`,
      farmId,
      farmName,
      windSpeed: weatherData.windSpeed,
    });
  }

  return alerts;
}

/**
 * Store weather data in history table
 */
async function storeWeatherHistory(farmId: number, weatherData: any) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(weatherHistory).values({
      farmId,
      recordedAt: new Date(),
      temperature: weatherData.temperature.toString(),
      feelsLike: weatherData.feelsLike.toString(),
      humidity: weatherData.humidity,
      pressure: weatherData.pressure,
      windSpeed: weatherData.windSpeed.toString(),
      cloudCover: weatherData.cloudiness,
      precipitation: "0", // Not available in current weather API
      weatherCondition: weatherData.description,
      weatherDescription: weatherData.description,
    });
  } catch (error) {
    console.error(`[WeatherCron] Error storing weather history for farm ${farmId}:`, error);
  }
}

/**
 * Store weather alerts in database
 */
async function storeWeatherAlerts(weatherAlerts: WeatherAlert[]) {
  if (weatherAlerts.length === 0) return;

  const db = await getDb();
  if (!db) return;

  try {
    const alertRecords = weatherAlerts.map((alert) => ({
      deviceId: 0, // Weather alerts are not device-specific
      farmId: alert.farmId,
      alertType: alert.type,
      message: alert.message,
      severity: alert.severity,
      isResolved: false,
    }));

    await db.insert(alerts).values(alertRecords);
  } catch (error) {
    console.error("[WeatherCron] Error storing weather alerts:", error);
  }
}

/**
 * Send notification digest to owner
 */
async function sendWeatherDigest(alerts: WeatherAlert[], checkTime: string) {
  if (alerts.length === 0) {
    console.log(`[WeatherCron] No alerts to send for ${checkTime} check`);
    return;
  }

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");

  let message = `**Weather Check - ${checkTime}**\n\n`;
  message += `Total Alerts: ${alerts.length}\n`;
  message += `Critical: ${criticalAlerts.length} | Warnings: ${warningAlerts.length}\n\n`;

  if (criticalAlerts.length > 0) {
    message += `**Critical Alerts:**\n`;
    criticalAlerts.forEach((alert) => {
      message += `- ${alert.message}\n`;
    });
    message += `\n`;
  }

  if (warningAlerts.length > 0) {
    message += `**Warnings:**\n`;
    warningAlerts.forEach((alert) => {
      message += `- ${alert.message}\n`;
    });
  }

  try {
    await notifyOwner({
      title: `Weather Alert Digest - ${checkTime}`,
      content: message,
    });
    console.log(`[WeatherCron] Notification sent for ${checkTime} check`);
  } catch (error) {
    console.error("[WeatherCron] Error sending notification:", error);
  }
}

/**
 * Main cron job function - runs weather checks for all farms
 */
export async function runWeatherCheck(checkTime: "6 AM" | "6 PM") {
  console.log(`[WeatherCron] Starting weather check at ${checkTime}`);

  try {
    // Fetch all farms with coordinates
    const db = await getDb();
    if (!db) {
      console.error("[WeatherCron] Database not available");
      return;
    }
    
    const allFarms = await db.select().from(farms);
    console.log(`[WeatherCron] Found ${allFarms.length} farms to check`);

    const allAlerts: WeatherAlert[] = [];

    for (const farm of allFarms) {
      if (!farm.gpsLatitude || !farm.gpsLongitude) {
        console.log(`[WeatherCron] Skipping farm ${farm.id} - no coordinates`);
        continue;
      }

      // Fetch weather data
      const weatherData = await fetchWeatherForFarm(
        farm.id,
        parseFloat(farm.gpsLatitude),
        parseFloat(farm.gpsLongitude)
      );

      if (!weatherData) {
        continue;
      }

      // Store in history
      await storeWeatherHistory(farm.id, weatherData);

      // Analyze for alerts
      const farmAlerts = analyzeWeatherForAlerts(weatherData, farm.id, farm.farmName);
      allAlerts.push(...farmAlerts);

      console.log(
        `[WeatherCron] Farm ${farm.farmName}: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity, ${farmAlerts.length} alerts`
      );
    }

    // Store all alerts in database
    await storeWeatherAlerts(allAlerts);

    // Send digest notification
    await sendWeatherDigest(allAlerts, checkTime);

    console.log(`[WeatherCron] Weather check completed at ${checkTime}`);
  } catch (error) {
    console.error(`[WeatherCron] Error during ${checkTime} weather check:`, error);
  }
}

/**
 * Initialize cron jobs for 6 AM and 6 PM checks
 * This should be called from server startup
 */
export function initializeWeatherCron() {
  console.log("[WeatherCron] Initializing weather cron jobs");

  // Schedule for 6 AM (every day at 6:00 AM)
  // Cron format: minute hour day month dayOfWeek
  cron.schedule("0 6 * * *", () => {
    console.log("[WeatherCron] Triggering 6 AM weather check");
    runWeatherCheck("6 AM").catch((error) => {
      console.error("[WeatherCron] Error in 6 AM check:", error);
    });
  }, {
    timezone: "Africa/Accra" // Ghana timezone
  });
  
  // Schedule for 6 PM (every day at 6:00 PM)
  cron.schedule("0 18 * * *", () => {
    console.log("[WeatherCron] Triggering 6 PM weather check");
    runWeatherCheck("6 PM").catch((error) => {
      console.error("[WeatherCron] Error in 6 PM check:", error);
    });
  }, {
    timezone: "Africa/Accra" // Ghana timezone
  });

  console.log("[WeatherCron] Cron jobs scheduled:");
  console.log("  - Morning check: 6:00 AM (Africa/Accra)");
  console.log("  - Evening check: 6:00 PM (Africa/Accra)");

  // Manual trigger for testing (uncomment to test immediately)
  // runWeatherCheck("6 AM").catch(console.error);
}
