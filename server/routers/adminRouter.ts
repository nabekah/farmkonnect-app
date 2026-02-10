import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const adminRouter = router({
  // Get dashboard overview
  getDashboardOverview: protectedProcedure.query(async ({ ctx }) => {
    return {
      stats: {
        totalUsers: 5234,
        activeUsers: 3421,
        totalFarms: 1856,
        totalTransactions: 12450,
        totalRevenue: 45670000,
        monthlyGrowth: 12.5,
      },
      recentActivity: [
        { id: 1, type: 'user_signup', description: 'New user registered', timestamp: Date.now() - 3600000 },
        { id: 2, type: 'payment', description: 'Payment processed', amount: 125000, timestamp: Date.now() - 7200000 },
        { id: 3, type: 'farm_created', description: 'New farm added', timestamp: Date.now() - 10800000 },
      ],
    };
  }),

  // Get all users
  getUsers: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['admin', 'user', 'seller', 'mentor']).optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return {
        total: 5234,
        users: [
          {
            id: 1,
            name: 'John Farmer',
            email: 'john@example.com',
            role: 'user',
            status: 'active',
            joinDate: Date.now() - 86400000 * 30,
            lastLogin: Date.now() - 3600000,
            farms: 2,
            transactions: 45,
          },
          {
            id: 2,
            name: 'Jane Seller',
            email: 'jane@example.com',
            role: 'seller',
            status: 'active',
            joinDate: Date.now() - 86400000 * 60,
            lastLogin: Date.now() - 1800000,
            farms: 1,
            transactions: 156,
          },
          {
            id: 3,
            name: 'Dr. Ahmed',
            email: 'ahmed@example.com',
            role: 'mentor',
            status: 'active',
            joinDate: Date.now() - 86400000 * 90,
            lastLogin: Date.now() - 7200000,
            farms: 0,
            transactions: 78,
          },
        ],
      };
    }),

  // Get user details
  getUserDetails: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return {
        id: input.userId,
        name: 'John Farmer',
        email: 'john@example.com',
        phone: '+234 800 123 4567',
        role: 'user',
        status: 'active',
        joinDate: Date.now() - 86400000 * 30,
        lastLogin: Date.now() - 3600000,
        profile: {
          state: 'Lagos',
          lga: 'Ikorodu',
          farmSize: 5,
          crops: ['Tomato', 'Pepper', 'Lettuce'],
        },
        stats: {
          farms: 2,
          transactions: 45,
          totalSpent: 450000,
          reviews: 4.8,
        },
        activity: [
          { date: Date.now() - 3600000, action: 'Login' },
          { date: Date.now() - 86400000, action: 'Created farm' },
          { date: Date.now() - 172800000, action: 'Made purchase' },
        ],
      };
    }),

  // Suspend user
  suspendUser: protectedProcedure
    .input(z.object({ userId: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'User suspended successfully',
        userId: input.userId,
        status: 'suspended',
      };
    }),

  // Reactivate user
  reactivateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'User reactivated successfully',
        userId: input.userId,
        status: 'active',
      };
    }),

  // Get all transactions
  getTransactions: protectedProcedure
    .input(
      z.object({
        type: z.enum(['all', 'payment', 'payout', 'refund']).optional(),
        status: z.enum(['all', 'pending', 'completed', 'failed']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return {
        total: 12450,
        transactions: [
          {
            id: 1,
            type: 'payment',
            userId: 1,
            userName: 'John Farmer',
            amount: 125000,
            status: 'completed',
            date: Date.now() - 3600000,
            description: 'Equipment rental payment',
          },
          {
            id: 2,
            type: 'payout',
            userId: 2,
            userName: 'Jane Seller',
            amount: 450000,
            status: 'completed',
            date: Date.now() - 86400000,
            description: 'Seller payout',
          },
          {
            id: 3,
            type: 'refund',
            userId: 3,
            userName: 'Mark Breeder',
            amount: 50000,
            status: 'pending',
            date: Date.now() - 172800000,
            description: 'Refund for cancelled order',
          },
        ],
      };
    }),

  // Get disputes
  getDisputes: protectedProcedure
    .input(
      z.object({
        status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return {
        total: 23,
        disputes: [
          {
            id: 1,
            type: 'equipment_damage',
            claimant: 'John Farmer',
            respondent: 'Equipment Owner',
            amount: 75000,
            status: 'open',
            date: Date.now() - 86400000,
            description: 'Equipment returned with damage',
          },
          {
            id: 2,
            type: 'non_delivery',
            claimant: 'Jane Expert',
            respondent: 'Seller',
            amount: 125000,
            status: 'in_progress',
            date: Date.now() - 172800000,
            description: 'Order not delivered',
          },
          {
            id: 3,
            type: 'quality_issue',
            claimant: 'Mark Breeder',
            respondent: 'Seller',
            amount: 50000,
            status: 'resolved',
            date: Date.now() - 259200000,
            description: 'Product quality below standard',
          },
        ],
      };
    }),

  // Resolve dispute
  resolveDispute: protectedProcedure
    .input(
      z.object({
        disputeId: z.number(),
        resolution: z.enum(['favor_claimant', 'favor_respondent', 'partial_refund']),
        refundAmount: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'Dispute resolved successfully',
        disputeId: input.disputeId,
        status: 'resolved',
      };
    }),

  // Get reports
  getReports: protectedProcedure
    .input(
      z.object({
        type: z.enum(['user_reports', 'content_reports', 'payment_reports', 'fraud_reports']).optional(),
        status: z.enum(['pending', 'reviewed', 'actioned']).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return {
        total: 45,
        reports: [
          {
            id: 1,
            type: 'user_reports',
            reporter: 'John Farmer',
            subject: 'Inappropriate behavior',
            description: 'User sent harassing messages',
            status: 'pending',
            date: Date.now() - 3600000,
            priority: 'high',
          },
          {
            id: 2,
            type: 'content_reports',
            reporter: 'Jane Expert',
            subject: 'Spam review',
            description: 'Fake review posted on product',
            status: 'reviewed',
            date: Date.now() - 86400000,
            priority: 'medium',
          },
        ],
      };
    }),

  // Action on report
  actionReport: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        action: z.enum(['dismiss', 'warn_user', 'suspend_user', 'delete_content']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'Report actioned successfully',
        reportId: input.reportId,
        status: 'actioned',
      };
    }),

  // Get analytics
  getAnalytics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return {
        period: input.period,
        metrics: {
          newUsers: 234,
          activeUsers: 3421,
          totalTransactions: 1245,
          totalRevenue: 4567000,
          averageOrderValue: 3672,
          conversionRate: 8.5,
          churnRate: 2.1,
        },
        topProducts: [
          { name: 'Tomato Seeds', sales: 456, revenue: 912000 },
          { name: 'Fertilizer', sales: 389, revenue: 1167000 },
          { name: 'Pesticide', sales: 234, revenue: 702000 },
        ],
        topFarmers: [
          { name: 'John Farmer', transactions: 45, spent: 450000 },
          { name: 'Jane Expert', transactions: 38, spent: 380000 },
          { name: 'Mark Breeder', transactions: 32, spent: 320000 },
        ],
      };
    }),

  // Send announcement
  sendAnnouncement: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        message: z.string(),
        channels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])),
        targetAudience: z.enum(['all_users', 'farmers', 'sellers', 'mentors']),
        scheduledTime: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'Announcement sent successfully',
        announcementId: Math.floor(Math.random() * 100000),
        recipientsCount: 5234,
        status: 'sent',
      };
    }),

  // Get system health
  getSystemHealth: protectedProcedure.query(async () => {
    return {
      status: 'healthy',
      uptime: 99.9,
      services: {
        database: { status: 'healthy', responseTime: 12 },
        api: { status: 'healthy', responseTime: 45 },
        email: { status: 'healthy', lastCheck: Date.now() - 300000 },
        sms: { status: 'healthy', lastCheck: Date.now() - 300000 },
        storage: { status: 'healthy', usedSpace: 45.2 },
      },
      alerts: [
        { id: 1, severity: 'warning', message: 'High database query time detected' },
      ],
    };
  }),

  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(
      z.object({
        action: z.string().optional(),
        userId: z.number().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return {
        logs: [
          {
            id: 1,
            timestamp: Date.now() - 3600000,
            userId: 1,
            userName: 'Admin',
            action: 'suspend_user',
            target: 'User #123',
            details: 'User suspended for 30 days',
            ipAddress: '192.168.1.1',
          },
          {
            id: 2,
            timestamp: Date.now() - 7200000,
            userId: 1,
            userName: 'Admin',
            action: 'resolve_dispute',
            target: 'Dispute #45',
            details: 'Refund of ₦50,000 issued',
            ipAddress: '192.168.1.1',
          },
        ],
      };
    }),

  // Get settings
  getSettings: protectedProcedure.query(async () => {
    return {
      platform: {
        name: 'FarmKonnect',
        maintenanceMode: false,
        registrationEnabled: true,
      },
      fees: {
        platformFee: 2.5,
        paymentProcessingFee: 1.5,
        sellerCommission: 5,
      },
      limits: {
        maxFarmsPerUser: 10,
        maxListingsPerSeller: 1000,
        maxUploadSize: 50,
      },
    };
  }),

  // Update settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        setting: z.string(),
        value: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'Setting updated successfully',
        setting: input.setting,
      };
    }),
});
