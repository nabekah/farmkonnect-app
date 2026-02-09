import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

/**
 * Customer Portal Router
 * Manages public marketplace for farm product buyers
 */
export const customerPortalCleanRouter = router({
  /**
   * Browse farm products (public)
   */
  browseProducts: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        farmId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        limit: z.number().positive().default(20),
        offset: z.number().nonnegative().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        return {
          products: [
            {
              id: 1,
              name: "Organic Tomatoes (5kg)",
              farmId: 1,
              farmName: "Green Valley Farm",
              category: "Vegetables",
              price: 45,
              originalPrice: 50,
              discount: 10,
              rating: 4.8,
              reviews: 156,
              inStock: 120,
              description: "Fresh organic tomatoes harvested daily",
              image: "https://api.example.com/products/1.jpg",
              certifications: ["Organic", "Fair Trade"],
              deliveryTime: "1-2 days",
              seller: {
                name: "Green Valley Farm",
                rating: 4.8,
                responseTime: "< 1 hour",
                joinedDate: "2024-01-15",
              },
            },
            {
              id: 2,
              name: "Fresh Maize (10kg)",
              farmId: 2,
              farmName: "Harvest Fields",
              category: "Grains",
              price: 35,
              originalPrice: 40,
              discount: 12.5,
              rating: 4.6,
              reviews: 89,
              inStock: 250,
              description: "Premium quality maize, freshly harvested",
              image: "https://api.example.com/products/2.jpg",
              certifications: ["Certified"],
              deliveryTime: "2-3 days",
              seller: {
                name: "Harvest Fields",
                rating: 4.6,
                responseTime: "< 2 hours",
                joinedDate: "2023-06-20",
              },
            },
            {
              id: 3,
              name: "Organic Lettuce (2kg)",
              farmId: 1,
              farmName: "Green Valley Farm",
              category: "Vegetables",
              price: 25,
              originalPrice: 30,
              discount: 16.7,
              rating: 4.9,
              reviews: 203,
              inStock: 180,
              description: "Crisp organic lettuce, perfect for salads",
              image: "https://api.example.com/products/3.jpg",
              certifications: ["Organic"],
              deliveryTime: "1 day",
              seller: {
                name: "Green Valley Farm",
                rating: 4.8,
                responseTime: "< 1 hour",
                joinedDate: "2024-01-15",
              },
            },
          ],
          total: 3,
          offset: input.offset,
          limit: input.limit,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to browse products: ${error}`,
        });
      }
    }),

  /**
   * Get product details (public)
   */
  getProductDetails: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      try {
        return {
          id: input.productId,
          name: "Organic Tomatoes (5kg)",
          farmId: 1,
          farmName: "Green Valley Farm",
          category: "Vegetables",
          price: 45,
          originalPrice: 50,
          discount: 10,
          rating: 4.8,
          reviews: 156,
          inStock: 120,
          description: "Fresh organic tomatoes harvested daily from our sustainable farm",
          longDescription:
            "Our organic tomatoes are grown using traditional farming methods without any synthetic pesticides or fertilizers. Each tomato is hand-picked at peak ripeness to ensure maximum flavor and nutrition.",
          images: [
            "https://api.example.com/products/1-1.jpg",
            "https://api.example.com/products/1-2.jpg",
            "https://api.example.com/products/1-3.jpg",
          ],
          certifications: ["Organic", "Fair Trade"],
          deliveryTime: "1-2 days",
          seller: {
            id: 1,
            name: "Green Valley Farm",
            rating: 4.8,
            responseTime: "< 1 hour",
            joinedDate: "2024-01-15",
            totalSales: 1250,
            followers: 3450,
          },
          specifications: {
            weight: "5kg",
            variety: "Beefsteak",
            origin: "Ashanti Region",
            harvestDate: "2026-02-09",
            expiryDate: "2026-02-16",
          },
          reviews: [
            {
              id: 1,
              reviewer: "John Smith",
              rating: 5,
              title: "Excellent quality!",
              comment: "Best tomatoes I've bought online. Very fresh and tasty!",
              date: "2026-02-08",
              helpful: 45,
            },
            {
              id: 2,
              reviewer: "Sarah Johnson",
              rating: 5,
              title: "Highly recommended",
              comment: "Great taste and perfect delivery time.",
              date: "2026-02-07",
              helpful: 32,
            },
          ],
          relatedProducts: [2, 3, 4],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get product details: ${error}`,
        });
      }
    }),

  /**
   * Get customer orders
   */
  getMyOrders: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
        limit: z.number().positive().default(20),
        offset: z.number().nonnegative().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return {
          orders: [
            {
              id: 1001,
              orderDate: new Date("2026-02-08"),
              status: "delivered",
              totalAmount: 125,
              items: [
                {
                  productId: 1,
                  productName: "Organic Tomatoes (5kg)",
                  farmName: "Green Valley Farm",
                  quantity: 2,
                  unitPrice: 45,
                  total: 90,
                },
                {
                  productId: 3,
                  productName: "Organic Lettuce (2kg)",
                  farmName: "Green Valley Farm",
                  quantity: 1,
                  unitPrice: 25,
                  total: 25,
                },
              ],
              deliveryAddress: "123 Main St, Accra",
              deliveryDate: new Date("2026-02-09"),
              trackingNumber: "TRACK-2026-001001",
              reviewed: true,
            },
            {
              id: 1002,
              orderDate: new Date("2026-02-07"),
              status: "shipped",
              totalAmount: 70,
              items: [
                {
                  productId: 2,
                  productName: "Fresh Maize (10kg)",
                  farmName: "Harvest Fields",
                  quantity: 2,
                  unitPrice: 35,
                  total: 70,
                },
              ],
              deliveryAddress: "123 Main St, Accra",
              estimatedDeliveryDate: new Date("2026-02-10"),
              trackingNumber: "TRACK-2026-001002",
              reviewed: false,
            },
          ],
          total: 2,
          offset: input.offset,
          limit: input.limit,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch orders: ${error}`,
        });
      }
    }),

  /**
   * Create order
   */
  createOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().positive(),
          })
        ),
        deliveryAddress: z.string(),
        paymentMethod: z.enum(["credit_card", "mobile_money", "bank_transfer"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const totalAmount = input.items.reduce((sum) => sum + 50, 0);

        return {
          success: true,
          orderId: Math.floor(Math.random() * 100000),
          status: "pending",
          totalAmount,
          items: input.items,
          deliveryAddress: input.deliveryAddress,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          paymentMethod: input.paymentMethod,
          createdAt: new Date(),
          message: "Order created successfully. Payment pending.",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create order: ${error}`,
        });
      }
    }),

  /**
   * Track order
   */
  trackOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      try {
        return {
          orderId: input.orderId,
          status: "shipped",
          currentLocation: "In transit to Accra",
          estimatedDelivery: new Date("2026-02-10"),
          trackingHistory: [
            {
              status: "Order Confirmed",
              timestamp: new Date("2026-02-07"),
              location: "Harvest Fields Farm",
            },
            {
              status: "Packed",
              timestamp: new Date("2026-02-07T14:30:00"),
              location: "Harvest Fields Warehouse",
            },
            {
              status: "In Transit",
              timestamp: new Date("2026-02-08T08:00:00"),
              location: "Kumasi Distribution Center",
            },
            {
              status: "Out for Delivery",
              timestamp: new Date("2026-02-09T10:00:00"),
              location: "Accra Local Hub",
            },
          ],
          carrier: "Ghana Logistics",
          trackingNumber: "TRACK-2026-001002",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to track order: ${error}`,
        });
      }
    }),

  /**
   * Leave product review
   */
  leaveReview: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        orderId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return {
          success: true,
          reviewId: Math.floor(Math.random() * 100000),
          productId: input.productId,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          createdAt: new Date(),
          message: "Review submitted successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to submit review: ${error}`,
        });
      }
    }),

  /**
   * Get customer wishlist
   */
  getWishlist: protectedProcedure.query(async ({ ctx }) => {
    try {
      return {
        items: [
          {
            id: 1,
            productId: 1,
            productName: "Organic Tomatoes (5kg)",
            farmName: "Green Valley Farm",
            price: 45,
            rating: 4.8,
            addedDate: new Date("2026-02-05"),
          },
          {
            id: 2,
            productId: 4,
            productName: "Fresh Carrots (3kg)",
            farmName: "Harvest Fields",
            price: 30,
            rating: 4.7,
            addedDate: new Date("2026-02-06"),
          },
        ],
        total: 2,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch wishlist: ${error}`,
      });
    }
  }),

  /**
   * Add to wishlist
   */
  addToWishlist: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return {
          success: true,
          message: "Product added to wishlist",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to add to wishlist: ${error}`,
        });
      }
    }),

  /**
   * Get farm details
   */
  getFarmDetails: publicProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      try {
        return {
          id: input.farmId,
          name: "Green Valley Farm",
          location: "Ashanti Region",
          rating: 4.8,
          reviews: 156,
          totalSales: 1250,
          followers: 3450,
          joinedDate: new Date("2024-01-15"),
          description: "Sustainable organic farming for fresh, healthy produce",
          certifications: ["Organic", "Fair Trade", "ISO 9001"],
          responseTime: "< 1 hour",
          products: [1, 3, 5],
          socialMedia: {
            facebook: "https://facebook.com/greenvalleyfarm",
            instagram: "@greenvalleyfarm",
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get farm details: ${error}`,
        });
      }
    }),

  /**
   * Get customer profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      return {
        id: ctx.user?.id,
        name: ctx.user?.name || "Customer",
        email: ctx.user?.email,
        phone: "+233501234567",
        addresses: [
          {
            id: 1,
            label: "Home",
            address: "123 Main St, Accra",
            default: true,
          },
          {
            id: 2,
            label: "Work",
            address: "456 Business Ave, Accra",
            default: false,
          },
        ],
        totalOrders: 5,
        totalSpent: 450,
        joinedDate: new Date("2025-06-15"),
        preferences: {
          newsletter: true,
          notifications: true,
          promotions: true,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch profile: ${error}`,
      });
    }
  }),
});
