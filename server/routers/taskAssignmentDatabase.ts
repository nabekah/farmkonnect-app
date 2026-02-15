import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

// Using raw SQL queries for database operations
// This approach is consistent with other routers in the codebase

export const taskAssignmentDatabaseRouter = router({
  /**
   * Get all tasks for a farm with worker details
   */
  getTasksByFarm: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `SELECT ta.id, ta.taskId, ta.title, ta.description, ta.taskType, ta.priority, ta.status,
                  ta.dueDate, ta.estimatedHours, ta.actualHours, ta.workerId, u.name as workerName,
                  ta.createdAt, ta.updatedAt, ta.farmId
           FROM taskAssignments ta
           LEFT JOIN users u ON ta.workerId = u.id
           WHERE ta.farmId = ?
           ORDER BY ta.createdAt DESC`,
          [input.farmId]
        );
        return result || [];
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch tasks" });
      }
    }),

  /**
   * Get single task by ID
   */
  getTaskById: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `SELECT ta.id, ta.taskId, ta.title, ta.description, ta.taskType, ta.priority, ta.status,
                  ta.dueDate, ta.estimatedHours, ta.actualHours, ta.workerId, u.name as workerName,
                  ta.createdAt, ta.updatedAt, ta.farmId
           FROM taskAssignments ta
           LEFT JOIN users u ON ta.workerId = u.id
           WHERE ta.taskId = ?
           LIMIT 1`,
          [input.taskId]
        );
        return result?.[0] || null;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch task" });
      }
    }),

  /**
   * Create new task assignment
   */
  createTask: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        workerId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        taskType: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        dueDate: z.date(),
        estimatedHours: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await db.query.raw(
          `INSERT INTO taskAssignments (taskId, farmId, workerId, title, description, taskType, priority, status, dueDate, estimatedHours, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, NOW(), NOW())`,
          [
            taskId,
            input.farmId,
            input.workerId,
            input.title,
            input.description || null,
            input.taskType,
            input.priority,
            input.dueDate,
            input.estimatedHours,
            ctx.user.id,
          ]
        );

        return { taskId, success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create task" });
      }
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled", "on_hold"]),
        actualHours: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        let query = `UPDATE taskAssignments SET status = ?, updatedAt = NOW()`;
        const params: any[] = [input.status];

        if (input.status === "completed") {
          query += `, completedAt = NOW()`;
          if (input.actualHours) {
            query += `, actualHours = ?`;
            params.push(input.actualHours);
          }
        }

        query += ` WHERE taskId = ?`;
        params.push(input.taskId);

        await db.query.raw(query, params);

        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update task" });
      }
    }),

  /**
   * Update task details
   */
  updateTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.date().optional(),
        estimatedHours: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updates: string[] = ["updatedAt = NOW()"];
        const params: any[] = [];

        if (input.title) {
          updates.push("title = ?");
          params.push(input.title);
        }
        if (input.description) {
          updates.push("description = ?");
          params.push(input.description);
        }
        if (input.priority) {
          updates.push("priority = ?");
          params.push(input.priority);
        }
        if (input.dueDate) {
          updates.push("dueDate = ?");
          params.push(input.dueDate);
        }
        if (input.estimatedHours) {
          updates.push("estimatedHours = ?");
          params.push(input.estimatedHours);
        }

        params.push(input.taskId);

        await db.query.raw(
          `UPDATE taskAssignments SET ${updates.join(", ")} WHERE taskId = ?`,
          params
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update task" });
      }
    }),

  /**
   * Delete task (mark as cancelled)
   */
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.query.raw(
          `UPDATE taskAssignments SET status = 'cancelled', updatedAt = NOW() WHERE taskId = ?`,
          [input.taskId]
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete task" });
      }
    }),

  /**
   * Get tasks by status
   */
  getTasksByStatus: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled", "on_hold"]),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `SELECT ta.id, ta.taskId, ta.title, ta.description, ta.taskType, ta.priority, ta.status,
                  ta.dueDate, ta.estimatedHours, ta.actualHours, ta.workerId, u.name as workerName,
                  ta.createdAt, ta.updatedAt
           FROM taskAssignments ta
           LEFT JOIN users u ON ta.workerId = u.id
           WHERE ta.farmId = ? AND ta.status = ?
           ORDER BY ta.dueDate DESC`,
          [input.farmId, input.status]
        );
        return result || [];
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch tasks" });
      }
    }),

  /**
   * Get task statistics for a farm
   */
  getTaskStats: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
           FROM taskAssignments
           WHERE farmId = ?`,
          [input.farmId]
        );

        return result?.[0] || { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch task stats" });
      }
    }),
});
