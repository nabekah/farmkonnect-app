import { invokeLLM } from "../_core/llm";

export interface FarmConditions {
  soilType: string;
  soilPH: number;
  soilNitrogen: number;
  soilPhosphorus: number;
  soilPotassium: number;
  rainfall: number;
  temperature: number;
  humidity: number;
  elevation: number;
  farmSize: number;
  budget: number;
  marketDemand: string[];
  previousCrops: string[];
  diseaseHistory: string[];
}

export interface CropRecommendation {
  cropName: string;
  suitability: number; // 0-100
  expectedYield: number;
  estimatedRevenue: number;
  riskFactors: string[];
  benefits: string[];
  requirements: {
    waterNeeds: string;
    soilRequirements: string;
    temperatureRange: string;
    diseaseRisks: string[];
  };
  plantingSchedule: {
    season: string;
    plantingDate: string;
    harvestDate: string;
  };
  marketOpportunities: string[];
}

export class CropRecommendationEngine {
  async generateRecommendations(farmConditions: FarmConditions): Promise<CropRecommendation[]> {
    const prompt = this.buildPrompt(farmConditions);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert agricultural consultant. Analyze farm conditions and recommend the best crops with detailed analysis. Return a JSON array of crop recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "crop_recommendations",
            strict: true,
            schema: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      cropName: { type: "string" },
                      suitability: { type: "number" },
                      expectedYield: { type: "number" },
                      estimatedRevenue: { type: "number" },
                      riskFactors: { type: "array", items: { type: "string" } },
                      benefits: { type: "array", items: { type: "string" } },
                      requirements: {
                        type: "object",
                        properties: {
                          waterNeeds: { type: "string" },
                          soilRequirements: { type: "string" },
                          temperatureRange: { type: "string" },
                          diseaseRisks: { type: "array", items: { type: "string" } },
                        },
                        required: ["waterNeeds", "soilRequirements", "temperatureRange", "diseaseRisks"],
                      },
                      plantingSchedule: {
                        type: "object",
                        properties: {
                          season: { type: "string" },
                          plantingDate: { type: "string" },
                          harvestDate: { type: "string" },
                        },
                        required: ["season", "plantingDate", "harvestDate"],
                      },
                      marketOpportunities: { type: "array", items: { type: "string" } },
                    },
                    required: [
                      "cropName",
                      "suitability",
                      "expectedYield",
                      "estimatedRevenue",
                      "riskFactors",
                      "benefits",
                      "requirements",
                      "plantingSchedule",
                      "marketOpportunities",
                    ],
                  },
                },
              },
              required: ["recommendations"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (typeof content === "string") {
        const parsed = JSON.parse(content);
        return parsed.recommendations.sort((a: CropRecommendation, b: CropRecommendation) => b.suitability - a.suitability);
      }
      return [];
    } catch (error) {
      console.error("Error generating crop recommendations:", error);
      return this.getFallbackRecommendations(farmConditions);
    }
  }

  private buildPrompt(conditions: FarmConditions): string {
    return `
Analyze the following farm conditions and recommend the top 5 most suitable crops:

FARM CONDITIONS:
- Soil Type: ${conditions.soilType}
- Soil pH: ${conditions.soilPH}
- Soil Nitrogen (mg/kg): ${conditions.soilNitrogen}
- Soil Phosphorus (mg/kg): ${conditions.soilPhosphorus}
- Soil Potassium (mg/kg): ${conditions.soilPotassium}
- Annual Rainfall (mm): ${conditions.rainfall}
- Average Temperature (°C): ${conditions.temperature}
- Average Humidity (%): ${conditions.humidity}
- Elevation (m): ${conditions.elevation}
- Farm Size (hectares): ${conditions.farmSize}
- Available Budget ($): ${conditions.budget}
- Market Demand: ${conditions.marketDemand.join(", ")}
- Previous Crops: ${conditions.previousCrops.join(", ")}
- Disease History: ${conditions.diseaseHistory.join(", ")}

For each recommended crop, provide:
1. Suitability score (0-100)
2. Expected yield (tons/hectare)
3. Estimated revenue ($/hectare)
4. Risk factors
5. Benefits
6. Specific requirements (water, soil, temperature, disease risks)
7. Optimal planting and harvest dates
8. Market opportunities

Consider crop rotation, disease prevention, market trends, and profitability.
`;
  }

  private getFallbackRecommendations(conditions: FarmConditions): CropRecommendation[] {
    // Fallback recommendations based on climate and soil
    const recommendations: CropRecommendation[] = [];

    if (conditions.temperature >= 20 && conditions.temperature <= 30) {
      recommendations.push({
        cropName: "Maize",
        suitability: 85,
        expectedYield: 3.5,
        estimatedRevenue: 650,
        riskFactors: ["Drought sensitivity", "Pest pressure"],
        benefits: ["High market demand", "Good rotation crop"],
        requirements: {
          waterNeeds: "600-800mm annually",
          soilRequirements: "Well-drained loam to clay loam",
          temperatureRange: "20-30°C",
          diseaseRisks: ["Leaf blight", "Stalk rot"],
        },
        plantingSchedule: {
          season: "Spring",
          plantingDate: "April-May",
          harvestDate: "September-October",
        },
        marketOpportunities: ["Grain market", "Animal feed", "Ethanol production"],
      });
    }

    if (conditions.rainfall > 600) {
      recommendations.push({
        cropName: "Rice",
        suitability: 80,
        expectedYield: 4.2,
        estimatedRevenue: 750,
        riskFactors: ["Waterlogging", "Disease pressure"],
        benefits: ["High yield potential", "Staple crop"],
        requirements: {
          waterNeeds: "1000-1500mm annually",
          soilRequirements: "Clay or clay loam",
          temperatureRange: "25-30°C",
          diseaseRisks: ["Blast", "Sheath blight"],
        },
        plantingSchedule: {
          season: "Monsoon",
          plantingDate: "June-July",
          harvestDate: "November-December",
        },
        marketOpportunities: ["Domestic market", "Export potential", "Organic premium"],
      });
    }

    if (conditions.soilPH >= 6.0 && conditions.soilPH <= 7.5) {
      recommendations.push({
        cropName: "Wheat",
        suitability: 75,
        expectedYield: 2.8,
        estimatedRevenue: 500,
        riskFactors: ["Frost damage", "Rust diseases"],
        benefits: ["Winter crop", "Soil improvement"],
        requirements: {
          waterNeeds: "400-500mm annually",
          soilRequirements: "Well-drained loam",
          temperatureRange: "15-25°C",
          diseaseRisks: ["Rust", "Septoria"],
        },
        plantingSchedule: {
          season: "Winter",
          plantingDate: "October-November",
          harvestDate: "March-April",
        },
        marketOpportunities: ["Flour mills", "Animal feed", "Export market"],
      });
    }

    if (conditions.temperature >= 25) {
      recommendations.push({
        cropName: "Soybean",
        suitability: 78,
        expectedYield: 2.2,
        estimatedRevenue: 550,
        riskFactors: ["Pod shattering", "Disease pressure"],
        benefits: ["Nitrogen fixation", "Rotation crop"],
        requirements: {
          waterNeeds: "450-650mm annually",
          soilRequirements: "Well-drained loam",
          temperatureRange: "25-30°C",
          diseaseRisks: ["Leaf spot", "Pod rot"],
        },
        plantingSchedule: {
          season: "Summer",
          plantingDate: "May-June",
          harvestDate: "September-October",
        },
        marketOpportunities: ["Oil extraction", "Animal feed", "Organic market"],
      });
    }

    recommendations.push({
      cropName: "Vegetables (Mixed)",
      suitability: 70,
      expectedYield: 15,
      estimatedRevenue: 3000,
      riskFactors: ["High labor requirement", "Market volatility"],
      benefits: ["High value", "Quick returns"],
      requirements: {
        waterNeeds: "600-1000mm annually",
        soilRequirements: "Rich organic matter",
        temperatureRange: "15-30°C",
        diseaseRisks: ["Fungal diseases", "Pest pressure"],
      },
      plantingSchedule: {
        season: "Year-round",
        plantingDate: "Variable",
        harvestDate: "60-120 days after planting",
      },
      marketOpportunities: ["Local markets", "Supermarkets", "Organic premium"],
    });

    return recommendations.sort((a, b) => b.suitability - a.suitability);
  }

  async getDetailedCropAnalysis(cropName: string, farmConditions: FarmConditions): Promise<string> {
    const prompt = `
Provide a detailed analysis for growing ${cropName} under these farm conditions:
- Soil Type: ${farmConditions.soilType}
- Climate: ${farmConditions.temperature}°C, ${farmConditions.rainfall}mm rainfall
- Soil pH: ${farmConditions.soilPH}
- Farm Size: ${farmConditions.farmSize} hectares
- Budget: $${farmConditions.budget}

Include:
1. Soil preparation steps
2. Seed selection and planting density
3. Irrigation schedule
4. Fertilizer recommendations
5. Pest and disease management
6. Harvesting and post-harvest handling
7. Expected profitability
8. Market timing
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert agricultural consultant providing detailed crop growing guides.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0].message.content;
      return typeof content === "string" ? content : "Unable to generate analysis";
    } catch (error) {
      console.error("Error generating crop analysis:", error);
      return "Unable to generate detailed analysis at this time.";
    }
  }
}

export const cropRecommendationEngine = new CropRecommendationEngine();
