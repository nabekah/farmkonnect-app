/**
 * Farm Consolidation Router
 * Handles aggregation and consolidation of all user farms
 * Provides portfolio-level analytics and metrics
 */

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users, farms, expenses, revenue, budgets, budgetLineItems } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const farmConsolidationRouter = router({
  /**
   * Get consolidated financial summary across all user farms
   * Returns total revenue, expenses, profit for entire portfolio
   */
  getConsolidatedFinancials: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get all farms for this user
      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));

      if (userFarms.length === 0) {
        return {
          farmCount: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          profitMargin: 0,
          averageRevenuePerFarm: 0,
          averageExpensesPerFarm: 0,
          totalSizeHectares: 0,
          revenuePerHectare: 0,
          expensePerHectare: 0,
        };
      }

      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalSizeHectares = 0;

      for (const farm of userFarms) {
        const revenueResult = await db
          .select({
            totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          })
          .from(revenue)
          .where(eq(revenue.farmId, farm.id));

        const expenseResult = await db
          .select({
            totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          })
          .from(expenses)
          .where(eq(expenses.farmId, farm.id));

        totalRevenue += Number(revenueResult[0]?.totalRevenue || 0);
        totalExpenses += Number(expenseResult[0]?.totalExpenses || 0);
        totalSizeHectares += Number(farm.sizeHectares || 0);
      }

      const totalProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const revenuePerHectare = totalSizeHectares > 0 ? totalRevenue / totalSizeHectares : 0;
      const expensePerHectare = totalSizeHectares > 0 ? totalExpenses / totalSizeHectares : 0;

      return {
        farmCount: userFarms.length,
        totalRevenue,
        totalExpenses,
        totalProfit,
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        averageRevenuePerFarm: parseFloat((totalRevenue / userFarms.length).toFixed(2)),
        averageExpensesPerFarm: parseFloat((totalExpenses / userFarms.length).toFixed(2)),
        totalSizeHectares: parseFloat(totalSizeHectares.toFixed(2)),
        revenuePerHectare: parseFloat(revenuePerHectare.toFixed(2)),
        expensePerHectare: parseFloat(expensePerHectare.toFixed(2)),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get consolidated financials",
      });
    }
  }),

  /**
   * Get consolidated budget status across all user farms
   * Returns overall budget health and spending status
   */
  getConsolidatedBudgetStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));

      if (userFarms.length === 0) {
        return {
          farmCount: 0,
          totalBudgeted: 0,
          totalSpent: 0,
          totalVariance: 0,
          variancePercentage: 0,
          budgetStatus: "no_data",
          categoryBreakdown: [],
        };
      }

      let totalBudgeted = 0;
      let totalSpent = 0;
      const categoryMap = new Map();

      for (const farm of userFarms) {
        const lineItems = await db
          .select({
            categoryName: budgetLineItems.categoryName,
            budgetedAmount: budgetLineItems.budgetedAmount,
          })
          .from(budgetLineItems)
          .innerJoin(budgets, eq(budgetLineItems.budgetId, budgets.id))
          .where(eq(budgets.farmId, farm.id));

        for (const item of lineItems) {
          const spendingResult = await db
            .select({
              totalSpent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            })
            .from(expenses)
            .where(
              and(
                eq(expenses.farmId, farm.id),
                eq(expenses.categoryName, item.categoryName)
              )
            );

          const budgeted = Number(item.budgetedAmount);
          const spent = Number(spendingResult[0]?.totalSpent || 0);

          totalBudgeted += budgeted;
          totalSpent += spent;

          if (categoryMap.has(item.categoryName)) {
            const existing = categoryMap.get(item.categoryName);
            existing.budgeted += budgeted;
            existing.spent += spent;
          } else {
            categoryMap.set(item.categoryName, {
              category: item.categoryName,
              budgeted,
              spent,
            });
          }
        }
      }

      const totalVariance = totalSpent - totalBudgeted;
      const variancePercentage = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

      const categoryBreakdown = Array.from(categoryMap.values()).map((cat) => ({
        ...cat,
        variance: cat.spent - cat.budgeted,
        variancePercentage: cat.budgeted > 0 ? parseFloat(((cat.spent - cat.budgeted) / cat.budgeted * 100).toFixed(1)) : 0,
      }));

      let budgetStatus = "on_track";
      if (totalSpent > totalBudgeted) {
        budgetStatus = "over_budget";
      } else if (totalSpent > totalBudgeted * 0.8) {
        budgetStatus = "warning";
      }

      return {
        farmCount: userFarms.length,
        totalBudgeted,
        totalSpent,
        totalVariance,
        variancePercentage: parseFloat(variancePercentage.toFixed(1)),
        budgetStatus,
        categoryBreakdown: categoryBreakdown.sort((a, b) => b.spent - a.spent),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get consolidated budget status",
      });
    }
  }),

  /**
   * Get farm ranking by performance metrics
   * Ranks farms by revenue, profit, efficiency, etc.
   */
  getFarmRanking: protectedProcedure
    .input(
      z.object({
        sortBy: z.enum(["revenue", "profit", "profitMargin", "efficiency"]).default("revenue"),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));

        if (userFarms.length === 0) {
          return { ranking: [], totalFarms: 0 };
        }

        const farmMetrics = [];

        for (const farm of userFarms) {
          const revenueResult = await db
            .select({
              totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
            })
            .from(revenue)
            .where(eq(revenue.farmId, farm.id));

          const expenseResult = await db
            .select({
              totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            })
            .from(expenses)
            .where(eq(expenses.farmId, farm.id));

          const totalRevenue = Number(revenueResult[0]?.totalRevenue || 0);
          const totalExpenses = Number(expenseResult[0]?.totalExpenses || 0);
          const profit = totalRevenue - totalExpenses;
          const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
          const sizeHectares = Number(farm.sizeHectares || 1);
          const efficiency = profit / sizeHectares;

          farmMetrics.push({
            rank: 0,
            farmId: farm.id,
            farmName: farm.farmName,
            farmType: farm.farmType,
            sizeHectares,
            totalRevenue,
            totalExpenses,
            profit,
            profitMargin: parseFloat(profitMargin.toFixed(1)),
            efficiency: parseFloat(efficiency.toFixed(2)),
            revenuePerHectare: parseFloat((totalRevenue / sizeHectares).toFixed(2)),
          });
        }

        // Sort based on sortBy parameter
        let sorted = farmMetrics;
        switch (input.sortBy) {
          case "revenue":
            sorted = farmMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
            break;
          case "profit":
            sorted = farmMetrics.sort((a, b) => b.profit - a.profit);
            break;
          case "profitMargin":
            sorted = farmMetrics.sort((a, b) => b.profitMargin - a.profitMargin);
            break;
          case "efficiency":
            sorted = farmMetrics.sort((a, b) => b.efficiency - a.efficiency);
            break;
        }

        // Add ranks
        sorted = sorted.map((farm, index) => ({
          ...farm,
          rank: index + 1,
        }));

        return {
          ranking: sorted,
          totalFarms: userFarms.length,
          topFarm: sorted[0],
          sortBy: input.sortBy,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get farm ranking",
        });
      }
    }),

  /**
   * Get portfolio overview with key metrics
   * Returns summary metrics for entire farm portfolio
   */
  getPortfolioOverview: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));

      if (userFarms.length === 0) {
        return {
          totalFarms: 0,
          farmTypes: {},
          totalArea: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          profitMargin: 0,
          averageFarmSize: 0,
          farmList: [],
        };
      }

      const farmTypes: Record<string, number> = {};
      let totalArea = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;
      const farmList = [];

      for (const farm of userFarms) {
        // Count farm types
        farmTypes[farm.farmType] = (farmTypes[farm.farmType] || 0) + 1;

        // Sum area
        totalArea += Number(farm.sizeHectares || 0);

        // Get financials
        const revenueResult = await db
          .select({
            totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          })
          .from(revenue)
          .where(eq(revenue.farmId, farm.id));

        const expenseResult = await db
          .select({
            totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          })
          .from(expenses)
          .where(eq(expenses.farmId, farm.id));

        const farmRevenue = Number(revenueResult[0]?.totalRevenue || 0);
        const farmExpenses = Number(expenseResult[0]?.totalExpenses || 0);

        totalRevenue += farmRevenue;
        totalExpenses += farmExpenses;

        farmList.push({
          farmId: farm.id,
          farmName: farm.farmName,
          farmType: farm.farmType,
          sizeHectares: Number(farm.sizeHectares || 0),
          revenue: farmRevenue,
          expenses: farmExpenses,
          profit: farmRevenue - farmExpenses,
        });
      }

      const totalProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return {
        totalFarms: userFarms.length,
        farmTypes,
        totalArea: parseFloat(totalArea.toFixed(2)),
        totalRevenue,
        totalExpenses,
        totalProfit,
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        averageFarmSize: parseFloat((totalArea / userFarms.length).toFixed(2)),
        farmList: farmList.sort((a, b) => b.revenue - a.revenue),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get portfolio overview",
      });
    }
  }),

  /**
   * Get expense breakdown across all farms
   * Shows consolidated spending by category
   */
  getConsolidatedExpenseBreakdown: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));

      if (userFarms.length === 0) {
        return { breakdown: [], totalExpenses: 0 };
      }

      const categoryMap = new Map();
      let totalExpenses = 0;

      for (const farm of userFarms) {
        const expensesByCategory = await db
          .select({
            categoryName: expenses.categoryName,
            totalAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            count: sql<number>`COUNT(*)`,
          })
          .from(expenses)
          .where(eq(expenses.farmId, farm.id))
          .groupBy(expenses.categoryName);

        for (const exp of expensesByCategory) {
          const amount = Number(exp.totalAmount);
          totalExpenses += amount;

          if (categoryMap.has(exp.categoryName)) {
            const existing = categoryMap.get(exp.categoryName);
            existing.amount += amount;
            existing.count += Number(exp.count);
          } else {
            categoryMap.set(exp.categoryName, {
              category: exp.categoryName,
              amount,
              count: Number(exp.count),
            });
          }
        }
      }

      const breakdown = Array.from(categoryMap.values())
        .map((cat) => ({
          ...cat,
          percentage: totalExpenses > 0 ? parseFloat((cat.amount / totalExpenses * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return { breakdown, totalExpenses };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get consolidated expense breakdown",
      });
    }
  }),

  /**
   * Get revenue breakdown across all farms
   * Shows consolidated income by type
   */
  getConsolidatedRevenueBreakdown: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userFarms = await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));

      if (userFarms.length === 0) {
        return { breakdown: [], totalRevenue: 0 };
      }

      const typeMap = new Map();
      let totalRevenue = 0;

      for (const farm of userFarms) {
        const revenueByType = await db
          .select({
            revenueType: revenue.revenueType,
            totalAmount: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
            count: sql<number>`COUNT(*)`,
          })
          .from(revenue)
          .where(eq(revenue.farmId, farm.id))
          .groupBy(revenue.revenueType);

        for (const rev of revenueByType) {
          const amount = Number(rev.totalAmount);
          totalRevenue += amount;

          if (typeMap.has(rev.revenueType)) {
            const existing = typeMap.get(rev.revenueType);
            existing.amount += amount;
            existing.count += Number(rev.count);
          } else {
            typeMap.set(rev.revenueType, {
              type: rev.revenueType,
              amount,
              count: Number(rev.count),
            });
          }
        }
      }

      const breakdown = Array.from(typeMap.values())
        .map((rev) => ({
          ...rev,
          percentage: totalRevenue > 0 ? parseFloat((rev.amount / totalRevenue * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return { breakdown, totalRevenue };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get consolidated revenue breakdown",
      });
    }
  }),
});
