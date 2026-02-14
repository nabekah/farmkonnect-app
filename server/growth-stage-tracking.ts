/**
 * Growth Stage Tracking System
 * Monitors crop growth stages and provides stage-specific recommendations
 */

export interface GrowthStage {
  id: string;
  stageName: string;
  stageNumber: number;
  daysFromPlanting: { min: number; max: number };
  description: string;
  physicalCharacteristics: string[];
  managementTasks: string[];
  waterRequirement: number;
  nutrientRequirement: { nitrogen: number; phosphorus: number; potassium: number };
  pestRisk: string[];
  diseaseRisk: string[];
  irrigationSchedule: string;
  fertilizerSchedule: string;
}

export interface CropGrowthTracker {
  cropId: string;
  fieldId: string;
  plantingDate: Date;
  variety: string;
  currentStage: number;
  daysGrown: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  observations: ObservationRecord[];
  stageHistory: StageTransition[];
}

export interface ObservationRecord {
  date: Date;
  stage: number;
  height: number;
  leafCount: number;
  diseaseSymptoms: string[];
  pestPresence: string[];
  notes: string;
}

export interface StageTransition {
  fromStage: number;
  toStage: number;
  transitionDate: Date;
  daysInPreviousStage: number;
  earlyLate: 'early' | 'on_time' | 'late';
}

/**
 * Growth Stage Tracking Implementation
 */
export class GrowthStageTracker {
  private trackers: Map<string, CropGrowthTracker> = new Map();
  private stages: Map<string, GrowthStage[]> = new Map();

  constructor() {
    this.initializeGrowthStages();
  }

