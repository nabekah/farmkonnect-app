import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const laborManagementRouter = router({
  // Create worker
  createWorker: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        position: z.string().min(1),
        department: z.string().optional(),
        hireDate: z.string(),
        baseSalary: z.number().positive(),
        salaryFrequency: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
        employmentType: z.enum(["permanent", "contract", "seasonal", "casual"]).default("permanent"),
        bankAccount: z.string().optional(),
        bankName: z.string().optional(),
        accountHolder: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.query.raw(
          `INSERT INTO workers (farmId, name, email, phone, position, department, hireDate, baseSalary, salaryFrequency, employmentType, bankAccount, bankName, accountHolder, emergencyContact, emergencyPhone)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.farmId,
            input.name,
            input.email || null,
            input.phone || null,
            input.position,
            input.department || null,
            input.hireDate,
            input.baseSalary,
            input.salaryFrequency,
            input.employmentType,
            input.bankAccount || null,
            input.bankName || null,
            input.accountHolder || null,
            input.emergencyContact || null,
            input.emergencyPhone || null,
          ]
        );

        return { id: result.insertId, ...input };
      } catch (error) {
        console.error("Error creating worker:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create worker" });
      }
    }),

  // Get all workers for a farm
  getWorkers: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const workers = await db.query.raw(
          `SELECT id, farmId, name, email, phone, position, department, hireDate, baseSalary, salaryFrequency, employmentType, status, bankAccount, bankName, accountHolder, emergencyContact, emergencyPhone, createdAt, updatedAt
           FROM workers
           WHERE farmId = ?
           ORDER BY createdAt DESC`,
          [input.farmId]
        );

        return workers || [];
      } catch (error) {
        console.error("Error fetching workers:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch workers" });
      }
    }),

  // Get worker details
  getWorker: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const worker = await db.query.raw(
          `SELECT * FROM workers WHERE id = ?`,
          [input.workerId]
        );

        return worker?.[0] || null;
      } catch (error) {
        console.error("Error fetching worker:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch worker" });
      }
    }),

  // Update worker
  updateWorker: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        position: z.string().optional(),
        department: z.string().optional(),
        baseSalary: z.number().optional(),
        salaryFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        status: z.enum(["active", "inactive", "on_leave", "terminated"]).optional(),
        bankAccount: z.string().optional(),
        bankName: z.string().optional(),
        accountHolder: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updates: string[] = [];
        const values: any[] = [];

        if (input.name) {
          updates.push("name = ?");
          values.push(input.name);
        }
        if (input.email) {
          updates.push("email = ?");
          values.push(input.email);
        }
        if (input.phone) {
          updates.push("phone = ?");
          values.push(input.phone);
        }
        if (input.position) {
          updates.push("position = ?");
          values.push(input.position);
        }
        if (input.department) {
          updates.push("department = ?");
          values.push(input.department);
        }
        if (input.baseSalary) {
          updates.push("baseSalary = ?");
          values.push(input.baseSalary);
        }
        if (input.salaryFrequency) {
          updates.push("salaryFrequency = ?");
          values.push(input.salaryFrequency);
        }
        if (input.status) {
          updates.push("status = ?");
          values.push(input.status);
        }
        if (input.bankAccount) {
          updates.push("bankAccount = ?");
          values.push(input.bankAccount);
        }
        if (input.bankName) {
          updates.push("bankName = ?");
          values.push(input.bankName);
        }
        if (input.accountHolder) {
          updates.push("accountHolder = ?");
          values.push(input.accountHolder);
        }

        if (updates.length === 0) return { success: false, message: "No updates provided" };

        values.push(input.workerId);

        await db.query.raw(
          `UPDATE workers SET ${updates.join(", ")} WHERE id = ?`,
          values
        );

        return { success: true, workerId: input.workerId };
      } catch (error) {
        console.error("Error updating worker:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update worker" });
      }
    }),

  // Delete worker (soft delete)
  deleteWorker: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.query.raw(
          `UPDATE workers SET status = 'terminated' WHERE id = ?`,
          [input.workerId]
        );

        return { success: true, workerId: input.workerId };
      } catch (error) {
        console.error("Error deleting worker:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete worker" });
      }
    }),

  // Get worker statistics for a farm
  getWorkerStatistics: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const stats = await db.query.raw(
          `SELECT
             COUNT(*) as totalWorkers,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeWorkers,
             SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactiveWorkers,
             SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as onLeaveWorkers,
             SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminatedWorkers,
             SUM(baseSalary) as totalMonthlySalary,
             AVG(baseSalary) as averageSalary,
             COUNT(DISTINCT department) as departmentCount
           FROM workers
           WHERE farmId = ?`,
          [input.farmId]
        );

        return stats?.[0] || {};
      } catch (error) {
        console.error("Error fetching worker statistics:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch statistics" });
      }
    }),

  // Get workers by department
  getWorkersByDepartment: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const workers = await db.query.raw(
          `SELECT department, COUNT(*) as count, SUM(baseSalary) as totalSalary, AVG(baseSalary) as avgSalary
           FROM workers
           WHERE farmId = ? AND status = 'active'
           GROUP BY department
           ORDER BY count DESC`,
          [input.farmId]
        );

        return workers || [];
      } catch (error) {
        console.error("Error fetching workers by department:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch workers by department" });
      }
    }),

  // Get workers by employment type
  getWorkersByEmploymentType: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const workers = await db.query.raw(
          `SELECT employmentType, COUNT(*) as count, SUM(baseSalary) as totalSalary
           FROM workers
           WHERE farmId = ? AND status = 'active'
           GROUP BY employmentType
           ORDER BY count DESC`,
          [input.farmId]
        );

        return workers || [];
      } catch (error) {
        console.error("Error fetching workers by employment type:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch workers by employment type" });
      }
    }),
});
