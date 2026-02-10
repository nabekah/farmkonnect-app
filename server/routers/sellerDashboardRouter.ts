import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const sellerDashboardRouter = router({
  // Get seller overview dashboard
  getSellerOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    return {
      totalProducts: 45,
      activeListings: 38,
      soldThisMonth: 127,
      revenue: {
        thisMonth: 2450000,
        lastMonth: 1890000,
        growth: 29.7,
      },
      rating: 4.8,
      reviews: 342,
      followers: 1250,
      recentOrders: [
        {
          id: 1,
          buyer: "John Farmer",
          product: "Tomato Seeds (1kg)",
          quantity: 5,
          total: 25000,
          status: "delivered",
          date: Date.now() - 86400000,
        },
        {
          id: 2,
          buyer: "Jane Expert",
          product: "Organic Fertilizer (50kg)",
          quantity: 2,
          total: 80000,
          status: "processing",
          date: Date.now() - 3600000,
        },
        {
          id: 3,
          buyer: "Mark Breeder",
          product: "Maize Hybrid Seeds (2kg)",
          quantity: 10,
          total: 120000,
          status: "pending",
          date: Date.now() - 1800000,
        },
      ],
    };
  }),

  // Get sales analytics
  getSalesAnalytics: protectedProcedure
    .input(
      z.object({
        period: z.enum(["week", "month", "quarter", "year"]),
      })
    )
    .query(async ({ input }) => {
      const periods: Record<string, number[]> = {
        week: [120, 150, 180, 160, 200, 220, 250],
        month: [2000, 2200, 2100, 2400, 2300, 2600, 2800, 2500, 2900, 3100, 2800, 3200],
        quarter: [25000, 28000, 32000, 35000, 38000, 40000, 42000, 45000, 48000],
        year: [150000, 165000, 180000, 195000, 210000, 225000, 240000, 255000, 270000, 285000, 300000, 320000],
      };

      return {
        period: input.period,
        data: periods[input.period] || [],
        average: 2500,
        peak: 3200,
        trend: "up",
      };
    }),

  // Get product performance
  getProductPerformance: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      return {
        topProducts: [
          {
            id: 1,
            name: "Tomato Seeds (1kg)",
            category: "Seeds",
            sold: 342,
            revenue: 1710000,
            rating: 4.9,
            reviews: 89,
            trend: "up",
          },
          {
            id: 2,
            name: "Organic Fertilizer (50kg)",
            category: "Fertilizer",
            sold: 156,
            revenue: 1560000,
            rating: 4.7,
            reviews: 67,
            trend: "up",
          },
          {
            id: 3,
            name: "Maize Hybrid Seeds (2kg)",
            category: "Seeds",
            sold: 128,
            revenue: 1280000,
            rating: 4.8,
            reviews: 54,
            trend: "stable",
          },
          {
            id: 4,
            name: "Pesticide Spray (1L)",
            category: "Pesticide",
            sold: 95,
            revenue: 475000,
            rating: 4.6,
            reviews: 42,
            trend: "down",
          },
          {
            id: 5,
            name: "Irrigation Hose (50m)",
            category: "Equipment",
            sold: 67,
            revenue: 335000,
            rating: 4.5,
            reviews: 28,
            trend: "stable",
          },
        ],
      };
    }),

  // Get inventory status
  getInventoryStatus: protectedProcedure.query(async () => {
    return {
      totalItems: 1250,
      lowStock: 45,
      outOfStock: 12,
      categories: [
        { name: "Seeds", count: 450, value: 450000 },
        { name: "Fertilizer", count: 320, value: 320000 },
        { name: "Pesticide", count: 180, value: 180000 },
        { name: "Equipment", count: 150, value: 300000 },
        { name: "Tools", count: 150, value: 150000 },
      ],
    };
  }),

  // Get customer feedback
  getCustomerFeedback: protectedProcedure.query(async () => {
    return {
      averageRating: 4.8,
      totalReviews: 342,
      distribution: {
        5: 245,
        4: 67,
        3: 20,
        2: 8,
        1: 2,
      },
      recentReviews: [
        {
          id: 1,
          buyer: "John Farmer",
          rating: 5,
          comment: "Excellent quality seeds, highly recommended!",
          date: Date.now() - 86400000,
        },
        {
          id: 2,
          buyer: "Jane Expert",
          rating: 4,
          comment: "Good product but delivery was slow",
          date: Date.now() - 172800000,
        },
        {
          id: 3,
          buyer: "Mark Breeder",
          rating: 5,
          comment: "Perfect for my farm, will order again",
          date: Date.now() - 259200000,
        },
      ],
    };
  }),

  // Get promotional campaigns
  getPromotionalCampaigns: protectedProcedure.query(async () => {
    return {
      activeCampaigns: 3,
      campaigns: [
        {
          id: 1,
          name: "Spring Sale",
          discount: 20,
          products: 15,
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          status: "active",
          impressions: 5420,
          clicks: 342,
          conversions: 89,
        },
        {
          id: 2,
          name: "Bundle Deal",
          discount: 15,
          products: 8,
          startDate: Date.now() - 259200000,
          endDate: Date.now() + 259200000,
          status: "active",
          impressions: 3200,
          clicks: 180,
          conversions: 45,
        },
        {
          id: 3,
          name: "Flash Sale",
          discount: 30,
          products: 5,
          startDate: Date.now() - 86400000,
          endDate: Date.now() + 172800000,
          status: "active",
          impressions: 8900,
          clicks: 1200,
          conversions: 234,
        },
      ],
    };
  }),

  // Update product listing
  updateProductListing: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        name: z.string().optional(),
        price: z.number().optional(),
        quantity: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Product updated successfully",
        productId: input.productId,
      };
    }),

  // Create promotional campaign
  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        discount: z.number(),
        productIds: z.array(z.number()),
        startDate: z.number(),
        endDate: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Campaign created successfully",
        campaignId: Math.floor(Math.random() * 1000),
      };
    }),

  // Get payout history
  getPayoutHistory: protectedProcedure.query(async () => {
    return {
      totalEarnings: 125000000,
      pendingPayout: 2450000,
      payouts: [
        {
          id: 1,
          amount: 1890000,
          date: Date.now() - 604800000,
          status: "completed",
          method: "Bank Transfer",
        },
        {
          id: 2,
          amount: 2100000,
          date: Date.now() - 1209600000,
          status: "completed",
          method: "Bank Transfer",
        },
        {
          id: 3,
          amount: 1750000,
          date: Date.now() - 1814400000,
          status: "completed",
          method: "Bank Transfer",
        },
      ],
    };
  }),
});
