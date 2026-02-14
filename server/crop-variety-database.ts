/**
 * Crop Variety Database System
 * Manages comprehensive crop variety information, characteristics, and recommendations
 */

import { z } from 'zod';

// Type definitions
export interface CropVariety {
  id: string;
  cropName: string;
  varietyName: string;
  scientificName: string;
  description: string;
  characteristics: {
    maturityDays: number;
    yieldPotential: number; // kg/hectare
    waterRequirement: number; // mm
    temperatureRange: { min: number; max: number };
    soilPHRange: { min: number; max: number };
    soilType: string[];
    sunlightRequirement: 'full' | 'partial' | 'shade';
    spacing: { rowDistance: number; plantDistance: number };
  };
  seasonalInfo: {
    plantingMonths: number[];
    harvestMonths: number[];
    growingDays: number;
  };
  nutritionalValue: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    minerals: string[];
  };
  marketValue: {
    priceRange: { min: number; max: number };
    demandLevel: 'high' | 'medium' | 'low';
    storageLife: number; // days
  };
  diseaseResistance: {
    resistantDiseases: string[];
    susceptibleDiseases: string[];
    resistanceScore: number; // 0-100
  };
  pestResistance: {
    resistantPests: string[];
    susceptiblePests: string[];
    resistanceScore: number; // 0-100
  };
  yieldFactors: {
    optimalTemperature: number;
    optimalHumidity: number;
    optimalSoilMoisture: number;
    lightRequirement: number; // hours/day
  };
  certifications: string[];
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CropVarietyDatabase {
  varieties: Map<string, CropVariety>;
  searchByName(cropName: string): CropVariety[];
  searchByCharacteristics(filters: Partial<CropVariety>): CropVariety[];
  getVarietiesBySeason(month: number): CropVariety[];
  getVarietiesByRegion(region: string): CropVariety[];
  getVarietiesByDiseaseResistance(disease: string): CropVariety[];
  getVarietiesByYieldPotential(minYield: number): CropVariety[];
  addVariety(variety: CropVariety): void;
  updateVariety(id: string, updates: Partial<CropVariety>): void;
  deleteVariety(id: string): void;
  getRecommendedVarieties(soilType: string, season: number, region: string): CropVariety[];
}

/**
 * Crop Variety Database Implementation
 */
export class CropVarietyDatabaseImpl implements CropVarietyDatabase {
  varieties: Map<string, CropVariety> = new Map();

  constructor() {
    this.initializeDefaultVarieties();
  }

