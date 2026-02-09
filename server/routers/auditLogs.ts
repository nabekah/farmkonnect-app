import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const auditLogsRouter = router({
  // Get audit logs for a farm
  getFarmAuditLogs: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        action: z.string().optional(),
        userId: z.string().optional()
      })
    )
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
            message: "You don't have access to view audit logs for this farm"
          });
        }

        let query = `SELECT id, userId, action, resourceType, resourceId, oldValue, newValue, 
                            ipAddress, status, createdAt
                     FROM audit_logs
                     WHERE farmId = ?`;
        const params: any[] = [parseInt(input.farmId)];

        if (input.action) {
          query += ` AND action = ?`;
          params.push(input.action);
        }

        if (input.userId) {
          query += ` AND userId = ?`;
          params.push(input.userId);
        }

        query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);

        const logs = await db.query.raw(query, params);

        return logs || [];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit logs"
        });
      }
    }),

  // Get user activity summary
  getUserActivitySummary: protectedProcedure
    .input(z.object({ farmId: z.string(), userId: z.string() }))
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
            message: "You don't have access to view this user's activity"
          });
        }

        // Get activity summary
        const summary = await db.query.raw(
          `SELECT 
             COUNT(*) as totalActions,
             SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successfulActions,
             SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failedActions,
             MAX(createdAt) as lastActivityAt,
             COUNT(DISTINCT DATE(createdAt)) as activeDays
           FROM audit_logs
           WHERE userId = ? AND farmId = ?`,
          [input.userId, parseInt(input.farmId)]
        );

        return summary?.[0] || {
          totalActions: 0,
          successfulActions: 0,
          failedActions: 0,
          lastActivityAt: null,
          activeDays: 0
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching activity summary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activity summary"
        });
      }
    }),

  // Get audit logs for current user
  getMyAuditLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const logs = await db.query.raw(
          `SELECT id, action, resourceType, resourceId, ipAddress, status, createdAt
           FROM audit_logs
           WHERE userId = ?
           ORDER BY createdAt DESC
           LIMIT ? OFFSET ?`,
          [ctx.user.id, input.limit, input.offset]
        );

        return logs || [];
      } catch (error) {
        console.error("Error fetching my audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit logs"
        });
      }
    })
});

// Helper function to log user actions
export async function logAuditAction(
  userId: string,
  farmId: number | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  status: "success" | "failure" = "success",
  oldValue: any = null,
  newValue: any = null,
  errorMessage: string | null = null
) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("Cannot log audit action: database not available");
      return;
    }

    await db.query.raw(
      `INSERT INTO audit_logs 
       (userId, farmId, action, resourceType, resourceId, oldValue, newValue, ipAddress, userAgent, status, errorMessage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        farmId,
        action,
        resourceType,
        resourceId,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent,
        status,
        errorMessage
      ]
    );
  } catch (error) {
    console.error("Error logging audit action:", error);
  }
}
