import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

// Ghana tax calculation functions
const calculateSSNITDeduction = (grossSalary: number, rate: number = 5.5) => {
  return (grossSalary * rate) / 100;
};

const calculateIncomeTax = (grossSalary: number, threshold: number = 0) => {
  if (grossSalary <= threshold) return 0;

  const taxableIncome = grossSalary - threshold;

  // Ghana progressive tax rates (2024)
  let tax = 0;
  if (taxableIncome <= 110000) {
    tax = (taxableIncome * 5) / 100;
  } else if (taxableIncome <= 175000) {
    tax = (110000 * 5) / 100 + ((taxableIncome - 110000) * 10) / 100;
  } else if (taxableIncome <= 295000) {
    tax = (110000 * 5) / 100 + (65000 * 10) / 100 + ((taxableIncome - 175000) * 17.5) / 100;
  } else {
    tax = (110000 * 5) / 100 + (65000 * 10) / 100 + (120000 * 17.5) / 100 + ((taxableIncome - 295000) * 25) / 100;
  }

  return tax;
};

const calculateHealthInsurance = (grossSalary: number, rate: number = 2.5) => {
  return (grossSalary * rate) / 100;
};

export const payrollRouter = router({
  // Create payroll period
  createPayrollPeriod: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        periodName: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        paymentDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `INSERT INTO payroll_periods (farmId, periodName, startDate, endDate, paymentDate, status)
           VALUES (?, ?, ?, ?, ?, 'draft')`,
          [input.farmId, input.periodName, input.startDate, input.endDate, input.paymentDate || null]
        );

        return { id: result.insertId, ...input };
      } catch (error) {
        console.error("Error creating payroll period:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create payroll period" });
      }
    }),

  // Calculate payroll for a worker
  calculatePayroll: protectedProcedure
    .input(
      z.object({
        payrollPeriodId: z.number(),
        workerId: z.number(),
        farmId: z.number(),
        daysWorked: z.number(),
        hoursWorked: z.number(),
        overtimeHours: z.number().default(0),
        bonusAmount: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get worker details
        const worker = await db.query.raw(`SELECT baseSalary FROM workers WHERE id = ?`, [input.workerId]);

        if (!worker || worker.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Worker not found" });
        }

        const baseSalary = parseFloat(worker[0].baseSalary);

        // Get tax configuration
        const taxConfig = await db.query.raw(
          `SELECT * FROM tax_configuration WHERE farmId = ? ORDER BY taxYear DESC LIMIT 1`,
          [input.farmId]
        );

        const config = taxConfig?.[0] || {
          ssnitEmployeeRate: 5.5,
          incomeTaxThreshold: 0,
          healthInsuranceRate: 2.5,
        };

        // Calculate gross pay
        const dailyRate = baseSalary / 22; // 22 working days per month
        const basePay = dailyRate * input.daysWorked;
        const overtimePay = (dailyRate / 8) * 1.5 * input.overtimeHours; // 1.5x for overtime
        const grossPay = basePay + overtimePay + input.bonusAmount;

        // Calculate deductions
        const ssnitEmployee = calculateSSNITDeduction(grossPay, config.ssnitEmployeeRate);
        const incomeTax = calculateIncomeTax(grossPay, config.incomeTaxThreshold);
        const healthInsurance = calculateHealthInsurance(grossPay, config.healthInsuranceRate);
        const totalDeductions = ssnitEmployee + incomeTax + healthInsurance;
        const netPay = grossPay - totalDeductions;

        // Insert payroll calculation
        const result = await db.query.raw(
          `INSERT INTO payroll_calculations (
            payrollPeriodId, workerId, farmId, baseSalary, daysWorked, hoursWorked,
            overtimeHours, overtimePay, bonusAmount, grossPay, ssnitEmployee,
            incomeTax, healthInsurance, totalDeductions, netPay
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.payrollPeriodId,
            input.workerId,
            input.farmId,
            baseSalary,
            input.daysWorked,
            input.hoursWorked,
            input.overtimeHours,
            overtimePay.toFixed(2),
            input.bonusAmount,
            grossPay.toFixed(2),
            ssnitEmployee.toFixed(2),
            incomeTax.toFixed(2),
            healthInsurance.toFixed(2),
            totalDeductions.toFixed(2),
            netPay.toFixed(2),
          ]
        );

        return {
          id: result.insertId,
          baseSalary,
          grossPay: parseFloat(grossPay.toFixed(2)),
          ssnitEmployee: parseFloat(ssnitEmployee.toFixed(2)),
          incomeTax: parseFloat(incomeTax.toFixed(2)),
          healthInsurance: parseFloat(healthInsurance.toFixed(2)),
          totalDeductions: parseFloat(totalDeductions.toFixed(2)),
          netPay: parseFloat(netPay.toFixed(2)),
        };
      } catch (error) {
        console.error("Error calculating payroll:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to calculate payroll" });
      }
    }),

  // Get payroll calculations for a period
  getPayrollCalculations: protectedProcedure
    .input(z.object({ payrollPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const calculations = await db.query.raw(
          `SELECT pc.*, w.name, w.position
           FROM payroll_calculations pc
           JOIN workers w ON pc.workerId = w.id
           WHERE pc.payrollPeriodId = ?
           ORDER BY w.name`,
          [input.payrollPeriodId]
        );

        return calculations || [];
      } catch (error) {
        console.error("Error fetching payroll calculations:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payroll calculations" });
      }
    }),

  // Get payroll summary for a period
  getPayrollSummary: protectedProcedure
    .input(z.object({ payrollPeriodId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const summary = await db.query.raw(
          `SELECT
             COUNT(*) as totalEmployees,
             SUM(grossPay) as totalGrossPay,
             SUM(ssnitEmployee) as totalSsnitEmployee,
             SUM(incomeTax) as totalIncomeTax,
             SUM(healthInsurance) as totalHealthInsurance,
             SUM(totalDeductions) as totalDeductions,
             SUM(netPay) as totalNetPay,
             AVG(grossPay) as averageGrossPay,
             AVG(netPay) as averageNetPay
           FROM payroll_calculations
           WHERE payrollPeriodId = ?`,
          [input.payrollPeriodId]
        );

        return summary?.[0] || {};
      } catch (error) {
        console.error("Error fetching payroll summary:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payroll summary" });
      }
    }),

  // Process payroll (mark as completed)
  processPayroll: protectedProcedure
    .input(z.object({ payrollPeriodId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.query.raw(
          `UPDATE payroll_periods SET status = 'processing' WHERE id = ?`,
          [input.payrollPeriodId]
        );

        await db.query.raw(
          `UPDATE payroll_calculations SET paymentStatus = 'processed' WHERE payrollPeriodId = ?`,
          [input.payrollPeriodId]
        );

        return { success: true, payrollPeriodId: input.payrollPeriodId };
      } catch (error) {
        console.error("Error processing payroll:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to process payroll" });
      }
    }),

  // Get payroll history for a worker
  getWorkerPayrollHistory: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        limit: z.number().default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const history = await db.query.raw(
          `SELECT pc.*, pp.periodName, pp.startDate, pp.endDate
           FROM payroll_calculations pc
           JOIN payroll_periods pp ON pc.payrollPeriodId = pp.id
           WHERE pc.workerId = ?
           ORDER BY pp.endDate DESC
           LIMIT ?`,
          [input.workerId, input.limit]
        );

        return history || [];
      } catch (error) {
        console.error("Error fetching worker payroll history:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payroll history" });
      }
    }),

  // Get all payroll periods for a farm
  getPayrollPeriods: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const periods = await db.query.raw(
          `SELECT * FROM payroll_periods WHERE farmId = ? ORDER BY endDate DESC`,
          [input.farmId]
        );

        return periods || [];
      } catch (error) {
        console.error("Error fetching payroll periods:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch payroll periods" });
      }
    }),

  // Update tax configuration
  updateTaxConfiguration: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        taxYear: z.number(),
        ssnitEmployeeRate: z.number().optional(),
        ssnitEmployerRate: z.number().optional(),
        incomeTaxThreshold: z.number().optional(),
        healthInsuranceRate: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const existing = await db.query.raw(
          `SELECT id FROM tax_configuration WHERE farmId = ? AND taxYear = ?`,
          [input.farmId, input.taxYear]
        );

        if (existing && existing.length > 0) {
          const updates: string[] = [];
          const values: any[] = [];

          if (input.ssnitEmployeeRate) {
            updates.push("ssnitEmployeeRate = ?");
            values.push(input.ssnitEmployeeRate);
          }
          if (input.ssnitEmployerRate) {
            updates.push("ssnitEmployerRate = ?");
            values.push(input.ssnitEmployerRate);
          }
          if (input.incomeTaxThreshold !== undefined) {
            updates.push("incomeTaxThreshold = ?");
            values.push(input.incomeTaxThreshold);
          }
          if (input.healthInsuranceRate) {
            updates.push("healthInsuranceRate = ?");
            values.push(input.healthInsuranceRate);
          }

          if (updates.length > 0) {
            values.push(input.farmId, input.taxYear);
            await db.query.raw(
              `UPDATE tax_configuration SET ${updates.join(", ")} WHERE farmId = ? AND taxYear = ?`,
              values
            );
          }
        } else {
          await db.query.raw(
            `INSERT INTO tax_configuration (farmId, taxYear, ssnitEmployeeRate, ssnitEmployerRate, incomeTaxThreshold, healthInsuranceRate)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              input.farmId,
              input.taxYear,
              input.ssnitEmployeeRate || 5.5,
              input.ssnitEmployerRate || 13.5,
              input.incomeTaxThreshold || 0,
              input.healthInsuranceRate || 2.5,
            ]
          );
        }

        return { success: true };
      } catch (error) {
        console.error("Error updating tax configuration:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update tax configuration" });
      }
    }),
});