  private initializeGrowthStages(): void {
    // Rice growth stages (10 stages)
    const riceStages: GrowthStage[] = [
      {
        id: 'rice-stage-1',
        stageName: 'Germination',
        stageNumber: 1,
        daysFromPlanting: { min: 0, max: 5 },
        description: 'Seed germination and root emergence',
        physicalCharacteristics: ['coleoptile emergence', 'root development'],
        managementTasks: ['maintain moisture', 'monitor temperature'],
        waterRequirement: 50,
        nutrientRequirement: { nitrogen: 0, phosphorus: 10, potassium: 5 },
        pestRisk: ['seed_rot', 'damping_off'],
        diseaseRisk: ['seed_borne_diseases'],
        irrigationSchedule: 'daily_light_spray',
        fertilizerSchedule: 'pre_planting_only',
      },
      {
        id: 'rice-stage-2',
        stageName: 'Seedling',
        stageNumber: 2,
        daysFromPlanting: { min: 5, max: 15 },
        description: 'Leaf emergence and seedling establishment',
        physicalCharacteristics: ['2-3 leaves', 'root system development'],
        managementTasks: ['thin seedlings', 'control weeds', 'monitor pests'],
        waterRequirement: 100,
        nutrientRequirement: { nitrogen: 20, phosphorus: 15, potassium: 10 },
        pestRisk: ['leaf_folder', 'stem_borer'],
        diseaseRisk: ['leaf_spot', 'blast'],
        irrigationSchedule: 'alternate_day',
        fertilizerSchedule: 'light_application',
      },
      {
        id: 'rice-stage-3',
        stageName: 'Vegetative',
        stageNumber: 3,
        daysFromPlanting: { min: 15, max: 45 },
        description: 'Rapid leaf and tiller development',
        physicalCharacteristics: ['4-6 leaves', 'active tillering', '15-20cm height'],
        managementTasks: ['fertilizer application', 'weed control', 'pest monitoring'],
        waterRequirement: 150,
        nutrientRequirement: { nitrogen: 60, phosphorus: 30, potassium: 40 },
        pestRisk: ['stem_borer', 'leaf_folder', 'plant_hopper'],
        diseaseRisk: ['sheath_blight', 'brown_spot'],
        irrigationSchedule: 'every_3_days',
        fertilizerSchedule: 'split_application',
      },
      {
        id: 'rice-stage-4',
        stageName: 'Panicle_Initiation',
        stageNumber: 4,
        daysFromPlanting: { min: 45, max: 60 },
        description: 'Panicle primordium formation',
        physicalCharacteristics: ['8-10 leaves', 'maximum tillering', 'panicle visible'],
        managementTasks: ['critical fertilizer stage', 'irrigation management'],
        waterRequirement: 200,
        nutrientRequirement: { nitrogen: 40, phosphorus: 40, potassium: 50 },
        pestRisk: ['stem_borer', 'gall_midge'],
        diseaseRisk: ['sheath_blight'],
        irrigationSchedule: 'continuous_flooding',
        fertilizerSchedule: 'critical_application',
      },
      {
        id: 'rice-stage-5',
        stageName: 'Booting',
        stageNumber: 5,
        daysFromPlanting: { min: 60, max: 75 },
        description: 'Panicle emergence from leaf sheath',
        physicalCharacteristics: ['panicle in boot', 'flag leaf visible'],
        managementTasks: ['maintain water level', 'pest control'],
        waterRequirement: 180,
        nutrientRequirement: { nitrogen: 20, phosphorus: 30, potassium: 30 },
        pestRisk: ['stem_borer', 'leaf_folder'],
        diseaseRisk: ['blast', 'sheath_blight'],
        irrigationSchedule: 'maintain_level',
        fertilizerSchedule: 'light_application',
      },
      {
        id: 'rice-stage-6',
        stageName: 'Heading',
        stageNumber: 6,
        daysFromPlanting: { min: 75, max: 85 },
        description: 'Panicle emergence and flowering',
        physicalCharacteristics: ['panicle fully emerged', 'flowering begins'],
        managementTasks: ['avoid water stress', 'pest monitoring'],
        waterRequirement: 150,
        nutrientRequirement: { nitrogen: 10, phosphorus: 20, potassium: 20 },
        pestRisk: ['gall_midge', 'plant_hopper'],
        diseaseRisk: ['false_smut'],
        irrigationSchedule: 'maintain_level',
        fertilizerSchedule: 'no_application',
      },
      {
        id: 'rice-stage-7',
        stageName: 'Flowering',
        stageNumber: 7,
        daysFromPlanting: { min: 85, max: 100 },
        description: 'Anther exertion and pollination',
        physicalCharacteristics: ['flowers open', 'pollen release'],
        managementTasks: ['avoid disturbance', 'maintain water'],
        waterRequirement: 120,
        nutrientRequirement: { nitrogen: 0, phosphorus: 10, potassium: 10 },
        pestRisk: [],
        diseaseRisk: ['false_smut'],
        irrigationSchedule: 'maintain_level',
        fertilizerSchedule: 'no_application',
      },
      {
        id: 'rice-stage-8',
        stageName: 'Milk',
        stageNumber: 8,
        daysFromPlanting: { min: 100, max: 110 },
        description: 'Grain filling with milky content',
        physicalCharacteristics: ['grain milky', 'green color'],
        managementTasks: ['maintain moisture', 'monitor diseases'],
        waterRequirement: 100,
        nutrientRequirement: { nitrogen: 0, phosphorus: 5, potassium: 10 },
        pestRisk: [],
        diseaseRisk: ['leaf_spot'],
        irrigationSchedule: 'reduce_gradually',
        fertilizerSchedule: 'no_application',
      },
      {
        id: 'rice-stage-9',
        stageName: 'Dough',
        stageNumber: 9,
        daysFromPlanting: { min: 110, max: 120 },
        description: 'Grain hardening with dough-like consistency',
        physicalCharacteristics: ['grain hard', 'straw yellowing'],
        managementTasks: ['reduce irrigation', 'prepare for harvest'],
        waterRequirement: 50,
        nutrientRequirement: { nitrogen: 0, phosphorus: 0, potassium: 5 },
        pestRisk: [],
        diseaseRisk: [],
        irrigationSchedule: 'minimal',
        fertilizerSchedule: 'no_application',
      },
      {
        id: 'rice-stage-10',
        stageName: 'Maturity',
        stageNumber: 10,
        daysFromPlanting: { min: 120, max: 130 },
        description: 'Grain fully mature and ready for harvest',
        physicalCharacteristics: ['grain hard', 'brown color', 'moisture 20-25%'],
        managementTasks: ['harvest preparation', 'drying'],
        waterRequirement: 0,
        nutrientRequirement: { nitrogen: 0, phosphorus: 0, potassium: 0 },
        pestRisk: [],
        diseaseRisk: [],
        irrigationSchedule: 'stop',
        fertilizerSchedule: 'no_application',
      },
    ];

    this.stages.set('rice', riceStages);
    // Add wheat, corn, and other crop stages similarly...
  }

