/**
 * Fertilizer Recommendations System
 * Provides crop-specific fertilizer recommendations based on soil and growth stage
 */

export interface SoilTest {
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  pH: number;
  organicMatter: number; // percentage
  micronutrients: {
    zinc: number;
    iron: number;
    manganese: number;
    copper: number;
    boron: number;
  };
}

export interface FertilizerRecommendation {
  cropName: string;
  growthStage: number;
  soilTest: SoilTest;
  recommendations: FertilizerApplication[];
  totalNitrogen: number;
  totalPhosphorus: number;
  totalPotassium: number;
  micronutrientApplications: MicronutrientApplication[];
  applicationSchedule: ApplicationSchedule[];
  costEstimate: number;
  environmentalImpact: string;
}

export interface FertilizerApplication {
  fertilizerType: string;
  nutrientContent: { N: number; P: number; K: number };
  quantity: number; // kg/hectare
  applicationMethod: 'broadcast' | 'band' | 'foliar' | 'fertigation';
  timing: string;
  notes: string;
}

export interface MicronutrientApplication {
  nutrient: string;
  source: string;
  quantity: number;
  applicationMethod: string;
  timing: string;
}

export interface ApplicationSchedule {
  stage: number;
  daysFromPlanting: number;
  applications: FertilizerApplication[];
  notes: string;
}

/**
 * Fertilizer Recommendations Implementation
 */
export class FertilizerRecommender {
  private cropNutrientRequirements: Map<string, CropNutrientProfile> = new Map();
  private fertilizerDatabase: Map<string, FertilizerProduct> = new Map();

  constructor() {
    this.initializeCropProfiles();
    this.initializeFertilizerDatabase();
  }

  private initializeCropProfiles(): void {
    // Rice nutrient requirements
    this.cropNutrientRequirements.set('rice', {
      cropName: 'rice',
      totalNitrogen: 120,
      totalPhosphorus: 60,
      totalPotassium: 60,
      stageRequirements: [
        { stage: 1, N: 0, P: 10, K: 5 },
        { stage: 2, N: 20, P: 15, K: 10 },
        { stage: 3, N: 60, P: 30, K: 40 },
        { stage: 4, N: 40, P: 40, K: 50 },
        { stage: 5, N: 20, P: 30, K: 30 },
      ],
      micronutrients: {
        zinc: 5,
        iron: 10,
        manganese: 5,
        copper: 2,
        boron: 1,
      },
    });

    // Wheat nutrient requirements
    this.cropNutrientRequirements.set('wheat', {
      cropName: 'wheat',
      totalNitrogen: 150,
      totalPhosphorus: 80,
      totalPotassium: 60,
      stageRequirements: [
        { stage: 1, N: 30, P: 20, K: 15 },
        { stage: 2, N: 60, P: 30, K: 20 },
        { stage: 3, N: 40, P: 20, K: 15 },
        { stage: 4, N: 20, P: 10, K: 10 },
      ],
      micronutrients: {
        zinc: 3,
        iron: 5,
        manganese: 3,
        copper: 1,
        boron: 0.5,
      },
    });

    // Corn nutrient requirements
    this.cropNutrientRequirements.set('corn', {
      cropName: 'corn',
      totalNitrogen: 180,
      totalPhosphorus: 100,
      totalPotassium: 80,
      stageRequirements: [
        { stage: 1, N: 40, P: 25, K: 20 },
        { stage: 2, N: 80, P: 40, K: 30 },
        { stage: 3, N: 40, P: 25, K: 20 },
        { stage: 4, N: 20, P: 10, K: 10 },
      ],
      micronutrients: {
        zinc: 8,
        iron: 10,
        manganese: 5,
        copper: 2,
        boron: 1,
      },
    });
  }

