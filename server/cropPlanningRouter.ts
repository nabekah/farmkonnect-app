import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Crop requirements database
 * Temperature ranges and rainfall requirements for common West African crops
 */
const CROP_REQUIREMENTS: Record<string, {
  optimalTempMin: number;
  optimalTempMax: number;
  minRainfallMm: number;
  maxRainfallMm: number;
  growingDays: number;
  plantingMonths: number[]; // Preferred months (1-12)
}> = {
  maize: {
    optimalTempMin: 18,
    optimalTempMax: 30,
    minRainfallMm: 500,
    maxRainfallMm: 1000,
    growingDays: 90,
    plantingMonths: [3, 4, 5, 9], // March-May, September (Ghana rainy seasons)
  },
  rice: {
    optimalTempMin: 20,
    optimalTempMax: 35,
    minRainfallMm: 1000,
    maxRainfallMm: 2000,
    growingDays: 120,
    plantingMonths: [4, 5, 6],
  },
  cassava: {
    optimalTempMin: 25,
    optimalTempMax: 35,
    minRainfallMm: 1000,
    maxRainfallMm: 1500,
    growingDays: 300,
    plantingMonths: [3, 4, 5, 9, 10],
  },
  yam: {
    optimalTempMin: 25,
    optimalTempMax: 30,
    minRainfallMm: 1000,
    maxRainfallMm: 1500,
    growingDays: 240,
    plantingMonths: [2, 3, 4],
  },
  cocoa: {
    optimalTempMin: 21,
    optimalTempMax: 32,
    minRainfallMm: 1500,
    maxRainfallMm: 2000,
    growingDays: 365,
    plantingMonths: [4, 5, 6],
  },
  groundnut: {
    optimalTempMin: 20,
    optimalTempMax: 30,
    minRainfallMm: 500,
    maxRainfallMm: 1000,
    growingDays: 100,
    plantingMonths: [4, 5, 9],
  },
  sorghum: {
    optimalTempMin: 25,
    optimalTempMax: 35,
    minRainfallMm: 400,
    maxRainfallMm: 800,
    growingDays: 100,
    plantingMonths: [5, 6, 7],
  },
  millet: {
    optimalTempMin: 25,
    optimalTempMax: 35,
    minRainfallMm: 300,
    maxRainfallMm: 600,
    growingDays: 90,
    plantingMonths: [5, 6, 7],
  },
  cowpea: {
    optimalTempMin: 20,
    optimalTempMax: 30,
    minRainfallMm: 500,
    maxRainfallMm: 1000,
    growingDays: 70,
    plantingMonths: [4, 5, 9],
  },
  tomato: {
    optimalTempMin: 18,
    optimalTempMax: 27,
    minRainfallMm: 400,
    maxRainfallMm: 800,
    growingDays: 80,
    plantingMonths: [1, 2, 3, 10, 11, 12],
  },
};

/**
 * Analyze weather forecast and determine optimal planting dates
 */
