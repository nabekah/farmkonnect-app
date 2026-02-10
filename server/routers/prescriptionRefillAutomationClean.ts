import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { sendPrescriptionExpiryAlert } from '../services/notificationService';

export const prescriptionRefillAutomationRouter = router({
  // Get refillable prescriptions
  getRefillablePrescriptions: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      // Mock refillable prescriptions
      return {
        prescriptions: [
          {
            id: 1,
            animalName: 'Bessie',
            medication: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Twice daily',
            refillsRemaining: 2,
            daysUntilExpiry: 15,
            lastRefillDate: '2024-01-15',
            veterinarian: 'Dr. John Smith',
            clinic: 'Accra Veterinary Clinic',
            canRefill: true,
          },
          {
            id: 2,
            animalName: 'Daisy',
            medication: 'Penicillin G',
            dosage: '1000mg',
            frequency: 'Once daily',
            refillsRemaining: 1,
            daysUntilExpiry: 8,
            lastRefillDate: '2024-01-20',
            veterinarian: 'Dr. Sarah Johnson',
            clinic: 'Accra Veterinary Clinic',
            canRefill: true,
          },
        ],
        totalRefillable: 2,
        expiringWithin7Days: 1,
        expiringWithin14Days: 2,
      };
    }),

  // Request prescription refill
  requestPrescriptionRefill: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        quantity: z.number().min(1),
        deliveryAddress: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock refill request
      return {
        refillRequestId: Math.random(),
        prescriptionId: input.prescriptionId,
        status: 'pending_approval',
        requestDate: new Date(),
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        quantity: input.quantity,
        estimatedCost: 150,
      };
    }),

  // Approve refill request (veterinarian)
  approvePrescriptionRefill: protectedProcedure
    .input(
      z.object({
        refillRequestId: z.number(),
        approvalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock approval
      return {
        refillRequestId: input.refillRequestId,
        status: 'approved',
        approvedBy: ctx.user.name,
        approvalDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),

  // Deny refill request
  denyPrescriptionRefill: protectedProcedure
    .input(
      z.object({
        refillRequestId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock denial
      return {
        refillRequestId: input.refillRequestId,
        status: 'denied',
        deniedBy: ctx.user.name,
        denialDate: new Date(),
        reason: input.reason,
      };
    }),

  // Get refill request status
  getRefillRequestStatus: protectedProcedure
    .input(z.object({ refillRequestId: z.number() }))
    .query(async ({ input }) => {
      // Mock status
      return {
        refillRequestId: input.refillRequestId,
        status: 'approved',
        prescription: {
          id: 1,
          medication: 'Amoxicillin',
          dosage: '500mg',
          quantity: 30,
        },
        veterinarian: 'Dr. John Smith',
        approvalDate: '2024-02-10',
        estimatedDeliveryDate: '2024-02-13',
        deliveryStatus: 'in_transit',
        trackingNumber: 'TRK123456789',
      };
    }),

  // Enable auto-refill
  enableAutoRefill: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        refillThresholdDays: z.number().default(7),
        maxAutoRefills: z.number().default(12),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock enable auto-refill
      return {
        prescriptionId: input.prescriptionId,
        autoRefillEnabled: true,
        refillThresholdDays: input.refillThresholdDays,
        maxAutoRefills: input.maxAutoRefills,
        nextAutoRefillDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }),

  // Disable auto-refill
  disableAutoRefill: protectedProcedure
    .input(z.object({ prescriptionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Mock disable auto-refill
      return {
        prescriptionId: input.prescriptionId,
        autoRefillEnabled: false,
        disabledAt: new Date(),
      };
    }),

  // Get refill history
  getRefillHistory: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      // Mock refill history
      return {
        prescriptionId: input.prescriptionId,
        refills: [
          {
            id: 1,
            date: '2024-02-10',
            quantity: 30,
            status: 'delivered',
            cost: 150,
            veterinarian: 'Dr. John Smith',
          },
          {
            id: 2,
            date: '2024-01-15',
            quantity: 30,
            status: 'delivered',
            cost: 150,
            veterinarian: 'Dr. John Smith',
          },
          {
            id: 3,
            date: '2023-12-20',
            quantity: 30,
            status: 'delivered',
            cost: 150,
            veterinarian: 'Dr. John Smith',
          },
        ],
        totalRefills: 3,
        totalCost: 450,
      };
    }),

  // Get refill reminders
  getRefillReminders: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      // Mock reminders
      return {
        reminders: [
          {
            id: 1,
            prescriptionId: 1,
            animalName: 'Bessie',
            medication: 'Amoxicillin',
            daysUntilExpiry: 15,
            reminderType: 'expiry_warning',
            nextReminderDate: new Date(),
          },
          {
            id: 2,
            prescriptionId: 2,
            animalName: 'Daisy',
            medication: 'Penicillin G',
            daysUntilExpiry: 8,
            reminderType: 'urgent_refill',
            nextReminderDate: new Date(),
          },
        ],
        totalReminders: 2,
        urgentReminders: 1,
      };
    }),

  // Send refill reminder notification
  sendRefillReminder: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        animalName: z.string(),
        medication: z.string(),
        daysUntilExpiry: z.number(),
        recipientEmail: z.string().optional(),
        recipientPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Send notification
      const result = await sendPrescriptionExpiryAlert({
        recipientEmail: input.recipientEmail,
        recipientPhone: input.recipientPhone,
        type: 'refill',
        subject: `Prescription Refill Reminder: ${input.medication}`,
        message: `Your prescription for ${input.animalName} is expiring in ${input.daysUntilExpiry} days.`,
        animalName: input.animalName,
        farmName: 'Farm',
        urgency: input.daysUntilExpiry <= 3 ? 'high' : 'medium',
        medicationName: input.medication,
        expiryDate: new Date(Date.now() + input.daysUntilExpiry * 24 * 60 * 60 * 1000),
        daysUntilExpiry: input.daysUntilExpiry,
      });

      return {
        success: result.success,
        notificationId: result.messageId,
        sentAt: new Date(),
      };
    }),

  // Get prescription refill cost estimate
  getRefillCostEstimate: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        quantity: z.number(),
      })
    )
    .query(async ({ input }) => {
      // Mock cost estimate
      return {
        prescriptionId: input.prescriptionId,
        quantity: input.quantity,
        unitPrice: 5,
        subtotal: input.quantity * 5,
        tax: input.quantity * 5 * 0.1,
        deliveryFee: 10,
        total: input.quantity * 5 + input.quantity * 5 * 0.1 + 10,
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };
    }),

  // Schedule automatic refill
  scheduleAutomaticRefill: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        frequency: z.enum(['weekly', 'biweekly', 'monthly']),
        quantity: z.number(),
        startDate: z.date(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock schedule
      return {
        scheduleId: Math.random(),
        prescriptionId: input.prescriptionId,
        frequency: input.frequency,
        quantity: input.quantity,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'active',
        nextRefillDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }),

  // Cancel refill schedule
  cancelRefillSchedule: protectedProcedure
    .input(z.object({ scheduleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Mock cancellation
      return {
        scheduleId: input.scheduleId,
        status: 'cancelled',
        cancelledAt: new Date(),
      };
    }),

  // Get pending refill approvals (for veterinarians)
  getPendingRefillApprovals: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock pending approvals
      return {
        pendingApprovals: [
          {
            id: 1,
            farmName: 'Smith Farm',
            animalName: 'Bessie',
            medication: 'Amoxicillin',
            dosage: '500mg',
            quantity: 30,
            requestDate: '2024-02-10',
            reason: 'Routine refill',
            lastPrescriptionDate: '2024-01-15',
          },
          {
            id: 2,
            farmName: 'Johnson Farm',
            animalName: 'Daisy',
            medication: 'Penicillin G',
            dosage: '1000mg',
            quantity: 20,
            requestDate: '2024-02-09',
            reason: 'Continued treatment',
            lastPrescriptionDate: '2024-01-20',
          },
        ],
        totalPending: 2,
      };
    }),

  // Get refill analytics
  getRefillAnalytics: protectedProcedure
    .input(z.object({ farmId: z.number(), timeRange: z.enum(['7days', '30days', '90days']) }))
    .query(async ({ input }) => {
      // Mock analytics
      return {
        totalRefills: 12,
        totalRefillCost: 1800,
        averageRefillCost: 150,
        mostRefilled: 'Amoxicillin',
        refillTrend: [
          { date: '2024-01-01', count: 2, cost: 300 },
          { date: '2024-01-15', count: 3, cost: 450 },
          { date: '2024-02-01', count: 4, cost: 600 },
          { date: '2024-02-10', count: 3, cost: 450 },
        ],
        complianceRate: 95,
        missedRefills: 1,
      };
    }),
});
