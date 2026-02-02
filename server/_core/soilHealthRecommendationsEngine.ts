import { getDb } from '../db';
import { soilHealthRecommendations, soilTests, cropCycles, fertilizerCosts } from '../../drizzle/schema';
import { eq, and, lte } from 'drizzle-orm';

export interface SoilDeficiency {
  nutrient: string;
  level: number;
  optimalLevel: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
}

export interface FertilizerRecommendation {
  fertilizerType: string;
  recommendedQuantityKg: number;
  applicationTiming: string;
  expectedYieldImprovement: number;
  costBenefit: number;
  alternativeOptions: string[];
  rationale: string;
}

export interface SoilHealthAnalysis {
  soilTestId: number;
  cycleId: number;
  deficiencies: SoilDeficiency[];
  recommendations: FertilizerRecommendation[];
  overallHealthScore: number;
  actionPriority: 'immediate' | 'high' | 'medium' | 'low';
}

export class SoilHealthRecommendationsEngine {
  /**
   * Analyze soil test and generate recommendations
   */
  async analyzeSoilAndRecommend(soilTestId: number, cycleId: number): Promise<SoilHealthAnalysis> {
    const dbPromise = getDb();
    const db = await dbPromise;
    if (!db) throw new Error('Database connection failed');

    // Get soil test data
    const soilTestRecords = await db.select().from(soilTests).where(eq(soilTests.id, soilTestId)).limit(1);

    if (!soilTestRecords.length) {
      throw new Error(`Soil test ${soilTestId} not found`);
    }

    const soilTest = soilTestRecords[0];

    // Analyze deficiencies
    const deficiencies = this.analyzeDeficiencies(soilTest);

    // Generate recommendations based on deficiencies
    const recommendations = await this.generateRecommendations(deficiencies, cycleId);

    // Calculate overall health score (0-100)
    const overallHealthScore = this.calculateHealthScore(deficiencies);

    // Determine action priority
    const actionPriority = this.determineActionPriority(deficiencies, overallHealthScore);

    // Save recommendations to database
    for (const rec of recommendations) {
      await db.insert(soilHealthRecommendations).values({
        soilTestId,
        cycleId,
        recommendedFertilizerType: rec.fertilizerType,
        recommendedQuantityKg: rec.recommendedQuantityKg.toString(),
        applicationTiming: rec.applicationTiming,
        deficiencyType: deficiencies[0]?.nutrient || 'general',
        deficiencySeverity: deficiencies[0]?.severity || 'low',
        expectedYieldImprovement: rec.expectedYieldImprovement.toString(),
        costBenefit: rec.costBenefit.toString(),
        alternativeOptions: JSON.stringify(rec.alternativeOptions),
        implementationStatus: 'pending',
      });
    }

    return {
      soilTestId,
      cycleId,
      deficiencies,
      recommendations,
      overallHealthScore,
      actionPriority,
    };
  }

