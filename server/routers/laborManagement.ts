import { protectedProcedure, publicProcedure } from "../_core/procedures";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db";
import {
  shiftTemplates,
  workerShifts,
  timeOffRequests,
  workerPerformance,
  workerAvailability,
  payrollRecords,
  complianceLogs,
  workerSkills,
  workerPerformanceHistory,
  farmWorkers,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

/**
 * Labor Management Router
 * Handles all labor management operations including shifts, time off, performance, and payroll
 */
export const laborManagementRouter = {
  // ============================================================================
  // SHIFT MANAGEMENT
  // ============================================================================

  /**
   * Get all shift templates for a farm
   */
  shifts: {
    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        const shifts = await db
          .select()
          .from(shiftTemplates)
          .where(and(eq(shiftTemplates.farmId, input.farmId), eq(shiftTemplates.isActive, true)))
          .orderBy(asc(shiftTemplates.startTime));

        return shifts;
      }),

    /**
     * Create a new shift template
     */
    create: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          name: z.string().min(1),
          startTime: z.string(), // HH:MM
          endTime: z.string(), // HH:MM
          duration: z.number(),
          description: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(shiftTemplates).values({
          ...input,
          isActive: true,
        });

        return { success: true, id: result[0] };
      }),

    /**
     * Update a shift template
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          duration: z.number().optional(),
          description: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.update(shiftTemplates).set(updates).where(eq(shiftTemplates.id, id));

        return { success: true };
      }),

    /**
     * Delete a shift template
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.update(shiftTemplates).set({ isActive: false }).where(eq(shiftTemplates.id, input.id));

        return { success: true };
      }),
  },

  // ============================================================================
  // WORKER SHIFTS
  // ============================================================================

  /**
   * Get worker shifts for a specific date or date range
   */
  workerShifts: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          workerId: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(workerShifts).where(eq(workerShifts.farmId, input.farmId));

        if (input.startDate && input.endDate) {
          query = query.where(
            and(
              gte(workerShifts.date, new Date(input.startDate)),
              lte(workerShifts.date, new Date(input.endDate))
            )
          );
        }

        if (input.workerId) {
          query = query.where(eq(workerShifts.workerId, input.workerId));
        }

        const shifts = await query.orderBy(desc(workerShifts.date));

        return shifts;
      }),

    /**
     * Assign a worker to a shift
     */
    assign: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number(),
          shiftId: z.number(),
          date: z.string(), // YYYY-MM-DD
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(workerShifts).values({
          ...input,
          date: new Date(input.date),
          status: "scheduled",
        });

        return { success: true, id: result[0] };
      }),

    /**
     * Update worker shift status
     */
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "pending_approval", "confirmed", "completed", "cancelled"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.update(workerShifts).set(updates).where(eq(workerShifts.id, id));

        return { success: true };
      }),

    /**
     * Approve a worker shift
     */
    approve: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number() }))
      .mutation(async ({ input }) => {
        await db
          .update(workerShifts)
          .set({
            status: "confirmed",
            approvedBy: input.approvedBy,
            approvedAt: new Date(),
          })
          .where(eq(workerShifts.id, input.id));

        return { success: true };
      }),
  },

  // ============================================================================
  // TIME OFF REQUESTS
  // ============================================================================

  /**
   * Get time off requests for a farm
   */
  timeOff: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
          workerId: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(timeOffRequests).where(eq(timeOffRequests.farmId, input.farmId));

        if (input.status) {
          query = query.where(eq(timeOffRequests.status, input.status));
        }

        if (input.workerId) {
          query = query.where(eq(timeOffRequests.workerId, input.workerId));
        }

        const requests = await query.orderBy(desc(timeOffRequests.requestedAt));

        return requests;
      }),

    /**
     * Request time off
     */
    request: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number(),
          startDate: z.string(), // YYYY-MM-DD
          endDate: z.string(), // YYYY-MM-DD
          reason: z.string(),
          type: z.enum(["personal", "sick", "vacation", "emergency", "other"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(timeOffRequests).values({
          ...input,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          status: "pending",
        });

        return { success: true, id: result[0] };
      }),

    /**
     * Approve time off request
     */
    approve: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number() }))
      .mutation(async ({ input }) => {
        await db
          .update(timeOffRequests)
          .set({
            status: "approved",
            approvedBy: input.approvedBy,
            approvedAt: new Date(),
          })
          .where(eq(timeOffRequests.id, input.id));

        return { success: true };
      }),

    /**
     * Reject time off request
     */
    reject: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number(), rejectionReason: z.string() }))
      .mutation(async ({ input }) => {
        const { id, approvedBy, rejectionReason } = input;
        await db
          .update(timeOffRequests)
          .set({
            status: "rejected",
            approvedBy,
            approvedAt: new Date(),
            rejectionReason,
          })
          .where(eq(timeOffRequests.id, id));

        return { success: true };
      }),
  },

  // ============================================================================
  // WORKER PERFORMANCE
  // ============================================================================

  /**
   * Get worker performance data
   */
  performance: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(workerPerformance).where(eq(workerPerformance.farmId, input.farmId));

        if (input.workerId) {
          query = query.where(eq(workerPerformance.workerId, input.workerId));
        }

        if (input.startDate && input.endDate) {
          query = query.where(
            and(
              gte(workerPerformance.date, new Date(input.startDate)),
              lte(workerPerformance.date, new Date(input.endDate))
            )
          );
        }

        const performance = await query.orderBy(desc(workerPerformance.date));

        return performance;
      }),

    /**
     * Record worker performance
     */
    record: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number(),
          date: z.string(), // YYYY-MM-DD
          tasksCompleted: z.number().default(0),
          tasksInProgress: z.number().default(0),
          tasksPending: z.number().default(0),
          rating: z.number().optional(),
          hoursWorked: z.number().default(0),
          productivity: z.number().optional(),
          notes: z.string().optional(),
          recordedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(workerPerformance).values({
          ...input,
          date: new Date(input.date),
        });

        return { success: true, id: result[0] };
      }),

    /**
     * Get performance history for analytics
     */
    history: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number().optional(),
          month: z.string().optional(), // YYYY-MM
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(workerPerformanceHistory).where(eq(workerPerformanceHistory.farmId, input.farmId));

        if (input.workerId) {
          query = query.where(eq(workerPerformanceHistory.workerId, input.workerId));
        }

        if (input.month) {
          query = query.where(eq(workerPerformanceHistory.month, input.month));
        }

        const history = await query.orderBy(desc(workerPerformanceHistory.month));

        return history;
      }),
  },

  // ============================================================================
  // WORKER AVAILABILITY
  // ============================================================================

  /**
   * Get worker availability
   */
  availability: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(workerAvailability).where(eq(workerAvailability.farmId, input.farmId));

        if (input.workerId) {
          query = query.where(eq(workerAvailability.workerId, input.workerId));
        }

        if (input.startDate && input.endDate) {
          query = query.where(
            and(
              gte(workerAvailability.date, new Date(input.startDate)),
              lte(workerAvailability.date, new Date(input.endDate))
            )
          );
        }

        const availability = await query.orderBy(asc(workerAvailability.date));

        return availability;
      }),

    /**
     * Update worker availability
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          availableHours: z.number().optional(),
          scheduledHours: z.number().optional(),
          status: z.enum(["available", "busy", "overbooked", "off"]).optional(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.update(workerAvailability).set(updates).where(eq(workerAvailability.id, id));

        return { success: true };
      }),
  },

  // ============================================================================
  // PAYROLL
  // ============================================================================

  /**
   * Get payroll records
   */
  payroll: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number().optional(),
          status: z.enum(["draft", "approved", "paid", "pending"]).optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(payrollRecords).where(eq(payrollRecords.farmId, input.farmId));

        if (input.workerId) {
          query = query.where(eq(payrollRecords.workerId, input.workerId));
        }

        if (input.status) {
          query = query.where(eq(payrollRecords.status, input.status));
        }

        const records = await query.orderBy(desc(payrollRecords.payrollPeriodEnd));

        return records;
      }),

    /**
     * Create payroll record
     */
    create: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number(),
          payrollPeriodStart: z.string(), // YYYY-MM-DD
          payrollPeriodEnd: z.string(), // YYYY-MM-DD
          hoursWorked: z.number(),
          hourlyRate: z.number(),
          basePay: z.number(),
          overtimeHours: z.number().default(0),
          overtimeRate: z.number().optional(),
          overtimePay: z.number().default(0),
          bonuses: z.number().default(0),
          deductions: z.number().default(0),
          totalPay: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(payrollRecords).values({
          ...input,
          payrollPeriodStart: new Date(input.payrollPeriodStart),
          payrollPeriodEnd: new Date(input.payrollPeriodEnd),
          status: "draft",
        });

        return { success: true, id: result[0] };
      }),

    /**
     * Approve payroll record
     */
    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.update(payrollRecords).set({ status: "approved" }).where(eq(payrollRecords.id, input.id));

        return { success: true };
      }),

    /**
     * Mark payroll as paid
     */
    markPaid: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db
          .update(payrollRecords)
          .set({ status: "paid", paidAt: new Date() })
          .where(eq(payrollRecords.id, input.id));

        return { success: true };
      }),
  },

  // ============================================================================
  // COMPLIANCE
  // ============================================================================

  /**
   * Get compliance logs
   */
  compliance: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number().optional(),
          status: z.enum(["compliant", "warning", "violation"]).optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(complianceLogs).where(eq(complianceLogs.farmId, input.farmId));

        if (input.workerId) {
          query = query.where(eq(complianceLogs.workerId, input.workerId));
        }

        if (input.status) {
          query = query.where(eq(complianceLogs.complianceStatus, input.status));
        }

        const logs = await query.orderBy(desc(complianceLogs.date));

        return logs;
      }),

    /**
     * Record compliance check
     */
    record: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number(),
          date: z.string(), // YYYY-MM-DD
          breaksTaken: z.number().default(0),
          breakDurationMinutes: z.number().default(0),
          overtimeHours: z.number().default(0),
          complianceStatus: z.enum(["compliant", "warning", "violation"]),
          violationType: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(complianceLogs).values({
          ...input,
          date: new Date(input.date),
        });

        return { success: true, id: result[0] };
      }),
  },

  // ============================================================================
  // WORKER SKILLS
  // ============================================================================

  /**
   * Get worker skills
   */
  skills: {
    list: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        let query = db.select().from(workerSkills).where(eq(workerSkills.farmId, input.farmId));

        if (input.workerId) {
          query = query.where(eq(workerSkills.workerId, input.workerId));
        }

        const skills = await query.orderBy(asc(workerSkills.skillName));

        return skills;
      }),

    /**
     * Add worker skill
     */
    add: protectedProcedure
      .input(
        z.object({
          farmId: z.number(),
          workerId: z.number(),
          skillName: z.string(),
          proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
          certificationNumber: z.string().optional(),
          certificationExpiry: z.string().optional(), // YYYY-MM-DD
          yearsOfExperience: z.number().default(0),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.insert(workerSkills).values({
          ...input,
          certificationExpiry: input.certificationExpiry ? new Date(input.certificationExpiry) : null,
        });

        return { success: true, id: result[0] };
      }),

    /**
     * Update worker skill
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
          certificationNumber: z.string().optional(),
          certificationExpiry: z.string().optional(),
          yearsOfExperience: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.update(workerSkills).set(updates).where(eq(workerSkills.id, id));

        return { success: true };
      }),
  },

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  /**
   * Get labor management dashboard data
   */
  dashboard: {
    summary: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        // Get active workers
        const activeWorkers = await db
          .select()
          .from(farmWorkers)
          .where(and(eq(farmWorkers.farmId, input.farmId), eq(farmWorkers.status, "active")));

        // Get today's shifts
        const today = new Date().toISOString().split("T")[0];
        const todayShifts = await db
          .select()
          .from(workerShifts)
          .where(and(eq(workerShifts.farmId, input.farmId), eq(workerShifts.date, new Date(today))));

        // Get pending time off requests
        const pendingTimeOff = await db
          .select()
          .from(timeOffRequests)
          .where(and(eq(timeOffRequests.farmId, input.farmId), eq(timeOffRequests.status, "pending")));

        // Get pending payroll
        const pendingPayroll = await db
          .select()
          .from(payrollRecords)
          .where(and(eq(payrollRecords.farmId, input.farmId), eq(payrollRecords.status, "pending")));

        // Get compliance violations
        const violations = await db
          .select()
          .from(complianceLogs)
          .where(and(eq(complianceLogs.farmId, input.farmId), eq(complianceLogs.complianceStatus, "violation")));

        return {
          activeWorkers: activeWorkers.length,
          todayShifts: todayShifts.length,
          pendingTimeOff: pendingTimeOff.length,
          pendingPayroll: pendingPayroll.length,
          complianceViolations: violations.length,
        };
      }),
  },
};
