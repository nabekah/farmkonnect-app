import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  calculateMonthlySettlement,
  getCurrentMonthSettlementSummary,
  processMonthlySettlement,
  getSettlementHistory,
  generateSettlementReport,
} from '../services/monthlySettlementService';
import {
  calculateTaxEstimate,
  calculateQuarterlyTaxEstimates,
  generateAnnualTaxReport,
  exportTaxReportToCSV,
  getTaxCategories,
} from '../services/taxCalculationService';
import {
  calculateAvailableBalance,
  requestPayout,
  getPayoutHistory,
  getPayoutSummary,
  requestEarlyPayout,
  getEarlyPayoutRequests,
  processPayout,
  cancelPayout,
} from '../services/sellerPayoutService';

export const settlementTaxPayoutRouter = router({
  // Settlement procedures
  getSettlementSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const summary = await getCurrentMonthSettlementSummary(ctx.user.id);
      return summary;
    } catch (error) {
      console.error('Error getting settlement summary:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get settlement summary',
      });
    }
  }),

  getSettlementHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(12),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const history = await getSettlementHistory(ctx.user.id, input.limit, input.offset);
        return history;
      } catch (error) {
        console.error('Error getting settlement history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get settlement history',
        });
      }
    }),

  downloadSettlementReport: protectedProcedure
    .input(
      z.object({
        startMonth: z.number().min(1).max(12),
        startYear: z.number(),
        endMonth: z.number().min(1).max(12),
        endYear: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const csv = await generateSettlementReport(ctx.user.id, input.startMonth, input.startYear, input.endMonth, input.endYear);
        return {
          filename: `settlement-report-${input.startYear}-${input.endYear}.csv`,
          content: csv,
        };
      } catch (error) {
        console.error('Error downloading settlement report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to download settlement report',
        });
      }
    }),

  // Tax procedures
  getTaxEstimate: protectedProcedure.query(async ({ ctx }) => {
    try {
      const estimate = await calculateTaxEstimate(ctx.user.id);
      return estimate;
    } catch (error) {
      console.error('Error getting tax estimate:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get tax estimate',
      });
    }
  }),

  getQuarterlyTaxEstimates: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const estimates = await calculateQuarterlyTaxEstimates(ctx.user.id, input.year);
        return estimates;
      } catch (error) {
        console.error('Error getting quarterly tax estimates:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get quarterly tax estimates',
        });
      }
    }),

  getAnnualTaxReport: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const report = await generateAnnualTaxReport(ctx.user.id, input.year);
        return report;
      } catch (error) {
        console.error('Error getting annual tax report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get annual tax report',
        });
      }
    }),

  downloadTaxReport: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const csv = await exportTaxReportToCSV(ctx.user.id, input.year);
        return {
          filename: `tax-report-${input.year}.csv`,
          content: csv,
        };
      } catch (error) {
        console.error('Error downloading tax report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to download tax report',
        });
      }
    }),

  getTaxCategories: protectedProcedure.query(() => {
    try {
      return getTaxCategories();
    } catch (error) {
      console.error('Error getting tax categories:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get tax categories',
      });
    }
  }),

  // Payout procedures
  getPayoutSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const summary = await getPayoutSummary(ctx.user.id);
      return summary;
    } catch (error) {
      console.error('Error getting payout summary:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get payout summary',
      });
    }
  }),

  getPayoutHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const history = await getPayoutHistory(ctx.user.id, input.limit, input.offset);
        return history;
      } catch (error) {
        console.error('Error getting payout history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get payout history',
        });
      }
    }),

  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        payoutMethod: z.enum(['bank_transfer', 'mobile_money', 'check']),
        bankAccount: z.string().optional(),
        mobileNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const payout = await requestPayout(
          ctx.user.id,
          input.amount,
          input.payoutMethod,
          input.bankAccount,
          input.mobileNumber
        );
        return payout;
      } catch (error) {
        console.error('Error requesting payout:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to request payout',
        });
      }
    }),

  requestEarlyPayout: protectedProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const request = await requestEarlyPayout(ctx.user.id, input.amount);
        return request;
      } catch (error) {
        console.error('Error requesting early payout:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to request early payout',
        });
      }
    }),

  getEarlyPayoutRequests: protectedProcedure.query(async ({ ctx }) => {
    try {
      const requests = await getEarlyPayoutRequests(ctx.user.id);
      return requests;
    } catch (error) {
      console.error('Error getting early payout requests:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get early payout requests',
      });
    }
  }),

  getAvailableBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const balance = await calculateAvailableBalance(ctx.user.id);
      return { balance };
    } catch (error) {
      console.error('Error getting available balance:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get available balance',
      });
    }
  }),
});
