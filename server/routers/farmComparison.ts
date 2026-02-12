/**
 * Farm Comparison Router
 * Handles side-by-side comparison of multiple farms
 * Compares financial, operational, and performance metrics
 */

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { farms, expenses, revenue, budgets, budgetLineItems } from "../../drizzle/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const farmComparisonRouter = router({
  /**
   * Compare financial metrics across selected farms
   * Returns revenue, expenses, profit for each farm
   */
  compareFinancials: protectedProcedure
    .input(z.object({ farmIds: z.array(z.number()).min(2).max(5) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const farmData = [];

        for (const farmId of input.farmIds) {
          // Get farm info
          const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);

          if (farm.length === 0) continue;

          // Get total revenue
          const revenueResult = await db
            .select({
              totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
            })
            .from(revenue)
            .where(eq(revenue.farmId, farmId));

          // Get total expenses
          const expenseResult = await db
            .select({
              totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            })
            .from(expenses)
            .where(eq(expenses.farmId, farmId));

          const totalRevenue = Number(revenueResult[0]?.totalRevenue || 0);
          const totalExpenses = Number(expenseResult[0]?.totalExpenses || 0);
          const profit = totalRevenue - totalExpenses;
          const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

          farmData.push({
            farmId,
            farmName: farm[0].farmName,
            farmType: farm[0].farmType,
            sizeHectares: Number(farm[0].sizeHectares || 0),
            totalRevenue,
            totalExpenses,
            profit,
            profitMargin: parseFloat(profitMargin.toFixed(1)),
            revenuePerHectare:
              Number(farm[0].sizeHectares || 0) > 0
                ? parseFloat((totalRevenue / Number(farm[0].sizeHectares)).toFixed(2))
                : 0,
            expensePerHectare:
              Number(farm[0].sizeHectares || 0) > 0
                ? parseFloat((totalExpenses / Number(farm[0].sizeHectares)).toFixed(2))
                : 0,
          });
        }

        // Calculate comparison metrics
        const avgRevenue = farmData.reduce((sum, f) => sum + f.totalRevenue, 0) / farmData.length;
        const avgExpenses = farmData.reduce((sum, f) => sum + f.totalExpenses, 0) / farmData.length;
        const avgProfit = farmData.reduce((sum, f) => sum + f.profit, 0) / farmData.length;
        const avgProfitMargin = farmData.reduce((sum, f) => sum + f.profitMargin, 0) / farmData.length;

        return {
          farms: farmData,
          comparison: {
            averageRevenue: parseFloat(avgRevenue.toFixed(2)),
            averageExpenses: parseFloat(avgExpenses.toFixed(2)),
            averageProfit: parseFloat(avgProfit.toFixed(2)),
            averageProfitMargin: parseFloat(avgProfitMargin.toFixed(1)),
            topFarmByRevenue: farmData.reduce((prev, current) =>
              prev.totalRevenue > current.totalRevenue ? prev : current
            ),
            topFarmByProfit: farmData.reduce((prev, current) =>
              prev.profit > current.profit ? prev : current
            ),
            topFarmByMargin: farmData.reduce((prev, current) =>
              prev.profitMargin > current.profitMargin ? prev : current
            ),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare farm financials",
        });
      }
    }),

  /**
   * Compare budget performance across farms
   * Shows budget vs actual spending
   */
  compareBudgetPerformance: protectedProcedure
    .input(z.object({ farmIds: z.array(z.number()).min(2).max(5) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const farmBudgetData = [];

        for (const farmId of input.farmIds) {
          const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
          if (farm.length === 0) continue;

          // Get all budget line items for this farm
          const lineItems = await db
            .select({
              categoryName: budgetLineItems.categoryName,
              budgetedAmount: budgetLineItems.budgetedAmount,
            })
            .from(budgetLineItems)
            .innerJoin(budgets, eq(budgetLineItems.budgetId, budgets.id))
            .where(eq(budgets.farmId, farmId));

          let totalBudgeted = 0;
          let totalSpent = 0;
          const categoryData = [];

          for (const item of lineItems) {
            const spendingResult = await db
              .select({
                totalSpent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
              })
              .from(expenses)
              .where(
                and(
                  eq(expenses.farmId, farmId),
                  eq(expenses.categoryName, item.categoryName)
                )
              );

            const spent = Number(spendingResult[0]?.totalSpent || 0);
            const budgeted = Number(item.budgetedAmount);
            const variance = spent - budgeted;
            const variancePercentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;

            totalBudgeted += budgeted;
            totalSpent += spent;

            categoryData.push({
              category: item.categoryName,
              budgeted,
              spent,
              variance,
              variancePercentage: parseFloat(variancePercentage.toFixed(1)),
            });
          }

          const overallVariancePercentage =
            totalBudgeted > 0 ? ((totalSpent - totalBudgeted) / totalBudgeted) * 100 : 0;

          farmBudgetData.push({
            farmId,
            farmName: farm[0].farmName,
            totalBudgeted,
            totalSpent,
            totalVariance: totalSpent - totalBudgeted,
            variancePercentage: parseFloat(overallVariancePercentage.toFixed(1)),
            budgetStatus:
              totalSpent > totalBudgeted
                ? "over_budget"
                : totalSpent > totalBudgeted * 0.8
                  ? "warning"
                  : "on_track",
            categories: categoryData,
          });
        }

        return {
          farms: farmBudgetData,
          comparison: {
            averageBudgeted: farmBudgetData.reduce((sum, f) => sum + f.totalBudgeted, 0) / farmBudgetData.length,
            averageSpent: farmBudgetData.reduce((sum, f) => sum + f.totalSpent, 0) / farmBudgetData.length,
            averageVariance: farmBudgetData.reduce((sum, f) => sum + f.totalVariance, 0) / farmBudgetData.length,
            bestBudgetPerformer: farmBudgetData.reduce((prev, current) =>
              Math.abs(prev.variancePercentage) < Math.abs(current.variancePercentage) ? prev : current
            ),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare farm budgets",
        });
      }
    }),

  /**
   * Get expense breakdown comparison across farms
   * Shows spending by category for each farm
   */
  compareExpenseBreakdown: protectedProcedure
    .input(z.object({ farmIds: z.array(z.number()).min(2).max(5) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const farmExpenseData = [];

        for (const farmId of input.farmIds) {
          const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
          if (farm.length === 0) continue;

          const expensesByCategory = await db
            .select({
              categoryName: expenses.categoryName,
              totalAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
              count: sql<number>`COUNT(*)`,
            })
            .from(expenses)
            .where(eq(expenses.farmId, farmId))
            .groupBy(expenses.categoryName);

          const totalExpenses = expensesByCategory.reduce((sum, e) => sum + Number(e.totalAmount), 0);

          const breakdown = expensesByCategory.map((e) => ({
            category: e.categoryName,
            amount: Number(e.totalAmount),
            percentage: totalExpenses > 0 ? parseFloat(((Number(e.totalAmount) / totalExpenses) * 100).toFixed(1)) : 0,
            count: Number(e.count),
          }));

          farmExpenseData.push({
            farmId,
            farmName: farm[0].farmName,
            totalExpenses,
            breakdown: breakdown.sort((a, b) => b.amount - a.amount),
          });
        }

        return {
          farms: farmExpenseData,
          comparison: {
            averageExpenses: farmExpenseData.reduce((sum, f) => sum + f.totalExpenses, 0) / farmExpenseData.length,
            highestSpender: farmExpenseData.reduce((prev, current) =>
              prev.totalExpenses > current.totalExpenses ? prev : current
            ),
            lowestSpender: farmExpenseData.reduce((prev, current) =>
              prev.totalExpenses < current.totalExpenses ? prev : current
            ),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare expense breakdowns",
        });
      }
    }),

  /**
   * Get revenue breakdown comparison across farms
   * Shows income by type for each farm
   */
  compareRevenueBreakdown: protectedProcedure
    .input(z.object({ farmIds: z.array(z.number()).min(2).max(5) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const farmRevenueData = [];

        for (const farmId of input.farmIds) {
          const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
          if (farm.length === 0) continue;

          const revenueByType = await db
            .select({
              revenueType: revenue.revenueType,
              totalAmount: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
              count: sql<number>`COUNT(*)`,
            })
            .from(revenue)
            .where(eq(revenue.farmId, farmId))
            .groupBy(revenue.revenueType);

          const totalRevenue = revenueByType.reduce((sum, r) => sum + Number(r.totalAmount), 0);

          const breakdown = revenueByType.map((r) => ({
            type: r.revenueType,
            amount: Number(r.totalAmount),
            percentage: totalRevenue > 0 ? parseFloat(((Number(r.totalAmount) / totalRevenue) * 100).toFixed(1)) : 0,
            count: Number(r.count),
          }));

          farmRevenueData.push({
            farmId,
            farmName: farm[0].farmName,
            totalRevenue,
            breakdown: breakdown.sort((a, b) => b.amount - a.amount),
          });
        }

        return {
          farms: farmRevenueData,
          comparison: {
            averageRevenue: farmRevenueData.reduce((sum, f) => sum + f.totalRevenue, 0) / farmRevenueData.length,
            highestEarner: farmRevenueData.reduce((prev, current) =>
              prev.totalRevenue > current.totalRevenue ? prev : current
            ),
            lowestEarner: farmRevenueData.reduce((prev, current) =>
              prev.totalRevenue < current.totalRevenue ? prev : current
            ),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare revenue breakdowns",
        });
      }
    }),

  /**
   * Get farm efficiency metrics comparison
   * Compares revenue/expense per hectare and other efficiency metrics
   */
  compareEfficiencyMetrics: protectedProcedure
    .input(z.object({ farmIds: z.array(z.number()).min(2).max(5) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const efficiencyData = [];

        for (const farmId of input.farmIds) {
          const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
          if (farm.length === 0) continue;

          const revenueResult = await db
            .select({
              totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
            })
            .from(revenue)
            .where(eq(revenue.farmId, farmId));

          const expenseResult = await db
            .select({
              totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            })
            .from(expenses)
            .where(eq(expenses.farmId, farmId));

          const totalRevenue = Number(revenueResult[0]?.totalRevenue || 0);
          const totalExpenses = Number(expenseResult[0]?.totalExpenses || 0);
          const sizeHectares = Number(farm[0].sizeHectares || 1);

          const revenuePerHectare = totalRevenue / sizeHectares;
          const expensePerHectare = totalExpenses / sizeHectares;
          const profitPerHectare = revenuePerHectare - expensePerHectare;
          const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

          efficiencyData.push({
            farmId,
            farmName: farm[0].farmName,
            sizeHectares,
            revenuePerHectare: parseFloat(revenuePerHectare.toFixed(2)),
            expensePerHectare: parseFloat(expensePerHectare.toFixed(2)),
            profitPerHectare: parseFloat(profitPerHectare.toFixed(2)),
            expenseRatio: parseFloat(expenseRatio.toFixed(1)),
            efficiency: profitPerHectare > 0 ? "high" : profitPerHectare === 0 ? "neutral" : "low",
          });
        }

        return {
          farms: efficiencyData,
          comparison: {
            bestRevenuePerHectare: efficiencyData.reduce((prev, current) =>
              prev.revenuePerHectare > current.revenuePerHectare ? prev : current
            ),
            bestProfitPerHectare: efficiencyData.reduce((prev, current) =>
              prev.profitPerHectare > current.profitPerHectare ? prev : current
            ),
            lowestExpenseRatio: efficiencyData.reduce((prev, current) =>
              prev.expenseRatio < current.expenseRatio ? prev : current
            ),
            averageRevenuePerHectare:
              efficiencyData.reduce((sum, f) => sum + f.revenuePerHectare, 0) / efficiencyData.length,
            averageProfitPerHectare:
              efficiencyData.reduce((sum, f) => sum + f.profitPerHectare, 0) / efficiencyData.length,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare efficiency metrics",
        });
      }
    }),
});
