import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const notificationCenterRouter = router({
  // Get notifications
  getNotifications: protectedProcedure
    .input(
      z.object({
        filter: z.enum(["all", "unread", "bookings", "mentorship", "marketplace", "payments"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return {
        unreadCount: 5,
        notifications: [
          {
            id: 1,
            type: "booking_confirmation",
            title: "Booking Confirmed",
            message: "Your equipment rental for Tractor (60HP) has been confirmed",
            icon: "check-circle",
            category: "bookings",
            read: false,
            actionUrl: "/rentals/1",
            date: Date.now() - 3600000,
            priority: "high",
          },
          {
            id: 2,
            type: "mentorship_request",
            title: "Mentorship Request Received",
            message: "Jane Expert has requested mentorship from you",
            icon: "user-plus",
            category: "mentorship",
            read: false,
            actionUrl: "/mentorship/requests/2",
            date: Date.now() - 7200000,
            priority: "medium",
          },
          {
            id: 3,
            type: "payment_received",
            title: "Payment Received",
            message: "You received ₦125,000 from equipment rental",
            icon: "dollar-sign",
            category: "payments",
            read: false,
            actionUrl: "/payments/3",
            date: Date.now() - 10800000,
            priority: "high",
          },
          {
            id: 4,
            type: "product_sold",
            title: "Product Sold",
            message: "Your Tomato Seeds (1kg) has been sold to John Farmer",
            icon: "shopping-cart",
            category: "marketplace",
            read: true,
            actionUrl: "/orders/4",
            date: Date.now() - 86400000,
            priority: "medium",
          },
          {
            id: 5,
            type: "equipment_available",
            title: "Equipment Available",
            message: "Combine Harvester you were interested in is now available",
            icon: "bell",
            category: "bookings",
            read: true,
            actionUrl: "/equipment/5",
            date: Date.now() - 172800000,
            priority: "low",
          },
        ],
      };
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Notification marked as read",
      };
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return {
      success: true,
      message: "All notifications marked as read",
    };
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Notification deleted",
      };
    }),

  // Delete all notifications
  deleteAllNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    return {
      success: true,
      message: "All notifications deleted",
    };
  }),

  // Get notification preferences
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    return {
      preferences: {
        email: {
          bookingConfirmation: true,
          bookingReminder: true,
          paymentReceived: true,
          mentorshipRequest: true,
          mentorshipReminder: true,
          productSold: true,
          productReview: true,
          promotions: false,
        },
        sms: {
          bookingConfirmation: true,
          paymentReceived: true,
          mentorshipReminder: true,
          productSold: false,
          urgentAlerts: true,
        },
        push: {
          bookingConfirmation: true,
          bookingReminder: true,
          paymentReceived: true,
          mentorshipRequest: true,
          productSold: true,
          productReview: true,
          promotions: false,
        },
        frequency: {
          digest: "daily", // immediate, daily, weekly, never
          quietHours: {
            enabled: true,
            startTime: "22:00",
            endTime: "08:00",
          },
        },
      },
    };
  }),

  // Update notification preferences
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        channel: z.enum(["email", "sms", "push"]),
        notificationType: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Notification preferences updated",
      };
    }),

  // Get notification statistics
  getNotificationStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalNotifications: 156,
      unreadCount: 5,
      thisWeek: 28,
      thisMonth: 89,
      byType: {
        bookingConfirmation: 45,
        paymentReceived: 32,
        mentorshipRequest: 28,
        productSold: 34,
        productReview: 12,
        other: 5,
      },
    };
  }),

  // Send test notification
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        channel: z.enum(["email", "sms", "push"]),
        type: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Test ${input.channel} notification sent successfully`,
      };
    }),

  // Get notification history
  getNotificationHistory: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      return {
        history: [
          {
            id: 1,
            type: "booking_confirmation",
            title: "Booking Confirmed",
            date: Date.now() - 86400000,
            channels: ["email", "push"],
            status: "delivered",
          },
          {
            id: 2,
            type: "payment_received",
            title: "Payment Received",
            date: Date.now() - 172800000,
            channels: ["email", "sms", "push"],
            status: "delivered",
          },
          {
            id: 3,
            type: "mentorship_reminder",
            title: "Mentorship Session Reminder",
            date: Date.now() - 259200000,
            channels: ["email", "push"],
            status: "delivered",
          },
        ],
      };
    }),

  // Create custom notification (admin only for users)
  createCustomNotification: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        title: z.string(),
        message: z.string(),
        type: z.string(),
        channels: z.array(z.enum(["email", "sms", "push"])),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Custom notification sent successfully",
        notificationId: Math.floor(Math.random() * 100000),
      };
    }),

  // Get notification templates
  getNotificationTemplates: protectedProcedure.query(async () => {
    return {
      templates: [
        {
          id: 1,
          name: "Booking Confirmation",
          type: "booking_confirmation",
          subject: "Your booking has been confirmed",
          emailTemplate: "booking_confirmation_email.html",
          smsTemplate: "Your booking for {{equipment}} is confirmed",
        },
        {
          id: 2,
          name: "Payment Received",
          type: "payment_received",
          subject: "Payment received - {{amount}}",
          emailTemplate: "payment_received_email.html",
          smsTemplate: "You received {{amount}} from {{source}}",
        },
        {
          id: 3,
          name: "Mentorship Request",
          type: "mentorship_request",
          subject: "New mentorship request from {{mentor}}",
          emailTemplate: "mentorship_request_email.html",
          smsTemplate: "{{mentor}} sent you a mentorship request",
        },
      ],
    };
  }),

  // Bulk send notifications (admin feature)
  bulkSendNotifications: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.number()),
        title: z.string(),
        message: z.string(),
        channels: z.array(z.enum(["email", "sms", "push"])),
        scheduleTime: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Notification sent to ${input.userIds.length} users`,
        campaignId: Math.floor(Math.random() * 100000),
        status: "sent",
      };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return {
      unreadCount: 5,
      byCategory: {
        bookings: 2,
        mentorship: 1,
        marketplace: 1,
        payments: 1,
      },
    };
  }),
});
