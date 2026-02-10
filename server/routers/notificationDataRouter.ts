import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { notificationLogs } from "../../drizzle/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export const notificationDataRouter = router({
  // Get notification history with filtering
  getNotificationHistory: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(["breeding", "vaccination", "harvest", "stock", "weather", "order", "all"]).optional(),
        channel: z.enum(["push", "email", "sms", "all"]).optional(),
        status: z.enum(["sent", "delivered", "failed", "pending", "all"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        // Build where conditions
        const conditions: any[] = [eq(notificationLogs.userId, input.userId)];
        
        if (input.type && input.type !== "all") {
          conditions.push(eq(notificationLogs.notificationType, input.type));
        }
        
        if (input.channel && input.channel !== "all") {
          conditions.push(eq(notificationLogs.channel, input.channel));
        }
        
        if (input.status && input.status !== "all") {
          conditions.push(eq(notificationLogs.status, input.status));
        }
        
        if (input.startDate) {
          conditions.push(gte(notificationLogs.createdAt, input.startDate.getTime()));
        }
        
        if (input.endDate) {
          conditions.push(lte(notificationLogs.createdAt, input.endDate.getTime()));
        }
        
        // Query notifications
        const notifications = await db
          .select()
          .from(notificationLogs)
          .where(and(...conditions))
          .orderBy(desc(notificationLogs.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        
        // Get total count
        const countResult = await db
          .select({ count: notificationLogs.id })
          .from(notificationLogs)
          .where(and(...conditions));
        
        return {
          notifications: notifications.map((n) => ({
            id: n.id,
            type: n.notificationType,
            channel: n.channel,
            status: n.status,
            subject: n.subject,
            message: n.message,
            createdAt: new Date(n.createdAt),
            deliveredAt: n.deliveredAt ? new Date(n.deliveredAt) : null,
            failureReason: n.failureReason,
            retryCount: n.retryCount,
          })),
          total: countResult[0]?.count || 0,
        };
      } catch (error) {
        console.error("Error fetching notification history:", error);
        throw new Error("Failed to fetch notification history");
      }
    }),

  // Get delivery statistics
  getDeliveryStatistics: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        const conditions: any[] = [eq(notificationLogs.userId, input.userId)];
        
        if (input.startDate) {
          conditions.push(gte(notificationLogs.createdAt, input.startDate.getTime()));
        }
        
        if (input.endDate) {
          conditions.push(lte(notificationLogs.createdAt, input.endDate.getTime()));
        }
        
        // Get all notifications for the user in the date range
        const allNotifications = await db
          .select()
          .from(notificationLogs)
          .where(and(...conditions));
        
        // Calculate statistics
        const total = allNotifications.length;
        const delivered = allNotifications.filter((n) => n.status === "delivered").length;
        const failed = allNotifications.filter((n) => n.status === "failed").length;
        const pending = allNotifications.filter((n) => n.status === "pending").length;
        const successRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : "0";
        
        // Calculate by channel
        const byChannel = {
          push: {
            sent: allNotifications.filter((n) => n.channel === "push").length,
            delivered: allNotifications.filter((n) => n.channel === "push" && n.status === "delivered").length,
            failed: allNotifications.filter((n) => n.channel === "push" && n.status === "failed").length,
          },
          email: {
            sent: allNotifications.filter((n) => n.channel === "email").length,
            delivered: allNotifications.filter((n) => n.channel === "email" && n.status === "delivered").length,
            failed: allNotifications.filter((n) => n.channel === "email" && n.status === "failed").length,
          },
          sms: {
            sent: allNotifications.filter((n) => n.channel === "sms").length,
            delivered: allNotifications.filter((n) => n.channel === "sms" && n.status === "delivered").length,
            failed: allNotifications.filter((n) => n.channel === "sms" && n.status === "failed").length,
          },
        };
        
        // Calculate by type
        const types = ["breeding", "vaccination", "harvest", "stock", "weather", "order"];
        const byType: Record<string, any> = {};
        
        types.forEach((type) => {
          const typeNotifications = allNotifications.filter((n) => n.notificationType === type);
          byType[type] = {
            sent: typeNotifications.length,
            delivered: typeNotifications.filter((n) => n.status === "delivered").length,
            failed: typeNotifications.filter((n) => n.status === "failed").length,
            successRate: typeNotifications.length > 0 
              ? ((typeNotifications.filter((n) => n.status === "delivered").length / typeNotifications.length) * 100).toFixed(2)
              : "0",
          };
        });
        
        // Calculate average retries
        const totalRetries = allNotifications.reduce((sum, n) => sum + (n.retryCount || 0), 0);
        const averageRetries = total > 0 ? (totalRetries / total).toFixed(2) : "0";
        
        return {
          total,
          delivered,
          failed,
          pending,
          successRate: parseFloat(successRate),
          averageRetries: parseFloat(averageRetries),
          byChannel,
          byType,
        };
      } catch (error) {
        console.error("Error fetching delivery statistics:", error);
        throw new Error("Failed to fetch delivery statistics");
      }
    }),

  // Get 7-day trend data
  getTrendData: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        // Get notifications from last 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        const notifications = await db
          .select()
          .from(notificationLogs)
          .where(
            and(
              eq(notificationLogs.userId, input.userId),
              gte(notificationLogs.createdAt, sevenDaysAgo)
            )
          );
        
        // Group by day
        const trendData: Record<string, any> = {};
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        
        days.forEach((day) => {
          trendData[day] = { date: day, sent: 0, delivered: 0, failed: 0 };
        });
        
        notifications.forEach((n) => {
          const date = new Date(n.createdAt);
          const dayIndex = date.getDay();
          const day = days[dayIndex === 0 ? 6 : dayIndex - 1];
          
          trendData[day].sent += 1;
          if (n.status === "delivered") trendData[day].delivered += 1;
          if (n.status === "failed") trendData[day].failed += 1;
        });
        
        return Object.values(trendData);
      } catch (error) {
        console.error("Error fetching trend data:", error);
        throw new Error("Failed to fetch trend data");
      }
    }),

  // Export notification history as CSV
  exportNotificationHistory: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(["breeding", "vaccination", "harvest", "stock", "weather", "order", "all"]).optional(),
        channel: z.enum(["push", "email", "sms", "all"]).optional(),
        status: z.enum(["sent", "delivered", "failed", "pending", "all"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        // Build where conditions
        const conditions: any[] = [eq(notificationLogs.userId, input.userId)];
        
        if (input.type && input.type !== "all") {
          conditions.push(eq(notificationLogs.notificationType, input.type));
        }
        
        if (input.channel && input.channel !== "all") {
          conditions.push(eq(notificationLogs.channel, input.channel));
        }
        
        if (input.status && input.status !== "all") {
          conditions.push(eq(notificationLogs.status, input.status));
        }
        
        if (input.startDate) {
          conditions.push(gte(notificationLogs.createdAt, input.startDate.getTime()));
        }
        
        if (input.endDate) {
          conditions.push(lte(notificationLogs.createdAt, input.endDate.getTime()));
        }
        
        // Query all notifications
        const notifications = await db
          .select()
          .from(notificationLogs)
          .where(and(...conditions))
          .orderBy(desc(notificationLogs.createdAt));
        
        // Convert to CSV format
        const headers = ["ID", "Type", "Channel", "Status", "Subject", "Message", "Created At", "Delivered At", "Retry Count"];
        const rows = notifications.map((n) => [
          n.id,
          n.notificationType,
          n.channel,
          n.status,
          n.subject || "",
          n.message || "",
          new Date(n.createdAt).toISOString(),
          n.deliveredAt ? new Date(n.deliveredAt).toISOString() : "",
          n.retryCount || 0,
        ]);
        
        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
        
        return {
          csv,
          filename: `notification-history-${Date.now()}.csv`,
        };
      } catch (error) {
        console.error("Error exporting notification history:", error);
        throw new Error("Failed to export notification history");
      }
    }),
});
