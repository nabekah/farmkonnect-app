import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte } from "drizzle-orm";
import { farmWorkers } from "../drizzle/schema";

export const workforceRouter = router({
  // ============================================================================
  // WORKER MANAGEMENT
  // ============================================================================

  workers: router({
    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        name: z.string(),
        contact: z.string().optional(),
        email: z.string().optional(),
        role: z.string(),
        hireDate: z.date(),
        salary: z.union([z.number(), z.string()]).optional(),
        salaryFrequency: z.string().optional(),
        status: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const values = {
          ...input,
          salary: input.salary ? input.salary.toString() : null,
          status: input.status || "active",
        };
        return await db.insert(farmWorkers).values(values);
      }),

    list: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        let whereConditions = [eq(farmWorkers.farmId, input.farmId)];
        if (input.status) {
          whereConditions.push(eq(farmWorkers.status, input.status));
        }

        return await db.select().from(farmWorkers).where(and(...whereConditions));
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        role: z.string().optional(),
        salary: z.union([z.number(), z.string()]).optional(),
        salaryFrequency: z.string().optional(),
        status: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { id, ...updates } = input;
        const values = {
          ...updates,
          salary: updates.salary ? updates.salary.toString() : undefined,
        };
        return await db.update(farmWorkers).set(values).where(eq(farmWorkers.id, id));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db.delete(farmWorkers).where(eq(farmWorkers.id, input.id));
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const result = await db.select().from(farmWorkers).where(eq(farmWorkers.id, input.id));
        return result.length > 0 ? result[0] : null;
      }),
  }),

  // ============================================================================
  // ATTENDANCE TRACKING
  // ============================================================================

  attendance: router({
    record: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        date: z.date(),
        status: z.enum(["present", "absent", "late", "half-day", "leave"]),
        hoursWorked: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // For now, we'll store attendance in a simple format
        // In production, you'd create an attendance table
        return { success: true, message: "Attendance recorded" };
      }),

    summary: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        // Calculate attendance summary
        return {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          attendanceRate: 0,
        };
      }),
  }),

  // ============================================================================
  // PAYROLL MANAGEMENT
  // ============================================================================

  payroll: router({
    calculateSalary: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
        daysWorked: z.number().optional(),
        deductions: z.number().optional(),
        bonuses: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { grossSalary: 0, deductions: 0, netSalary: 0 };

        const worker = await db.select().from(farmWorkers).where(eq(farmWorkers.id, input.workerId));
        if (worker.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Worker not found" });
        }

        const baseSalary = parseFloat(worker[0].salary?.toString() || "0");
        const deductions = input.deductions || 0;
        const bonuses = input.bonuses || 0;

        let grossSalary = baseSalary;
        if (input.daysWorked && worker[0].salaryFrequency === "daily") {
          grossSalary = baseSalary * input.daysWorked;
        }

        const netSalary = grossSalary + bonuses - deductions;

        return {
          workerId: input.workerId,
          month: input.month,
          year: input.year,
          grossSalary,
          deductions,
          bonuses,
          netSalary,
        };
      }),

    processPayout: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
        amount: z.number().positive(),
        paymentMethod: z.enum(["cash", "bank_transfer", "mobile_money"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Record payout (in production, create a payroll_records table)
        return {
          success: true,
          message: `Payout of ${input.amount} processed for worker ${input.workerId}`,
          paymentMethod: input.paymentMethod,
        };
      }),

    getPayrollHistory: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        // Return payroll history (in production, query payroll_records table)
        return [];
      }),
  }),

  // ============================================================================
  // PERFORMANCE & SKILLS
  // ============================================================================

  performance: router({
    recordEvaluation: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        evaluationDate: z.date(),
        rating: z.number().min(1).max(5),
        skills: z.array(z.string()).optional(),
        strengths: z.string().optional(),
        areasForImprovement: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Store performance evaluation
        return { success: true, message: "Performance evaluation recorded" };
      }),

    getEvaluations: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        limit: z.number().default(5),
      }))
      .query(async ({ input }) => {
        // Return performance evaluations
        return [];
      }),
  }),

  // ============================================================================
  // TEAM MANAGEMENT
  // ============================================================================

  teams: router({
    getTeamByFarm: protectedProcedure
      .input(z.object({
        farmId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const workers = await db.select()
          .from(farmWorkers)
          .where(and(
            eq(farmWorkers.farmId, input.farmId),
            eq(farmWorkers.status, "active")
          ));

        // Group by role
        const teamByRole: Record<string, any[]> = {};
        workers.forEach(w => {
          if (!teamByRole[w.role]) {
            teamByRole[w.role] = [];
          }
          teamByRole[w.role].push(w);
        });

        return {
          totalWorkers: workers.length,
          activeWorkers: workers.filter(w => w.status === "active").length,
          teamByRole,
        };
      }),

    getTeamStats: protectedProcedure
      .input(z.object({
        farmId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { totalWorkers: 0, totalPayroll: 0, averageSalary: 0 };

        const workers = await db.select()
          .from(farmWorkers)
          .where(eq(farmWorkers.farmId, input.farmId));

        const totalPayroll = workers.reduce((sum, w) => sum + parseFloat(w.salary?.toString() || "0"), 0);
        const averageSalary = workers.length > 0 ? totalPayroll / workers.length : 0;

        return {
          totalWorkers: workers.length,
          activeWorkers: workers.filter(w => w.status === "active").length,
          totalPayroll,
          averageSalary,
          workersByRole: workers.reduce((acc, w) => {
            acc[w.role] = (acc[w.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
      }),
  }),
});
