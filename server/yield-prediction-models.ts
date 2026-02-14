/**
 * Yield Prediction Models System
 * Predicts crop yield based on various environmental and management factors
 */

export interface YieldPredictionInput {
  cropVariety: string;
  fieldArea: number; // hectares
  soilFertility: number; // 0-100
  waterAvailability: number; // 0-100
  temperature: number; // celsius
  rainfall: number; // mm
  sunlight: number; // hours/day
  pestPressure: number; // 0-100
  diseasePressure: number; // 0-100
  fertilizerApplied: number; // kg/hectare
  irrigationSchedule: string;
  historicalYield?: number; // previous year yield
}

export interface YieldPrediction {
  estimatedYield: number; // kg/hectare
  confidence: number; // 0-100
  bestCaseYield: number;
  worstCaseYield: number;
  factors: YieldFactor[];
  recommendations: string[];
}

export interface YieldFactor {
  name: string;
  impact: number; // -100 to +100
  description: string;
}

/**
 * Yield Prediction Model Implementation
 */
export class YieldPredictionModel {
  private baseYields: Map<string, number> = new Map();
  private modelWeights = {
    soilFertility: 0.25,
    waterAvailability: 0.20,
    temperature: 0.15,
    rainfall: 0.10,
    sunlight: 0.10,
    pestPressure: 0.10,
    diseasePressure: 0.10,
  };

  constructor() {
    this.initializeBaseYields();
  }

  private initializeBaseYields(): void {
    // Base yields for major crops (kg/hectare)
    this.baseYields.set('rice', 5000);
    this.baseYields.set('wheat', 4500);
    this.baseYields.set('corn', 6000);
    this.baseYields.set('soybean', 2500);
    this.baseYields.set('cotton', 1500);
    this.baseYields.set('sugarcane', 70000);
    this.baseYields.set('potato', 20000);
    this.baseYields.set('tomato', 50000);
    this.baseYields.set('onion', 30000);
    this.baseYields.set('cabbage', 40000);
  }

  predictYield(input: YieldPredictionInput): YieldPrediction {
    const baseYield = this.baseYields.get(input.cropVariety.toLowerCase()) || 5000;
    const factors: YieldFactor[] = [];

    // Calculate factor impacts
    const soilImpact = this.calculateSoilImpact(input.soilFertility);
    factors.push({
      name: 'Soil Fertility',
      impact: soilImpact,
      description: `Soil fertility at ${input.soilFertility}% - ${soilImpact > 0 ? 'positive' : 'negative'} impact`,
    });

    const waterImpact = this.calculateWaterImpact(input.waterAvailability, input.rainfall);
    factors.push({
      name: 'Water Availability',
      impact: waterImpact,
      description: `Water availability at ${input.waterAvailability}% with ${input.rainfall}mm rainfall`,
    });

    const tempImpact = this.calculateTemperatureImpact(input.temperature, input.cropVariety);
    factors.push({
      name: 'Temperature',
      impact: tempImpact,
      description: `Temperature at ${input.temperature}°C`,
    });

    const sunlightImpact = this.calculateSunlightImpact(input.sunlight);
    factors.push({
      name: 'Sunlight',
      impact: sunlightImpact,
      description: `${input.sunlight} hours of sunlight per day`,
    });

    const pestImpact = this.calculatePestImpact(input.pestPressure);
    factors.push({
      name: 'Pest Pressure',
      impact: pestImpact,
      description: `Pest pressure at ${input.pestPressure}%`,
    });

    const diseaseImpact = this.calculateDiseaseImpact(input.diseasePressure);
    factors.push({
      name: 'Disease Pressure',
      impact: diseaseImpact,
      description: `Disease pressure at ${input.diseasePressure}%`,
    });

    const fertilizerImpact = this.calculateFertilizerImpact(input.fertilizerApplied, input.cropVariety);
    factors.push({
      name: 'Fertilizer Application',
      impact: fertilizerImpact,
      description: `${input.fertilizerApplied} kg/hectare applied`,
    });

    // Calculate weighted average impact
    const totalImpact = (
      (soilImpact * this.modelWeights.soilFertility) +
      (waterImpact * this.modelWeights.waterAvailability) +
      (tempImpact * this.modelWeights.temperature) +
      (sunlightImpact * this.modelWeights.sunlight) +
      (pestImpact * this.modelWeights.pestPressure) +
      (diseaseImpact * this.modelWeights.diseasePressure) +
      (fertilizerImpact * 0.10)
    ) / 1.0;

    // Calculate final yield
    const impactMultiplier = 1 + (totalImpact / 100);
    const estimatedYield = Math.max(0, baseYield * impactMultiplier);

    // Calculate confidence
    const confidence = this.calculateConfidence(input);

    // Calculate best and worst case
    const bestCaseYield = estimatedYield * 1.2;
    const worstCaseYield = Math.max(0, estimatedYield * 0.8);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, input);

