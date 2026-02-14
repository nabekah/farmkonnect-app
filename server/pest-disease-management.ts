/**
 * Pest & Disease Management System
 * Identifies, tracks, and manages crop pests and diseases
 */

export interface Pest {
  id: string;
  name: string;
  scientificName: string;
  affectedCrops: string[];
  lifecycle: string;
  damageType: string;
  identificationCharacteristics: string[];
  treatmentMethods: TreatmentMethod[];
  preventionMeasures: string[];
  biologicalControls: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Disease {
  id: string;
  name: string;
  pathogen: string;
  affectedCrops: string[];
  symptoms: string[];
  conditions: EnvironmentalCondition[];
  treatmentMethods: TreatmentMethod[];
  preventionMeasures: string[];
  resistantVarieties: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TreatmentMethod {
  name: string;
  type: 'chemical' | 'biological' | 'cultural' | 'mechanical';
  activeIngredient: string;
  dosage: string;
  applicationMethod: string;
  waitingPeriod: number; // days
  effectiveness: number; // 0-100
  cost: number;
  environmentalImpact: 'low' | 'medium' | 'high';
}

export interface EnvironmentalCondition {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  rainfall: { min: number; max: number };
  description: string;
}

export interface PestDiseaseIncident {
  id: string;
  fieldId: string;
  cropId: string;
  type: 'pest' | 'disease';
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number; // percentage
  detectionDate: Date;
  treatments: TreatmentRecord[];
  status: 'detected' | 'treated' | 'monitored' | 'resolved';
}

export interface TreatmentRecord {
  date: Date;
  method: TreatmentMethod;
  appliedArea: number;
  effectiveness: number;
  notes: string;
}

/**
 * Pest & Disease Management Implementation
 */
export class PestDiseaseManager {
  private pests: Map<string, Pest> = new Map();
  private diseases: Map<string, Disease> = new Map();
  private incidents: Map<string, PestDiseaseIncident> = new Map();

  constructor() {
    this.initializePestsAndDiseases();
  }

  private initializePestsAndDiseases(): void {
    // Initialize common rice pests
    const ricePests: Pest[] = [
      {
        id: 'rice-stem-borer',
        name: 'Rice Stem Borer',
        scientificName: 'Chilo suppressalis',
        affectedCrops: ['rice'],
        lifecycle: '4-5 generations per year',
        damageType: 'Larvae bore into stems causing white heads',
        identificationCharacteristics: ['white heads', 'holes in stems', 'frass in stems'],
        treatmentMethods: [
          {
            name: 'Carbofuran',
            type: 'chemical',
            activeIngredient: 'Carbofuran 3% G',
            dosage: '20 kg/hectare',
            applicationMethod: 'soil application',
            waitingPeriod: 7,
            effectiveness: 85,
            cost: 500,
            environmentalImpact: 'high',
          },
        ],
        preventionMeasures: ['field sanitation', 'crop rotation', 'resistant varieties'],
        biologicalControls: ['Trichogramma', 'Bacillus thuringiensis'],
        riskLevel: 'high',
      },
      {
        id: 'rice-leaf-folder',
        name: 'Rice Leaf Folder',
        scientificName: 'Cnaphalocrocis medinalis',
        affectedCrops: ['rice'],
        lifecycle: '6-8 generations per year',
        damageType: 'Larvae fold leaves and feed inside',
        identificationCharacteristics: ['folded leaves', 'transparent patches', 'frass'],
        treatmentMethods: [
          {
            name: 'Cypermethrin',
            type: 'chemical',
            activeIngredient: 'Cypermethrin 10% EC',
            dosage: '500 ml/hectare',
            applicationMethod: 'spray',
            waitingPeriod: 14,
            effectiveness: 80,
            cost: 300,
            environmentalImpact: 'medium',
          },
        ],
        preventionMeasures: ['field sanitation', 'water management', 'resistant varieties'],
        biologicalControls: ['Trichogramma', 'parasitic wasps'],
        riskLevel: 'medium',
      },
    ];

    // Initialize common rice diseases
    const riceDiseases: Disease[] = [
      {
        id: 'rice-blast',
        name: 'Rice Blast',
        pathogen: 'Magnaporthe oryzae',
        affectedCrops: ['rice'],
        symptoms: ['gray-brown spots on leaves', 'diamond-shaped lesions', 'panicle infection'],
        conditions: [
          {
            temperature: { min: 20, max: 28 },
            humidity: { min: 85, max: 100 },
            rainfall: { min: 100, max: 500 },
            description: 'Cool, wet conditions favor disease',
          },
        ],
        treatmentMethods: [
          {
            name: 'Tricyclazole',
            type: 'chemical',
            activeIngredient: 'Tricyclazole 75% WP',
            dosage: '500 g/hectare',
            applicationMethod: 'spray',
            waitingPeriod: 7,
            effectiveness: 90,
            cost: 400,
            environmentalImpact: 'low',
          },
        ],
        preventionMeasures: ['resistant varieties', 'proper spacing', 'balanced fertilization'],
        resistantVarieties: ['Basmati 2000', 'Pusa Basmati 1'],
        riskLevel: 'critical',
      },
      {
        id: 'rice-sheath-blight',
        name: 'Rice Sheath Blight',
        pathogen: 'Rhizoctonia solani',
        affectedCrops: ['rice'],
        symptoms: ['water-soaked lesions on sheath', 'gray-green spots', 'panicle discoloration'],
        conditions: [
          {
            temperature: { min: 25, max: 32 },
            humidity: { min: 90, max: 100 },
            rainfall: { min: 50, max: 200 },
            description: 'Warm, humid conditions favor disease',
          },
        ],
        treatmentMethods: [
          {
            name: 'Hexaconazole',
            type: 'chemical',
            activeIngredient: 'Hexaconazole 5% SC',
            dosage: '1 liter/hectare',
            applicationMethod: 'spray',
            waitingPeriod: 14,
            effectiveness: 85,
            cost: 350,
            environmentalImpact: 'medium',
          },
        ],
        preventionMeasures: ['field sanitation', 'balanced fertilization', 'proper spacing'],
        resistantVarieties: ['Pusa Basmati 1', 'Improved Pusa Basmati'],
        riskLevel: 'high',
      },
    ];

    ricePests.forEach(pest => this.pests.set(pest.id, pest));
    riceDiseases.forEach(disease => this.diseases.set(disease.id, disease));
  }

  reportIncident(incident: Omit<PestDiseaseIncident, 'id' | 'treatments' | 'status'>): PestDiseaseIncident {
    const id = `incident-${Date.now()}`;
    const newIncident: PestDiseaseIncident = {
      ...incident,
      id,
      treatments: [],
      status: 'detected',
    };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  identifyPestOrDisease(cropName: string, symptoms: string[]): (Pest | Disease)[] {
    const results: (Pest | Disease)[] = [];

    // Search pests
    Array.from(this.pests.values()).forEach(pest => {
      if (pest.affectedCrops.includes(cropName.toLowerCase())) {
        const matchingSymptoms = symptoms.filter(s =>
          pest.identificationCharacteristics.some(ic =>
            ic.toLowerCase().includes(s.toLowerCase())
          )
        );
        if (matchingSymptoms.length > 0) {
          results.push(pest);
        }
      }
    });

    // Search diseases
    Array.from(this.diseases.values()).forEach(disease => {
      if (disease.affectedCrops.includes(cropName.toLowerCase())) {
        const matchingSymptoms = symptoms.filter(s =>
          disease.symptoms.some(sy => sy.toLowerCase().includes(s.toLowerCase()))
        );
        if (matchingSymptoms.length > 0) {
          results.push(disease);
        }
      }
    });

    return results;
  }

  getTreatmentRecommendations(incidentId: string): TreatmentMethod[] {
    const incident = this.incidents.get(incidentId);
    if (!incident) return [];

    const target = incident.type === 'pest'
      ? this.pests.get(incident.name.toLowerCase())
      : this.diseases.get(incident.name.toLowerCase());

    if (!target) return [];

    return target.treatmentMethods.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  recordTreatment(incidentId: string, treatment: Omit<TreatmentRecord, 'date'>): void {
    const incident = this.incidents.get(incidentId);
    if (incident) {
      incident.treatments.push({ ...treatment, date: new Date() });
      
      // Update status
      if (treatment.effectiveness > 80) {
        incident.status = 'resolved';
      } else if (treatment.effectiveness > 50) {
        incident.status = 'treated';
      }
    }
  }

  getPreventionMeasures(cropName: string, pestOrDiseaseName: string): string[] {
    const pest = Array.from(this.pests.values()).find(p =>
      p.affectedCrops.includes(cropName.toLowerCase()) &&
      p.name.toLowerCase().includes(pestOrDiseaseName.toLowerCase())
    );

    if (pest) return pest.preventionMeasures;

    const disease = Array.from(this.diseases.values()).find(d =>
      d.affectedCrops.includes(cropName.toLowerCase()) &&
      d.name.toLowerCase().includes(pestOrDiseaseName.toLowerCase())
    );

    return disease?.preventionMeasures || [];
  }

  getRiskAssessment(fieldId: string, temperature: number, humidity: number, rainfall: number): string {
    let riskLevel = 'low';
    let risks: string[] = [];

    // Check disease conditions
    Array.from(this.diseases.values()).forEach(disease => {
      disease.conditions.forEach(condition => {
        if (
          temperature >= condition.temperature.min &&
          temperature <= condition.temperature.max &&
          humidity >= condition.humidity.min &&
          humidity <= condition.humidity.max &&
          rainfall >= condition.rainfall.min &&
          rainfall <= condition.rainfall.max
        ) {
          risks.push(`${disease.name} risk is high`);
          if (disease.riskLevel === 'critical') riskLevel = 'critical';
          else if (disease.riskLevel === 'high' && riskLevel !== 'critical') riskLevel = 'high';
        }
      });
    });

    return `Risk Level: ${riskLevel}. ${risks.join('. ')}`;
  }

  getIncident(incidentId: string): PestDiseaseIncident | undefined {
    return this.incidents.get(incidentId);
  }

  getAllIncidents(): PestDiseaseIncident[] {
    return Array.from(this.incidents.values());
  }
}

export const pestDiseaseManager = new PestDiseaseManager();
