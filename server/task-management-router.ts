import { router, protectedProcedure } from "./trpc";
import { z } from "zod";
import { db } from "./db";
import {
  taskAssignments,
  taskCompletionRecords,
  workerPerformanceAlerts,
  taskTemplates,
  bulkTaskAssignments,
  workerPerformanceMetrics,
} from "@/drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Validation schemas
const createTaskSchema = z.object({
  farmId: z.number(),
  workerId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  taskType: z.enum([
    "planting",
    "weeding",
    "irrigation",
    "harvesting",
    "maintenance",
    "spraying",
    "feeding",
    "health_check",
    "cleaning",
    "repair",
    "inspection",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.date(),
  estimatedHours: z.number().positive(),
  templateId: z.number().optional(),
});

const updateTaskStatusSchema = z.object({
  taskId: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled", "on_hold"]),
  actualHours: z.number().positive().optional(),
  notes: z.string().optional(),
});

const completeTaskSchema = z.object({
  taskId: z.string(),
  actualHours: z.number().positive(),
  qualityRating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
});

const createTaskTemplateSchema = z.object({
  farmId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  taskType: z.enum([
    "planting",
    "weeding",
    "irrigation",
    "harvesting",
    "maintenance",
    "spraying",
    "feeding",
    "health_check",
    "cleaning",
    "repair",
    "inspection",
    "other",
  ]),
  defaultPriority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  defaultEstimatedHours: z.number().positive(),
  defaultDescription: z.string().optional(),
  recurrencePattern: z.enum(["once", "daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).default("once"),
  recurrenceDayOfWeek: z.array(z.string()).optional(),
  recurrenceDayOfMonth: z.number().optional(),
});

const bulkAssignTasksSchema = z.object({
  farmId: z.number(),
  templateId: z.number(),
  workerIds: z.array(z.number()).min(1),
  startDate: z.date(),
  endDate: z.date().optional(),
});

export const taskManagementRouter = router({
  // Create a new task assignment
  createTask: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ input, ctx }) => {
      const taskId = uuidv4();

      const result = await db.insert(taskAssignments).values({
        taskId,
        farmId: input.farmId,
        workerId: input.workerId,
        title: input.title,
        description: input.description,
        taskType: input.taskType,
        priority: input.priority,
        status: "pending",
        dueDate: input.dueDate,
        estimatedHours: input.estimatedHours,
        templateId: input.templateId,
        createdBy: ctx.user.id,
      });

      return { taskId, success: true };
    }),

  // Get all tasks for a farm
  getTasksByFarm: protectedProcedure
    .input(z.object({ farmId: z.number(), status: z.string().optional() }))
    .query(async ({ input }) => {
      const conditions = [eq(taskAssignments.farmId, input.farmId)];

      if (input.status) {
        conditions.push(eq(taskAssignments.status, input.status as any));
      }

      return await db
        .select()
        .from(taskAssignments)
        .where(and(...conditions))
        .orderBy(desc(taskAssignments.createdAt));
    }),

  // Get tasks for a specific worker
  getWorkerTasks: protectedProcedure
    .input(z.object({ workerId: z.number(), farmId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(taskAssignments)
        .where(and(eq(taskAssignments.workerId, input.workerId), eq(taskAssignments.farmId, input.farmId)))
        .orderBy(desc(taskAssignments.dueDate));
    }),

  // Update task status
  updateTaskStatus: protectedProcedure
    .input(updateTaskStatusSchema)
    .mutation(async ({ input }) => {
      await db
        .update(taskAssignments)
        .set({
          status: input.status,
          actualHours: input.actualHours,
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(taskAssignments.taskId, input.taskId));

      return { success: true };
    }),

  // Complete a task with efficiency tracking
  completeTask: protectedProcedure
    .input(completeTaskSchema)
    .mutation(async ({ input, ctx }) => {
      // Get the task
      const task = await db.query.taskAssignments.findFirst({
        where: eq(taskAssignments.taskId, input.taskId),
      });

      if (!task) throw new Error("Task not found");

      // Calculate efficiency
      const efficiency = (Number(task.estimatedHours) / input.actualHours) * 100;

      // Update task
      await db
        .update(taskAssignments)
        .set({
          status: "completed",
          actualHours: input.actualHours,
          completedAt: new Date(),
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(taskAssignments.taskId, input.taskId));

      // Create completion record
      const recordId = uuidv4();
      await db.insert(taskCompletionRecords).values({
        recordId,
        taskId: input.taskId,
        workerId: task.workerId,
        farmId: task.farmId,
        completedAt: new Date(),
        estimatedHours: task.estimatedHours,
        actualHours: input.actualHours,
        efficiency: efficiency,
        qualityRating: input.qualityRating,
        notes: input.notes,
        photoUrls: input.photoUrls ? JSON.stringify(input.photoUrls) : null,
      });

      // Check for performance alerts
      if (efficiency < 85) {
        const alertId = uuidv4();
        await db.insert(workerPerformanceAlerts).values({
          alertId,
          farmId: task.farmId,
          workerId: task.workerId,
          alertType: "low_efficiency",
          threshold: "efficiency < 85%",
          currentValue: `efficiency: ${efficiency.toFixed(1)}%`,
          taskId: input.taskId,
          severity: efficiency < 70 ? "critical" : "warning",
          notificationSent: false,
        });
      }

      // Update worker performance metrics
      await updateWorkerMetrics(task.farmId, task.workerId);

      return { recordId, efficiency, success: true };
    }),

  // Get completion records for a worker
  getWorkerCompletionRecords: protectedProcedure
    .input(z.object({ workerId: z.number(), farmId: z.number(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(taskCompletionRecords)
        .where(and(eq(taskCompletionRecords.workerId, input.workerId), eq(taskCompletionRecords.farmId, input.farmId)))
        .orderBy(desc(taskCompletionRecords.completedAt))
        .limit(input.limit);
    }),

  // Get worker performance metrics
  getWorkerMetrics: protectedProcedure
    .input(z.object({ workerId: z.number(), farmId: z.number(), period: z.enum(["daily", "weekly", "monthly", "yearly"]) }))
    .query(async ({ input }) => {
      const today = new Date();
      const periodDate = new Date(today);

      if (input.period === "daily") {
        periodDate.setDate(periodDate.getDate() - 1);
      } else if (input.period === "weekly") {
        periodDate.setDate(periodDate.getDate() - 7);
      } else if (input.period === "monthly") {
        periodDate.setMonth(periodDate.getMonth() - 1);
      } else if (input.period === "yearly") {
        periodDate.setFullYear(periodDate.getFullYear() - 1);
      }

      return await db
        .select()
        .from(workerPerformanceMetrics)
        .where(
          and(
            eq(workerPerformanceMetrics.workerId, input.workerId),
            eq(workerPerformanceMetrics.farmId, input.farmId),
            eq(workerPerformanceMetrics.period, input.period),
            gte(workerPerformanceMetrics.periodDate, periodDate)
          )
        )
        .orderBy(desc(workerPerformanceMetrics.periodDate));
    }),

  // Get performance alerts for a farm
  getPerformanceAlerts: protectedProcedure
    .input(z.object({ farmId: z.number(), resolved: z.boolean().optional() }))
    .query(async ({ input }) => {
      const conditions = [eq(workerPerformanceAlerts.farmId, input.farmId)];

      if (input.resolved !== undefined) {
        conditions.push(eq(workerPerformanceAlerts.isResolved, input.resolved));
      }

      return await db
        .select()
        .from(workerPerformanceAlerts)
        .where(and(...conditions))
        .orderBy(desc(workerPerformanceAlerts.createdAt));
    }),

  // Resolve a performance alert
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      await db
        .update(workerPerformanceAlerts)
        .set({
          isResolved: true,
          resolvedAt: new Date(),
          resolvedNotes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(workerPerformanceAlerts.alertId, input.alertId));

      return { success: true };
    }),

  // Create a task template
  createTaskTemplate: protectedProcedure
    .input(createTaskTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const templateId = uuidv4();

      await db.insert(taskTemplates).values({
        templateId,
        farmId: input.farmId,
        name: input.name,
        description: input.description,
        taskType: input.taskType,
        defaultPriority: input.defaultPriority,
        defaultEstimatedHours: input.defaultEstimatedHours,
        defaultDescription: input.defaultDescription,
        recurrencePattern: input.recurrencePattern,
        recurrenceDayOfWeek: input.recurrenceDayOfWeek ? JSON.stringify(input.recurrenceDayOfWeek) : null,
        recurrenceDayOfMonth: input.recurrenceDayOfMonth,
        createdBy: ctx.user.id,
      });

      return { templateId, success: true };
    }),

  // Get task templates for a farm
  getTaskTemplates: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(taskTemplates)
        .where(and(eq(taskTemplates.farmId, input.farmId), eq(taskTemplates.isActive, true)))
        .orderBy(desc(taskTemplates.createdAt));
    }),

  // Bulk assign tasks from template
  bulkAssignTasks: protectedProcedure
    .input(bulkAssignTasksSchema)
    .mutation(async ({ input, ctx }) => {
      const bulkId = uuidv4();

      // Get template
      const template = await db.query.taskTemplates.findFirst({
        where: eq(taskTemplates.id, input.templateId),
      });

      if (!template) throw new Error("Template not found");

      // Create bulk assignment record
      await db.insert(bulkTaskAssignments).values({
        bulkId,
        farmId: input.farmId,
        templateId: input.templateId,
        workerIds: JSON.stringify(input.workerIds),
        totalTasks: input.workerIds.length,
        status: "processing",
        startDate: input.startDate,
        endDate: input.endDate,
        createdBy: ctx.user.id,
      });

      // Create tasks for each worker
      let successCount = 0;
      let failureCount = 0;

      for (const workerId of input.workerIds) {
        try {
          const taskId = uuidv4();
          await db.insert(taskAssignments).values({
            taskId,
            farmId: input.farmId,
            workerId,
            title: template.name,
            description: template.defaultDescription,
            taskType: template.taskType,
            priority: template.defaultPriority,
            status: "pending",
            dueDate: input.startDate,
            estimatedHours: template.defaultEstimatedHours,
            templateId: input.templateId,
            createdBy: ctx.user.id,
          });
          successCount++;
        } catch (error) {
          failureCount++;
        }
      }

      // Update bulk assignment status
      await db
        .update(bulkTaskAssignments)
        .set({
          status: "completed",
          successCount,
          failureCount,
          completedAt: new Date(),
        })
        .where(eq(bulkTaskAssignments.bulkId, bulkId));

      return { bulkId, successCount, failureCount, success: true };
    }),

  // Get bulk assignment status
  getBulkAssignmentStatus: protectedProcedure
    .input(z.object({ bulkId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.bulkTaskAssignments.findFirst({
        where: eq(bulkTaskAssignments.bulkId, input.bulkId),
      });
    }),
});

// Helper function to update worker metrics
async function updateWorkerMetrics(farmId: number, workerId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get completion records for today
  const records = await db
    .select()
    .from(taskCompletionRecords)
    .where(
      and(
        eq(taskCompletionRecords.farmId, farmId),
        eq(taskCompletionRecords.workerId, workerId),
        gte(taskCompletionRecords.completedAt, today)
      )
    );

  if (records.length === 0) return;

  const totalTasks = records.length;
  const avgEfficiency =
    records.reduce((sum, r) => sum + Number(r.efficiency), 0) / totalTasks;
  const totalHoursEstimated = records.reduce((sum, r) => sum + Number(r.estimatedHours), 0);
  const totalHoursActual = records.reduce((sum, r) => sum + Number(r.actualHours), 0);
  const avgQualityRating = records
    .filter((r) => r.qualityRating)
    .reduce((sum, r) => sum + r.qualityRating!, 0) / records.filter((r) => r.qualityRating).length || null;

  const metricsId = uuidv4();

  await db.insert(workerPerformanceMetrics).values({
    metricsId,
    farmId,
    workerId,
    period: "daily",
    periodDate: today,
    totalTasks,
    completedTasks: totalTasks,
    cancelledTasks: 0,
    averageEfficiency: avgEfficiency,
    totalHoursEstimated,
    totalHoursActual,
    averageQualityRating: avgQualityRating,
    lowEfficiencyCount: records.filter((r) => Number(r.efficiency) < 85).length,
  });
}
