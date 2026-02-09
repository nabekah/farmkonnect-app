import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const deductionsRouter = router({
  // Add deduction or benefit
  addDeduction: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        farmId: z.number(),
        deductionType: z.enum(["ssnit", "income_tax", "health_insurance", "loan", "advance", "other"]),
        amount: z.number().positive(),
        frequency: z.enum(["one_time", "monthly", "per_payroll"]).default("monthly"),
        startDate: z.string(),
        endDate: z.string().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `INSERT INTO deductions_benefits (workerId, farmId, deductionType, amount, frequency, startDate, endDate, reason, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            input.workerId,
            input.farmId,
            input.deductionType,
            input.amount,
            input.frequency,
            input.startDate,
            input.endDate || null,
            input.reason || null,
          ]
        );

        return { id: result.insertId, ...input };
      } catch (error) {
        console.error("Error adding deduction:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add deduction" });
      }
    }),

  // Get deductions for a worker
  getWorkerDeductions: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const deductions = await db.query.raw(
          `SELECT * FROM deductions_benefits
           WHERE workerId = ? AND status = 'active'
           ORDER BY deductionType`,
          [input.workerId]
        );

        return deductions || [];
      } catch (error) {
        console.error("Error fetching deductions:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch deductions" });
      }
    }),

  // Get all deductions for a farm
  getFarmDeductions: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const deductions = await db.query.raw(
          `SELECT db.*, w.name, w.position
           FROM deductions_benefits db
           JOIN workers w ON db.workerId = w.id
           WHERE db.farmId = ? AND db.status = 'active'
           ORDER BY db.deductionType, w.name`,
          [input.farmId]
        );

        return deductions || [];
      } catch (error) {
        console.error("Error fetching farm deductions:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch farm deductions" });
      }
    }),

  // Get deduction summary by type
  getDeductionSummary: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const summary = await db.query.raw(
          `SELECT
             deductionType,
             COUNT(*) as count,
             SUM(amount) as totalAmount,
             AVG(amount) as averageAmount
           FROM deductions_benefits
           WHERE farmId = ? AND status = 'active'
           GROUP BY deductionType
           ORDER BY totalAmount DESC`,
          [input.farmId]
        );

        return summary || [];
      } catch (error) {
        console.error("Error fetching deduction summary:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch deduction summary" });
      }
    }),

  // Update deduction
  updateDeduction: protectedProcedure
    .input(
      z.object({
        deductionId: z.number(),
        amount: z.number().optional(),
        frequency: z.enum(["one_time", "monthly", "per_payroll"]).optional(),
        endDate: z.string().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updates: string[] = [];
        const values: any[] = [];

        if (input.amount) {
          updates.push("amount = ?");
          values.push(input.amount);
        }
        if (input.frequency) {
          updates.push("frequency = ?");
          values.push(input.frequency);
        }
        if (input.endDate) {
          updates.push("endDate = ?");
          values.push(input.endDate);
        }
        if (input.reason) {
          updates.push("reason = ?");
          values.push(input.reason);
        }

        if (updates.length === 0) return { success: false, message: "No updates provided" };

        values.push(input.deductionId);

        await db.query.raw(
          `UPDATE deductions_benefits SET ${updates.join(", ")} WHERE id = ?`,
          values
        );

        return { success: true, deductionId: input.deductionId };
      } catch (error) {
        console.error("Error updating deduction:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update deduction" });
      }
    }),

  // Deactivate deduction
  deactivateDeduction: protectedProcedure
    .input(z.object({ deductionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.query.raw(
          `UPDATE deductions_benefits SET status = 'inactive' WHERE id = ?`,
          [input.deductionId]
        );

        return { success: true, deductionId: input.deductionId };
      } catch (error) {
        console.error("Error deactivating deduction:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to deactivate deduction" });
      }
    }),

  // Get active deductions for payroll calculation
  getActiveDeductionsForPayroll: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        payrollDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const deductions = await db.query.raw(
          `SELECT * FROM deductions_benefits
           WHERE workerId = ?
           AND status = 'active'
           AND startDate <= ?
           AND (endDate IS NULL OR endDate >= ?)
           ORDER BY deductionType`,
          [input.workerId, input.payrollDate, input.payrollDate]
        );

        return deductions || [];
      } catch (error) {
        console.error("Error fetching active deductions:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch active deductions" });
      }
    }),

  // Get deduction history for a worker
  getDeductionHistory: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const history = await db.query.raw(
          `SELECT * FROM deductions_benefits
           WHERE workerId = ?
           ORDER BY createdAt DESC
           LIMIT ?`,
          [input.workerId, input.limit]
        );

        return history || [];
      } catch (error) {
        console.error("Error fetching deduction history:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch deduction history" });
      }
    }),
});
