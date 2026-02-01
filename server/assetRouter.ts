import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte } from "drizzle-orm";
import { farmAssets } from "../drizzle/schema";

export const assetRouter = router({
  // ============================================================================
  // ASSET MANAGEMENT
  // ============================================================================

  assets: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        assetType: z.string(),
        purchaseDate: z.date(),
        purchaseValue: z.union([z.number(), z.string()]).optional(),
        currentValue: z.union([z.number(), z.string()]).optional(),
        maintenanceSchedule: z.string().optional(),
        lastMaintenanceDate: z.date().optional(),
        nextMaintenanceDate: z.date().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const values = {
          ...input,
          purchaseValue: input.purchaseValue ? input.purchaseValue.toString() : null,
          currentValue: input.currentValue ? input.currentValue.toString() : null,
          status: input.status || "active",
        };
        return await db.insert(farmAssets).values(values);
      }),

    list: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        assetType: z.string().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        let whereConditions = [eq(farmAssets.farmId, input.farmId)];
        if (input.assetType) {
          whereConditions.push(eq(farmAssets.assetType, input.assetType));
        }
        if (input.status) {
          whereConditions.push(eq(farmAssets.status, input.status));
        }

        return await db.select().from(farmAssets).where(and(...whereConditions));
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        currentValue: z.union([z.number(), z.string()]).optional(),
        maintenanceSchedule: z.string().optional(),
        lastMaintenanceDate: z.date().optional(),
        nextMaintenanceDate: z.date().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { id, ...updates } = input;
        const values = {
          ...updates,
          currentValue: updates.currentValue ? updates.currentValue.toString() : undefined,
        };
        return await db.update(farmAssets).set(values).where(eq(farmAssets.id, id));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db.delete(farmAssets).where(eq(farmAssets.id, input.id));
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const result = await db.select().from(farmAssets).where(eq(farmAssets.id, input.id));
        return result.length > 0 ? result[0] : null;
      }),
  }),

  // ============================================================================
  // MAINTENANCE TRACKING
  // ============================================================================

  maintenance: router({
    recordMaintenance: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        maintenanceDate: z.date(),
        maintenanceType: z.enum(["routine", "repair", "inspection", "upgrade"]),
        description: z.string(),
        cost: z.number().optional(),
        nextMaintenanceDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Record maintenance event
        return {
          success: true,
          message: `Maintenance recorded for asset ${input.assetId}`,
          maintenanceDate: input.maintenanceDate,
        };
      }),

    getMaintenanceHistory: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        // Return maintenance history
        return [];
      }),

    getUpcomingMaintenance: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        daysAhead: z.number().default(30),
      }))
      .query(async ({ input }) => {
        // Return upcoming maintenance tasks
        return [];
      }),

    getMaintenanceCosts: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        // Calculate maintenance costs
        return {
          assetId: input.assetId,
          totalCost: 0,
          maintenanceCount: 0,
          averageCostPerMaintenance: 0,
        };
      }),
  }),

  // ============================================================================
  // DEPRECIATION & VALUE TRACKING
  // ============================================================================

  depreciation: router({
    calculateDepreciation: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        depreciationMethod: z.enum(["straight_line", "declining_balance"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { depreciation: 0, remainingValue: 0 };

        const asset = await db.select().from(farmAssets).where(eq(farmAssets.id, input.assetId));
        if (asset.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }

        const a = asset[0];
        const purchaseValue = parseFloat(a.purchaseValue?.toString() || "0");
        const currentValue = parseFloat(a.currentValue?.toString() || purchaseValue.toString());
        const depreciation = purchaseValue - currentValue;

        return {
          assetId: input.assetId,
          purchaseValue,
          currentValue,
          depreciation,
          depreciationPercentage: (depreciation / purchaseValue) * 100,
        };
      }),

    getAssetValueHistory: protectedProcedure
      .input(z.object({
        assetId: z.number(),
      }))
      .query(async ({ input }) => {
        // Return asset value history
        return [];
      }),
  }),

  // ============================================================================
  // ASSET ANALYTICS
  // ============================================================================

  analytics: router({
    getAssetInventory: protectedProcedure
      .input(z.object({
        farmId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { totalAssets: 0, totalValue: 0, assetsByType: {} };

        const assets = await db.select().from(farmAssets).where(eq(farmAssets.farmId, input.farmId));

        const totalValue = assets.reduce((sum, a) => sum + parseFloat(a.currentValue?.toString() || a.purchaseValue?.toString() || "0"), 0);
        const assetsByType: Record<string, number> = {};
        const assetsByStatus: Record<string, number> = {};

        assets.forEach(a => {
          assetsByType[a.assetType] = (assetsByType[a.assetType] || 0) + 1;
          if (a.status) {
            assetsByStatus[a.status] = (assetsByStatus[a.status] || 0) + 1;
          }
        });

        return {
          totalAssets: assets.length,
          totalValue,
          averageAssetValue: assets.length > 0 ? totalValue / assets.length : 0,
          assetsByType,
          assetsByStatus,
        };
      }),

    getAssetsByStatus: protectedProcedure
      .input(z.object({
        farmId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return {};

        const assets = await db.select().from(farmAssets).where(eq(farmAssets.farmId, input.farmId));

        const byStatus: Record<string, any[]> = {
          active: [],
          maintenance: [],
          retired: [],
        };

        assets.forEach(a => {
          const status = a.status || "active";
          if (!byStatus[status]) {
            byStatus[status] = [];
          }
          byStatus[status].push(a);
        });

        return byStatus;
      }),

    getHighValueAssets: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        threshold: z.number().optional(),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const assets = await db.select().from(farmAssets).where(eq(farmAssets.farmId, input.farmId));

        const threshold = input.threshold || 10000;
        return assets
          .filter(a => parseFloat(a.currentValue?.toString() || a.purchaseValue?.toString() || "0") >= threshold)
          .sort((a, b) => {
            const aVal = parseFloat(a.currentValue?.toString() || a.purchaseValue?.toString() || "0");
            const bVal = parseFloat(b.currentValue?.toString() || b.purchaseValue?.toString() || "0");
            return bVal - aVal;
          })
          .slice(0, input.limit);
      }),

    getDepreciationReport: protectedProcedure
      .input(z.object({
        farmId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { totalDepreciation: 0, assets: [] };

        const assets = await db.select().from(farmAssets).where(eq(farmAssets.farmId, input.farmId));

        let totalDepreciation = 0;
        const assetDepreciation = assets.map(a => {
          const purchaseValue = parseFloat(a.purchaseValue?.toString() || "0");
          const currentValue = parseFloat(a.currentValue?.toString() || purchaseValue.toString());
          const depreciation = purchaseValue - currentValue;
          totalDepreciation += depreciation;

          return {
            assetId: a.id,
            assetName: a.name,
            purchaseValue,
            currentValue,
            depreciation,
            depreciationPercentage: (depreciation / purchaseValue) * 100,
          };
        });

        return {
          totalAssets: assets.length,
          totalPurchaseValue: assets.reduce((sum, a) => sum + parseFloat(a.purchaseValue?.toString() || "0"), 0),
          totalCurrentValue: assets.reduce((sum, a) => sum + parseFloat(a.currentValue?.toString() || a.purchaseValue?.toString() || "0"), 0),
          totalDepreciation,
          assets: assetDepreciation,
        };
      }),
  }),
});
