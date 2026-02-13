import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { farms } from '@/drizzle/schema';

export const analyticsRouter = router({
  /**
   * Get ROI analysis by crop/animal
   * Calculate return on investment for each crop or animal type
   */
  getRoiAnalysis: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        dateRange: z.object({
          startDate: z.string(),
          endDate: z.string(),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock ROI analysis data
        const roiData = [
          {
            type: 'crop',
            name: 'Corn',
            revenue: 45000,
            expenses: 18000,
            profit: 27000,
            roi: 150,
            acreage: 100,
            profitPerAcre: 270,
          },
          {
            type: 'crop',
            name: 'Soybeans',
            revenue: 32000,
            expenses: 12000,
            profit: 20000,
            roi: 166.67,
            acreage: 80,
            profitPerAcre: 250,
          },
          {
            type: 'animal',
            name: 'Cattle',
            revenue: 28000,
            expenses: 15000,
            profit: 13000,
            roi: 86.67,
            count: 50,
            profitPerUnit: 260,
          },
          {
            type: 'animal',
            name: 'Chickens',
            revenue: 12000,
            expenses: 4000,
            profit: 8000,
            roi: 200,
            count: 500,
            profitPerUnit: 16,
          },
        ];

        return {
          farmId: input.farmId,
          dateRange: input.dateRange,
          roiData,
          totalRevenue: roiData.reduce((sum, item) => sum + item.revenue, 0),
          totalExpenses: roiData.reduce((sum, item) => sum + item.expenses, 0),
          totalProfit: roiData.reduce((sum, item) => sum + item.profit, 0),
          averageRoi: (roiData.reduce((sum, item) => sum + item.roi, 0) / roiData.length).toFixed(2),
          topPerformer: roiData.reduce((max, item) => (item.roi > max.roi ? item : max)),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve ROI analysis',
        });
      }
    }),

  /**
   * Get seasonal trends
   * Analyze spending and revenue patterns by season
   */
  getSeasonalTrends: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        year: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock seasonal trend data
        const trends = [
          {
            season: 'Spring',
            months: ['March', 'April', 'May'],
            revenue: 15000,
            expenses: 8000,
            profit: 7000,
            activities: ['Planting', 'Soil preparation', 'Equipment maintenance'],
          },
          {
            season: 'Summer',
            months: ['June', 'July', 'August'],
            revenue: 22000,
            expenses: 12000,
            profit: 10000,
            activities: ['Crop maintenance', 'Irrigation', 'Pest management'],
          },
          {
            season: 'Fall',
            months: ['September', 'October', 'November'],
            revenue: 35000,
            expenses: 18000,
            profit: 17000,
            activities: ['Harvesting', 'Processing', 'Storage'],
          },
          {
            season: 'Winter',
            months: ['December', 'January', 'February'],
            revenue: 8000,
            expenses: 6000,
            profit: 2000,
            activities: ['Maintenance', 'Planning', 'Equipment repair'],
          },
        ];

        return {
          farmId: input.farmId,
          year: input.year,
          trends,
          highestRevenueSeasons: trends.sort((a, b) => b.revenue - a.revenue).slice(0, 2),
          highestExpenseSeasons: trends.sort((a, b) => b.expenses - a.expenses).slice(0, 2),
          totalYearlyRevenue: trends.reduce((sum, t) => sum + t.revenue, 0),
          totalYearlyExpenses: trends.reduce((sum, t) => sum + t.expenses, 0),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve seasonal trends',
        });
      }
    }),

  /**
   * Get profitability analysis
   * Analyze profitability by category and time period
   */
  getProfitabilityAnalysis: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        groupBy: z.enum(['category', 'month', 'quarter', 'year']),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock profitability data
        const profitabilityData = [
          {
            period: 'January 2026',
            revenue: 3500,
            expenses: 2100,
            profit: 1400,
            margin: 40,
          },
          {
            period: 'February 2026',
            revenue: 4200,
            expenses: 2400,
            profit: 1800,
            margin: 42.86,
          },
          {
            period: 'March 2026',
            revenue: 5000,
            expenses: 2800,
            profit: 2200,
            margin: 44,
          },
        ];

        return {
          farmId: input.farmId,
          groupBy: input.groupBy,
          data: profitabilityData,
          totalRevenue: profitabilityData.reduce((sum, item) => sum + item.revenue, 0),
          totalExpenses: profitabilityData.reduce((sum, item) => sum + item.expenses, 0),
          totalProfit: profitabilityData.reduce((sum, item) => sum + item.profit, 0),
          averageMargin: (profitabilityData.reduce((sum, item) => sum + item.margin, 0) / profitabilityData.length).toFixed(2),
          trend: 'improving',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve profitability analysis',
        });
      }
    }),

  /**
   * Get expense breakdown by category
   * Analyze expense distribution across categories
   */
  getExpenseBreakdown: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        dateRange: z.object({
          startDate: z.string(),
          endDate: z.string(),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock expense breakdown
        const breakdown = [
          { category: 'Feed & Supplies', amount: 8500, percentage: 28.3, trend: 'up' },
          { category: 'Labor', amount: 7200, percentage: 24.0, trend: 'stable' },
          { category: 'Equipment', amount: 5400, percentage: 18.0, trend: 'down' },
          { category: 'Utilities', amount: 4100, percentage: 13.7, trend: 'up' },
          { category: 'Maintenance', amount: 3200, percentage: 10.7, trend: 'stable' },
          { category: 'Other', amount: 1600, percentage: 5.3, trend: 'down' },
        ];

        return {
          farmId: input.farmId,
          dateRange: input.dateRange,
          breakdown,
          totalExpenses: breakdown.reduce((sum, item) => sum + item.amount, 0),
          largestCategory: breakdown.reduce((max, item) => (item.amount > max.amount ? item : max)),
          smallestCategory: breakdown.reduce((min, item) => (item.amount < min.amount ? item : min)),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve expense breakdown',
        });
      }
    }),

  /**
   * Get revenue trends
   * Analyze revenue patterns over time
   */
  getRevenueTrends: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        months: z.number().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock revenue trend data
        const trends = Array.from({ length: input.months }, (_, i) => ({
          month: new Date(Date.now() - (input.months - i - 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: Math.floor(Math.random() * 15000) + 5000,
          target: 12000,
          forecast: Math.floor(Math.random() * 15000) + 5000,
        }));

        return {
          farmId: input.farmId,
          period: `Last ${input.months} months`,
          trends,
          totalRevenue: trends.reduce((sum, t) => sum + t.revenue, 0),
          averageMonthly: (trends.reduce((sum, t) => sum + t.revenue, 0) / trends.length).toFixed(2),
          highestMonth: trends.reduce((max, t) => (t.revenue > max.revenue ? t : max)),
          lowestMonth: trends.reduce((min, t) => (t.revenue < min.revenue ? t : min)),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve revenue trends',
        });
      }
    }),
});
