import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { users, farms, animals, expenses, revenue, auditLogs } from '../../drizzle/schema';
import { eq, count, gte, lte } from 'drizzle-orm';

export const adminAnalyticsRouter = router({
  /**
   * Get system health metrics
   */
  getSystemHealth: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      const totalUsers = await db.select({ count: count() }).from(users);
      const totalFarms = await db.select({ count: count() }).from(farms);
      const totalAnimals = await db.select({ count: count() }).from(animals);
      const totalExpenses = await db.select({ count: count() }).from(expenses);
      const totalRevenue = await db.select({ count: count() }).from(revenue);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          totalUsers: totalUsers[0]?.count || 0,
          totalFarms: totalFarms[0]?.count || 0,
          totalAnimals: totalAnimals[0]?.count || 0,
          totalExpenses: totalExpenses[0]?.count || 0,
          totalRevenue: totalRevenue[0]?.count || 0,
        },
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),

  /**
   * Get user activity metrics
   */
  getUserActivity: adminProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(30),
        limit: z.number().int().positive().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

        const recentActivity = await db
          .select()
          .from(auditLogs)
          .where(gte(auditLogs.timestamp, startDate))
          .limit(input.limit);

        // Group by user
        const activityByUser: Record<number, any> = {};
        for (const log of recentActivity) {
          if (!activityByUser[log.userId]) {
            activityByUser[log.userId] = {
              userId: log.userId,
              actions: 0,
              lastAction: log.timestamp,
              resources: new Set(),
            };
          }
          activityByUser[log.userId].actions++;
          activityByUser[log.userId].resources.add(log.resource);
        }

        return {
          period: `Last ${input.days} days`,
          totalActions: recentActivity.length,
          activeUsers: Object.keys(activityByUser).length,
          activityByUser: Object.values(activityByUser).map(user => ({
            ...user,
            resources: Array.from(user.resources),
          })),
        };
      } catch (error) {
        throw new Error(`Failed to get user activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Get API performance metrics
   */
  getApiPerformance: adminProcedure.query(async () => {
    try {
      // In a real application, this would track response times, error rates, etc.
      return {
        timestamp: new Date().toISOString(),
        metrics: {
          averageResponseTime: '125ms',
          p95ResponseTime: '250ms',
          p99ResponseTime: '500ms',
          errorRate: '0.5%',
          requestsPerSecond: '150',
          uptime: '99.95%',
        },
        endpoints: [
          { name: 'GET /api/trpc/farms.getFarms', avgTime: '50ms', errorRate: '0%' },
          { name: 'POST /api/trpc/expenses.createExpense', avgTime: '150ms', errorRate: '0.2%' },
          { name: 'GET /api/trpc/animals.getAnimals', avgTime: '75ms', errorRate: '0%' },
          { name: 'POST /api/trpc/revenue.createRevenue', avgTime: '120ms', errorRate: '0.1%' },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get API performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  /**
   * Get error rate dashboard
   */
  getErrorMetrics: adminProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(7),
      })
    )
    .query(async ({ input }) => {
      try {
        const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

        const failedLogs = await db
          .select()
          .from(auditLogs)
          .where(
            eq(auditLogs.status, 'failure') &&
            gte(auditLogs.timestamp, startDate)
          );

        // Group errors by type
        const errorsByType: Record<string, number> = {};
        const errorsByResource: Record<string, number> = {};

        for (const log of failedLogs) {
          const errorType = log.errorMessage?.split(':')[0] || 'Unknown';
          errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
          errorsByResource[log.resource] = (errorsByResource[log.resource] || 0) + 1;
        }

        return {
          period: `Last ${input.days} days`,
          totalErrors: failedLogs.length,
          errorRate: ((failedLogs.length / (input.days * 1000)) * 100).toFixed(2) + '%',
          errorsByType,
          errorsByResource,
          topErrors: Object.entries(errorsByType)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
        };
      } catch (error) {
        throw new Error(`Failed to get error metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Get real-time metrics
   */
  getRealtimeMetrics: adminProcedure.query(async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const recentActions = await db
        .select()
        .from(auditLogs)
        .where(gte(auditLogs.timestamp, oneHourAgo));

      const successCount = recentActions.filter(a => a.status === 'success').length;
      const failureCount = recentActions.filter(a => a.status === 'failure').length;

      return {
        timestamp: now.toISOString(),
        lastHour: {
          totalActions: recentActions.length,
          successfulActions: successCount,
          failedActions: failureCount,
          successRate: recentActions.length > 0 ? ((successCount / recentActions.length) * 100).toFixed(2) + '%' : '0%',
        },
        activeUsers: new Set(recentActions.map(a => a.userId)).size,
        topResources: Object.entries(
          recentActions.reduce((acc, a) => {
            acc[a.resource] = (acc[a.resource] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
      };
    } catch (error) {
      throw new Error(`Failed to get realtime metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  /**
   * Get audit logs
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        resource: z.string().optional(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        let query = db.select().from(auditLogs);

        // Apply filters
        if (input.userId) {
          query = query.where(eq(auditLogs.userId, input.userId));
        }

        const logs = await query.limit(input.limit).offset(input.offset);

        return {
          total: logs.length,
          limit: input.limit,
          offset: input.offset,
          logs,
        };
      } catch (error) {
        throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Get system statistics
   */
  getSystemStats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      const totalUsers = await db.select({ count: count() }).from(users);
      const totalFarms = await db.select({ count: count() }).from(farms);
      const totalAnimals = await db.select({ count: count() }).from(animals);

      return {
        timestamp: new Date().toISOString(),
        statistics: {
          users: totalUsers[0]?.count || 0,
          farms: totalFarms[0]?.count || 0,
          animals: totalAnimals[0]?.count || 0,
          averageAnimalsPerFarm: totalFarms[0]?.count ? Math.round((totalAnimals[0]?.count || 0) / totalFarms[0].count) : 0,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get system stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),
});
