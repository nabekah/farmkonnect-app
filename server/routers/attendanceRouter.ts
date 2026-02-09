import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";

export const attendanceRouter = router({
  // Clock in worker
  clockIn: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        farmId: z.number(),
        attendanceDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const now = new Date().toISOString();

        await db.query.raw(
          `INSERT INTO attendance_records (workerId, farmId, clockInTime, attendanceDate, status)
           VALUES (?, ?, ?, ?, 'present')`,
          [input.workerId, input.farmId, now, input.attendanceDate]
        );

        return { success: true, clockInTime: now };
      } catch (error) {
        console.error("Error clocking in:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to clock in" });
      }
    }),

  // Clock out worker
  clockOut: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        attendanceDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const now = new Date().toISOString();

        const record = await db.query.raw(
          `SELECT clockInTime FROM attendance_records
           WHERE workerId = ? AND attendanceDate = ? AND clockOutTime IS NULL
           LIMIT 1`,
          [input.workerId, input.attendanceDate]
        );

        if (!record || record.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No active clock-in found" });
        }

        const clockInTime = new Date(record[0].clockInTime);
        const clockOutTime = new Date(now);
        const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

        await db.query.raw(
          `UPDATE attendance_records
           SET clockOutTime = ?, hoursWorked = ?
           WHERE workerId = ? AND attendanceDate = ? AND clockOutTime IS NULL`,
          [now, hoursWorked.toFixed(2), input.workerId, input.attendanceDate]
        );

        return { success: true, clockOutTime: now, hoursWorked: parseFloat(hoursWorked.toFixed(2)) };
      } catch (error) {
        console.error("Error clocking out:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to clock out" });
      }
    }),

  // Record attendance manually
  recordAttendance: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        farmId: z.number(),
        attendanceDate: z.string(),
        status: z.enum(["present", "absent", "late", "half_day", "leave"]),
        hoursWorked: z.number().optional(),
        leaveType: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.query.raw(
          `INSERT INTO attendance_records (workerId, farmId, attendanceDate, status, hoursWorked, leaveType, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            input.workerId,
            input.farmId,
            input.attendanceDate,
            input.status,
            input.hoursWorked || null,
            input.leaveType || null,
            input.notes || null,
          ]
        );

        return { success: true, message: "Attendance recorded" };
      } catch (error) {
        console.error("Error recording attendance:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record attendance" });
      }
    }),

  // Get attendance records for a worker
  getWorkerAttendance: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const records = await db.query.raw(
          `SELECT * FROM attendance_records
           WHERE workerId = ? AND attendanceDate BETWEEN ? AND ?
           ORDER BY attendanceDate DESC`,
          [input.workerId, input.startDate, input.endDate]
        );

        return records || [];
      } catch (error) {
        console.error("Error fetching attendance:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch attendance" });
      }
    }),

  // Get attendance summary for a farm
  getFarmAttendanceSummary: protectedProcedure
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
             COUNT(*) as totalRecords,
             SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays,
             SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentDays,
             SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lateDays,
             SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as halfDays,
             SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leaveDays,
             SUM(hoursWorked) as totalHoursWorked,
             AVG(hoursWorked) as averageHoursPerDay
           FROM attendance_records
           WHERE farmId = ? AND attendanceDate BETWEEN ? AND ?`,
          [input.farmId, input.startDate, input.endDate]
        );

        return summary?.[0] || {};
      } catch (error) {
        console.error("Error fetching attendance summary:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch attendance summary" });
      }
    }),

  // Get attendance rate for workers
  getAttendanceRate: protectedProcedure
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

        const rates = await db.query.raw(
          `SELECT
             w.id,
             w.name,
             COUNT(ar.id) as totalDays,
             SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as presentDays,
             ROUND(SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id) * 100, 2) as attendanceRate,
             SUM(ar.hoursWorked) as totalHours
           FROM workers w
           LEFT JOIN attendance_records ar ON w.id = ar.workerId AND ar.attendanceDate BETWEEN ? AND ?
           WHERE w.farmId = ? AND w.status = 'active'
           GROUP BY w.id, w.name
           ORDER BY attendanceRate DESC`,
          [input.startDate, input.endDate, input.farmId]
        );

        return rates || [];
      } catch (error) {
        console.error("Error fetching attendance rates:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch attendance rates" });
      }
    }),

  // Update attendance record
  updateAttendance: protectedProcedure
    .input(
      z.object({
        recordId: z.number(),
        status: z.enum(["present", "absent", "late", "half_day", "leave"]).optional(),
        hoursWorked: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updates: string[] = [];
        const values: any[] = [];

        if (input.status) {
          updates.push("status = ?");
          values.push(input.status);
        }
        if (input.hoursWorked) {
          updates.push("hoursWorked = ?");
          values.push(input.hoursWorked);
        }
        if (input.notes) {
          updates.push("notes = ?");
          values.push(input.notes);
        }

        if (updates.length === 0) return { success: false, message: "No updates provided" };

        values.push(input.recordId);

        await db.query.raw(
          `UPDATE attendance_records SET ${updates.join(", ")} WHERE id = ?`,
          values
        );

        return { success: true, recordId: input.recordId };
      } catch (error) {
        console.error("Error updating attendance:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update attendance" });
      }
    }),
});
