import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const paymentRouter = router({
  // Create payment intent for equipment rental
  createRentalPaymentIntent: protectedProcedure
    .input(
      z.object({
        rentalId: z.number(),
        equipmentId: z.number(),
        amount: z.number(),
        currency: z.string().default("NGN"),
        rentalDays: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // In production, this would call Stripe API
      const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 20)}`,
        paymentIntentId,
        amount: input.amount,
        currency: input.currency,
        status: "requires_payment_method",
      };
    }),

  // Create payment intent for mentorship session
  createMentorshipPaymentIntent: protectedProcedure
    .input(
      z.object({
        mentorshipId: z.number(),
        mentorId: z.number(),
        sessionCount: z.number(),
        hourlyRate: z.number(),
        currency: z.string().default("NGN"),
      })
    )
    .mutation(async ({ input }) => {
      const amount = input.sessionCount * input.hourlyRate;
      const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 20)}`,
        paymentIntentId,
        amount,
        currency: input.currency,
        status: "requires_payment_method",
      };
    }),

  // Create payment intent for marketplace purchase
  createMarketplacePaymentIntent: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number(),
            price: z.number(),
          })
        ),
        currency: z.string().default("NGN"),
      })
    )
    .mutation(async ({ input }) => {
      const amount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 20)}`,
        paymentIntentId,
        amount,
        currency: input.currency,
        status: "requires_payment_method",
      };
    }),

  // Confirm payment
  confirmPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        paymentMethodId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Payment confirmed successfully",
        paymentIntentId: input.paymentIntentId,
        status: "succeeded",
        receiptUrl: `https://receipts.example.com/${input.paymentIntentId}`,
      };
    }),

  // Get payment history
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        type: z.enum(["all", "rentals", "mentorship", "purchases"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      return {
        payments: [
          {
            id: 1,
            type: "rental",
            description: "Tractor Rental - 5 days",
            amount: 125000,
            currency: "NGN",
            status: "succeeded",
            date: Date.now() - 86400000,
            receiptUrl: "https://receipts.example.com/pi_123456",
          },
          {
            id: 2,
            type: "mentorship",
            description: "Mentorship Session - 3 hours",
            amount: 15000,
            currency: "NGN",
            status: "succeeded",
            date: Date.now() - 172800000,
            receiptUrl: "https://receipts.example.com/pi_123457",
          },
          {
            id: 3,
            type: "purchase",
            description: "Tomato Seeds (5kg) + Fertilizer (50kg)",
            amount: 45000,
            currency: "NGN",
            status: "succeeded",
            date: Date.now() - 259200000,
            receiptUrl: "https://receipts.example.com/pi_123458",
          },
        ],
      };
    }),

  // Process seller payout
  processSellerPayout: protectedProcedure
    .input(
      z.object({
        sellerId: z.number(),
        amount: z.number(),
        bankAccountId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const payoutId = `po_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        message: "Payout initiated successfully",
        payoutId,
        amount: input.amount,
        status: "processing",
        estimatedArrival: Date.now() + 172800000, // 2 days
      };
    }),

  // Get payout history
  getPayoutHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx }) => {
      return {
        totalPayouts: 12,
        totalAmount: 450000,
        payouts: [
          {
            id: 1,
            amount: 125000,
            status: "completed",
            date: Date.now() - 604800000,
            bankAccount: "****1234",
          },
          {
            id: 2,
            amount: 98000,
            status: "completed",
            date: Date.now() - 1209600000,
            bankAccount: "****1234",
          },
          {
            id: 3,
            amount: 87000,
            status: "processing",
            date: Date.now() - 86400000,
            bankAccount: "****1234",
          },
        ],
      };
    }),

  // Add bank account for payouts
  addBankAccount: protectedProcedure
    .input(
      z.object({
        accountHolderName: z.string(),
        accountNumber: z.string(),
        bankCode: z.string(),
        accountType: z.enum(["checking", "savings"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const bankAccountId = Math.floor(Math.random() * 100000);
      
      return {
        success: true,
        message: "Bank account added successfully",
        bankAccountId,
        accountNumber: `****${input.accountNumber.slice(-4)}`,
        status: "verified",
      };
    }),

  // Get bank accounts
  getBankAccounts: protectedProcedure.query(async ({ ctx }) => {
    return {
      bankAccounts: [
        {
          id: 1,
          accountHolderName: "John Farmer",
          accountNumber: "****1234",
          bankCode: "044",
          bankName: "Access Bank",
          accountType: "checking",
          status: "verified",
          isPrimary: true,
        },
      ],
    };
  }),

  // Create refund
  createRefund: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        reason: z.string(),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const refundId = `ref_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        message: "Refund initiated successfully",
        refundId,
        status: "processing",
        amount: input.amount || 0,
      };
    }),

  // Get invoice
  getInvoice: protectedProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .query(async ({ input }) => {
      return {
        invoiceId: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        paymentIntentId: input.paymentIntentId,
        date: Date.now(),
        items: [
          {
            description: "Equipment Rental",
            quantity: 1,
            unitPrice: 125000,
            amount: 125000,
          },
        ],
        subtotal: 125000,
        tax: 0,
        total: 125000,
        status: "paid",
        downloadUrl: "https://invoices.example.com/inv-12345.pdf",
      };
    }),

  // Get payment statistics
  getPaymentStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalRevenue: 2450000,
      thisMonthRevenue: 450000,
      lastMonthRevenue: 380000,
      growthRate: 18.4,
      averageTransactionValue: 45000,
      totalTransactions: 54,
      successRate: 98.5,
      paymentMethods: [
        { method: "Card", count: 32, percentage: 59.3 },
        { method: "Bank Transfer", count: 15, percentage: 27.8 },
        { method: "Mobile Money", count: 7, percentage: 12.9 },
      ],
    };
  }),

  // Setup subscription for recurring payments
  setupSubscription: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        paymentMethodId: z.string(),
        billingCycle: z.enum(["monthly", "quarterly", "yearly"]),
      })
    )
    .mutation(async ({ input }) => {
      const subscriptionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        message: "Subscription created successfully",
        subscriptionId,
        status: "active",
        nextBillingDate: Date.now() + 2592000000, // 30 days
      };
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Subscription cancelled successfully",
        subscriptionId: input.subscriptionId,
        status: "cancelled",
      };
    }),
});
