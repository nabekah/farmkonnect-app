import { getDb } from "../db";
import { eq, and, gte, lte } from "drizzle-orm";

interface PredictionInput {
  farmId: string;
  cropType: string;
  historicalYields: number[];
  rainfall: number;
  temperature: number;
  soilHealth: number;
  fertilizer: number;
  pesticide: number;
}

interface YieldPrediction {
  predictedYield: number;
  confidence: number;
  factors: {
    rainfall: number;
    temperature: number;
    soilHealth: number;
    fertilizer: number;
    pesticide: number;
  };
  recommendation: string;
}

interface DiseaseRiskPrediction {
  diseaseType: string;
  riskLevel: "low" | "medium" | "high";
  probability: number;
  affectedAnimals: string[];
  preventiveMeasures: string[];
  urgency: "immediate" | "soon" | "monitor";
}

interface MarketPricePrediction {
  productType: string;
  predictedPrice: number;
  priceChange: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  recommendation: "sell_now" | "hold" | "wait";
  timeframe: string;
}

class PredictiveAnalyticsEngine {
  /**
   * Predict crop yield based on historical data and environmental factors
   */
  async predictCropYield(input: PredictionInput): Promise<YieldPrediction> {
    const { historicalYields, rainfall, temperature, soilHealth, fertilizer, pesticide } = input;

    // Calculate average historical yield
    const avgHistoricalYield = historicalYields.reduce((a, b) => a + b, 0) / historicalYields.length;

    // Calculate yield variance (standard deviation)
    const variance = historicalYields.reduce((sum, val) => sum + Math.pow(val - avgHistoricalYield, 2), 0) / historicalYields.length;
    const stdDev = Math.sqrt(variance);

    // Normalize factors to 0-1 scale
    const rainfallFactor = Math.min(rainfall / 1000, 1); // Optimal: 800-1000mm
    const temperatureFactor = this.calculateTemperatureFactor(temperature); // Optimal: 20-30°C
    const soilFactor = soilHealth / 100;
    const fertilizerFactor = Math.min(fertilizer / 200, 1); // Optimal: 150-200 kg/ha
    const pesticideFactor = Math.min(pesticide / 50, 1); // Optimal: 30-50 kg/ha

    // Calculate weighted prediction
    const weights = {
      rainfall: 0.25,
      temperature: 0.25,
      soil: 0.20,
      fertilizer: 0.20,
      pesticide: 0.10,
    };

    const weightedFactor =
      rainfallFactor * weights.rainfall +
      temperatureFactor * weights.temperature +
      soilFactor * weights.soil +
      fertilizerFactor * weights.fertilizer +
      pesticideFactor * weights.pesticide;

    const predictedYield = avgHistoricalYield * (0.7 + weightedFactor * 0.6); // Range: 70%-130% of historical average

    // Calculate confidence based on data consistency
    const confidence = Math.max(0.6, 1 - stdDev / avgHistoricalYield * 0.5);

    // Generate recommendation
    let recommendation = "Maintain current practices";
    if (weightedFactor < 0.5) {
      recommendation = "Increase fertilizer and improve irrigation to boost yield";
    } else if (weightedFactor > 0.85) {
      recommendation = "Excellent conditions - optimize harvest timing for maximum quality";
    }

    return {
      predictedYield: Math.round(predictedYield * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      factors: {
        rainfall: Math.round(rainfallFactor * 100) / 100,
        temperature: Math.round(temperatureFactor * 100) / 100,
        soilHealth: Math.round(soilFactor * 100) / 100,
        fertilizer: Math.round(fertilizerFactor * 100) / 100,
        pesticide: Math.round(pesticideFactor * 100) / 100,
      },
      recommendation,
    };
  }

  /**
   * Predict disease outbreak risk in livestock
   */
  async predictDiseaseRisk(farmId: string, speciesType: string): Promise<DiseaseRiskPrediction[]> {
    const db = await getDb();

    // Get recent health records
    const recentHealthRecords = await db.query.animalHealthRecords.findMany({
      limit: 100,
      orderBy: (records) => [records.recordDate],
    });

    // Analyze disease patterns
    const diseasePatterns = this.analyzeDiseasePatterns(recentHealthRecords);

    // Generate predictions based on patterns
    const predictions: DiseaseRiskPrediction[] = [];

    // Newcastle Disease risk
    if (speciesType === "poultry" || speciesType === "all") {
      const newcastleRisk = this.calculateDiseaseRisk(diseasePatterns, "newcastle");
      predictions.push({
        diseaseType: "Newcastle Disease",
        riskLevel: newcastleRisk > 0.7 ? "high" : newcastleRisk > 0.4 ? "medium" : "low",
        probability: newcastleRisk,
        affectedAnimals: ["Poultry"],
        preventiveMeasures: [
          "Increase biosecurity measures",
          "Ensure vaccination schedules are up-to-date",
          "Monitor for respiratory symptoms",
          "Isolate sick birds immediately",
        ],
        urgency: newcastleRisk > 0.7 ? "immediate" : newcastleRisk > 0.4 ? "soon" : "monitor",
      });
    }

    // Foot and Mouth Disease risk
    if (speciesType === "cattle" || speciesType === "all") {
      const fmdRisk = this.calculateDiseaseRisk(diseasePatterns, "fmd");
      predictions.push({
        diseaseType: "Foot and Mouth Disease",
        riskLevel: fmdRisk > 0.7 ? "high" : fmdRisk > 0.4 ? "medium" : "low",
        probability: fmdRisk,
        affectedAnimals: ["Cattle", "Goats"],
        preventiveMeasures: [
          "Restrict farm access to essential personnel only",
          "Disinfect equipment and vehicles",
          "Monitor for lameness and oral lesions",
          "Report any suspected cases to authorities",
        ],
        urgency: fmdRisk > 0.7 ? "immediate" : fmdRisk > 0.4 ? "soon" : "monitor",
      });
    }

    // Mastitis risk
    if (speciesType === "cattle" || speciesType === "all") {
      const mastitisRisk = this.calculateDiseaseRisk(diseasePatterns, "mastitis");
      predictions.push({
        diseaseType: "Mastitis",
        riskLevel: mastitisRisk > 0.7 ? "high" : mastitisRisk > 0.4 ? "medium" : "low",
        probability: mastitisRisk,
        affectedAnimals: ["Cattle"],
        preventiveMeasures: [
          "Improve milking hygiene practices",
          "Ensure proper udder cleaning before milking",
          "Monitor milk quality regularly",
          "Maintain clean housing conditions",
        ],
        urgency: mastitisRisk > 0.7 ? "immediate" : mastitisRisk > 0.4 ? "soon" : "monitor",
      });
    }

    return predictions;
  }

  /**
   * Predict market prices for agricultural products
   */
  async predictMarketPrice(productType: string, historicalPrices: number[]): Promise<MarketPricePrediction> {
    // Calculate trend using simple moving average
    const recentPrices = historicalPrices.slice(-12); // Last 12 months
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

    // Calculate trend direction
    const firstHalf = recentPrices.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
    const secondHalf = recentPrices.slice(6).reduce((a, b) => a + b, 0) / 6;
    const trendDirection = secondHalf > firstHalf ? "up" : secondHalf < firstHalf ? "down" : "stable";

    // Calculate price change percentage
    const priceChange = ((secondHalf - firstHalf) / firstHalf) * 100;

    // Predict future price using exponential smoothing
    const alpha = 0.3; // Smoothing factor
    let predictedPrice = recentPrices[recentPrices.length - 1];
    for (let i = 0; i < 3; i++) {
      // Predict 3 months ahead
      predictedPrice = alpha * predictedPrice + (1 - alpha) * avgPrice;
    }

    // Calculate confidence based on price stability
    const variance = recentPrices.reduce((sum, val) => sum + Math.pow(val - avgPrice, 2), 0) / recentPrices.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0.5, 1 - stdDev / avgPrice * 0.5);

    // Generate recommendation
    let recommendation: "sell_now" | "hold" | "wait" = "hold";
    if (trendDirection === "up" && priceChange > 10) {
      recommendation = "wait"; // Wait for higher prices
    } else if (trendDirection === "down" && priceChange < -10) {
      recommendation = "sell_now"; // Sell before prices drop further
    } else {
      recommendation = "hold"; // Hold for stable prices
    }

    return {
      productType,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      priceChange: Math.round(priceChange * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      trend: trendDirection as "up" | "down" | "stable",
      recommendation,
      timeframe: "3 months",
    };
  }

  /**
   * Get comprehensive farm insights
   */
  async getFarmInsights(farmId: string) {
    return {
      summary: "AI-powered farm analytics",
      timestamp: new Date(),
      insights: {
        cropPerformance: "Monitor soil health and adjust irrigation",
        livestockHealth: "Vaccination schedules up to date",
        marketOpportunities: "Price trends favorable for maize",
      },
    };
  }

  // Helper methods
  private calculateTemperatureFactor(temp: number): number {
    // Optimal temperature: 20-30°C
    if (temp >= 20 && temp <= 30) return 1;
    if (temp >= 15 && temp < 20) return 0.8 + (temp - 15) * 0.04;
    if (temp > 30 && temp <= 35) return 1 - (temp - 30) * 0.04;
    return Math.max(0.5, 1 - Math.abs(temp - 25) / 25);
  }

  private analyzeDiseasePatterns(records: any[]): Map<string, number> {
    const patterns = new Map<string, number>();

    // Count disease occurrences
    records.forEach((record) => {
      if (record.diagnosis) {
        const count = patterns.get(record.diagnosis) || 0;
        patterns.set(record.diagnosis, count + 1);
      }
    });

    return patterns;
  }

  private calculateDiseaseRisk(patterns: Map<string, number>, diseaseType: string): number {
    const count = patterns.get(diseaseType) || 0;
    const totalRecords = Array.from(patterns.values()).reduce((a, b) => a + b, 0) || 1;

    // Base risk calculation
    let risk = count / totalRecords;

    // Add seasonal factors
    const month = new Date().getMonth();
    if (diseaseType === "newcastle" && (month === 11 || month === 0 || month === 1)) {
      risk += 0.1; // Higher risk in winter
    }

    return Math.min(risk, 1);
  }
}

export { PredictiveAnalyticsEngine, YieldPrediction, DiseaseRiskPrediction, MarketPricePrediction };
