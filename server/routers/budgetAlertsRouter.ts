import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

export const budgetAlertsRouter = router({
  /**
   * Get budget alerts for a farm
   */
  getBudgetAlerts: protectedProcedure
    .input(z.object({ farmId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      // Mock budget alerts
      const alerts = [
        {
          id: 1,
          type: 'budget_exceeded',
          category: 'Seeds & Fertilizer',
          severity: 'warning',
          message: 'Budget exceeded by 15%',
          budgeted: 100000,
          spent: 115000,
          percentage: 115,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isResolved: false,
        },
        {
          id: 2,
          type: 'budget_threshold',
          category: 'Labor',
          severity: 'info',
          message: 'Approaching 80% of budget',
          budgeted: 80000,
          spent: 64000,
          percentage: 80,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isResolved: false,
        },
        {
          id: 3,
          type: 'loan_payment_due',
          severity: 'critical',
          message: 'Loan payment due in 3 days',
          lender: 'Agricultural Bank',
          amount: 22500,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isResolved: false,
        },
        {
          id: 4,
          type: 'expense_spike',
          severity: 'warning',
          message: 'Unusual expense spike detected',
          category: 'Equipment',
          normalAverage: 8000,
          currentExpense: 25000,
          increase: 212,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          isResolved: false,
        },
      ];

      return {
        alerts,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        warnings: alerts.filter((a) => a.severity === 'warning').length,
        info: alerts.filter((a) => a.severity === 'info').length,
      };
    }),

  /**
   * Resolve a budget alert
   */
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number(), farmId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      return {
        id: input.alertId,
        isResolved: true,
        resolvedAt: new Date(),
      };
    }),

  /**
   * Create a budget alert rule
   */
  createAlertRule: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        thresholdPercentage: z.number().min(0).max(100),
        alertType: z.enum(['threshold', 'exceeded', 'spike']),
        notificationChannels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])),
        farmId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      return {
        id: Math.random(),
        ...input,
        isActive: true,
        createdAt: new Date(),
      };
    }),

  /**
   * Get alert rules for a farm
   */
  getAlertRules: protectedProcedure
    .input(z.object({ farmId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      const rules = [
        {
          id: 1,
          category: 'Seeds & Fertilizer',
          thresholdPercentage: 90,
          alertType: 'threshold',
          notificationChannels: ['email', 'push'],
          isActive: true,
          createdAt: new Date('2026-01-15'),
        },
        {
          id: 2,
          category: 'Labor',
          thresholdPercentage: 100,
          alertType: 'exceeded',
          notificationChannels: ['email', 'sms', 'push'],
          isActive: true,
          createdAt: new Date('2026-01-20'),
        },
        {
          id: 3,
          category: 'Equipment',
          thresholdPercentage: 150,
          alertType: 'spike',
          notificationChannels: ['push', 'in_app'],
          isActive: true,
          createdAt: new Date('2026-02-01'),
        },
      ];

      return rules;
    }),

  /**
   * Update alert rule
   */
  updateAlertRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
        thresholdPercentage: z.number().optional(),
        notificationChannels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])).optional(),
        isActive: z.boolean().optional(),
        farmId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      return {
        id: input.ruleId,
        ...input,
        updatedAt: new Date(),
      };
    }),

  /**
   * Delete alert rule
   */
  deleteAlertRule: protectedProcedure
    .input(z.object({ ruleId: z.number(), farmId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      return {
        id: input.ruleId,
        deleted: true,
        deletedAt: new Date(),
      };
    }),

  /**
   * Get alert history
   */
  getAlertHistory: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      const history = [
        {
          id: 1,
          type: 'budget_exceeded',
          category: 'Seeds & Fertilizer',
          message: 'Budget exceeded by 15%',
          severity: 'warning',
          createdAt: new Date('2026-02-08'),
          resolvedAt: new Date('2026-02-09'),
        },
        {
          id: 2,
          type: 'loan_payment_due',
          message: 'Loan payment due reminder',
          severity: 'info',
          createdAt: new Date('2026-02-05'),
          resolvedAt: new Date('2026-02-06'),
        },
        {
          id: 3,
          type: 'expense_spike',
          category: 'Equipment',
          message: 'Unusual expense spike detected',
          severity: 'warning',
          createdAt: new Date('2026-02-01'),
          resolvedAt: null,
        },
      ];

      return {
        history: history.slice(input.offset, input.offset + input.limit),
        total: history.length,
        offset: input.offset,
        limit: input.limit,
      };
    }),

  /**
   * Get alert statistics
   */
  getAlertStats: protectedProcedure
    .input(z.object({ farmId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      return {
        totalAlerts: 15,
        activeAlerts: 4,
        resolvedAlerts: 11,
        criticalAlerts: 1,
        warningAlerts: 2,
        infoAlerts: 1,
        averageResolutionTime: 1.2, // hours
        alertsThisMonth: 8,
        alertsLastMonth: 12,
      };
    }),

  /**
   * Send test alert notification
   */
  sendTestAlert: protectedProcedure
    .input(
      z.object({
        channel: z.enum(['email', 'sms', 'push', 'in_app']),
        farmId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const farmId = input.farmId || ctx.user.farmId;

      return {
        success: true,
        channel: input.channel,
        message: `Test alert sent via ${input.channel}`,
        sentAt: new Date(),
      };
    }),
});
