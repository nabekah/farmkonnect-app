import { getDb } from "./db";
import { irrigationZones, irrigationRecommendations, soilMoistureReadings } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

export interface IrrigationCalculationInput {
  zoneId: number;
  currentMoisture: number; // percentage 0-100
  targetMoisture: number; // percentage
  minMoisture: number; // trigger threshold
  maxMoisture: number; // prevent overwatering
  fieldCapacity: number; // water holding capacity %
  wiltingPoint: number; // stress point %
  areaHectares: number;
  cropType: string;
  soilType: string;
  temperature: number; // soil temperature °C
  humidity: number; // air humidity %
  rainfallForecast: number; // mm expected in next 24h
  evapotranspirationRate: number; // mm/day
}

export interface IrrigationRecommendation {
  type: "irrigate_now" | "delay" | "skip" | "increase" | "decrease";
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  recommendedDurationMinutes: number;
  estimatedWaterNeeded: number; // liters
  weatherFactor: number; // % adjustment
  soilMoistureFactor: number; // current moisture %
  cropWaterRequirement: number; // mm/day
}

/**
 * Calculate irrigation requirements based on soil moisture, weather, and crop needs
 */
export function calculateIrrigationNeeds(input: IrrigationCalculationInput): IrrigationRecommendation {
  const {
    currentMoisture,
    targetMoisture,
    minMoisture,
    maxMoisture,
    fieldCapacity,
    wiltingPoint,
    areaHectares,
    cropType,
    soilType,
    temperature,
    humidity,
    rainfallForecast,
    evapotranspirationRate,
  } = input;

  // Calculate available water capacity
  const availableWaterCapacity = fieldCapacity - wiltingPoint;
  const depletionAllowance = availableWaterCapacity * 0.5; // typically 50% depletion before irrigation

  // Calculate crop water requirement based on type and weather
  const baseWaterRequirement = getCropWaterRequirement(cropType);
  const temperatureFactor = getTemperatureFactor(temperature);
  const humidityFactor = getHumidityFactor(humidity);
  const cropWaterRequirement = baseWaterRequirement * temperatureFactor * humidityFactor;

  // Adjust for rainfall forecast
  const effectiveEvapotranspiration = Math.max(0, evapotranspirationRate - rainfallForecast);
  const weatherAdjustment = rainfallForecast > 0 ? (1 - rainfallForecast / 25) : 1; // reduce if rain expected

  // Determine if irrigation is needed
  let recommendation: IrrigationRecommendation;

  if (currentMoisture <= minMoisture) {
    // Critical - soil is too dry
    const waterDeficit = targetMoisture - currentMoisture;
    const waterNeeded = calculateWaterVolume(waterDeficit, areaHectares, soilType);

    recommendation = {
      type: "irrigate_now",
      priority: "critical",
      reason: `Soil moisture (${currentMoisture.toFixed(1)}%) is below minimum threshold (${minMoisture}%). Immediate irrigation required to prevent crop stress.`,
      recommendedDurationMinutes: calculateDuration(waterNeeded),
      estimatedWaterNeeded: waterNeeded,
      weatherFactor: weatherAdjustment * 100,
      soilMoistureFactor: currentMoisture,
      cropWaterRequirement: cropWaterRequirement,
    };
  } else if (currentMoisture <= targetMoisture - depletionAllowance) {
    // High priority - approaching minimum
    const waterDeficit = targetMoisture - currentMoisture;
    const waterNeeded = calculateWaterVolume(waterDeficit, areaHectares, soilType);

    if (rainfallForecast > 10) {
      // Significant rain expected, delay irrigation
      recommendation = {
        type: "delay",
        priority: "medium",
        reason: `Rainfall of ${rainfallForecast}mm expected in next 24h. Delay irrigation to avoid overwatering.`,
        recommendedDurationMinutes: 0,
        estimatedWaterNeeded: 0,
        weatherFactor: weatherAdjustment * 100,
        soilMoistureFactor: currentMoisture,
        cropWaterRequirement: cropWaterRequirement,
      };
    } else {
      recommendation = {
        type: "irrigate_now",
        priority: "high",
        reason: `Soil moisture (${currentMoisture.toFixed(1)}%) is approaching minimum. Irrigation recommended to maintain optimal crop growth.`,
        recommendedDurationMinutes: calculateDuration(waterNeeded),
        estimatedWaterNeeded: waterNeeded,
        weatherFactor: weatherAdjustment * 100,
        soilMoistureFactor: currentMoisture,
        cropWaterRequirement: cropWaterRequirement,
      };
    }
  } else if (currentMoisture >= maxMoisture) {
    // Too wet - prevent overwatering
    recommendation = {
      type: "skip",
      priority: "high",
      reason: `Soil moisture (${currentMoisture.toFixed(1)}%) exceeds maximum threshold (${maxMoisture}%). Skip irrigation to prevent root rot and waterlogging.`,
      recommendedDurationMinutes: 0,
      estimatedWaterNeeded: 0,
      weatherFactor: weatherAdjustment * 100,
      soilMoistureFactor: currentMoisture,
      cropWaterRequirement: cropWaterRequirement,
    };
  } else if (rainfallForecast > 15) {
    // Significant rain expected
    recommendation = {
      type: "skip",
      priority: "medium",
      reason: `Expected rainfall of ${rainfallForecast}mm in next 24h is sufficient for crop water needs. Skip scheduled irrigation.`,
      recommendedDurationMinutes: 0,
      estimatedWaterNeeded: 0,
      weatherFactor: weatherAdjustment * 100,
      soilMoistureFactor: currentMoisture,
      cropWaterRequirement: cropWaterRequirement,
    };
  } else if (currentMoisture < targetMoisture) {
    // Optimal range but below target
    const waterDeficit = targetMoisture - currentMoisture;
    const waterNeeded = calculateWaterVolume(waterDeficit * 0.5, areaHectares, soilType); // partial irrigation

    recommendation = {
      type: "increase",
      priority: "low",
      reason: `Soil moisture (${currentMoisture.toFixed(1)}%) is in acceptable range but below target. Consider light irrigation to optimize crop growth.`,
      recommendedDurationMinutes: calculateDuration(waterNeeded),
      estimatedWaterNeeded: waterNeeded,
      weatherFactor: weatherAdjustment * 100,
      soilMoistureFactor: currentMoisture,
      cropWaterRequirement: cropWaterRequirement,
    };
  } else {
    // Optimal conditions
    recommendation = {
      type: "skip",
      priority: "low",
      reason: `Soil moisture (${currentMoisture.toFixed(1)}%) is at optimal level. No irrigation needed at this time.`,
      recommendedDurationMinutes: 0,
      estimatedWaterNeeded: 0,
      weatherFactor: weatherAdjustment * 100,
      soilMoistureFactor: currentMoisture,
      cropWaterRequirement: cropWaterRequirement,
    };
  }

  return recommendation;
}

