import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { realtimeNotificationsService } from "../services/realtimeNotificationsService";

/**
 * Real-time Notifications Router
 * Handles WebSocket connections, notification delivery, and preference management
 */
export const realtimeNotificationsCleanRouter = router({
  /**
   * Get user notifications
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().positive().default(50),
        offset: z.number().nonnegative().default(0),
        type: z.enum(["maintenance", "performance", "sales", "compliance", "alert"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const notifications = await realtimeNotificationsService.getUserNotifications(
          ctx.user?.id || 1,
          input.limit + input.offset
        );

        const filtered = input.type
          ? notifications.filter((n) => n.type === input.type)
          : notifications;

        return {
          notifications: filtered.slice(input.offset, input.offset + input.limit),
          total: filtered.length,
          offset: input.offset,
          limit: input.limit,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch notifications: ${error}`,
        });
      }
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const unreadCount = await realtimeNotificationsService.getUnreadCount(ctx.user?.id || 1);
      return { unreadCount };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch unread count: ${error}`,
      });
    }
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.markAsRead(ctx.user?.id || 1, input.notificationId);
        return { success: true, message: "Notification marked as read" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to mark notification as read: ${error}`,
        });
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await realtimeNotificationsService.markAllAsRead(ctx.user?.id || 1);
      return { success: true, message: "All notifications marked as read" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to mark all notifications as read: ${error}`,
      });
    }
  }),

  /**
   * Delete notification
   */
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.deleteNotification(ctx.user?.id || 1, input.notificationId);
        return { success: true, message: "Notification deleted" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete notification: ${error}`,
        });
      }
    }),

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const preferences = await realtimeNotificationsService.getPreferences(ctx.user?.id || 1);
      return preferences;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch preferences: ${error}`,
      });
    }
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        maintenanceAlerts: z.boolean().optional(),
        performanceAlerts: z.boolean().optional(),
        salesAlerts: z.boolean().optional(),
        complianceAlerts: z.boolean().optional(),
        digestFrequency: z.enum(["immediate", "daily", "weekly"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.updatePreferences(ctx.user?.id || 1, input);
        return { success: true, message: "Preferences updated successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update preferences: ${error}`,
        });
      }
    }),

  /**
   * Get notification statistics
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await realtimeNotificationsService.getNotificationStats(ctx.user?.id || 1);
      return stats;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch notification statistics: ${error}`,
      });
    }
  }),

  /**
   * Send maintenance alert (admin only)
   */
  sendMaintenanceAlert: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        farmId: z.number(),
        equipmentName: z.string(),
        maintenanceType: z.string(),
        daysOverdue: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.sendMaintenanceAlert(
          input.userId,
          input.farmId,
          input.equipmentName,
          input.maintenanceType,
          input.daysOverdue
        );
        return { success: true, message: "Maintenance alert sent" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send maintenance alert: ${error}`,
        });
      }
    }),

  /**
   * Send performance alert (admin only)
   */
  sendPerformanceAlert: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        farmId: z.number(),
        workerName: z.string(),
        metric: z.string(),
        value: z.number(),
        threshold: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.sendPerformanceAlert(
          input.userId,
          input.farmId,
          input.workerName,
          input.metric,
          input.value,
          input.threshold
        );
        return { success: true, message: "Performance alert sent" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send performance alert: ${error}`,
        });
      }
    }),

  /**
   * Send sales notification
   */
  sendSalesNotification: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        farmId: z.number(),
        productName: z.string(),
        quantity: z.number(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.sendSalesNotification(
          input.userId,
          input.farmId,
          input.productName,
          input.quantity,
          input.amount
        );
        return { success: true, message: "Sales notification sent" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send sales notification: ${error}`,
        });
      }
    }),

  /**
   * Send compliance alert
   */
  sendComplianceAlert: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        farmId: z.number(),
        workerName: z.string(),
        missingCertifications: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await realtimeNotificationsService.sendComplianceAlert(
          input.userId,
          input.farmId,
          input.workerName,
          input.missingCertifications
        );
        return { success: true, message: "Compliance alert sent" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send compliance alert: ${error}`,
        });
      }
    }),

  /**
   * Clear all notifications
   */
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user?.id || 1;
      const notifications = await realtimeNotificationsService.getUserNotifications(userId, 1000);
      for (const notification of notifications) {
        await realtimeNotificationsService.deleteNotification(userId, notification.id);
      }
      return { success: true, message: "All notifications cleared" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to clear notifications: ${error}`,
      });
    }
  }),
});
