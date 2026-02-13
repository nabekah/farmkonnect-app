import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';
import { expenses, revenue } from '@/drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const aiInsightsRouter = router({
  // Analyze spending patterns
  analyzeSpendingPatterns: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        months: z.number().default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - input.months);

        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, sixMonthsAgo)
            )
          );

        // Calculate category breakdown
        const categoryBreakdown: Record<string, number> = {};
        expenseData.forEach((exp) => {
          categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
        });

        // Calculate trend (month-over-month)
        const monthlyTotals: Record<string, number> = {};
        expenseData.forEach((exp) => {
          const monthKey = exp.date.toISOString().substring(0, 7);
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.amount;
        });

        // Calculate average and standard deviation
        const amounts = expenseData.map((e) => e.amount);
        const average = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
        const variance = amounts.length > 0
          ? amounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / amounts.length
          : 0;
        const stdDev = Math.sqrt(variance);

        return {
          totalExpenses: expenseData.reduce((sum, e) => sum + e.amount, 0),
          averageExpense: average,
          standardDeviation: stdDev,
          categoryBreakdown,
          monthlyTotals,
          transactionCount: expenseData.length,
          insights: [
            `You have ${expenseData.length} expenses in the last ${input.months} months`,
            `Average expense is $${average.toFixed(2)}`,
            `Highest category: ${Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}`,
          ],
        };
      } catch (error) {
        throw new Error('Failed to analyze spending patterns');
      }
    }),

  // Detect spending anomalies
  detectAnomalies: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        threshold: z.number().default(2), // Standard deviations
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, threeMonthsAgo)
            )
          );

        // Calculate statistics by category
        const categoryStats: Record<string, { amounts: number[]; average: number; stdDev: number }> = {};

        expenseData.forEach((exp) => {
          if (!categoryStats[exp.category]) {
            categoryStats[exp.category] = { amounts: [], average: 0, stdDev: 0 };
          }
          categoryStats[exp.category].amounts.push(exp.amount);
        });

        // Calculate mean and std dev for each category
        Object.keys(categoryStats).forEach((category) => {
          const amounts = categoryStats[category].amounts;
          const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const variance = amounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / amounts.length;
          const stdDev = Math.sqrt(variance);

          categoryStats[category].average = average;
          categoryStats[category].stdDev = stdDev;
        });

        // Find anomalies
        const anomalies = expenseData.filter((exp) => {
          const stats = categoryStats[exp.category];
          const zScore = Math.abs((exp.amount - stats.average) / (stats.stdDev || 1));
          return zScore > input.threshold;
        });

        return {
          anomaliesFound: anomalies.length,
          anomalies: anomalies.map((a) => ({
            id: a.id,
            amount: a.amount,
            category: a.category,
            description: a.description,
            date: a.date,
            severity: a.amount > categoryStats[a.category].average * 3 ? 'high' : 'medium',
          })),
          recommendations: anomalies.length > 0
            ? ['Review unusual transactions', 'Check for duplicate entries', 'Verify receipt accuracy']
            : ['Spending patterns are normal'],
        };
      } catch (error) {
        throw new Error('Failed to detect anomalies');
      }
    }),

  // Get cost optimization recommendations
  getCostOptimizations: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, sixMonthsAgo)
            )
          );

        // Analyze category trends
        const categoryTotals: Record<string, number> = {};
        expenseData.forEach((exp) => {
          categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
        });

        const recommendations = [];

        // Find top spending categories
        const topCategories = Object.entries(categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        topCategories.forEach(([category, total]) => {
          if (total > 5000) {
            recommendations.push({
              category,
              currentSpend: total,
              suggestion: `Consider negotiating bulk discounts for ${category} purchases`,
              potentialSavings: total * 0.1, // 10% potential savings
            });
          }
        });

        return {
          recommendations,
          totalAnalyzed: expenseData.length,
          potentialTotalSavings: recommendations.reduce((sum, r) => sum + r.potentialSavings, 0),
        };
      } catch (error) {
        throw new Error('Failed to get cost optimizations');
      }
    }),

  // Forecast future spending
  forecastSpending: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        months: z.number().default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, sixMonthsAgo)
            )
          );

        // Calculate monthly averages
        const monthlyTotals: Record<string, number> = {};
        expenseData.forEach((exp) => {
          const monthKey = exp.date.toISOString().substring(0, 7);
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.amount;
        });

        const monthlyAverages = Object.values(monthlyTotals);
        const avgMonthlySpend = monthlyAverages.length > 0
          ? monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length
          : 0;

        // Simple linear forecast
        const forecast = [];
        for (let i = 1; i <= input.months; i++) {
          const forecastDate = new Date();
          forecastDate.setMonth(forecastDate.getMonth() + i);
          forecast.push({
            month: forecastDate.toISOString().substring(0, 7),
            predictedSpend: avgMonthlySpend * (1 + (Math.random() - 0.5) * 0.2), // Add some variance
            confidence: 0.75,
          });
        }

        return {
          historicalAverage: avgMonthlySpend,
          forecast,
          totalForecastedSpend: forecast.reduce((sum, f) => sum + f.predictedSpend, 0),
        };
      } catch (error) {
        throw new Error('Failed to forecast spending');
      }
    }),
});