  private initializeFertilizerDatabase(): void {
    this.fertilizerDatabase.set('urea', {
      name: 'Urea',
      type: 'nitrogen',
      NPK: { N: 46, P: 0, K: 0 },
      costPerKg: 15,
      applicationMethod: 'broadcast',
    });

    this.fertilizerDatabase.set('dap', {
      name: 'DAP (Diammonium Phosphate)',
      type: 'phosphorus',
      NPK: { N: 18, P: 46, K: 0 },
      costPerKg: 25,
      applicationMethod: 'broadcast',
    });

    this.fertilizerDatabase.set('mop', {
      name: 'MOP (Muriate of Potash)',
      type: 'potassium',
      NPK: { N: 0, P: 0, K: 60 },
      costPerKg: 20,
      applicationMethod: 'broadcast',
    });

    this.fertilizerDatabase.set('neem-cake', {
      name: 'Neem Cake',
      type: 'organic',
      NPK: { N: 3, P: 1, K: 1 },
      costPerKg: 8,
      applicationMethod: 'broadcast',
    });

    this.fertilizerDatabase.set('vermicompost', {
      name: 'Vermicompost',
      type: 'organic',
      NPK: { N: 2, P: 1, K: 1 },
      costPerKg: 5,
      applicationMethod: 'broadcast',
    });
  }

  getRecommendation(
    cropName: string,
    growthStage: number,
    soilTest: SoilTest
  ): FertilizerRecommendation {
    const profile = this.cropNutrientRequirements.get(cropName.toLowerCase());
    if (!profile) throw new Error(`Crop profile not found for ${cropName}`);

    // Calculate nutrient deficiency
    const nitrogenDeficiency = Math.max(0, profile.totalNitrogen - soilTest.nitrogen);
    const phosphorusDeficiency = Math.max(0, profile.totalPhosphorus - soilTest.phosphorus);
    const potassiumDeficiency = Math.max(0, profile.totalPotassium - soilTest.potassium);

    // Generate fertilizer applications
    const recommendations = this.generateApplications(
      nitrogenDeficiency,
      phosphorusDeficiency,
      potassiumDeficiency
    );

    // Generate micronutrient applications
    const micronutrientApplications = this.generateMicronutrientApplications(
      soilTest.micronutrients,
      profile.micronutrients
    );

    // Generate application schedule
    const applicationSchedule = this.generateSchedule(profile, growthStage);

    // Calculate cost
    const costEstimate = this.calculateCost(recommendations, micronutrientApplications);

    // Assess environmental impact
    const environmentalImpact = this.assessEnvironmentalImpact(
      recommendations,
      soilTest
    );

    return {
      cropName,
      growthStage,
      soilTest,
      recommendations,
      totalNitrogen: nitrogenDeficiency,
      totalPhosphorus: phosphorusDeficiency,
      totalPotassium: potassiumDeficiency,
      micronutrientApplications,
      applicationSchedule,
      costEstimate,
      environmentalImpact,
    };
  }

  private generateApplications(
    nitrogenDeficiency: number,
    phosphorusDeficiency: number,
    potassiumDeficiency: number
  ): FertilizerApplication[] {
    const applications: FertilizerApplication[] = [];

    // Nitrogen application
    if (nitrogenDeficiency > 0) {
      const ureaQuantity = (nitrogenDeficiency / 46) * 100;
      applications.push({
        fertilizerType: 'Urea',
        nutrientContent: { N: 46, P: 0, K: 0 },
        quantity: Math.round(ureaQuantity),
        applicationMethod: 'broadcast',
        timing: 'split application (50% at planting, 50% at tillering)',
        notes: 'Apply in moist soil for better absorption',
      });
    }

    // Phosphorus application
    if (phosphorusDeficiency > 0) {
      const dapQuantity = (phosphorusDeficiency / 46) * 100;
      applications.push({
        fertilizerType: 'DAP',
        nutrientContent: { N: 18, P: 46, K: 0 },
        quantity: Math.round(dapQuantity),
        applicationMethod: 'broadcast',
        timing: 'at planting',
        notes: 'Mix with soil before planting',
      });
    }

    // Potassium application
    if (potassiumDeficiency > 0) {
      const mopQuantity = (potassiumDeficiency / 60) * 100;
      applications.push({
        fertilizerType: 'MOP',
        nutrientContent: { N: 0, P: 0, K: 60 },
        quantity: Math.round(mopQuantity),
        applicationMethod: 'broadcast',
        timing: 'split application (50% at planting, 50% at panicle initiation)',
        notes: 'Avoid application during flowering',
      });
    }

    return applications;
  }

