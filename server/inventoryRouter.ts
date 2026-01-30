import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  inventoryItems,
  inventoryTransactions,
  lowStockAlerts,
  inventoryForecasts,
  inventoryAuditLogs,
  marketplaceProducts,
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const inventoryRouter = router({
  // Get inventory for a product
  getInventory: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }: any) => {
      const inventory = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.productId, input.productId))
        .limit(1);

      return inventory[0] || null;
    }),

  // Update inventory stock
  updateStock: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.string(),
        transactionType: z.enum([
          "purchase",
          "sale",
          "adjustment",
          "restock",
          "damage",
          "return",
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const inventory = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.productId, input.productId))
        .limit(1);

      if (!inventory[0]) {
        throw new Error("Inventory not found");
      }

      const currentStock = parseFloat(inventory[0].currentStock as any);
      const quantityChange = parseFloat(input.quantity);
      const newStock =
        input.transactionType === "sale" ||
        input.transactionType === "damage"
          ? currentStock - quantityChange
          : currentStock + quantityChange;

      // Update inventory
      await ctx.db
        .update(inventoryItems)
        .set({
          currentStock: newStock.toString(),
          availableStock: (
            newStock - parseFloat(inventory[0].reservedStock as any)
          ).toString(),
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.productId, input.productId));

      // Record transaction
      await ctx.db.insert(inventoryTransactions).values({
        productId: input.productId,
        transactionType: input.transactionType,
        quantity: input.quantity,
        notes: input.notes,
      });

      // Check if low stock alert needed
      if (
        newStock <= parseFloat(inventory[0].minimumThreshold as any) &&
        newStock > 0
      ) {
        const existingAlert = await ctx.db
          .select()
          .from(lowStockAlerts)
          .where(
            and(
              eq(lowStockAlerts.productId, input.productId),
              eq(lowStockAlerts.acknowledged, false)
            )
          )
          .limit(1);

        if (!existingAlert[0]) {
          const product = await ctx.db
            .select()
            .from(marketplaceProducts)
            .where(eq(marketplaceProducts.id, input.productId))
            .limit(1);

          if (product[0]) {
            await ctx.db.insert(lowStockAlerts).values({
              productId: input.productId,
              sellerId: product[0].sellerId,
              alertType: newStock === 0 ? "out_of_stock" : "low_stock",
              currentStock: newStock.toString(),
              minimumThreshold: inventory[0].minimumThreshold,
            });
          }
        }
      }

      return { success: true, newStock };
    }),

  // Set minimum threshold
  setMinimumThreshold: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        minimumThreshold: z.string(),
        reorderQuantity: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      await ctx.db
        .update(inventoryItems)
        .set({
          minimumThreshold: input.minimumThreshold,
          reorderQuantity: input.reorderQuantity,
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.productId, input.productId));

      return { success: true };
    }),

  // Get low stock alerts for seller
  getLowStockAlerts: protectedProcedure
    .input(z.object({ sellerId: z.number().optional() }))
    .query(async ({ ctx, input }: any) => {
      const sellerId = input.sellerId || ctx.user.id;

      const alerts = await ctx.db
        .select()
        .from(lowStockAlerts)
        .where(eq(lowStockAlerts.sellerId, sellerId))
        .orderBy(desc(lowStockAlerts.createdAt));

      return alerts;
    }),

  // Acknowledge alert
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      await ctx.db
        .update(lowStockAlerts)
        .set({
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: ctx.user.id,
        })
        .where(eq(lowStockAlerts.id, input.alertId));

      return { success: true };
    }),

  // Get inventory transactions
  getTransactions: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }: any) => {
      const transactions = await ctx.db
        .select()
        .from(inventoryTransactions)
        .where(eq(inventoryTransactions.productId, input.productId))
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(input.limit);

      return transactions;
    }),

  // Get inventory forecast
  getForecast: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }: any) => {
      const forecast = await ctx.db
        .select()
        .from(inventoryForecasts)
        .where(eq(inventoryForecasts.productId, input.productId))
        .orderBy(desc(inventoryForecasts.forecastDate))
        .limit(30);

      return forecast;
    }),

  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }: any) => {
      const logs = await ctx.db
        .select()
        .from(inventoryAuditLogs)
        .where(eq(inventoryAuditLogs.productId, input.productId))
        .orderBy(desc(inventoryAuditLogs.createdAt))
        .limit(100);

      return logs;
    }),

  // Get inventory summary for seller
  getInventorySummary: protectedProcedure
    .input(z.object({ sellerId: z.number().optional() }))
    .query(async ({ ctx, input }: any) => {
      const sellerId = input.sellerId || ctx.user.id;

      const products = await ctx.db
        .select()
        .from(marketplaceProducts)
        .leftJoin(
          inventoryItems,
          eq(marketplaceProducts.id, inventoryItems.productId)
        )
        .where(eq(marketplaceProducts.sellerId, sellerId));

      const lowStockCount = products.filter(
        (p: any) =>
          p.inventory_items?.currentStock &&
          p.inventory_items?.minimumThreshold &&
          parseFloat(p.inventory_items.currentStock as any) <=
            parseFloat(p.inventory_items.minimumThreshold as any)
      ).length;

      const outOfStockCount = products.filter(
        (p: any) =>
          !p.inventory_items?.currentStock ||
          parseFloat(p.inventory_items?.currentStock as any) === 0
      ).length;

      return {
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
        products,
      };
    }),
});