  /**
   * Analyze soil test for nutrient deficiencies
   */
  private analyzeDeficiencies(soilTest: any): SoilDeficiency[] {
    const deficiencies: SoilDeficiency[] = [];

    // Nitrogen analysis
    const nitrogenLevel = Number(soilTest.nitrogen) || 0;
    if (nitrogenLevel < 20) {
      deficiencies.push({
        nutrient: 'Nitrogen',
        level: nitrogenLevel,
        optimalLevel: 30,
        severity: nitrogenLevel < 10 ? 'critical' : nitrogenLevel < 15 ? 'high' : 'moderate',
        description: `Nitrogen level is ${nitrogenLevel} mg/kg, below optimal level of 30 mg/kg. This affects plant growth and leaf development.`,
      });
    }

    // Phosphorus analysis
    const phosphorusLevel = Number(soilTest.phosphorus) || 0;
    if (phosphorusLevel < 15) {
      deficiencies.push({
        nutrient: 'Phosphorus',
        level: phosphorusLevel,
        optimalLevel: 20,
        severity: phosphorusLevel < 8 ? 'critical' : phosphorusLevel < 12 ? 'high' : 'moderate',
        description: `Phosphorus level is ${phosphorusLevel} mg/kg, below optimal level of 20 mg/kg. This affects root development and energy transfer.`,
      });
    }

    // Potassium analysis
    const potassiumLevel = Number(soilTest.potassium) || 0;
    if (potassiumLevel < 150) {
      deficiencies.push({
        nutrient: 'Potassium',
        level: potassiumLevel,
        optimalLevel: 200,
        severity: potassiumLevel < 75 ? 'critical' : potassiumLevel < 120 ? 'high' : 'moderate',
        description: `Potassium level is ${potassiumLevel} mg/kg, below optimal level of 200 mg/kg. This affects plant strength and disease resistance.`,
      });
    }

    // pH analysis
    const phLevel = Number(soilTest.pH) || 0;
    if (phLevel < 6.0 || phLevel > 7.5) {
      deficiencies.push({
        nutrient: 'pH Balance',
        level: phLevel,
        optimalLevel: 6.5,
        severity: phLevel < 5.5 || phLevel > 8.0 ? 'high' : 'moderate',
        description: `Soil pH is ${phLevel}, which is outside the optimal range of 6.0-7.5. This affects nutrient availability.`,
      });
    }

    // Organic matter analysis
    const organicMatter = Number(soilTest.organicMatter) || 0;
    if (organicMatter < 2.0) {
      deficiencies.push({
        nutrient: 'Organic Matter',
        level: organicMatter,
        optimalLevel: 3.0,
        severity: organicMatter < 1.0 ? 'critical' : 'moderate',
        description: `Organic matter is ${organicMatter}%, below optimal level of 3%. This affects soil structure and water retention.`,
      });
    }

    return deficiencies;
  }

