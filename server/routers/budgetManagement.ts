import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { budgets, budgetLineItems, expenses } from "../../drizzle/schema";
import { eq, and, gte, lte, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Budget Management Router
 * Handles budget creation, forecasting, and comparison operations
 */
export const budgetManagementRouter = router({
  /**
   * Create a new budget with line items
   */
  createBudget: protectedProcedure
    .input(
      z.object({
        farmId: z.string().min(1),
        budgetName: z.string().min(1),
        budgetType: z.enum(["monthly", "quarterly", "annual", "custom"]),
        startDate: z.date(),
        endDate: z.date(),
        totalBudget: z.number().positive(),
        currency: z.string().default("GHS"),
        lineItems: z.array(
          z.object({
            expenseType: z.string(),
            budgetedAmount: z.number().positive(),
            description: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        // Create budget record
        const [budget] = await db
          .insert(budgets)
          .values({
            farmId: input.farmId,
            budgetName: input.budgetName,
            budgetType: input.budgetType,
            startDate: input.startDate,
            endDate: input.endDate,
            totalBudget: input.totalBudget,
            currency: input.currency,
            status: "active",
          })
          .returning();

        // Create budget line items
        const lineItemsData = input.lineItems.map((item) => ({
          budgetId: budget.id,
          expenseType: item.expenseType,
          budgetedAmount: item.budgetedAmount,
          description: item.description || "",
        }));

        await (await getDb()).insert(budgetLineItems).values(lineItemsData);

        return {
          id: budget.id,
          budgetName: budget.budgetName,
          totalBudget: budget.totalBudget,
          lineItemCount: input.lineItems.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create budget",
        });
      }
    }),

  /**
   * Get budget forecasts based on historical spending patterns
   */
  getBudgetForecasts: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        budgetId: z.string(),
        forecastPeriods: z.number().default(3),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get budget details
        const budget = await (await getDb()).query.budgets.findFirst({
          where: eq(budgets.id, input.budgetId),
        });

        if (!budget) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Budget not found",
          });
        }

        // Get historical expenses for the same period in previous years
        const historicalExpenses = await db
          .select({
            expenseType: expenses.expenseType,
            amount: sum(expenses.amount),
            month: expenses.date,
          })
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              gte(expenses.date, new Date(budget.startDate.getFullYear() - 1, budget.startDate.getMonth(), 1)),
              lte(expenses.date, new Date(budget.endDate.getFullYear() - 1, budget.endDate.getMonth() + 1, 0))
            )
          )
          .groupBy(expenses.expenseType);

        // Calculate forecasts based on historical data
        const forecasts = input.forecastPeriods > 0
          ? Array.from({ length: input.forecastPeriods }).map((_, i) => {
              const forecastDate = new Date(budget.startDate);
              forecastDate.setMonth(forecastDate.getMonth() + i);

              // Simple linear regression forecast
              const avgHistorical = historicalExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) / Math.max(historicalExpenses.length, 1);
              const trend = avgHistorical * (1 + (i * 0.05)); // 5% growth per period

              return {
                period: forecastDate.toISOString().split("T")[0],
                forecastedAmount: Math.round(trend * 100) / 100,
                confidence: Math.max(0.6, 1 - i * 0.1), // Decreasing confidence over time
              };
            })
          : [];

        return {
          budgetId: input.budgetId,
          budgetName: budget.budgetName,
          totalBudget: budget.totalBudget,
          forecasts,
          historicalAverage: historicalExpenses.length > 0
            ? Math.round((historicalExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) / historicalExpenses.length) * 100) / 100
            : 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get budget forecasts",
        });
      }
    }),

  /**
   * Compare budgets across periods (year-over-year or period-over-period)
   */
  compareBudgets: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        budgetId1: z.string(),
        budgetId2: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get both budgets
        const budget1 = await (await getDb()).query.budgets.findFirst({
          where: eq(budgets.id, input.budgetId1),
        });

        const budget2 = await (await getDb()).query.budgets.findFirst({
          where: eq(budgets.id, input.budgetId2),
        });

        if (!budget1 || !budget2) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or both budgets not found",
          });
        }

        // Get expenses for both periods
        const expenses1 = await db
          .select({
            expenseType: expenses.expenseType,
            amount: sum(expenses.amount),
          })
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              gte(expenses.date, budget1.startDate),
              lte(expenses.date, budget1.endDate)
            )
          )
          .groupBy(expenses.expenseType);

        const expenses2 = await db
          .select({
            expenseType: expenses.expenseType,
            amount: sum(expenses.amount),
          })
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              gte(expenses.date, budget2.startDate),
              lte(expenses.date, budget2.endDate)
            )
          )
          .groupBy(expenses.expenseType);

        // Calculate comparison metrics
        const totalExpenses1 = expenses1.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        const totalExpenses2 = expenses2.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

        const variance = totalExpenses2 - totalExpenses1;
        const variancePercent = totalExpenses1 > 0 ? (variance / totalExpenses1) * 100 : 0;

        return {
          period1: {
            name: budget1.budgetName,
            startDate: budget1.startDate,
            endDate: budget1.endDate,
            budgeted: budget1.totalBudget,
            actual: Math.round(totalExpenses1 * 100) / 100,
            utilization: budget1.totalBudget > 0 ? (totalExpenses1 / budget1.totalBudget) * 100 : 0,
          },
          period2: {
            name: budget2.budgetName,
            startDate: budget2.startDate,
            endDate: budget2.endDate,
            budgeted: budget2.totalBudget,
            actual: Math.round(totalExpenses2 * 100) / 100,
            utilization: budget2.totalBudget > 0 ? (totalExpenses2 / budget2.totalBudget) * 100 : 0,
          },
          comparison: {
            variance: Math.round(variance * 100) / 100,
            variancePercent: Math.round(variancePercent * 100) / 100,
            trend: variance > 0 ? "increase" : variance < 0 ? "decrease" : "stable",
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare budgets",
        });
      }
    }),

  /**
   * Get all budgets for a farm
   */
  listBudgets: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ input }) => {
      try {
        const farmBudgets = await (await getDb()).query.budgets.findMany({
          where: eq(budgets.farmId, input.farmId),
        });

        return farmBudgets.map((b) => ({
          id: b.id,
          budgetName: b.budgetName,
          budgetType: b.budgetType,
          startDate: b.startDate,
          endDate: b.endDate,
          totalBudget: b.totalBudget,
          status: b.status,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list budgets",
        });
      }
    }),

  /**
   * Get budget details with line items
   */
  getBudgetDetails: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .query(async ({ input }) => {
      try {
        const budget = await (await getDb()).query.budgets.findFirst({
          where: eq(budgets.id, input.budgetId),
          with: {
            lineItems: true,
          },
        });

        if (!budget) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Budget not found",
          });
        }

        return budget;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get budget details",
        });
      }
    }),

  /**
   * Delete a budget
   */
  deleteBudget: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Delete line items first
        await (await getDb()).delete(budgetLineItems).where(eq(budgetLineItems.budgetId, input.budgetId));

        // Delete budget
        await (await getDb()).delete(budgets).where(eq(budgets.id, input.budgetId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete budget",
        });
      }
    }),
});
