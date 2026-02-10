import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Define time slot type
interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  isBooked: boolean;
}

interface DaySchedule {
  day: string; // "Monday", "Tuesday", etc.
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  slotDuration: number; // minutes
  isWorkingDay: boolean;
}

export const veterinarianAvailabilityRouter = router({
  /**
   * Get veterinarian's weekly schedule
   */
  getVeterinarianSchedule: publicProcedure
    .input(z.object({ veterinarianId: z.number() }))
    .query(async ({ input }) => {
      // Mock schedule data - in production, fetch from database
      const schedules: DaySchedule[] = [
        { day: "Monday", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDuration: 30, isWorkingDay: true },
        { day: "Tuesday", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDuration: 30, isWorkingDay: true },
        { day: "Wednesday", dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDuration: 30, isWorkingDay: true },
        { day: "Thursday", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDuration: 30, isWorkingDay: true },
        { day: "Friday", dayOfWeek: 5, startTime: "09:00", endTime: "17:00", slotDuration: 30, isWorkingDay: true },
        { day: "Saturday", dayOfWeek: 6, startTime: "10:00", endTime: "14:00", slotDuration: 30, isWorkingDay: true },
        { day: "Sunday", dayOfWeek: 0, startTime: "00:00", endTime: "00:00", slotDuration: 30, isWorkingDay: false },
      ];

      return schedules;
    }),

  /**
   * Get available time slots for a veterinarian on a specific date
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        veterinarianId: z.number(),
        date: z.string(), // YYYY-MM-DD format
        duration: z.number().default(30), // appointment duration in minutes
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const dateObj = new Date(input.date);
      const dayOfWeek = dateObj.getDay();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[dayOfWeek];

      // Get vet's schedule for this day of week
      const schedule = await db.execute(
        sql`
          SELECT * FROM veterinarians
          WHERE id = ${input.veterinarianId}
        `
      );

      const vet = (schedule as any).rows?.[0];
      if (!vet) {
        return { slots: [], message: "Veterinarian not found" };
      }

      // Get booked appointments for this date
      const bookedAppointments = await db.execute(
        sql`
          SELECT appointmentDate, duration
          FROM vetAppointments
          WHERE veterinarianId = ${input.veterinarianId}
            AND DATE(appointmentDate) = ${input.date}
            AND status IN ('scheduled', 'confirmed', 'in_progress')
        `
      );

      const booked = (bookedAppointments as any).rows || [];

      // Generate time slots (30-minute intervals by default)
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += input.duration) {
          const slotStart = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          const slotEnd = new Date();
          slotEnd.setHours(hour, minute + input.duration);
          const slotEndStr = `${String(slotEnd.getHours()).padStart(2, "0")}:${String(slotEnd.getMinutes()).padStart(2, "0")}`;

          // Check if slot is booked
          const isBooked = booked.some((apt: any) => {
            const aptStart = new Date(apt.appointmentDate);
            const aptStartStr = `${String(aptStart.getHours()).padStart(2, "0")}:${String(aptStart.getMinutes()).padStart(2, "0")}`;
            return aptStartStr === slotStart;
          });

          slots.push({
            startTime: slotStart,
            endTime: slotEndStr,
            isBooked,
          });
        }
      }

      return {
        veterinarianId: input.veterinarianId,
        date: input.date,
        dayOfWeek,
        dayName,
        slots,
      };
    }),

  /**
   * Get available slots for multiple dates (calendar view)
   */
  getAvailableSlotsForDateRange: publicProcedure
    .input(
      z.object({
        veterinarianId: z.number(),
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string(),   // YYYY-MM-DD
        duration: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get booked appointments for date range
      const bookedAppointments = await db.execute(
        sql`
          SELECT appointmentDate, duration
          FROM vetAppointments
          WHERE veterinarianId = ${input.veterinarianId}
            AND DATE(appointmentDate) BETWEEN ${input.startDate} AND ${input.endDate}
            AND status IN ('scheduled', 'confirmed', 'in_progress')
        `
      );

      const booked = (bookedAppointments as any).rows || [];

      // Generate calendar data for each day
      const calendarData: any[] = [];
      const currentDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayOfWeek = currentDate.getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Only include working days (Monday-Saturday)
        if (dayOfWeek !== 0) {
          const dayBooked = booked.filter((apt: any) => {
            const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
            return aptDate === dateStr;
          });

          const availableSlots = 8 * 60 / input.duration; // 8 hours / slot duration
          const bookedSlots = dayBooked.length;
          const availableCount = Math.max(0, availableSlots - bookedSlots);

          calendarData.push({
            date: dateStr,
            dayOfWeek,
            dayName: dayNames[dayOfWeek],
            totalSlots: availableSlots,
            bookedSlots,
            availableSlots: availableCount,
            hasAvailability: availableCount > 0,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        veterinarianId: input.veterinarianId,
        startDate: input.startDate,
        endDate: input.endDate,
        calendar: calendarData,
      };
    }),

  /**
   * Book an appointment slot (creates appointment)
   */
  bookAppointmentSlot: protectedProcedure
    .input(
      z.object({
        veterinarianId: z.number(),
        farmId: z.number(),
        animalId: z.number().optional(),
        date: z.string(), // YYYY-MM-DD
        time: z.string(), // HH:mm
        duration: z.number().default(30),
        appointmentType: z.enum(["clinic_visit", "farm_visit", "telemedicine", "emergency"]),
        reason: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Combine date and time into datetime
      const appointmentDateTime = `${input.date}T${input.time}:00`;

      // Check if slot is still available
      const existingAppointment = await db.execute(
        sql`
          SELECT id FROM vetAppointments
          WHERE veterinarianId = ${input.veterinarianId}
            AND DATE(appointmentDate) = ${input.date}
            AND TIME(appointmentDate) = ${input.time}
            AND status IN ('scheduled', 'confirmed', 'in_progress')
        `
      );

      if ((existingAppointment as any).rows?.length > 0) {
        throw new Error("This time slot is no longer available. Please select another time.");
      }

      // Create the appointment
      const result = await db.execute(
        sql`
          INSERT INTO vetAppointments (
            farmId, veterinarianId, animalId, appointmentType, 
            appointmentDate, duration, status, reason, notes, createdAt, updatedAt
          ) VALUES (
            ${input.farmId}, ${input.veterinarianId}, ${input.animalId || null}, 
            ${input.appointmentType}, ${appointmentDateTime}, ${input.duration}, 
            'scheduled', ${input.reason}, ${input.notes || null}, NOW(), NOW()
          )
        `
      );

      return {
        success: true,
        appointmentId: (result as any).insertId,
        message: "Appointment booked successfully",
        appointmentDateTime,
      };
    }),

  /**
   * Get veterinarian details with availability summary
   */
  getVeterinarianWithAvailability: publicProcedure
    .input(z.object({ veterinarianId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const vet = await db.execute(
        sql`
          SELECT 
            id, userId, licenseNumber, specialization, clinicName, clinicPhone,
            clinicEmail, clinicAddress, clinicCity, clinicRegion, yearsOfExperience,
            consultationFee, currency, isVerified, rating, totalReviews,
            telemedicineAvailable, createdAt, updatedAt
          FROM veterinarians
          WHERE id = ${input.veterinarianId}
        `
      );

      const vetData = (vet as any).rows?.[0];
      if (!vetData) {
        return null;
      }

      // Get upcoming appointments count
      const upcomingCount = await db.execute(
        sql`
          SELECT COUNT(*) as count FROM vetAppointments
          WHERE veterinarianId = ${input.veterinarianId}
            AND appointmentDate >= NOW()
            AND status IN ('scheduled', 'confirmed')
        `
      );

      const count = (upcomingCount as any).rows?.[0]?.count || 0;

      return {
        ...vetData,
        upcomingAppointments: count,
        responseTime: "Usually responds within 2 hours",
        acceptsTelemedicine: vetData.telemedicineAvailable,
      };
    }),

  /**
   * Get all available veterinarians with their next available slots
   */
  getAvailableVeterinarians: publicProcedure
    .input(
      z.object({
        date: z.string().optional(), // YYYY-MM-DD
        specialization: z.string().optional(),
        region: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      let query = sql`
        SELECT 
          id, licenseNumber, specialization, clinicName, clinicPhone,
          clinicEmail, clinicCity, clinicRegion, yearsOfExperience,
          consultationFee, currency, isVerified, rating, totalReviews,
          telemedicineAvailable
        FROM veterinarians
        WHERE isVerified = true
      `;

      if (input.specialization) {
        query = sql`${query} AND specialization LIKE ${`%${input.specialization}%`}`;
      }

      if (input.region) {
        query = sql`${query} AND clinicRegion = ${input.region}`;
      }

      query = sql`${query} ORDER BY rating DESC, totalReviews DESC`;

      const vets = await db.execute(query);
      const vetList = (vets as any).rows || [];

      // Add availability info for each vet
      const vetsWithAvailability = vetList.map((vet: any) => ({
        ...vet,
        nextAvailableDate: input.date || new Date().toISOString().split("T")[0],
        consultationFeeFormatted: `GHS ${parseFloat(vet.consultationFee).toFixed(2)}`,
      }));

      return vetsWithAvailability;
    }),
});