  /**
   * Generate fertilizer recommendations based on deficiencies
   */
  private async generateRecommendations(
    deficiencies: SoilDeficiency[],
    cycleId: number
  ): Promise<FertilizerRecommendation[]> {
    const recommendations: FertilizerRecommendation[] = [];

    for (const deficiency of deficiencies) {
      let recommendation: FertilizerRecommendation | null = null;

      if (deficiency.nutrient === 'Nitrogen') {
        recommendation = {
          fertilizerType: 'Urea (46-0-0)',
          recommendedQuantityKg: this.calculateQuantity(deficiency, 46),
          applicationTiming: 'Split into 2-3 applications during growing season',
          expectedYieldImprovement: 15,
          costBenefit: 2.5,
          alternativeOptions: ['Ammonium Nitrate (34-0-0)', 'Calcium Nitrate (15-0-0)'],
          rationale: 'Urea is cost-effective and provides readily available nitrogen for plant uptake.',
        };
      } else if (deficiency.nutrient === 'Phosphorus') {
        recommendation = {
          fertilizerType: 'DAP (18-46-0)',
          recommendedQuantityKg: this.calculateQuantity(deficiency, 46),
          applicationTiming: 'Apply before planting or at early growth stage',
          expectedYieldImprovement: 12,
          costBenefit: 2.0,
          alternativeOptions: ['Triple Superphosphate (0-46-0)', 'Bone Meal (0-10-0)'],
          rationale: 'DAP provides both nitrogen and phosphorus, improving root development and energy transfer.',
        };
      } else if (deficiency.nutrient === 'Potassium') {
        recommendation = {
          fertilizerType: 'Potassium Chloride (0-0-60)',
          recommendedQuantityKg: this.calculateQuantity(deficiency, 60),
          applicationTiming: 'Apply at mid-season or before flowering',
          expectedYieldImprovement: 10,
          costBenefit: 1.8,
          alternativeOptions: ['Potassium Sulfate (0-0-50)', 'Potassium Nitrate (13-0-46)'],
          rationale: 'Potassium chloride is economical and improves plant strength and disease resistance.',
        };
      } else if (deficiency.nutrient === 'Organic Matter') {
        recommendation = {
          fertilizerType: 'Compost or Manure',
          recommendedQuantityKg: 5000, // 5 tons per hectare
          applicationTiming: 'Apply before planting, incorporate into soil',
          expectedYieldImprovement: 20,
          costBenefit: 1.5,
          alternativeOptions: ['Green Manure', 'Biochar'],
          rationale: 'Organic matter improves soil structure, water retention, and microbial activity.',
        };
      } else if (deficiency.nutrient === 'pH Balance') {
        if (Number(deficiency.level) < 6.0) {
          recommendation = {
            fertilizerType: 'Lime (Calcium Carbonate)',
            recommendedQuantityKg: 2000,
            applicationTiming: 'Apply 2-3 months before planting',
            expectedYieldImprovement: 8,
            costBenefit: 1.2,
            alternativeOptions: ['Dolomitic Lime', 'Wood Ash'],
            rationale: 'Lime raises soil pH and provides calcium for plant nutrition.',
          };
        } else {
          recommendation = {
            fertilizerType: 'Sulfur',
            recommendedQuantityKg: 500,
            applicationTiming: 'Apply and incorporate into soil',
            expectedYieldImprovement: 5,
            costBenefit: 1.0,
            alternativeOptions: ['Aluminum Sulfate', 'Acidifying Fertilizers'],
            rationale: 'Sulfur lowers soil pH gradually for better nutrient availability.',
          };
        }
      }

      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // If no specific deficiencies, recommend balanced fertilizer
    if (recommendations.length === 0) {
      recommendations.push({
        fertilizerType: 'Balanced NPK (10-10-10)',
        recommendedQuantityKg: 500,
        applicationTiming: 'Apply at planting or early growth stage',
        expectedYieldImprovement: 5,
        costBenefit: 1.0,
        alternativeOptions: ['NPK (15-15-15)', 'NPK (20-20-20)'],
        rationale: 'Balanced fertilizer provides essential nutrients for general plant growth.',
      });
    }

    return recommendations;
  }

  /**
   * Calculate recommended fertilizer quantity based on deficiency
   */
  private calculateQuantity(deficiency: SoilDeficiency, nutrientPercentage: number): number {
    const deficiencyGap = deficiency.optimalLevel - deficiency.level;
    const baseQuantity = (deficiencyGap / nutrientPercentage) * 100;

    // Adjust based on severity
    const severityMultiplier = {
      low: 0.5,
      moderate: 0.8,
      high: 1.2,
      critical: 1.5,
    };

    return Math.round(baseQuantity * (severityMultiplier[deficiency.severity] || 1));
  }

  /**
   * Calculate overall soil health score (0-100)
   */
  private calculateHealthScore(deficiencies: SoilDeficiency[]): number {
    if (deficiencies.length === 0) return 100;

    const severityScores = {
      low: 15,
      moderate: 30,
      high: 50,
      critical: 80,
    };

    const totalDeduction = deficiencies.reduce((sum, def) => sum + (severityScores[def.severity] || 0), 0);

    return Math.max(0, 100 - totalDeduction);
  }

  /**
   * Determine action priority
   */
  private determineActionPriority(
    deficiencies: SoilDeficiency[],
    healthScore: number
  ): 'immediate' | 'high' | 'medium' | 'low' {
    const hasCritical = deficiencies.some((d) => d.severity === 'critical');
    const hasHigh = deficiencies.some((d) => d.severity === 'high');

    if (hasCritical || healthScore < 40) return 'immediate';
    if (hasHigh || healthScore < 60) return 'high';
    if (deficiencies.length > 0 || healthScore < 80) return 'medium';
    return 'low';
  }

  /**
   * Get recommendations for a cycle
   */
  async getRecommendationsForCycle(cycleId: number): Promise<any[]> {
    const dbPromise = getDb();
    const db = await dbPromise;
    if (!db) throw new Error('Database connection failed');

    return await db.select().from(soilHealthRecommendations).where(eq(soilHealthRecommendations.cycleId, cycleId));
  }

  /**
   * Update recommendation implementation status
   */
  async updateRecommendationStatus(
    recommendationId: number,
    status: 'pending' | 'applied' | 'completed' | 'cancelled'
  ): Promise<void> {
    const dbPromise = getDb();
    const db = await dbPromise;
    if (!db) throw new Error('Database connection failed');

    await db
      .update(soilHealthRecommendations)
      .set({
        implementationStatus: status,
        appliedDate: status === 'applied' || status === 'completed' ? new Date() : undefined,
      })
      .where(eq(soilHealthRecommendations.id, recommendationId));
  }
}

export const soilHealthRecommendationsEngine = new SoilHealthRecommendationsEngine();