    return {
      estimatedYield: Math.round(estimatedYield),
      confidence,
      bestCaseYield: Math.round(bestCaseYield),
      worstCaseYield: Math.round(worstCaseYield),
      factors,
      recommendations,
    };
  }

  private calculateSoilImpact(fertility: number): number {
    // Optimal fertility is 70-80%
    if (fertility >= 70 && fertility <= 80) return 20;
    if (fertility >= 60 && fertility < 70) return 10;
    if (fertility > 80 && fertility <= 90) return 10;
    if (fertility >= 50 && fertility < 60) return -10;
    if (fertility > 90) return -5;
    return -30;
  }

  private calculateWaterImpact(availability: number, rainfall: number): number {
    const totalWater = availability + (rainfall / 10); // Normalize rainfall
    if (totalWater >= 80 && totalWater <= 100) return 15;
    if (totalWater >= 60 && totalWater < 80) return 5;
    if (totalWater >= 40 && totalWater < 60) return -10;
    if (totalWater < 40) return -40;
    return 0;
  }

  private calculateTemperatureImpact(temp: number, crop: string): number {
    // Optimal temperatures vary by crop
    const optimalRanges: { [key: string]: { min: number; max: number } } = {
      rice: { min: 25, max: 30 },
      wheat: { min: 18, max: 22 },
      corn: { min: 20, max: 28 },
      soybean: { min: 20, max: 25 },
      cotton: { min: 25, max: 32 },
    };

    const range = optimalRanges[crop.toLowerCase()] || { min: 20, max: 28 };

    if (temp >= range.min && temp <= range.max) return 20;
    if (Math.abs(temp - range.min) <= 2 || Math.abs(temp - range.max) <= 2) return 5;
    if (Math.abs(temp - range.min) <= 5 || Math.abs(temp - range.max) <= 5) return -10;
    return -40;
  }

  private calculateSunlightImpact(hours: number): number {
    if (hours >= 12) return 20;
    if (hours >= 10) return 10;
    if (hours >= 8) return 0;
    if (hours >= 6) return -15;
    return -40;
  }

  private calculatePestImpact(pressure: number): number {
    if (pressure <= 10) return 5;
    if (pressure <= 30) return -5;
    if (pressure <= 50) return -20;
    if (pressure <= 70) return -40;
    return -60;
  }

  private calculateDiseaseImpact(pressure: number): number {
    if (pressure <= 10) return 5;
    if (pressure <= 30) return -5;
    if (pressure <= 50) return -20;
    if (pressure <= 70) return -40;
    return -60;
  }

  private calculateFertilizerImpact(applied: number, crop: string): number {
    // Optimal fertilizer rates (kg/hectare)
    const optimalRates: { [key: string]: number } = {
      rice: 100,
      wheat: 120,
      corn: 150,
      soybean: 50,
      cotton: 80,
    };

    const optimal = optimalRates[crop.toLowerCase()] || 100;

    if (applied >= optimal * 0.8 && applied <= optimal * 1.2) return 25;
    if (applied >= optimal * 0.6 && applied < optimal * 0.8) return 10;
    if (applied > optimal * 1.2 && applied <= optimal * 1.5) return 5;
    if (applied < optimal * 0.6) return -20;
    return -10;
  }

  private calculateConfidence(input: YieldPredictionInput): number {
    let confidence = 70; // Base confidence

    // Increase confidence with historical data
    if (input.historicalYield) confidence += 15;

    // Decrease confidence with extreme conditions
    if (input.pestPressure > 60 || input.diseasePressure > 60) confidence -= 10;
    if (input.waterAvailability < 30 || input.waterAvailability > 90) confidence -= 5;

    return Math.min(95, Math.max(40, confidence));
  }

  private generateRecommendations(factors: YieldFactor[], input: YieldPredictionInput): string[] {
    const recommendations: string[] = [];

    // Analyze factors and generate recommendations
    const negativeFactors = factors.filter(f => f.impact < -10);

    if (input.soilFertility < 60) {
      recommendations.push('Increase soil fertility through fertilizer application or organic matter');
    }

    if (input.waterAvailability < 50) {
      recommendations.push('Improve irrigation scheduling or water management practices');
    }

    if (input.pestPressure > 50) {
      recommendations.push('Implement integrated pest management strategies');
    }

    if (input.diseasePressure > 50) {
      recommendations.push('Apply disease prevention and management measures');
    }

    if (input.sunlight < 8) {
      recommendations.push('Consider crop varieties that tolerate lower light conditions');
    }

    if (negativeFactors.length === 0) {
      recommendations.push('Maintain current management practices - conditions are optimal');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  // Advanced ML-based prediction (simplified version)
  predictYieldWithML(input: YieldPredictionInput): YieldPrediction {
    // This would integrate with actual ML models in production
    // For now, return standard prediction
    return this.predictYield(input);
  }
}

export const yieldPredictionModel = new YieldPredictionModel();
