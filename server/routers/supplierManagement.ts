import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';

export const supplierManagementRouter = router({
  // Create supplier
  createSupplier: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        name: z.string(),
        contactPerson: z.string(),
        email: z.string().email(),
        phone: z.string(),
        address: z.string(),
        paymentTerms: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return {
          success: true,
          message: 'Supplier created successfully',
          supplierId: `SUP-${Date.now()}`,
          supplier: input,
        };
      } catch (error) {
        throw new Error('Failed to create supplier');
      }
    }),

  // Get suppliers
  getSuppliers: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const suppliers = [
          {
            id: 'SUP-001',
            name: 'Farm Feed Co',
            contactPerson: 'John Smith',
            email: 'john@farmfeed.com',
            phone: '555-0101',
            category: 'Feed & Supplies',
            paymentTerms: 'Net 30',
            lastOrder: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            totalSpent: 5000,
            rating: 4.5,
          },
          {
            id: 'SUP-002',
            name: 'Equipment Rentals Inc',
            contactPerson: 'Jane Doe',
            email: 'jane@equiprent.com',
            phone: '555-0102',
            category: 'Equipment',
            paymentTerms: 'Net 15',
            lastOrder: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            totalSpent: 8500,
            rating: 4.0,
          },
          {
            id: 'SUP-003',
            name: 'Labor Services LLC',
            contactPerson: 'Bob Johnson',
            email: 'bob@laborservices.com',
            phone: '555-0103',
            category: 'Labor',
            paymentTerms: 'Weekly',
            lastOrder: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            totalSpent: 12000,
            rating: 4.8,
          },
        ];

        return {
          suppliers,
          total: suppliers.length,
          farmId: input.farmId,
        };
      } catch (error) {
        throw new Error('Failed to get suppliers');
      }
    }),

  // Create purchase order
  createPurchaseOrder: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        supplierId: z.string(),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            category: z.string(),
          })
        ),
        deliveryDate: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        return {
          success: true,
          message: 'Purchase order created',
          poNumber: `PO-${Date.now()}`,
          supplierId: input.supplierId,
          items: input.items,
          totalAmount,
          status: 'pending',
          createdAt: new Date(),
          deliveryDate: input.deliveryDate,
        };
      } catch (error) {
        throw new Error('Failed to create purchase order');
      }
    }),

  // Get purchase orders
  getPurchaseOrders: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const orders = [
          {
            id: 'PO-001',
            poNumber: 'PO-2026-001',
            supplierId: 'SUP-001',
            supplierName: 'Farm Feed Co',
            items: [
              { description: 'Chicken Feed (50lb)', quantity: 10, unitPrice: 25, total: 250 },
              { description: 'Hay Bales', quantity: 50, unitPrice: 5, total: 250 },
            ],
            totalAmount: 500,
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'PO-002',
            poNumber: 'PO-2026-002',
            supplierId: 'SUP-002',
            supplierName: 'Equipment Rentals Inc',
            items: [
              { description: 'Tractor Rental', quantity: 1, unitPrice: 500, total: 500 },
              { description: 'Plow Attachment', quantity: 1, unitPrice: 200, total: 200 },
            ],
            totalAmount: 700,
            status: 'confirmed',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
        ];

        const filtered = input.status
          ? orders.filter((o) => o.status === input.status)
          : orders;

        return {
          orders: filtered,
          total: filtered.length,
          byStatus: {
            pending: orders.filter((o) => o.status === 'pending').length,
            confirmed: orders.filter((o) => o.status === 'confirmed').length,
            shipped: orders.filter((o) => o.status === 'shipped').length,
            delivered: orders.filter((o) => o.status === 'delivered').length,
            cancelled: orders.filter((o) => o.status === 'cancelled').length,
          },
        };
      } catch (error) {
        throw new Error('Failed to get purchase orders');
      }
    }),

  // Update purchase order status
  updatePurchaseOrderStatus: protectedProcedure
    .input(
      z.object({
        poNumber: z.string(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return {
          success: true,
          message: `Purchase order status updated to ${input.status}`,
          poNumber: input.poNumber,
          status: input.status,
          updatedAt: new Date(),
        };
      } catch (error) {
        throw new Error('Failed to update purchase order status');
      }
    }),

  // Track inventory
  getInventoryStatus: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const inventory = [
          {
            id: 'INV-001',
            name: 'Chicken Feed (50lb)',
            category: 'Feed & Supplies',
            currentStock: 45,
            minimumLevel: 20,
            reorderQuantity: 50,
            unit: 'bags',
            lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: 'adequate',
          },
          {
            id: 'INV-002',
            name: 'Hay Bales',
            category: 'Feed & Supplies',
            currentStock: 15,
            minimumLevel: 30,
            reorderQuantity: 100,
            unit: 'bales',
            lastRestocked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            status: 'low',
          },
          {
            id: 'INV-003',
            name: 'Fertilizer',
            category: 'Supplies',
            currentStock: 5,
            minimumLevel: 10,
            reorderQuantity: 50,
            unit: 'bags',
            lastRestocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: 'critical',
          },
        ];

        const lowStockItems = inventory.filter((item) => item.currentStock <= item.minimumLevel);

        return {
          inventory,
          totalItems: inventory.length,
          lowStockCount: lowStockItems.length,
          criticalItems: inventory.filter((item) => item.status === 'critical').length,
          lowStockItems,
        };
      } catch (error) {
        throw new Error('Failed to get inventory status');
      }
    }),

  // Get supplier pricing history
  getSupplierPricingHistory: protectedProcedure
    .input(
      z.object({
        supplierId: z.string(),
        months: z.number().default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const pricingHistory = [
          { month: '2025-09', item: 'Chicken Feed (50lb)', price: 24, quantity: 100 },
          { month: '2025-10', item: 'Chicken Feed (50lb)', price: 24.5, quantity: 120 },
          { month: '2025-11', item: 'Chicken Feed (50lb)', price: 25, quantity: 150 },
          { month: '2025-12', item: 'Chicken Feed (50lb)', price: 25.5, quantity: 100 },
          { month: '2026-01', item: 'Chicken Feed (50lb)', price: 26, quantity: 80 },
          { month: '2026-02', item: 'Chicken Feed (50lb)', price: 25, quantity: 100 },
        ];

        return {
          supplierId: input.supplierId,
          pricingHistory,
          averagePrice: (pricingHistory.reduce((sum, p) => sum + p.price, 0) / pricingHistory.length).toFixed(2),
          priceChange: ((pricingHistory[pricingHistory.length - 1].price - pricingHistory[0].price) / pricingHistory[0].price * 100).toFixed(2),
        };
      } catch (error) {
        throw new Error('Failed to get supplier pricing history');
      }
    }),

  // Generate auto purchase orders based on inventory
  generateAutoPurchaseOrders: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const generatedOrders = [
          {
            supplierId: 'SUP-001',
            items: [
              { description: 'Hay Bales', quantity: 100, unitPrice: 5 },
            ],
            totalAmount: 500,
            reason: 'Stock below minimum level',
          },
          {
            supplierId: 'SUP-001',
            items: [
              { description: 'Fertilizer', quantity: 50, unitPrice: 15 },
            ],
            totalAmount: 750,
            reason: 'Critical stock level',
          },
        ];

        return {
          success: true,
          message: `Generated ${generatedOrders.length} auto purchase orders`,
          ordersGenerated: generatedOrders.length,
          totalAmount: generatedOrders.reduce((sum, o) => sum + o.totalAmount, 0),
          orders: generatedOrders,
        };
      } catch (error) {
        throw new Error('Failed to generate auto purchase orders');
      }
    }),
});
