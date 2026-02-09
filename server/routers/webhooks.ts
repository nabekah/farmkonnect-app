import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";

export const webhooksRouter = router({
  // Create webhook
  createWebhook: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        eventType: z.enum([
          "failed_login",
          "suspicious_device",
          "budget_exceeded",
          "access_denied",
          "prescription_alert",
          "appointment_reminder",
          "vet_recommendation",
        ]),
        targetUrl: z.string().url(),
        isActive: z.boolean().default(true),
        retryPolicy: z.object({
          maxRetries: z.number().default(3),
          retryDelayMs: z.number().default(5000),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb(ctx.user.id);
      
      // Verify farm ownership
      const farm = await db.query.farms.findFirst({
        where: (farms, { eq }) => eq(farms.id, input.farmId),
      });

      if (!farm || farm.ownerId !== ctx.user.id) {
        throw new Error("Unauthorized: Farm not found or not owned by user");
      }

      const webhookId = Math.random().toString(36).substr(2, 9);
      
      return {
        id: webhookId,
        farmId: input.farmId,
        name: input.name,
        description: input.description,
        eventType: input.eventType,
        targetUrl: input.targetUrl,
        isActive: input.isActive,
        retryPolicy: input.retryPolicy,
        createdAt: new Date(),
        lastTriggeredAt: null,
        successCount: 0,
        failureCount: 0,
      };
    }),

  // List webhooks
  listWebhooks: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb(ctx.user.id);
      
      // Verify farm ownership
      const farm = await db.query.farms.findFirst({
        where: (farms, { eq }) => eq(farms.id, input.farmId),
      });

      if (!farm || farm.ownerId !== ctx.user.id) {
        throw new Error("Unauthorized: Farm not found or not owned by user");
      }

      // Return mock webhooks
      return [
        {
          id: "webhook-1",
          farmId: input.farmId,
          name: "Failed Login Alert",
          description: "Trigger workflow on failed login",
          eventType: "failed_login",
          targetUrl: "https://api.farmkonnect.com/webhooks/failed-login",
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          successCount: 42,
          failureCount: 2,
        },
        {
          id: "webhook-2",
          farmId: input.farmId,
          name: "Budget Exceeded",
          description: "Trigger workflow when budget is exceeded",
          eventType: "budget_exceeded",
          targetUrl: "https://api.farmkonnect.com/webhooks/budget-alert",
          isActive: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastTriggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          successCount: 18,
          failureCount: 0,
        },
      ];
    }),

  // Update webhook
  updateWebhook: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        farmId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        targetUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb(ctx.user.id);
      
      // Verify farm ownership
      const farm = await db.query.farms.findFirst({
        where: (farms, { eq }) => eq(farms.id, input.farmId),
      });

      if (!farm || farm.ownerId !== ctx.user.id) {
        throw new Error("Unauthorized: Farm not found or not owned by user");
      }

      return {
        id: input.webhookId,
        farmId: input.farmId,
        name: input.name || "Updated Webhook",
        description: input.description,
        targetUrl: input.targetUrl,
        isActive: input.isActive !== undefined ? input.isActive : true,
        updatedAt: new Date(),
      };
    }),

  // Delete webhook
  deleteWebhook: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb(ctx.user.id);
      
      // Verify farm ownership
      const farm = await db.query.farms.findFirst({
        where: (farms, { eq }) => eq(farms.id, input.farmId),
      });

      if (!farm || farm.ownerId !== ctx.user.id) {
        throw new Error("Unauthorized: Farm not found or not owned by user");
      }

      return { success: true, webhookId: input.webhookId };
    }),

  // Test webhook
  testWebhook: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        farmId: z.number(),
        eventType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb(ctx.user.id);
      
      // Verify farm ownership
      const farm = await db.query.farms.findFirst({
        where: (farms, { eq }) => eq(farms.id, input.farmId),
      });

      if (!farm || farm.ownerId !== ctx.user.id) {
        throw new Error("Unauthorized: Farm not found or not owned by user");
      }

      // Simulate webhook call
      try {
        const response = await fetch("https://api.farmkonnect.com/webhooks/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookId: input.webhookId,
            eventType: input.eventType,
            farmId: input.farmId,
            timestamp: new Date(),
          }),
        });

        return {
          success: response.ok,
          statusCode: response.status,
          message: response.ok ? "Webhook test successful" : "Webhook test failed",
        };
      } catch (error) {
        return {
          success: false,
          statusCode: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get webhook delivery history
  getWebhookHistory: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        farmId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = getDb(ctx.user.id);
      
      // Verify farm ownership
      const farm = await db.query.farms.findFirst({
        where: (farms, { eq }) => eq(farms.id, input.farmId),
      });

      if (!farm || farm.ownerId !== ctx.user.id) {
        throw new Error("Unauthorized: Farm not found or not owned by user");
      }

      // Return mock delivery history
      return [
        {
          id: "delivery-1",
          webhookId: input.webhookId,
          eventType: "failed_login",
          status: "success",
          statusCode: 200,
          deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          responseTime: 245,
        },
        {
          id: "delivery-2",
          webhookId: input.webhookId,
          eventType: "failed_login",
          status: "success",
          statusCode: 200,
          deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          responseTime: 312,
        },
        {
          id: "delivery-3",
          webhookId: input.webhookId,
          eventType: "failed_login",
          status: "failed",
          statusCode: 500,
          deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          responseTime: 5000,
        },
      ];
    }),
});
