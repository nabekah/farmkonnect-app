import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const paymentRouter = router({
  // Record payment
  recordPayment: protectedProcedure
    .input(
      z.object({
        payrollCalculationId: z.number(),
        workerId: z.number(),
        farmId: z.number(),
        paymentAmount: z.number().positive(),
        paymentDate: z.string(),
        paymentMethod: z.enum(["bank_transfer", "cash", "mobile_money", "check"]),
        transactionId: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `INSERT INTO payment_history (payrollCalculationId, workerId, farmId, paymentAmount, paymentDate, paymentMethod, transactionId, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
          [
            input.payrollCalculationId,
            input.workerId,
            input.farmId,
            input.paymentAmount,
            input.paymentDate,
            input.paymentMethod,
            input.transactionId || null,
            input.notes || null,
          ]
        );

        // Update payroll calculation status
        await db.query.raw(
          `UPDATE payroll_calculations SET paymentStatus = 'paid', paymentDate = ? WHERE id = ?`,
          [input.paymentDate, input.payrollCalculationId]
        );

        return { id: result.insertId, ...input };
      } catch (error) {
        console.error("Error recording payment:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record payment" });
      }
    }),

  // Get payment history for a worker
  getWorkerPaymentHistory: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        limit: z.number().default(24),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const history = await db.query.raw(
          `SELECT * FROM payment_history
           WHERE workerId = ?
           ORDER BY paymentDate DESC
           LIMIT ?`,
          [input.workerId, input.limit]
        );

        return history || [];
      } catch (error) {
        console.error("Error fetching payment history:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payment history" });
      }
    }),

  // Get payment summary for a period
  getPaymentSummary: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const summary = await db.query.raw(
          `SELECT
             COUNT(*) as totalPayments,
             SUM(paymentAmount) as totalPaid,
             AVG(paymentAmount) as averagePayment,
             COUNT(DISTINCT workerId) as uniqueWorkers,
             paymentMethod,
             COUNT(*) as methodCount
           FROM payment_history
           WHERE farmId = ? AND paymentDate BETWEEN ? AND ?
           GROUP BY paymentMethod
           ORDER BY methodCount DESC`,
          [input.farmId, input.startDate, input.endDate]
        );

        return summary || [];
      } catch (error) {
        console.error("Error fetching payment summary:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payment summary" });
      }
    }),

  // Get pending payments
  getPendingPayments: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const pending = await db.query.raw(
          `SELECT pc.*, w.name, w.position, w.bankAccount, w.bankName, w.accountHolder
           FROM payroll_calculations pc
           JOIN workers w ON pc.workerId = w.id
           WHERE pc.farmId = ? AND pc.paymentStatus = 'pending'
           ORDER BY pc.createdAt ASC`,
          [input.farmId]
        );

        return pending || [];
      } catch (error) {
        console.error("Error fetching pending payments:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch pending payments" });
      }
    }),

  // Generate payroll report
  generatePayrollReport: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        payrollPeriodId: z.number(),
        reportType: z.enum(["monthly_summary", "tax_summary", "ssnit_summary", "payment_summary", "compliance_report"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get payroll data
        const calculations = await db.query.raw(
          `SELECT * FROM payroll_calculations WHERE payrollPeriodId = ?`,
          [input.payrollPeriodId]
        );

        // Calculate totals
        const reportData = {
          totalEmployees: calculations?.length || 0,
          totalGrossPay: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.grossPay), 0) || 0,
          totalDeductions: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.totalDeductions), 0) || 0,
          totalNetPay: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.netPay), 0) || 0,
          totalSsnitEmployee: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.ssnitEmployee), 0) || 0,
          totalSsnitEmployer: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.ssnitEmployee) * (13.5 / 5.5), 0) || 0,
          totalIncomeTax: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.incomeTax), 0) || 0,
          totalHealthInsurance: calculations?.reduce((sum: number, c: any) => sum + parseFloat(c.healthInsurance), 0) || 0,
        };

        const result = await db.query.raw(
          `INSERT INTO payroll_reports (farmId, payrollPeriodId, reportType, reportData, totalEmployees, totalGrossPay, totalDeductions, totalNetPay, totalSsnitEmployee, totalSsnitEmployer, totalIncomeTax)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.farmId,
            input.payrollPeriodId,
            input.reportType,
            JSON.stringify(reportData),
            reportData.totalEmployees,
            reportData.totalGrossPay,
            reportData.totalDeductions,
            reportData.totalNetPay,
            reportData.totalSsnitEmployee,
            reportData.totalSsnitEmployer,
            reportData.totalIncomeTax,
          ]
        );

        return { id: result.insertId, ...reportData };
      } catch (error) {
        console.error("Error generating payroll report:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate payroll report" });
      }
    }),

  // Get payroll reports
  getPayrollReports: protectedProcedure
    .input(z.object({ farmId: z.number(), limit: z.number().default(12) }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const reports = await db.query.raw(
          `SELECT pr.*, pp.periodName, pp.startDate, pp.endDate
           FROM payroll_reports pr
           JOIN payroll_periods pp ON pr.payrollPeriodId = pp.id
           WHERE pr.farmId = ?
           ORDER BY pr.generatedAt DESC
           LIMIT ?`,
          [input.farmId, input.limit]
        );

        return reports || [];
      } catch (error) {
        console.error("Error fetching payroll reports:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payroll reports" });
      }
    }),

  // Get tax compliance report
  getTaxComplianceReport: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const report = await db.query.raw(
          `SELECT
             SUM(pc.ssnitEmployee) as totalSsnitEmployee,
             SUM(pc.ssnitEmployee * (13.5 / 5.5)) as totalSsnitEmployer,
             SUM(pc.incomeTax) as totalIncomeTax,
             SUM(pc.healthInsurance) as totalHealthInsurance,
             COUNT(DISTINCT pc.workerId) as totalWorkers,
             SUM(pc.grossPay) as totalGrossPay
           FROM payroll_calculations pc
           JOIN payroll_periods pp ON pc.payrollPeriodId = pp.id
           WHERE pc.farmId = ? AND pp.endDate BETWEEN ? AND ?`,
          [input.farmId, input.startDate, input.endDate]
        );

        return report?.[0] || {};
      } catch (error) {
        console.error("Error fetching tax compliance report:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch tax compliance report" });
      }
    }),

  // Update payment status
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        status: z.enum(["pending", "completed", "failed", "reversed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.query.raw(
          `UPDATE payment_history SET status = ? WHERE id = ?`,
          [input.status, input.paymentId]
        );

        return { success: true, paymentId: input.paymentId };
      } catch (error) {
        console.error("Error updating payment status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update payment status" });
      }
    }),
});