  createTracker(cropId: string, fieldId: string, variety: string): CropGrowthTracker {
    const tracker: CropGrowthTracker = {
      cropId,
      fieldId,
      plantingDate: new Date(),
      variety,
      currentStage: 1,
      daysGrown: 0,
      healthStatus: 'excellent',
      observations: [],
      stageHistory: [],
    };
    this.trackers.set(cropId, tracker);
    return tracker;
  }

  recordObservation(cropId: string, observation: Omit<ObservationRecord, 'date'>): void {
    const tracker = this.trackers.get(cropId);
    if (tracker) {
      tracker.observations.push({ ...observation, date: new Date() });
      this.updateHealthStatus(cropId);
    }
  }

  updateStage(cropId: string, newStage: number): void {
    const tracker = this.trackers.get(cropId);
    if (tracker) {
      const daysInPreviousStage = tracker.daysGrown;
      const expectedDays = this.getExpectedDaysForStage(tracker.variety, tracker.currentStage);
      const earlyLate = daysInPreviousStage < expectedDays ? 'early' : 
                       daysInPreviousStage > expectedDays ? 'late' : 'on_time';

      tracker.stageHistory.push({
        fromStage: tracker.currentStage,
        toStage: newStage,
        transitionDate: new Date(),
        daysInPreviousStage,
        earlyLate,
      });

      tracker.currentStage = newStage;
      tracker.daysGrown = 0;
    }
  }

  getStageRecommendations(cropId: string): GrowthStage | null {
    const tracker = this.trackers.get(cropId);
    if (!tracker) return null;

    const stages = this.stages.get(tracker.variety);
    return stages?.find(s => s.stageNumber === tracker.currentStage) || null;
  }

  predictNextStage(cropId: string): { stage: number; daysUntil: number } | null {
    const tracker = this.trackers.get(cropId);
    if (!tracker) return null;

    const stages = this.stages.get(tracker.variety);
    const currentStage = stages?.find(s => s.stageNumber === tracker.currentStage);
    if (!currentStage) return null;

    const daysUntilNext = (currentStage.daysFromPlanting.max - tracker.daysGrown) + 1;
    return {
      stage: tracker.currentStage + 1,
      daysUntil: Math.max(0, daysUntilNext),
    };
  }

  private updateHealthStatus(cropId: string): void {
    const tracker = this.trackers.get(cropId);
    if (!tracker || tracker.observations.length === 0) return;

    const lastObs = tracker.observations[tracker.observations.length - 1];
    const diseaseCount = lastObs.diseaseSymptoms.length;
    const pestCount = lastObs.pestPresence.length;

    if (diseaseCount > 3 || pestCount > 5) {
      tracker.healthStatus = 'poor';
    } else if (diseaseCount > 1 || pestCount > 2) {
      tracker.healthStatus = 'fair';
    } else if (diseaseCount > 0 || pestCount > 0) {
      tracker.healthStatus = 'good';
    } else {
      tracker.healthStatus = 'excellent';
    }
  }

  private getExpectedDaysForStage(variety: string, stage: number): number {
    const stages = this.stages.get(variety);
    const stageInfo = stages?.find(s => s.stageNumber === stage);
    return stageInfo ? (stageInfo.daysFromPlanting.min + stageInfo.daysFromPlanting.max) / 2 : 0;
  }

  getTracker(cropId: string): CropGrowthTracker | undefined {
    return this.trackers.get(cropId);
  }
}

export const growthStageTracker = new GrowthStageTracker();
