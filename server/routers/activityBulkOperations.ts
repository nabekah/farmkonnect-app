import { protectedProcedure, publicProcedure } from '../_core/procedures';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '../db';
import { fieldWorkerActivityLogs } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';

/**
 * Bulk Operations Router for Activity Management
 * Handles bulk approve, reject, and delete operations
 */

export const activityBulkOperationsRouter = {
  /**
   * Bulk approve activities
   */
  bulkApprove: protectedProcedure
    .input(
      z.object({
        activityIds: z.array(z.string()).min(1),
        farmId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { activityIds, farmId, notes } = input;

        // Verify user has permission to approve activities for this farm
        // TODO: Add farm permission check

        // Update activities to reviewed status
        const result = await db.execute(
          sql`
            UPDATE ${fieldWorkerActivityLogs}
            SET 
              status = 'reviewed',
              reviewedBy = ${ctx.user.id},
              reviewedAt = NOW(),
              reviewNotes = ${notes || null},
              updatedAt = NOW()
            WHERE logId IN (${sql.join(activityIds, ',')})
            AND farmId = ${farmId}
            AND status != 'reviewed'
          `
        );

        return {
          success: true,
          updated: (result as any)[0]?.affectedRows || 0,
          message: `Successfully approved ${(result as any)[0]?.affectedRows || 0} activities`,
        };
      } catch (error) {
        console.error('Bulk approve error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk approve activities',
        });
      }
    }),

  /**
   * Bulk reject activities
   */
  bulkReject: protectedProcedure
    .input(
      z.object({
        activityIds: z.array(z.string()).min(1),
        farmId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { activityIds, farmId, reason } = input;

        // Verify user has permission
        // TODO: Add farm permission check

        // Update activities to draft status with rejection reason
        const result = await db.execute(
          sql`
            UPDATE ${fieldWorkerActivityLogs}
            SET 
              status = 'draft',
              reviewedBy = ${ctx.user.id},
              reviewedAt = NOW(),
              reviewNotes = ${reason},
              updatedAt = NOW()
            WHERE logId IN (${sql.join(activityIds, ',')})
            AND farmId = ${farmId}
            AND status = 'submitted'
          `
        );

        return {
          success: true,
          updated: (result as any)[0]?.affectedRows || 0,
          message: `Successfully rejected ${(result as any)[0]?.affectedRows || 0} activities`,
        };
      } catch (error) {
        console.error('Bulk reject error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk reject activities',
        });
      }
    }),

  /**
   * Bulk delete activities
   */
  bulkDelete: protectedProcedure
    .input(
      z.object({
        activityIds: z.array(z.string()).min(1),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { activityIds, farmId } = input;

        // Verify user has permission (admin only)
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only administrators can delete activities',
          });
        }

        // Delete activities
        const result = await db.execute(
          sql`
            DELETE FROM ${fieldWorkerActivityLogs}
            WHERE logId IN (${sql.join(activityIds, ',')})
            AND farmId = ${farmId}
          `
        );

        return {
          success: true,
          deleted: (result as any)[0]?.affectedRows || 0,
          message: `Successfully deleted ${(result as any)[0]?.affectedRows || 0} activities`,
        };
      } catch (error) {
        console.error('Bulk delete error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk delete activities',
        });
      }
    }),

  /**
   * Bulk update activity status
   */
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        activityIds: z.array(z.string()).min(1),
        farmId: z.number(),
        status: z.enum(['draft', 'submitted', 'reviewed']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { activityIds, farmId, status } = input;

        // Verify user has permission
        // TODO: Add farm permission check

        // Update activity status
        const result = await db.execute(
          sql`
            UPDATE ${fieldWorkerActivityLogs}
            SET 
              status = ${status},
              updatedAt = NOW()
            WHERE logId IN (${sql.join(activityIds, ',')})
            AND farmId = ${farmId}
          `
        );

        return {
          success: true,
          updated: (result as any)[0]?.affectedRows || 0,
          message: `Successfully updated ${(result as any)[0]?.affectedRows || 0} activities to ${status}`,
        };
      } catch (error) {
        console.error('Bulk update status error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk update activity status',
        });
      }
    }),

  /**
   * Get bulk operation statistics
   */
  getStats: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      try {
        const result = await db.execute(
          sql`
            SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
              SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
              SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed
            FROM ${fieldWorkerActivityLogs}
            WHERE farmId = ${input.farmId}
          `
        );

        const stats = (result as any)[0]?.[0] || {
          total: 0,
          draft: 0,
          submitted: 0,
          reviewed: 0,
        };

        return {
          total: parseInt(stats.total) || 0,
          draft: parseInt(stats.draft) || 0,
          submitted: parseInt(stats.submitted) || 0,
          reviewed: parseInt(stats.reviewed) || 0,
        };
      } catch (error) {
        console.error('Get stats error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get bulk operation statistics',
        });
      }
    }),
};