/**
 * Get base water requirement for crop type (mm/day)
 */
function getCropWaterRequirement(cropType: string): number {
  const requirements: Record<string, number> = {
    wheat: 3.5,
    corn: 5.5,
    rice: 6.0,
    tomato: 4.5,
    potato: 4.0,
    cotton: 5.0,
    sugarcane: 6.5,
    alfalfa: 5.5,
  };
  return requirements[cropType.toLowerCase()] || 4.0; // default 4mm/day
}

/**
 * Temperature adjustment factor for evapotranspiration
 */
function getTemperatureFactor(temperature: number): number {
  if (temperature < 10) return 0.5;
  if (temperature < 15) return 0.7;
  if (temperature < 20) return 0.85;
  if (temperature < 25) return 1.0;
  if (temperature < 30) return 1.15;
  if (temperature < 35) return 1.3;
  return 1.4; // >35°C
}

/**
 * Humidity adjustment factor for evapotranspiration
 */
function getHumidityFactor(humidity: number): number {
  // Higher humidity = lower evapotranspiration
  if (humidity > 80) return 0.7;
  if (humidity > 70) return 0.8;
  if (humidity > 60) return 0.9;
  if (humidity > 50) return 1.0;
  if (humidity > 40) return 1.1;
  if (humidity > 30) return 1.2;
  return 1.3; // <30% humidity
}

/**
 * Calculate water volume needed (liters) based on soil moisture deficit
 */
function calculateWaterVolume(
  moistureDeficit: number, // percentage points
  areaHectares: number,
  soilType: string
): number {
  // Soil depth for water calculation (assume 30cm root zone)
  const rootDepthCm = 30;

  // Bulk density varies by soil type (g/cm³)
  const bulkDensity: Record<string, number> = {
    clay: 1.3,
    sandy: 1.6,
    loam: 1.4,
    silt: 1.3,
  };
  const density = bulkDensity[soilType.toLowerCase()] || 1.4;

  // Water volume = (moisture deficit % / 100) × soil depth × bulk density × area
  // Result in liters per hectare
  const waterPerHectare = (moistureDeficit / 100) * rootDepthCm * density * 10000; // 10000 for cm to m conversion
  return waterPerHectare * areaHectares;
}

/**
 * Calculate irrigation duration in minutes based on water needed and flow rate
 */
function calculateDuration(waterNeeded: number, flowRateLitersPerMin: number = 1000): number {
  return Math.ceil(waterNeeded / flowRateLitersPerMin);
}

/**
 * Get latest soil moisture reading for a zone
 */
export async function getLatestMoistureReading(zoneId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;
  const db = dbInstance as any;
  const readings = await db
    .select()
    .from(soilMoistureReadings)
    .where(eq(soilMoistureReadings.zoneId, zoneId))
    .orderBy(desc(soilMoistureReadings.readingTime));

  return readings[0] || null;
}

/**
 * Get average moisture for last N hours
 */
export async function getAverageMoisture(zoneId: number, hoursBack: number = 24) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;
  const db = dbInstance as any;
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const readings = await db
    .select()
    .from(soilMoistureReadings)
    .where(and(eq(soilMoistureReadings.zoneId, zoneId)))
    .orderBy(desc(soilMoistureReadings.readingTime));

  if (!readings || readings.length === 0) return null;

  const validReadings = readings.filter((r: any) => new Date(r.readingTime) > cutoffTime);
  if (validReadings.length === 0) return null;

  const sum = validReadings.reduce((acc: number, r: any) => acc + parseFloat(r.moisturePercentage.toString()), 0);
  return sum / validReadings.length;
}

/**
 * Get moisture trend (increasing, decreasing, stable)
 */
export async function getMoistureTrend(zoneId: number, hoursBack: number = 6) {
  const dbInstance = await getDb();
  if (!dbInstance) return "stable";
  const db = dbInstance as any;
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const readings = await db
    .select()
    .from(soilMoistureReadings)
    .where(and(eq(soilMoistureReadings.zoneId, zoneId)))
    .orderBy(desc(soilMoistureReadings.readingTime));

  if (readings.length < 2) return "stable";
  
  const limitedReadings = readings.slice(0, 10);

  const recent = parseFloat(limitedReadings[0].moisturePercentage.toString());
  const older = parseFloat(limitedReadings[Math.min(5, limitedReadings.length - 1)].moisturePercentage.toString());
  const change = recent - older;

  if (Math.abs(change) < 2) return "stable";
  return change > 0 ? "increasing" : "decreasing";
}