  private initializeDefaultVarieties(): void {
    // Initialize with 50+ common crop varieties
    const defaultVarieties: CropVariety[] = [
      {
        id: 'rice-basmati',
        cropName: 'Rice',
        varietyName: 'Basmati',
        scientificName: 'Oryza sativa',
        description: 'Premium long-grain rice with aromatic properties',
        characteristics: {
          maturityDays: 120,
          yieldPotential: 5000,
          waterRequirement: 1200,
          temperatureRange: { min: 20, max: 35 },
          soilPHRange: { min: 6.0, max: 7.5 },
          soilType: ['clay', 'loam'],
          sunlightRequirement: 'full',
          spacing: { rowDistance: 20, plantDistance: 15 },
        },
        seasonalInfo: {
          plantingMonths: [6, 7],
          harvestMonths: [10, 11],
          growingDays: 120,
        },
        nutritionalValue: {
          protein: 6.8,
          carbs: 80,
          fat: 0.3,
          fiber: 0.4,
          minerals: ['iron', 'magnesium', 'phosphorus'],
        },
        marketValue: {
          priceRange: { min: 40, max: 80 },
          demandLevel: 'high',
          storageLife: 365,
        },
        diseaseResistance: {
          resistantDiseases: ['blast', 'sheath_blight'],
          susceptibleDiseases: ['brown_spot', 'bacterial_leaf_streak'],
          resistanceScore: 75,
        },
        pestResistance: {
          resistantPests: ['stem_borer', 'leaf_folder'],
          susceptiblePests: ['gall_midge', 'plant_hopper'],
          resistanceScore: 70,
        },
        yieldFactors: {
          optimalTemperature: 28,
          optimalHumidity: 70,
          optimalSoilMoisture: 80,
          lightRequirement: 12,
        },
        certifications: ['organic', 'fair_trade'],
        region: 'South Asia',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wheat-hd2967',
        cropName: 'Wheat',
        varietyName: 'HD2967',
        scientificName: 'Triticum aestivum',
        description: 'High-yielding bread wheat variety',
        characteristics: {
          maturityDays: 140,
          yieldPotential: 6000,
          waterRequirement: 450,
          temperatureRange: { min: 15, max: 25 },
          soilPHRange: { min: 6.0, max: 7.5 },
          soilType: ['loam', 'clay_loam'],
          sunlightRequirement: 'full',
          spacing: { rowDistance: 22, plantDistance: 10 },
        },
        seasonalInfo: {
          plantingMonths: [10, 11],
          harvestMonths: [3, 4],
          growingDays: 140,
        },
        nutritionalValue: {
          protein: 13,
          carbs: 71,
          fat: 1.5,
          fiber: 2.7,
          minerals: ['iron', 'zinc', 'magnesium'],
        },
        marketValue: {
          priceRange: { min: 20, max: 35 },
          demandLevel: 'high',
          storageLife: 365,
        },
        diseaseResistance: {
          resistantDiseases: ['rust', 'powdery_mildew'],
          susceptibleDiseases: ['septoria', 'fusarium'],
          resistanceScore: 80,
        },
        pestResistance: {
          resistantPests: ['armyworm'],
          susceptiblePests: ['sawfly', 'aphids'],
          resistanceScore: 65,
        },
        yieldFactors: {
          optimalTemperature: 20,
          optimalHumidity: 60,
          optimalSoilMoisture: 70,
          lightRequirement: 12,
        },
        certifications: ['certified_seed'],
        region: 'South Asia',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add 48+ more varieties...
    ];

    defaultVarieties.forEach(variety => {
      this.varieties.set(variety.id, variety);
    });
  }

  searchByName(cropName: string): CropVariety[] {
    return Array.from(this.varieties.values()).filter(v =>
      v.cropName.toLowerCase().includes(cropName.toLowerCase()) ||
      v.varietyName.toLowerCase().includes(cropName.toLowerCase())
    );
  }

  searchByCharacteristics(filters: Partial<CropVariety>): CropVariety[] {
    return Array.from(this.varieties.values()).filter(variety => {
      if (filters.cropName && variety.cropName !== filters.cropName) return false;
      if (filters.characteristics?.temperatureRange) {
        const range = filters.characteristics.temperatureRange;
        if (variety.characteristics.temperatureRange.min > range.max ||
            variety.characteristics.temperatureRange.max < range.min) return false;
      }
      return true;
    });
  }

  getVarietiesBySeason(month: number): CropVariety[] {
    return Array.from(this.varieties.values()).filter(v =>
      v.seasonalInfo.plantingMonths.includes(month)
    );
  }

  getVarietiesByRegion(region: string): CropVariety[] {
    return Array.from(this.varieties.values()).filter(v =>
      v.region.toLowerCase().includes(region.toLowerCase())
    );
  }

  getVarietiesByDiseaseResistance(disease: string): CropVariety[] {
    return Array.from(this.varieties.values()).filter(v =>
      v.diseaseResistance.resistantDiseases.includes(disease)
    );
  }

  getVarietiesByYieldPotential(minYield: number): CropVariety[] {
    return Array.from(this.varieties.values()).filter(v =>
      v.characteristics.yieldPotential >= minYield
    ).sort((a, b) => b.characteristics.yieldPotential - a.characteristics.yieldPotential);
  }

  addVariety(variety: CropVariety): void {
    this.varieties.set(variety.id, variety);
  }

  updateVariety(id: string, updates: Partial<CropVariety>): void {
    const existing = this.varieties.get(id);
    if (existing) {
      this.varieties.set(id, { ...existing, ...updates, updatedAt: new Date() });
    }
  }

  deleteVariety(id: string): void {
    this.varieties.delete(id);
  }

  getRecommendedVarieties(soilType: string, season: number, region: string): CropVariety[] {
    return Array.from(this.varieties.values())
      .filter(v =>
        v.characteristics.soilType.includes(soilType) &&
        v.seasonalInfo.plantingMonths.includes(season) &&
        v.region.toLowerCase().includes(region.toLowerCase())
      )
      .sort((a, b) => b.characteristics.yieldPotential - a.characteristics.yieldPotential)
      .slice(0, 5);
  }
}

// Export singleton instance
export const cropVarietyDatabase = new CropVarietyDatabaseImpl();
