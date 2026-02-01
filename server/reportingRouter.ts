import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  farmExpenses,
  farmRevenue,
  animals,
  animalHealthRecords,
  farmWorkers,
  fishPonds,
  fishPondActivities,
  farmAssets,
} from "../drizzle/schema";

export const reportingRouter = router({
  /**
   * Generate comprehensive farm report
   */
  generateFarmReport: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        includeFinancial: z.boolean().default(true),
        includeLivestock: z.boolean().default(true),
        includeWorkforce: z.boolean().default(true),
        includeFishFarming: z.boolean().default(true),
        includeAssets: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const report: any = {
        farmId: input.farmId,
        generatedAt: new Date(),
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
      };

      // Financial Report
      if (input.includeFinancial) {
        const expenses = await db
          .select()
          .from(farmExpenses)
          .where(
            and(
              eq(farmExpenses.farmId, input.farmId),
              gte(farmExpenses.expenseDate, input.startDate),
              lte(farmExpenses.expenseDate, input.endDate)
            )
          );

        const revenue = await db
          .select()
          .from(farmRevenue)
          .where(
            and(
              eq(farmRevenue.farmId, input.farmId),
              gte(farmRevenue.saleDate, input.startDate),
              lte(farmRevenue.saleDate, input.endDate)
            )
          );

        const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
        const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);

        report.financial = {
          totalExpenses,
          totalRevenue,
          netProfit: totalRevenue - totalExpenses,
          profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
          expensesByCategory: expenses.reduce(
            (acc, e) => {
              acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount || "0");
              return acc;
            },
            {} as Record<string, number>
          ),
          revenueBySource: revenue.reduce(
            (acc, r) => {
              acc[r.source] = (acc[r.source] || 0) + parseFloat(r.amount || "0");
              return acc;
            },
            {} as Record<string, number>
          ),
        };
      }

      // Livestock Report
      if (input.includeLivestock) {
        const allAnimals = await db
          .select()
          .from(animals)
          .where(eq(animals.farmId, input.farmId));

        const healthRecords = await db
          .select()
          .from(animalHealthRecords)
          .where(
            and(
              gte(animalHealthRecords.recordDate, input.startDate),
              lte(animalHealthRecords.recordDate, input.endDate)
            )
          );

        report.livestock = {
          totalAnimals: allAnimals.length,
          animalsByType: allAnimals.reduce(
            (acc, a) => {
              const type = a.typeId ? `Type ${a.typeId}` : "Unknown";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
          healthRecordsCount: healthRecords.length,
          healthIssues: healthRecords.filter((h) => h.eventType !== "checkup").length,
        };
      }

      // Workforce Report
      if (input.includeWorkforce) {
        const workers = await db
          .select()
          .from(farmWorkers)
          .where(eq(farmWorkers.farmId, input.farmId));

        report.workforce = {
          totalWorkers: workers.length,
          activeWorkers: workers.filter((w) => w.status === "active").length,
          workersByRole: workers.reduce(
            (acc, w) => {
              acc[w.role] = (acc[w.role] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
        };
      }

      // Fish Farming Report
      if (input.includeFishFarming) {
        const ponds = await db
          .select()
          .from(fishPonds)
          .where(eq(fishPonds.farmId, input.farmId));

        const activities = await db
          .select()
          .from(fishPondActivities)
          .where(
            and(
              gte(fishPondActivities.activityDate, input.startDate),
              lte(fishPondActivities.activityDate, input.endDate)
            )
          );

        report.fishFarming = {
          totalPonds: ponds.length,
          activePonds: ponds.filter((p) => p.status === "active").length,
          totalActivities: activities.length,
          activitiesByType: activities.reduce(
            (acc, a) => {
              acc[a.activityType] = (acc[a.activityType] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
        };
      }

      // Assets Report
      if (input.includeAssets) {
        const assets = await db
          .select()
          .from(farmAssets)
          .where(eq(farmAssets.farmId, input.farmId));

        const totalValue = assets.reduce((sum, a) => sum + parseFloat(a.purchaseValue || "0"), 0);
        const currentValue = assets.reduce((sum, a) => sum + parseFloat(a.currentValue || "0"), 0);

        report.assets = {
          totalAssets: assets.length,
          activeAssets: assets.filter((a) => a.status === "active").length,
          totalPurchaseValue: totalValue,
          totalCurrentValue: currentValue,
          depreciation: totalValue - currentValue,
          depreciationRate: totalValue > 0 ? ((totalValue - currentValue) / totalValue) * 100 : 0,
          assetsByType: assets.reduce(
            (acc, a) => {
              acc[a.assetType] = (acc[a.assetType] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
        };
      }

      return report;
    }),

  /**
   * Export report as CSV
   */
  exportAsCSV: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        reportType: z.enum(["financial", "livestock", "workforce", "comprehensive"]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let csvContent = "";
      const headers = ["Date", "Description", "Amount", "Category"];

      if (input.reportType === "financial" || input.reportType === "comprehensive") {
        const expenses = await db
          .select()
          .from(farmExpenses)
          .where(
            and(
              eq(farmExpenses.farmId, input.farmId),
              gte(farmExpenses.expenseDate, input.startDate),
              lte(farmExpenses.expenseDate, input.endDate)
            )
          );

        csvContent += "EXPENSES\n";
        csvContent += headers.join(",") + "\n";
        expenses.forEach((e) => {
          csvContent += `${e.expenseDate},${e.description || ""},${e.amount},${e.category}\n`;
        });

        const revenue = await db
          .select()
          .from(farmRevenue)
          .where(
            and(
              eq(farmRevenue.farmId, input.farmId),
              gte(farmRevenue.saleDate, input.startDate),
              lte(farmRevenue.saleDate, input.endDate)
            )
          );

        csvContent += "\nREVENUE\n";
        csvContent += headers.join(",") + "\n";
        revenue.forEach((r) => {
          csvContent += `${r.saleDate},${r.notes || ""},${r.amount},${r.source}\n`;
        });
      }

      if (input.reportType === "livestock" || input.reportType === "comprehensive") {
        const healthRecords = await db
          .select()
          .from(animalHealthRecords)
          .where(
            and(
              gte(animalHealthRecords.recordDate, input.startDate),
              lte(animalHealthRecords.recordDate, input.endDate)
            )
          );

        csvContent += "\nLIVESTOCK HEALTH RECORDS\n";
        csvContent += ["Date", "Animal ID", "Status", "Details"].join(",") + "\n";
        healthRecords.forEach((h) => {
          csvContent += `${h.recordDate},${h.animalId},${h.eventType},${h.details || ""}\n`;
        });
      }

      return {
        content: csvContent,
        filename: `farm-report-${input.reportType}-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

  /**
   * Get financial summary for dashboard
   */
  getFinancialSummary: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        months: z.number().default(12),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);

      const expenses = await db
        .select()
        .from(farmExpenses)
        .where(
          and(
            eq(farmExpenses.farmId, input.farmId),
            gte(farmExpenses.expenseDate, startDate),
            lte(farmExpenses.expenseDate, endDate)
          )
        );

      const revenue = await db
        .select()
        .from(farmRevenue)
        .where(
          and(
            eq(farmRevenue.farmId, input.farmId),
            gte(farmRevenue.saleDate, startDate),
            lte(farmRevenue.saleDate, endDate)
          )
        );

      const monthlyData: Record<string, { expenses: number; revenue: number }> = {};

      expenses.forEach((e) => {
        const month = e.expenseDate.toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { expenses: 0, revenue: 0 };
        monthlyData[month].expenses += parseFloat(e.amount || "0");
      });

      revenue.forEach((r) => {
        const month = r.saleDate.toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { expenses: 0, revenue: 0 };
        monthlyData[month].revenue += parseFloat(r.amount || "0");
      });

      return {
        monthlyData,
        totalExpenses: expenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0),
        totalRevenue: revenue.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0),
      };
    }),
});
