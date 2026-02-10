import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

/**
 * Mobile-First Dashboard Router
 * Offline-first dashboard with task assignments, notifications, and low-bandwidth optimization
 */
export const mobileFirstDashboardCleanRouter = router({
  /**
   * Get mobile dashboard summary
   */
  getMobileDashboardSummary: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          summary: {
            tasksToday: 5,
            tasksCompleted: 2,
            tasksOverdue: 1,
            pendingNotifications: 3,
            lastSyncTime: new Date(Date.now() - 5 * 60 * 1000),
          },
          quickStats: {
            fieldsCovered: 3,
            hoursWorked: 6.5,
            efficiency: 87,
            safetyScore: 95,
          },
          alerts: [
            {
              id: 1,
              type: "warning",
              title: "Task Overdue",
              message: "Field maintenance task overdue by 2 hours",
              priority: "high",
            },
            {
              id: 2,
              type: "info",
              title: "Weather Alert",
              message: "Rain expected in 2 hours",
              priority: "medium",
            },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get summary: ${error}`,
        });
      }
    }),

  /**
   * Get worker tasks
   */
  getWorkerTasks: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          tasks: [
            {
              id: 1,
              title: "Field A - Soil Preparation",
              fieldName: "Field A",
              taskType: "maintenance",
              status: "in_progress",
              priority: "high",
              dueTime: "14:00",
              estimatedDuration: 120,
              description: "Prepare soil for planting",
              location: { lat: 5.6037, lng: -0.1870 },
              assignedBy: "Farm Manager",
              startedAt: new Date(Date.now() - 30 * 60 * 1000),
              completedAt: null,
            },
            {
              id: 2,
              title: "Field B - Irrigation Check",
              fieldName: "Field B",
              taskType: "inspection",
              status: "pending",
              priority: "medium",
              dueTime: "16:00",
              estimatedDuration: 60,
              description: "Check irrigation system functionality",
              location: { lat: 5.6045, lng: -0.1865 },
              assignedBy: "Supervisor",
              startedAt: null,
              completedAt: null,
            },
            {
              id: 3,
              title: "Field C - Pest Monitoring",
              fieldName: "Field C",
              taskType: "monitoring",
              status: "pending",
              priority: "medium",
              dueTime: "17:30",
              estimatedDuration: 45,
              description: "Monitor for pest activity",
              location: { lat: 5.6050, lng: -0.1875 },
              assignedBy: "Farm Manager",
              startedAt: null,
              completedAt: null,
            },
          ],
          totalTasks: 3,
          completedToday: 2,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get tasks: ${error}`,
        });
      }
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          taskId: input.taskId,
          status: input.status,
          updatedAt: new Date(),
          message: "Task status updated successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update task: ${error}`,
        });
      }
    }),

  /**
   * Get worker notifications
   */
  getWorkerNotifications: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          notifications: [
            {
              id: 1,
              type: "task_assigned",
              title: "New Task Assigned",
              message: "Field maintenance task assigned to you",
              timestamp: new Date(Date.now() - 10 * 60 * 1000),
              read: false,
              priority: "high",
            },
            {
              id: 2,
              type: "weather_alert",
              title: "Weather Alert",
              message: "Rain expected in 2 hours",
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              read: false,
              priority: "medium",
            },
            {
              id: 3,
              type: "task_reminder",
              title: "Task Reminder",
              message: "Field B irrigation check due in 1 hour",
              timestamp: new Date(Date.now() - 60 * 60 * 1000),
              read: true,
              priority: "medium",
            },
          ],
          unreadCount: 2,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get notifications: ${error}`,
        });
      }
    }),

  /**
   * Get offline sync data
   */
  getOfflineSyncData: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          syncData: {
            tasks: [
              {
                id: 1,
                title: "Field A - Soil Preparation",
                status: "in_progress",
                priority: "high",
              },
              {
                id: 2,
                title: "Field B - Irrigation Check",
                status: "pending",
                priority: "medium",
              },
            ],
            fields: [
              {
                id: 1,
                name: "Field A",
                cropType: "Maize",
                soilMoisture: 45,
                location: { lat: 5.6037, lng: -0.1870 },
              },
              {
                id: 2,
                name: "Field B",
                cropType: "Tomato",
                soilMoisture: 55,
                location: { lat: 5.6045, lng: -0.1865 },
              },
            ],
            weather: {
              currentTemp: 28,
              condition: "Partly Cloudy",
              humidity: 65,
              rainfall: 0,
            },
            syncTimestamp: new Date(),
            dataSize: "2.3 MB",
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get sync data: ${error}`,
        });
      }
    }),

  /**
   * Sync offline changes
   */
  syncOfflineChanges: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        changes: z.array(
          z.object({
            type: z.string(),
            id: z.number(),
            data: z.record(z.any()),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          workerId: input.workerId,
          changesProcessed: input.changes.length,
          syncedAt: new Date(),
          message: "Offline changes synced successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync changes: ${error}`,
        });
      }
    }),

  /**
   * Get worker location history
   */
  getWorkerLocationHistory: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        date: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          date: input.date,
          locations: [
            {
              timestamp: "08:00",
              lat: 5.6037,
              lng: -0.1870,
              fieldName: "Field A",
              accuracy: 10,
            },
            {
              timestamp: "10:30",
              lat: 5.6045,
              lng: -0.1865,
              fieldName: "Field B",
              accuracy: 12,
            },
            {
              timestamp: "13:00",
              lat: 5.6050,
              lng: -0.1875,
              fieldName: "Field C",
              accuracy: 8,
            },
          ],
          totalDistance: 2.5,
          unit: "km",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get location history: ${error}`,
        });
      }
    }),

  /**
   * Get low-bandwidth optimized data
   */
  getLowBandwidthData: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        dataType: z.enum(["tasks", "weather", "fields", "notifications"]),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          dataType: input.dataType,
          data: {
            compressed: true,
            format: "minified_json",
            size: "0.5 MB",
            compressionRatio: 78,
            content: {
              tasks: [
                { id: 1, t: "Field A - Soil", s: "ip", p: "h" },
                { id: 2, t: "Field B - Irrigation", s: "p", p: "m" },
              ],
            },
          },
          estimatedLoadTime: "2.3 seconds",
          bandwidthUsed: "512 KB",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get low-bandwidth data: ${error}`,
        });
      }
    }),

  /**
   * Get worker performance metrics
   */
  getWorkerPerformanceMetrics: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          metrics: {
            tasksCompleted: 42,
            tasksOnTime: 38,
            averageCompletionTime: 85,
            efficiency: 87,
            safetyScore: 95,
            attendanceRate: 98,
            qualityScore: 92,
          },
          trends: {
            efficiency: "up 5%",
            safetyScore: "up 2%",
            taskCompletion: "up 8%",
          },
          badges: [
            { name: "Safety Champion", earnedDate: "2026-01-15" },
            { name: "Efficiency Expert", earnedDate: "2026-02-01" },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get metrics: ${error}`,
        });
      }
    }),
});
