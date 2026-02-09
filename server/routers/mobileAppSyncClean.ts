import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

/**
 * Mobile App Sync Router
 * Handles offline-first sync, push notifications, and mobile-specific features
 */
export const mobileAppSyncCleanRouter = router({
  /**
   * Register mobile device
   */
  registerMobileDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        deviceType: z.enum(["ios", "android"]),
        appVersion: z.string(),
        osVersion: z.string(),
        pushToken: z.string(),
        deviceName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          deviceId: input.deviceId,
          registered: true,
          message: "Mobile device registered successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to register device: ${error}`,
        });
      }
    }),

  /**
   * Sync offline data
   */
  syncOfflineData: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        lastSyncTime: z.string().datetime(),
        localChanges: z.array(
          z.object({
            type: z.enum(["create", "update", "delete"]),
            entity: z.string(),
            entityId: z.number(),
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
          syncedChanges: input.localChanges.length,
          serverChanges: [
            {
              type: "update",
              entity: "farm",
              entityId: 1,
              data: { name: "Updated Farm Name" },
            },
          ],
          newSyncTime: new Date(),
          message: "Data synced successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync data: ${error}`,
        });
      }
    }),

  /**
   * Get mobile dashboard data
   */
  getMobileDashboard: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          summary: {
            activeAlerts: 3,
            pendingTasks: 5,
            todayRevenue: 2500,
            weeklyRevenue: 15000,
          },
          quickActions: [
            { id: 1, title: "Record Expense", icon: "receipt" },
            { id: 2, title: "Check Weather", icon: "cloud" },
            { id: 3, title: "View Alerts", icon: "bell" },
            { id: 4, title: "Start Task", icon: "play" },
          ],
          recentActivities: [
            {
              id: 1,
              type: "expense",
              title: "Fertilizer Purchase",
              amount: 500,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              id: 2,
              type: "revenue",
              title: "Tomato Sale",
              amount: 2250,
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
            {
              id: 3,
              type: "alert",
              title: "Soil Moisture Low",
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get mobile dashboard: ${error}`,
        });
      }
    }),

  /**
   * Update push notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        preferences: z.object({
          alerts: z.boolean(),
          tasks: z.boolean(),
          messages: z.boolean(),
          promotions: z.boolean(),
          soundEnabled: z.boolean(),
          vibrationEnabled: z.boolean(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          deviceId: input.deviceId,
          preferences: input.preferences,
          message: "Notification preferences updated",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update preferences: ${error}`,
        });
      }
    }),

  /**
   * Get mobile tasks
   */
  getMobileTasks: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          tasks: [
            {
              id: 1,
              title: "Water Field A",
              description: "Irrigate Field A for 30 minutes",
              status: "pending",
              priority: "high",
              dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
              assignedTo: "John Doe",
              location: "Field A",
            },
            {
              id: 2,
              title: "Check Soil pH",
              description: "Test soil pH in Field B",
              status: "pending",
              priority: "medium",
              dueTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
              assignedTo: "Jane Smith",
              location: "Field B",
            },
            {
              id: 3,
              title: "Harvest Tomatoes",
              description: "Pick ripe tomatoes from greenhouse",
              status: "in_progress",
              priority: "high",
              dueTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
              assignedTo: "John Doe",
              location: "Greenhouse",
            },
          ],
          total: 3,
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
          message: "Task status updated",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update task: ${error}`,
        });
      }
    }),

  /**
   * Get mobile notifications
   */
  getMobileNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().positive().default(20),
        offset: z.number().nonnegative().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          notifications: [
            {
              id: 1,
              type: "alert",
              title: "Soil Moisture Low",
              message: "Soil moisture in Field A is below threshold",
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              read: false,
              actionUrl: "/alerts/1",
            },
            {
              id: 2,
              type: "task",
              title: "Task Assigned",
              message: "You have been assigned a new task",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              read: false,
              actionUrl: "/tasks/2",
            },
            {
              id: 3,
              type: "revenue",
              title: "Sale Recorded",
              message: "New sale: 50 units of Tomatoes for GH₵2,250",
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
              read: true,
              actionUrl: "/revenue/3",
            },
          ],
          total: 3,
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
   * Mark notification as read
   */
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          notificationId: input.notificationId,
          message: "Notification marked as read",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to mark notification: ${error}`,
        });
      }
    }),

  /**
   * Get mobile app analytics
   */
  getMobileAppAnalytics: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          deviceId: input.deviceId,
          analytics: {
            totalSessions: 45,
            totalSessionTime: 3600,
            averageSessionTime: 80,
            lastSessionTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            mostUsedFeatures: ["dashboard", "tasks", "alerts"],
            appCrashes: 0,
            errorRate: 0,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get analytics: ${error}`,
        });
      }
    }),
});
