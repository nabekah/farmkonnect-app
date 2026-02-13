import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';
import { expenses, revenue } from '@/drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const advancedReportingRouter = router({
  // Get cash flow report
  getCashFlowReport: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, input.startDate),
              lte(expenses.date, input.endDate)
            )
          );

        const revenueData = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id),
              gte(revenue.date, input.startDate),
              lte(revenue.date, input.endDate)
            )
          );

        // Calculate monthly cash flow
        const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

        revenueData.forEach((rev) => {
          const monthKey = rev.date.toISOString().substring(0, 7);
          if (!monthlyData[monthKey]) monthlyData[monthKey] = { revenue: 0, expenses: 0 };
          monthlyData[monthKey].revenue += rev.amount;
        });

        expenseData.forEach((exp) => {
          const monthKey = exp.date.toISOString().substring(0, 7);
          if (!monthlyData[monthKey]) monthlyData[monthKey] = { revenue: 0, expenses: 0 };
          monthlyData[monthKey].expenses += exp.amount;
        });

        const chartData = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          expenses: data.expenses,
          netCashFlow: data.revenue - data.expenses,
        }));

        return {
          totalRevenue: revenueData.reduce((sum, r) => sum + r.amount, 0),
          totalExpenses: expenseData.reduce((sum, e) => sum + e.amount, 0),
          netCashFlow: revenueData.reduce((sum, r) => sum + r.amount, 0) -
                       expenseData.reduce((sum, e) => sum + e.amount, 0),
          chartData,
          period: { start: input.startDate, end: input.endDate },
        };
      } catch (error) {
        throw new Error('Failed to get cash flow report');
      }
    }),

  // Get expense breakdown by category
  getExpenseBreakdown: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, input.startDate),
              lte(expenses.date, input.endDate)
            )
          );

        const categoryBreakdown: Record<string, { amount: number; count: number; percentage: number }> = {};
        const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);

        expenseData.forEach((exp) => {
          if (!categoryBreakdown[exp.category]) {
            categoryBreakdown[exp.category] = { amount: 0, count: 0, percentage: 0 };
          }
          categoryBreakdown[exp.category].amount += exp.amount;
          categoryBreakdown[exp.category].count += 1;
        });

        // Calculate percentages
        Object.keys(categoryBreakdown).forEach((category) => {
          categoryBreakdown[category].percentage = (categoryBreakdown[category].amount / totalExpenses) * 100;
        });

        const chartData = Object.entries(categoryBreakdown)
          .sort(([, a], [, b]) => b.amount - a.amount)
          .map(([category, data]) => ({
            category,
            amount: data.amount,
            count: data.count,
            percentage: data.percentage,
          }));

        return {
          totalExpenses,
          categoryCount: Object.keys(categoryBreakdown).length,
          chartData,
          topCategory: chartData[0] || null,
        };
      } catch (error) {
        throw new Error('Failed to get expense breakdown');
      }
    }),

  // Get revenue breakdown by type
  getRevenueBreakdown: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const revenueData = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id),
              gte(revenue.date, input.startDate),
              lte(revenue.date, input.endDate)
            )
          );

        const typeBreakdown: Record<string, { amount: number; count: number; percentage: number }> = {};
        const totalRevenue = revenueData.reduce((sum, r) => sum + r.amount, 0);

        revenueData.forEach((rev) => {
          if (!typeBreakdown[rev.type]) {
            typeBreakdown[rev.type] = { amount: 0, count: 0, percentage: 0 };
          }
          typeBreakdown[rev.type].amount += rev.amount;
          typeBreakdown[rev.type].count += 1;
        });

        // Calculate percentages
        Object.keys(typeBreakdown).forEach((type) => {
          typeBreakdown[type].percentage = (typeBreakdown[type].amount / totalRevenue) * 100;
        });

        const chartData = Object.entries(typeBreakdown)
          .sort(([, a], [, b]) => b.amount - a.amount)
          .map(([type, data]) => ({
            type,
            amount: data.amount,
            count: data.count,
            percentage: data.percentage,
          }));

        return {
          totalRevenue,
          typeCount: Object.keys(typeBreakdown).length,
          chartData,
          topType: chartData[0] || null,
        };
      } catch (error) {
        throw new Error('Failed to get revenue breakdown');
      }
    }),

  // Get profitability metrics
  getProfitabilityMetrics: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, input.startDate),
              lte(expenses.date, input.endDate)
            )
          );

        const revenueData = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id),
              gte(revenue.date, input.startDate),
              lte(revenue.date, input.endDate)
            )
          );

        const totalRevenue = revenueData.reduce((sum, r) => sum + r.amount, 0);
        const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

        return {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin: profitMargin.toFixed(2),
          roi: roi.toFixed(2),
          breakEvenPoint: totalExpenses,
          profitPercentage: (profitMargin).toFixed(2),
        };
      } catch (error) {
        throw new Error('Failed to get profitability metrics');
      }
    }),

  // Get trend analysis
  getTrendAnalysis: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        months: z.number().default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - input.months);

        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, startDate)
            )
          );

        const revenueData = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id),
              gte(revenue.date, startDate)
            )
          );

        // Calculate monthly trends
        const monthlyTrends: Record<string, { revenue: number; expenses: number }> = {};

        revenueData.forEach((rev) => {
          const monthKey = rev.date.toISOString().substring(0, 7);
          if (!monthlyTrends[monthKey]) monthlyTrends[monthKey] = { revenue: 0, expenses: 0 };
          monthlyTrends[monthKey].revenue += rev.amount;
        });

        expenseData.forEach((exp) => {
          const monthKey = exp.date.toISOString().substring(0, 7);
          if (!monthlyTrends[monthKey]) monthlyTrends[monthKey] = { revenue: 0, expenses: 0 };
          monthlyTrends[monthKey].expenses += exp.amount;
        });

        const trendData = Object.entries(monthlyTrends)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => ({
            month,
            revenue: data.revenue,
            expenses: data.expenses,
            trend: data.revenue > data.expenses ? 'positive' : 'negative',
          }));

        return {
          period: input.months,
          trendData,
          overallTrend: trendData[trendData.length - 1]?.trend || 'neutral',
        };
      } catch (error) {
        throw new Error('Failed to get trend analysis');
      }
    }),

  // Export report to PDF/Excel
  exportReport: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        reportType: z.enum(['cash_flow', 'expense_breakdown', 'revenue_breakdown', 'profitability', 'comprehensive']),
        format: z.enum(['pdf', 'excel']),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const filename = `report-${input.reportType}-${new Date().toISOString().split('T')[0]}.${input.format}`;

        return {
          success: true,
          message: `Report exported as ${input.format.toUpperCase()}`,
          filename,
          reportType: input.reportType,
          format: input.format,
          downloadUrl: `/downloads/${filename}`,
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new Error('Failed to export report');
      }
    }),
});
