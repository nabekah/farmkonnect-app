import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { PredictiveAnalyticsEngine } from "../services/predictiveAnalyticsEngine";

const analyticsEngine = new PredictiveAnalyticsEngine();

export const predictiveAnalyticsRouter = router({
  /**
   * Predict crop yield based on environmental factors
   */
  predictCropYield: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        cropType: z.string(),
        historicalYields: z.array(z.number()).min(1),
        rainfall: z.number().min(0),
        temperature: z.number().min(-50).max(60),
        soilHealth: z.number().min(0).max(100),
        fertilizer: z.number().min(0),
        pesticide: z.number().min(0),
      })
    )
    .query(async ({ input }) => {
      const prediction = await analyticsEngine.predictCropYield(input);
      return {
        success: true,
        data: prediction,
        timestamp: new Date(),
      };
    }),

  /**
   * Predict disease outbreak risk
   */
  predictDiseaseRisk: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        speciesType: z.enum(["cattle", "poultry", "goats", "all"]),
      })
    )
    .query(async ({ input }) => {
      const predictions = await analyticsEngine.predictDiseaseRisk(input.farmId, input.speciesType);
      return {
        success: true,
        data: predictions,
        timestamp: new Date(),
      };
    }),

  /**
   * Predict market prices for agricultural products
   */
  predictMarketPrice: protectedProcedure
    .input(
      z.object({
        productType: z.string(),
        historicalPrices: z.array(z.number()).min(3),
      })
    )
    .query(async ({ input }) => {
      const prediction = await analyticsEngine.predictMarketPrice(input.productType, input.historicalPrices);
      return {
        success: true,
        data: prediction,
        timestamp: new Date(),
      };
    }),

  /**
   * Get comprehensive farm insights
   */
  getFarmInsights: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const insights = await analyticsEngine.getFarmInsights(input.farmId);
      return {
        success: true,
        data: insights,
        timestamp: new Date(),
      };
    }),

  /**
   * Batch predict for multiple crops
   */
  batchPredictCropYields: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        crops: z.array(
          z.object({
            cropType: z.string(),
            historicalYields: z.array(z.number()).min(1),
            rainfall: z.number().min(0),
            temperature: z.number().min(-50).max(60),
            soilHealth: z.number().min(0).max(100),
            fertilizer: z.number().min(0),
            pesticide: z.number().min(0),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const predictions = await Promise.all(
        input.crops.map((crop) =>
          analyticsEngine.predictCropYield({
            farmId: input.farmId,
            ...crop,
          })
        )
      );

      return {
        success: true,
        data: predictions.map((pred, idx) => ({
          cropType: input.crops[idx].cropType,
          prediction: pred,
        })),
        timestamp: new Date(),
      };
    }),

  /**
   * Get all disease predictions for a farm
   */
  getAllDiseasePredictions: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const predictions = await analyticsEngine.predictDiseaseRisk(input.farmId, "all");

      // Filter to high and medium risk only
      const criticalPredictions = predictions.filter((p) => p.riskLevel !== "low");

      return {
        success: true,
        data: {
          allPredictions: predictions,
          criticalPredictions,
          summary: {
            total: predictions.length,
            critical: criticalPredictions.length,
            highRisk: predictions.filter((p) => p.riskLevel === "high").length,
            mediumRisk: predictions.filter((p) => p.riskLevel === "medium").length,
          },
        },
        timestamp: new Date(),
      };
    }),

  /**
   * Get market price trends for multiple products
   */
  getMarketTrends: protectedProcedure
    .input(
      z.object({
        products: z.array(
          z.object({
            productType: z.string(),
            historicalPrices: z.array(z.number()).min(3),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const predictions = await Promise.all(
        input.products.map((product) =>
          analyticsEngine.predictMarketPrice(product.productType, product.historicalPrices)
        )
      );

      return {
        success: true,
        data: predictions,
        timestamp: new Date(),
      };
    }),
});