async function analyzeOptimalPlantingDates(
  cropType: string,
  latitude: number,
  longitude: number
) {
  const crop = CROP_REQUIREMENTS[cropType.toLowerCase()];
  if (!crop) {
    return {
      error: "Crop not found in database",
      availableCrops: Object.keys(CROP_REQUIREMENTS),
    };
  }

  if (!OPENWEATHER_API_KEY) {
    return {
      error: "Weather API not configured",
      recommendations: [],
    };
  }

  try {
    // Fetch 16-day forecast (maximum available from OpenWeatherMap)
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=16&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      // Fallback to current month analysis
      return analyzeCurrentMonthSuitability(cropType, crop);
    }

    const data = await response.json();
    const recommendations = [];

    // Analyze each day in the forecast
    for (let i = 0; i < data.list.length; i++) {
      const day = data.list[i];
      const date = new Date(day.dt * 1000);
      const temp = day.temp.day;
      const rain = day.rain || 0;
      const humidity = day.humidity;

      // Calculate suitability score (0-100)
      let score = 100;
      let reasons = [];

      // Temperature suitability
      if (temp < crop.optimalTempMin) {
        score -= 30;
        reasons.push(`Temperature (${temp.toFixed(1)}°C) below optimal range`);
      } else if (temp > crop.optimalTempMax) {
        score -= 30;
        reasons.push(`Temperature (${temp.toFixed(1)}°C) above optimal range`);
      } else {
        reasons.push(`Temperature (${temp.toFixed(1)}°C) is optimal`);
      }

      // Rainfall suitability (check if rain is expected)
      if (rain > 0) {
        score += 10;
        reasons.push(`Rainfall expected (${rain.toFixed(1)}mm)`);
      } else if (humidity > 70) {
        score += 5;
        reasons.push(`High humidity (${humidity}%) indicates moisture`);
      }

      // Month suitability
      const month = date.getMonth() + 1;
      if (crop.plantingMonths.includes(month)) {
        score += 15;
        reasons.push(`${date.toLocaleString('default', { month: 'long' })} is a preferred planting month`);
      } else {
        score -= 10;
        reasons.push(`Not a traditional planting month for this crop`);
      }

      // Only recommend dates with score >= 60
      if (score >= 60) {
        recommendations.push({
          date: date.toISOString().split('T')[0],
          suitabilityScore: Math.round(score),
          temperature: temp,
          rainfall: rain,
          humidity: humidity,
          reasons: reasons,
          expectedHarvestDate: new Date(date.getTime() + crop.growingDays * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });
      }
    }

    // Sort by suitability score
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return {
      cropType,
      recommendations: recommendations.slice(0, 5), // Top 5 dates
      cropInfo: {
        optimalTempRange: `${crop.optimalTempMin}-${crop.optimalTempMax}°C`,
        rainfallRequirement: `${crop.minRainfallMm}-${crop.maxRainfallMm}mm`,
        growingPeriod: `${crop.growingDays} days`,
        preferredMonths: crop.plantingMonths.map((m: number) => 
          new Date(2024, m - 1, 1).toLocaleString('default', { month: 'long' })
        ).join(', '),
      },
    };
  } catch (error) {
    console.error("[CropPlanning] Error fetching weather forecast:", error);
    return analyzeCurrentMonthSuitability(cropType, crop);
  }
}

/**
 * Fallback: Analyze current month suitability without forecast
 */
function analyzeCurrentMonthSuitability(cropType: string, crop: any) {
  const currentMonth = new Date().getMonth() + 1;
  const isPreferredMonth = crop.plantingMonths.includes(currentMonth);

  return {
    cropType,
    recommendations: [{
      date: new Date().toISOString().split('T')[0],
      suitabilityScore: isPreferredMonth ? 75 : 50,
      reasons: isPreferredMonth
        ? [`Current month is a preferred planting month for ${cropType}`]
        : [`Current month is not traditionally optimal for ${cropType}`],
      expectedHarvestDate: new Date(Date.now() + crop.growingDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    }],
    cropInfo: {
      optimalTempRange: `${crop.optimalTempMin}-${crop.optimalTempMax}°C`,
      rainfallRequirement: `${crop.minRainfallMm}-${crop.maxRainfallMm}mm`,
      growingPeriod: `${crop.growingDays} days`,
      preferredMonths: crop.plantingMonths.map((m: number) => 
        new Date(2024, m - 1, 1).toLocaleString('default', { month: 'long' })
      ).join(', '),
    },
    note: "Weather forecast unavailable. Recommendations based on traditional planting calendar.",
  };
}

export const cropPlanningRouter = router({
  /**
   * Get optimal planting dates for a specific crop based on weather forecast
   */
  getOptimalPlantingDates: protectedProcedure
    .input(
      z.object({
        cropType: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return analyzeOptimalPlantingDates(
        input.cropType,
        input.latitude,
        input.longitude
      );
    }),

  /**
   * Get list of available crops in the planning database
   */
  getAvailableCrops: protectedProcedure.query(() => {
    return Object.keys(CROP_REQUIREMENTS).map((crop) => ({
      name: crop,
      displayName: crop.charAt(0).toUpperCase() + crop.slice(1),
      growingDays: CROP_REQUIREMENTS[crop].growingDays,
      optimalTempRange: `${CROP_REQUIREMENTS[crop].optimalTempMin}-${CROP_REQUIREMENTS[crop].optimalTempMax}°C`,
    }));
  }),

  /**
   * Compare multiple crops for the same location
   */
  compareCrops: protectedProcedure
    .input(
      z.object({
        cropTypes: z.array(z.string()),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      const results = await Promise.all(
        input.cropTypes.map((crop) =>
          analyzeOptimalPlantingDates(crop, input.latitude, input.longitude)
        )
      );

      return {
        comparisons: results,
        bestCrop: results.reduce((best, current) => {
          const bestScore = best.recommendations?.[0]?.suitabilityScore || 0;
          const currentScore = current.recommendations?.[0]?.suitabilityScore || 0;
          return currentScore > bestScore ? current : best;
        }, results[0]),
      };
    }),
});
