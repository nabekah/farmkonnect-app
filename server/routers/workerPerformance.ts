import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const workerPerformanceRouter = router({
  // Get worker performance metrics
  getWorkerMetrics: protectedProcedure
    .input(z.object({ farmId: z.string(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user has access to the farm
        const hasAccess = await db.query.raw(
          `SELECT fw.role FROM farm_workers fw
           WHERE fw.userId = ? AND fw.farmId = ? AND fw.status = 'active'`,
          [ctx.user.id, parseInt(input.farmId)]
        );

        if (!hasAccess || hasAccess.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to view worker metrics"
          });
        }

        const metrics = await db.query.raw(
          `SELECT id, userId, farmId, tasksAssigned, tasksCompleted, tasksOverdue,
                  averageCompletionTime, activityScore, lastActivityAt, totalHoursWorked,
                  attendanceRate, qualityScore, createdAt, updatedAt
           FROM worker_performance
           WHERE userId = ? AND farmId = ?`,
          [input.userId, parseInt(input.farmId)]
        );

        return metrics?.[0] || null;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching worker metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch worker metrics"
        });
      }
    }),

  // Get all worker metrics for a farm
  getFarmWorkerMetrics: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user has access to the farm
        const hasAccess = await db.query.raw(
          `SELECT fw.role FROM farm_workers fw
           WHERE fw.userId = ? AND fw.farmId = ? AND fw.status = 'active'`,
          [ctx.user.id, parseInt(input.farmId)]
        );

        if (!hasAccess || hasAccess.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to view farm worker metrics"
          });
        }

        const metrics = await db.query.raw(
          `SELECT wp.userId, wp.tasksAssigned, wp.tasksCompleted, wp.tasksOverdue,
                  wp.averageCompletionTime, wp.activityScore, wp.lastActivityAt,
                  wp.totalHoursWorked, wp.attendanceRate, wp.qualityScore,
                  fw.role
           FROM worker_performance wp
           JOIN farm_workers fw ON wp.userId = fw.userId AND wp.farmId = fw.farmId
           WHERE wp.farmId = ? AND fw.status = 'active'
           ORDER BY wp.activityScore DESC`,
          [parseInt(input.farmId)]
        );

        return metrics || [];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching farm worker metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch farm worker metrics"
        });
      }
    }),

  // Update worker performance metrics
  updateWorkerMetrics: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        userId: z.string(),
        tasksCompleted: z.number().optional(),
        tasksOverdue: z.number().optional(),
        averageCompletionTime: z.number().optional(),
        activityScore: z.number().optional(),
        totalHoursWorked: z.number().optional(),
        attendanceRate: z.number().optional(),
        qualityScore: z.number().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user is manager or owner
        const userRole = await db.query.raw(
          `SELECT fw.role FROM farm_workers fw
           WHERE fw.userId = ? AND fw.farmId = ? AND fw.status = 'active'`,
          [ctx.user.id, parseInt(input.farmId)]
        );

        if (!userRole || userRole.length === 0 || !["owner", "manager"].includes(userRole[0].role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update worker metrics"
          });
        }

        // Build update query dynamically
        const updates: string[] = [];
        const params: any[] = [];

        if (input.tasksCompleted !== undefined) {
          updates.push("tasksCompleted = ?");
          params.push(input.tasksCompleted);
        }
        if (input.tasksOverdue !== undefined) {
          updates.push("tasksOverdue = ?");
          params.push(input.tasksOverdue);
        }
        if (input.averageCompletionTime !== undefined) {
          updates.push("averageCompletionTime = ?");
          params.push(input.averageCompletionTime);
        }
        if (input.activityScore !== undefined) {
          updates.push("activityScore = ?");
          params.push(input.activityScore);
        }
        if (input.totalHoursWorked !== undefined) {
          updates.push("totalHoursWorked = ?");
          params.push(input.totalHoursWorked);
        }
        if (input.attendanceRate !== undefined) {
          updates.push("attendanceRate = ?");
          params.push(input.attendanceRate);
        }
        if (input.qualityScore !== undefined) {
          updates.push("qualityScore = ?");
          params.push(input.qualityScore);
        }

        if (updates.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No metrics to update"
          });
        }

        updates.push("lastActivityAt = NOW()");
        params.push(input.userId, parseInt(input.farmId));

        const query = `UPDATE worker_performance SET ${updates.join(", ")}
                       WHERE userId = ? AND farmId = ?`;

        await db.query.raw(query, params);

        return {
          success: true,
          message: "Worker metrics updated successfully"
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating worker metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update worker metrics"
        });
      }
    }),

  // Get performance summary for farm
  getFarmPerformanceSummary: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user has access
        const hasAccess = await db.query.raw(
          `SELECT fw.role FROM farm_workers fw
           WHERE fw.userId = ? AND fw.farmId = ? AND fw.status = 'active'`,
          [ctx.user.id, parseInt(input.farmId)]
        );

        if (!hasAccess || hasAccess.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to view farm performance"
          });
        }

        const summary = await db.query.raw(
          `SELECT 
             COUNT(*) as totalWorkers,
             AVG(activityScore) as averageActivityScore,
             AVG(attendanceRate) as averageAttendanceRate,
             AVG(qualityScore) as averageQualityScore,
             SUM(tasksCompleted) as totalTasksCompleted,
             SUM(tasksOverdue) as totalTasksOverdue,
             SUM(totalHoursWorked) as totalHoursWorked
           FROM worker_performance
           WHERE farmId = ?`,
          [parseInt(input.farmId)]
        );

        return summary?.[0] || {
          totalWorkers: 0,
          averageActivityScore: 0,
          averageAttendanceRate: 0,
          averageQualityScore: 0,
          totalTasksCompleted: 0,
          totalTasksOverdue: 0,
          totalHoursWorked: 0
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching performance summary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch performance summary"
        });
      }
    })
});