  private generateMicronutrientApplications(
    soilMicronutrients: { [key: string]: number },
    requiredMicronutrients: { [key: string]: number }
  ): MicronutrientApplication[] {
    const applications: MicronutrientApplication[] = [];

    Object.entries(requiredMicronutrients).forEach(([nutrient, required]) => {
      const available = soilMicronutrients[nutrient] || 0;
      if (available < required) {
        applications.push({
          nutrient,
          source: this.getMicronutrientSource(nutrient),
          quantity: required - available,
          applicationMethod: 'foliar spray',
          timing: 'at tillering and panicle initiation',
        });
      }
    });

    return applications;
  }

  private getMicronutrientSource(nutrient: string): string {
    const sources: { [key: string]: string } = {
      zinc: 'Zinc Sulfate',
      iron: 'Iron Sulfate',
      manganese: 'Manganese Sulfate',
      copper: 'Copper Sulfate',
      boron: 'Borax',
    };
    return sources[nutrient] || 'Unknown';
  }

  private generateSchedule(profile: CropNutrientProfile, growthStage: number): ApplicationSchedule[] {
    const schedule: ApplicationSchedule[] = [];

    profile.stageRequirements.forEach((req, index) => {
      if (index <= growthStage) {
        schedule.push({
          stage: req.stage,
          daysFromPlanting: index * 30 + 10,
          applications: [
            {
              fertilizerType: 'Urea',
              nutrientContent: { N: 46, P: 0, K: 0 },
              quantity: Math.round((req.N / 46) * 100),
              applicationMethod: 'broadcast',
              timing: `Stage ${req.stage}`,
              notes: 'Apply in moist soil',
            },
          ],
          notes: `Nutrient requirement: N=${req.N}, P=${req.P}, K=${req.K}`,
        });
      }
    });

    return schedule;
  }

  private calculateCost(
    applications: FertilizerApplication[],
    micronutrientApplications: MicronutrientApplication[]
  ): number {
    let cost = 0;

    applications.forEach(app => {
      const product = Array.from(this.fertilizerDatabase.values()).find(
        p => p.name === app.fertilizerType
      );
      if (product) {
        cost += app.quantity * product.costPerKg;
      }
    });

    return Math.round(cost);
  }

  private assessEnvironmentalImpact(
    applications: FertilizerApplication[],
    soilTest: SoilTest
  ): string {
    let impact = 'Low';

    const totalNitrogen = applications.reduce((sum, app) => sum + app.quantity * (app.nutrientContent.N / 100), 0);

    if (totalNitrogen > 150) {
      impact = 'High - Risk of nitrogen leaching';
    } else if (totalNitrogen > 100) {
      impact = 'Medium - Monitor for nitrogen runoff';
    }

    if (soilTest.pH < 6 || soilTest.pH > 8) {
      impact += ' - Adjust pH for optimal nutrient availability';
    }

    return impact;
  }
}

interface CropNutrientProfile {
  cropName: string;
  totalNitrogen: number;
  totalPhosphorus: number;
  totalPotassium: number;
  stageRequirements: Array<{ stage: number; N: number; P: number; K: number }>;
  micronutrients: { [key: string]: number };
}

interface FertilizerProduct {
  name: string;
  type: string;
  NPK: { N: number; P: number; K: number };
  costPerKg: number;
  applicationMethod: string;
}

export const fertilizerRecommender = new FertilizerRecommender();
