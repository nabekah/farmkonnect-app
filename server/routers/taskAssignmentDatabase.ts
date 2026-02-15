import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { taskAssignments, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

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

        const result = await db
          .select({
            id: taskAssignments.id,
            taskId: taskAssignments.taskId,
            title: taskAssignments.title,
            description: taskAssignments.description,
            taskType: taskAssignments.taskType,
            priority: taskAssignments.priority,
            status: taskAssignments.status,
            dueDate: taskAssignments.dueDate,
            estimatedHours: taskAssignments.estimatedHours,
            actualHours: taskAssignments.actualHours,
            workerId: taskAssignments.workerId,
            workerName: users.name,
            createdAt: taskAssignments.createdAt,
            updatedAt: taskAssignments.updatedAt,
            farmId: taskAssignments.farmId
          })
          .from(taskAssignments)
          .leftJoin(users, eq(taskAssignments.workerId, users.id))
          .where(eq(taskAssignments.farmId, input.farmId))
          .orderBy(sql`${taskAssignments.createdAt} DESC`);

        return result || [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
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

        const result = await db
          .select()
          .from(taskAssignments)
          .where(eq(taskAssignments.taskId, input.taskId))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Error fetching task:", error);
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
        workerId: z.number().nullable(),
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

        await db.insert(taskAssignments).values({
          taskId,
          farmId: input.farmId,
          workerId: input.workerId,
          title: input.title,
          description: input.description || null,
          taskType: input.taskType,
          priority: input.priority,
          status: 'pending',
          dueDate: input.dueDate,
          estimatedHours: input.estimatedHours,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return { taskId, success: true };
      } catch (error) {
        console.error("Error creating task:", error);
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

        const updateData: any = { status: input.status, updatedAt: new Date() };
        if (input.status === "completed" && input.actualHours) {
          updateData.actualHours = input.actualHours;
        }

        await db
          .update(taskAssignments)
          .set(updateData)
          .where(eq(taskAssignments.taskId, input.taskId));

        return { success: true };
      } catch (error) {
        console.error("Error updating task status:", error);
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

        const updateData: any = { updatedAt: new Date() };
        if (input.title) updateData.title = input.title;
        if (input.description) updateData.description = input.description;
        if (input.priority) updateData.priority = input.priority;
        if (input.dueDate) updateData.dueDate = input.dueDate;
        if (input.estimatedHours) updateData.estimatedHours = input.estimatedHours;

        await db
          .update(taskAssignments)
          .set(updateData)
          .where(eq(taskAssignments.taskId, input.taskId));

        return { success: true };
      } catch (error) {
        console.error("Error updating task:", error);
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

        await db
          .update(taskAssignments)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(taskAssignments.taskId, input.taskId));

        return { success: true };
      } catch (error) {
        console.error("Error deleting task:", error);
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

        const result = await db
          .select()
          .from(taskAssignments)
          .where(and(
            eq(taskAssignments.farmId, input.farmId),
            eq(taskAssignments.status, input.status)
          ))
          .orderBy(sql`${taskAssignments.dueDate} DESC`);

        return result || [];
      } catch (error) {
        console.error("Error fetching tasks by status:", error);
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

        const result = await db
          .select({
            total: sql<number>`COUNT(*)`,
            pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
            inProgress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
            completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
            cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`
          })
          .from(taskAssignments)
          .where(eq(taskAssignments.farmId, input.farmId));

        return result?.[0] || { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 };
      } catch (error) {
        console.error("Error fetching task stats:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch task stats" });
      }
    }),
});

export default taskAssignmentDatabaseRouter;
