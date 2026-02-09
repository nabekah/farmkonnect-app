import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const rbacRouter = router({
  // Get user's role and permissions for a specific farm
  getUserFarmRole: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const result = await db.query.raw(
          `SELECT fw.role, fw.status, rp.permission 
           FROM farm_workers fw
           LEFT JOIN role_permissions rp ON fw.role = rp.role
           WHERE fw.userId = ? AND fw.farmId = ?`,
          [ctx.user.id, parseInt(input.farmId)]
        );

        if (!result || result.length === 0) {
          return null;
        }

        const role = result[0].role;
        const status = result[0].status;
        const permissions = result.map((r: any) => r.permission).filter(Boolean);

        return {
          role,
          status,
          permissions,
          isActive: status === "active"
        };
      } catch (error) {
        console.error("Error fetching user farm role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user role"
        });
      }
    }),

  // Get all farms where user has access
  getAccessibleFarms: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const result = await db.query.raw(
        `SELECT DISTINCT f.id, f.farmName, f.location, fw.role, fw.status
         FROM farms f
         INNER JOIN farm_workers fw ON f.id = fw.farmId
         WHERE fw.userId = ? AND fw.status = 'active'
         ORDER BY f.farmName`,
        [ctx.user.id]
      );

      return result || [];
    } catch (error) {
      console.error("Error fetching accessible farms:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch accessible farms"
      });
    }
  }),

  // Assign worker to farm (owner only)
  assignWorkerToFarm: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        farmId: z.string(),
        role: z.enum(["owner", "manager", "worker", "viewer"])
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        // Verify user is owner of the farm
        const farmOwner = await db.query.raw(
          `SELECT id FROM farms WHERE id = ? AND ownerId = ?`,
          [parseInt(input.farmId), ctx.user.id]
        );

        if (!farmOwner || farmOwner.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to assign workers to this farm"
          });
        }

        // Insert or update farm worker assignment
        await db.query.raw(
          `INSERT INTO farm_workers (userId, farmId, role, status)
           VALUES (?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE role = VALUES(role), status = 'active', updatedAt = CURRENT_TIMESTAMP`,
          [input.userId, parseInt(input.farmId), input.role]
        );

        return {
          success: true,
          message: `Worker assigned to farm with role: ${input.role}`
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error assigning worker:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign worker to farm"
        });
      }
    }),

  // Get farm workers (owner/manager only)
  getFarmWorkers: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        // Verify user has permission to view workers
        const userRole = await db.query.raw(
          `SELECT fw.role FROM farm_workers fw
           WHERE fw.userId = ? AND fw.farmId = ? AND fw.status = 'active'`,
          [ctx.user.id, parseInt(input.farmId)]
        );

        if (!userRole || userRole.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this farm"
          });
        }

        const role = userRole[0].role;
        if (!["owner", "manager"].includes(role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view farm workers"
          });
        }

        // Get all workers for the farm
        const workers = await db.query.raw(
          `SELECT fw.id, fw.userId, fw.role, fw.status, fw.assignedAt
           FROM farm_workers fw
           WHERE fw.farmId = ?
           ORDER BY fw.assignedAt DESC`,
          [parseInt(input.farmId)]
        );

        return workers || [];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching farm workers:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch farm workers"
        });
      }
    }),

  // Update worker role (owner only)
  updateWorkerRole: protectedProcedure
    .input(
      z.object({
        workerId: z.string(),
        farmId: z.string(),
        newRole: z.enum(["owner", "manager", "worker", "viewer"])
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        // Verify user is owner of the farm
        const farmOwner = await db.query.raw(
          `SELECT id FROM farms WHERE id = ? AND ownerId = ?`,
          [parseInt(input.farmId), ctx.user.id]
        );

        if (!farmOwner || farmOwner.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update worker roles"
          });
        }

        // Update worker role
        await db.query.raw(
          `UPDATE farm_workers SET role = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ? AND farmId = ?`,
          [input.newRole, parseInt(input.workerId), parseInt(input.farmId)]
        );

        return {
          success: true,
          message: `Worker role updated to: ${input.newRole}`
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating worker role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update worker role"
        });
      }
    }),

  // Deactivate worker (owner only)
  deactivateWorker: protectedProcedure
    .input(z.object({ workerId: z.string(), farmId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        // Verify user is owner of the farm
        const farmOwner = await db.query.raw(
          `SELECT id FROM farms WHERE id = ? AND ownerId = ?`,
          [parseInt(input.farmId), ctx.user.id]
        );

        if (!farmOwner || farmOwner.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to deactivate workers"
          });
        }

        // Deactivate worker
        await db.query.raw(
          `UPDATE farm_workers SET status = 'inactive', updatedAt = CURRENT_TIMESTAMP
           WHERE id = ? AND farmId = ?`,
          [parseInt(input.workerId), parseInt(input.farmId)]
        );

        return {
          success: true,
          message: "Worker deactivated successfully"
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deactivating worker:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to deactivate worker"
        });
      }
    }),

  // Check if user has specific permission for a farm
  hasPermission: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        permission: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const result = await db.query.raw(
          `SELECT COUNT(*) as count FROM farm_workers fw
           INNER JOIN role_permissions rp ON fw.role = rp.role
           WHERE fw.userId = ? AND fw.farmId = ? AND fw.status = 'active'
           AND rp.permission = ?`,
          [ctx.user.id, parseInt(input.farmId), input.permission]
        );

        return result && result.length > 0 && result[0].count > 0;
      } catch (error) {
        console.error("Error checking permission:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check permission"
        });
      }
    })
});
