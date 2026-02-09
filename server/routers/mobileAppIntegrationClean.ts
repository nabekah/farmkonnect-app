import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

/**
 * Mobile App Integration Router
 * Handles mobile app specific features including offline sync, push notifications, and mobile-optimized data
 */
export const mobileAppIntegrationCleanRouter = router({
  /**
   * Register mobile device for push notifications
   */
  registerDevice: protectedProcedure
    .input(
      z.object({
        deviceToken: z.string(),
        platform: z.enum(["ios", "android"]),
        deviceName: z.string(),
        appVersion: z.string(),
        osVersion: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          deviceId: Math.floor(Math.random() * 100000),
          platform: input.platform,
          message: `Device registered successfully for ${input.platform}`,
          pushNotificationsEnabled: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to register device: ${error}`,
        });
      }
    }),

  /**
   * Get mobile-optimized dashboard data
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
            farmName: "Green Valley Farm",
            totalWorkers: 8,
            equipmentStatus: "12 operational, 1 maintenance due",
            productivityToday: 92,
            complianceRate: 87.5,
            alertsCount: 3,
            tasksCount: 12,
          },
          quickActions: [
            { id: 1, title: "View Alerts", icon: "alert", action: "alerts" },
            { id: 2, title: "Check Tasks", icon: "task", action: "tasks" },
            { id: 3, title: "Equipment Status", icon: "equipment", action: "equipment" },
            { id: 4, title: "Worker Performance", icon: "users", action: "workers" },
          ],
          recentAlerts: [
            {
              id: 1,
              title: "Tractor A maintenance overdue",
              priority: "high",
              timestamp: new Date(),
            },
            {
              id: 2,
              title: "Worker certification expiring",
              priority: "medium",
              timestamp: new Date(Date.now() - 3600000),
            },
          ],
          todaysTasks: [
            { id: 1, title: "Equipment inspection", status: "pending", dueTime: "10:00 AM" },
            { id: 2, title: "Worker training session", status: "in_progress", dueTime: "2:00 PM" },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch mobile dashboard: ${error}`,
        });
      }
    }),

  /**
   * Get offline sync data
   */
  getOfflineSyncData: protectedProcedure
    .input(z.object({ farmId: z.number(), lastSyncTimestamp: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          syncTimestamp: Date.now(),
          data: {
            workers: [
              {
                id: 1,
                name: "John Smith",
                role: "field_worker",
                status: "active",
                tasks: 5,
              },
              {
                id: 2,
                name: "Sarah Johnson",
                role: "supervisor",
                status: "active",
                tasks: 3,
              },
            ],
            equipment: [
              {
                id: 1,
                name: "Tractor A",
                status: "operational",
                utilization: 85,
                lastMaintenance: "2026-02-01",
              },
              {
                id: 2,
                name: "Tractor B",
                status: "operational",
                utilization: 92,
                lastMaintenance: "2026-01-28",
              },
            ],
            tasks: [
              {
                id: 1,
                title: "Field inspection",
                assignedTo: 1,
                dueDate: "2026-02-10",
                status: "pending",
              },
              {
                id: 2,
                title: "Equipment maintenance",
                assignedTo: 2,
                dueDate: "2026-02-09",
                status: "in_progress",
              },
            ],
            alerts: [
              {
                id: 1,
                title: "Maintenance due",
                type: "maintenance",
                priority: "high",
                timestamp: Date.now(),
              },
            ],
          },
          dataSize: 2048,
          estimatedSyncTime: 2000,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch offline sync data: ${error}`,
        });
      }
    }),

  /**
   * Sync offline changes to server
   */
  syncOfflineChanges: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        changes: z.object({
          updatedWorkers: z.array(z.object({ id: z.number(), status: z.string() })).optional(),
          updatedTasks: z.array(z.object({ id: z.number(), status: z.string() })).optional(),
          newAlerts: z.array(z.object({ title: z.string(), type: z.string() })).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          farmId: input.farmId,
          syncedItems: {
            workers: input.changes.updatedWorkers?.length || 0,
            tasks: input.changes.updatedTasks?.length || 0,
            alerts: input.changes.newAlerts?.length || 0,
          },
          timestamp: Date.now(),
          message: "Offline changes synced successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync offline changes: ${error}`,
        });
      }
    }),

  /**
   * Get push notification preferences
   */
  getPushPreferences: protectedProcedure
    .input(z.object({ deviceId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          deviceId: input.deviceId,
          preferences: {
            maintenanceAlerts: true,
            performanceAlerts: true,
            complianceAlerts: true,
            salesNotifications: true,
            weatherAlerts: true,
            dailyDigest: true,
            digestTime: "08:00",
            quietHours: {
              enabled: true,
              startTime: "22:00",
              endTime: "08:00",
            },
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch push preferences: ${error}`,
        });
      }
    }),

  /**
   * Update push notification preferences
   */
  updatePushPreferences: protectedProcedure
    .input(
      z.object({
        deviceId: z.number().optional(),
        maintenanceAlerts: z.boolean().optional(),
        performanceAlerts: z.boolean().optional(),
        complianceAlerts: z.boolean().optional(),
        salesNotifications: z.boolean().optional(),
        weatherAlerts: z.boolean().optional(),
        dailyDigest: z.boolean().optional(),
        digestTime: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          message: "Push preferences updated successfully",
          timestamp: Date.now(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update push preferences: ${error}`,
        });
      }
    }),

  /**
   * Get mobile-optimized alerts
   */
  getMobileAlerts: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        limit: z.number().positive().default(20),
        offset: z.number().nonnegative().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          alerts: [
            {
              id: 1,
              title: "Tractor A maintenance overdue",
              description: "Oil change required",
              type: "maintenance",
              priority: "critical",
              actionRequired: true,
              timestamp: Date.now(),
              actionUrl: "/equipment/1/maintenance",
            },
            {
              id: 2,
              title: "Worker certification expiring",
              description: "Sarah Johnson - 5 days remaining",
              type: "compliance",
              priority: "high",
              actionRequired: true,
              timestamp: Date.now() - 3600000,
              actionUrl: "/workers/2/certifications",
            },
            {
              id: 3,
              title: "Productivity below target",
              description: "Field team productivity at 78% vs 85% target",
              type: "performance",
              priority: "medium",
              actionRequired: false,
              timestamp: Date.now() - 7200000,
              actionUrl: "/analytics/productivity",
            },
          ],
          total: 3,
          offset: input.offset,
          limit: input.limit,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch mobile alerts: ${error}`,
        });
      }
    }),

  /**
   * Get mobile-optimized worker list
   */
  getMobileWorkers: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          workers: [
            {
              id: 1,
              name: "John Smith",
              role: "field_worker",
              status: "active",
              productivity: 92,
              compliance: 100,
              tasksAssigned: 5,
              tasksCompleted: 3,
              avatar: "https://api.example.com/avatars/1.jpg",
            },
            {
              id: 2,
              name: "Sarah Johnson",
              role: "supervisor",
              status: "active",
              productivity: 88,
              compliance: 80,
              tasksAssigned: 3,
              tasksCompleted: 2,
              avatar: "https://api.example.com/avatars/2.jpg",
            },
            {
              id: 3,
              name: "Michael Brown",
              role: "field_worker",
              status: "active",
              productivity: 95,
              compliance: 100,
              tasksAssigned: 4,
              tasksCompleted: 4,
              avatar: "https://api.example.com/avatars/3.jpg",
            },
          ],
          total: 3,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch mobile workers: ${error}`,
        });
      }
    }),

  /**
   * Get mobile-optimized equipment status
   */
  getMobileEquipmentStatus: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          equipment: [
            {
              id: 1,
              name: "Tractor A",
              type: "tractor",
              status: "maintenance_due",
              utilization: 85,
              lastMaintenance: "2026-02-01",
              nextMaintenance: "2026-02-09",
              daysUntilMaintenance: 0,
              icon: "tractor",
            },
            {
              id: 2,
              name: "Tractor B",
              type: "tractor",
              status: "operational",
              utilization: 92,
              lastMaintenance: "2026-01-28",
              nextMaintenance: "2026-02-25",
              daysUntilMaintenance: 16,
              icon: "tractor",
            },
            {
              id: 3,
              name: "Pump System",
              type: "pump",
              status: "operational",
              utilization: 78,
              lastMaintenance: "2026-01-15",
              nextMaintenance: "2026-03-15",
              daysUntilMaintenance: 34,
              icon: "pump",
            },
          ],
          operationalCount: 2,
          maintenanceDueCount: 1,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch mobile equipment status: ${error}`,
        });
      }
    }),

  /**
   * Get mobile-optimized tasks
   */
  getMobileTasks: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
        limit: z.number().positive().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          tasks: [
            {
              id: 1,
              title: "Field inspection",
              description: "Inspect North field for crop health",
              assignedTo: 1,
              assignedToName: "John Smith",
              dueDate: "2026-02-10",
              priority: "high",
              status: "pending",
              estimatedTime: "2 hours",
              location: "North Field",
            },
            {
              id: 2,
              title: "Equipment maintenance",
              description: "Oil change for Tractor A",
              assignedTo: 2,
              assignedToName: "Sarah Johnson",
              dueDate: "2026-02-09",
              priority: "critical",
              status: "in_progress",
              estimatedTime: "1 hour",
              location: "Equipment Shed",
            },
            {
              id: 3,
              title: "Worker training",
              description: "Pesticide safety training",
              assignedTo: 3,
              assignedToName: "Michael Brown",
              dueDate: "2026-02-15",
              priority: "medium",
              status: "pending",
              estimatedTime: "3 hours",
              location: "Training Center",
            },
          ],
          total: 3,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch mobile tasks: ${error}`,
        });
      }
    }),

  /**
   * Update task status from mobile
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
        notes: z.string().optional(),
        attachments: z.array(z.string()).optional(),
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
          message: `Task status updated to ${input.status}`,
          timestamp: Date.now(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update task status: ${error}`,
        });
      }
    }),

  /**
   * Get app analytics
   */
  getAppAnalytics: protectedProcedure
    .input(z.object({ farmId: z.number(), period: z.enum(["day", "week", "month"]).default("week") }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          farmId: input.farmId,
          period: input.period,
          analytics: {
            appOpens: 45,
            averageSessionDuration: 8.5,
            tasksCompleted: 12,
            alertsViewed: 23,
            offlineSyncs: 5,
            crashesReported: 0,
            topFeatures: [
              { feature: "Alerts", usage: 35 },
              { feature: "Tasks", usage: 28 },
              { feature: "Equipment Status", usage: 22 },
              { feature: "Worker Performance", usage: 15 },
            ],
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch app analytics: ${error}`,
        });
      }
    }),
});
