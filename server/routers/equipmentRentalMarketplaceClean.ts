import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

/**
 * Equipment Rental Marketplace Router
 * Peer-to-peer equipment rental platform
 */
export const equipmentRentalMarketplaceCleanRouter = router({
  /**
   * Get available equipment for rent
   */
  getAvailableEquipment: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        location: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          equipment: [
            {
              id: 1,
              name: "Tractor - John Deere 5100",
              category: "Tractors",
              owner: "Kwame Farms",
              ownerId: 1,
              dailyRate: 250,
              weeklyRate: 1500,
              monthlyRate: 5000,
              location: "Accra, Ghana",
              distance: 5.2,
              condition: "Excellent",
              rating: 4.8,
              reviews: 24,
              image: "tractor.jpg",
              available: true,
              availableFrom: "2026-02-11",
              specs: {
                horsepower: 100,
                transmission: "Manual",
                fuelType: "Diesel",
              },
            },
            {
              id: 2,
              name: "Irrigation Pump - 5HP",
              category: "Irrigation",
              owner: "Ama's Farm",
              ownerId: 2,
              dailyRate: 50,
              weeklyRate: 300,
              monthlyRate: 1000,
              location: "Tema, Ghana",
              distance: 12.5,
              condition: "Good",
              rating: 4.5,
              reviews: 18,
              image: "pump.jpg",
              available: true,
              availableFrom: "2026-02-11",
              specs: {
                horsepower: 5,
                flowRate: "100 GPM",
              },
            },
            {
              id: 3,
              name: "Harvester - CLAAS Lexion",
              category: "Harvesters",
              owner: "Peter's Cooperative",
              ownerId: 3,
              dailyRate: 400,
              weeklyRate: 2400,
              monthlyRate: 8000,
              location: "Kumasi, Ghana",
              distance: 45.3,
              condition: "Excellent",
              rating: 4.9,
              reviews: 32,
              image: "harvester.jpg",
              available: false,
              availableFrom: "2026-03-01",
              specs: {
                capacity: "10 tons/hour",
                width: "3.5m",
              },
            },
          ],
          total: 3,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get equipment: ${error}`,
        });
      }
    }),

  /**
   * List equipment for rent
   */
  listEquipmentForRent: protectedProcedure
    .input(
      z.object({
        farmerId: z.number(),
        equipmentName: z.string(),
        category: z.string(),
        dailyRate: z.number(),
        monthlyRate: z.number(),
        description: z.string(),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          equipmentId: Math.floor(Math.random() * 100000),
          status: "listed",
          message: "Equipment listed successfully",
          listedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list equipment: ${error}`,
        });
      }
    }),

  /**
   * Create rental booking
   */
  createRentalBooking: protectedProcedure
    .input(
      z.object({
        equipmentId: z.number(),
        renterId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        rentalType: z.enum(["daily", "weekly", "monthly"]),
        insuranceOption: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const days = 5;
        const dailyRate = 250;
        const totalCost = days * dailyRate;

        return {
          success: true,
          bookingId: `BK-${Date.now()}`,
          equipmentId: input.equipmentId,
          renterId: input.renterId,
          startDate: input.startDate,
          endDate: input.endDate,
          rentalType: input.rentalType,
          totalCost: totalCost,
          status: "pending_approval",
          createdAt: new Date(),
          message: "Booking request created successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create booking: ${error}`,
        });
      }
    }),

  /**
   * Get rental bookings
   */
  getRentalBookings: protectedProcedure
    .input(
      z.object({
        farmerId: z.number(),
        status: z.enum(["pending_approval", "confirmed", "active", "completed", "cancelled"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          bookings: [
            {
              id: 1,
              bookingId: "BK-1707500000",
              equipment: "Tractor - John Deere 5100",
              owner: "Kwame Farms",
              renter: "John Farmer",
              startDate: "2026-02-15",
              endDate: "2026-02-20",
              rentalType: "daily",
              totalCost: 1250,
              status: "confirmed",
              createdAt: "2026-02-10",
            },
            {
              id: 2,
              bookingId: "BK-1707510000",
              equipment: "Irrigation Pump - 5HP",
              owner: "Ama's Farm",
              renter: "Jane Farmer",
              startDate: "2026-02-12",
              endDate: "2026-02-19",
              rentalType: "weekly",
              totalCost: 300,
              status: "active",
              createdAt: "2026-02-09",
            },
          ],
          total: 2,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get bookings: ${error}`,
        });
      }
    }),

  /**
   * Approve rental booking
   */
  approveRentalBooking: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        ownerId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          bookingId: input.bookingId,
          status: "confirmed",
          message: "Booking approved successfully",
          approvedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to approve booking: ${error}`,
        });
      }
    }),

  /**
   * Cancel rental booking
   */
  cancelRentalBooking: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          bookingId: input.bookingId,
          status: "cancelled",
          refundAmount: 1000,
          message: "Booking cancelled successfully",
          cancelledAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to cancel booking: ${error}`,
        });
      }
    }),

  /**
   * Get rental history
   */
  getRentalHistory: protectedProcedure
    .input(z.object({ farmerId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          history: [
            {
              id: 1,
              equipment: "Tractor - John Deere 5100",
              owner: "Kwame Farms",
              rentalPeriod: "2026-02-01 to 2026-02-05",
              totalCost: 1250,
              status: "completed",
              rating: 5,
              review: "Excellent equipment and smooth rental process",
            },
            {
              id: 2,
              equipment: "Irrigation Pump - 5HP",
              owner: "Ama's Farm",
              rentalPeriod: "2026-01-15 to 2026-01-22",
              totalCost: 300,
              status: "completed",
              rating: 4,
              review: "Good equipment, timely delivery",
            },
          ],
          total: 2,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get history: ${error}`,
        });
      }
    }),

  /**
   * Get rental analytics
   */
  getRentalAnalytics: protectedProcedure
    .input(z.object({ farmerId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          analytics: {
            totalRentals: 12,
            activeRentals: 2,
            totalSpent: 4500,
            averageRating: 4.6,
            equipmentCategories: [
              { category: "Tractors", count: 5, spent: 2500 },
              { category: "Irrigation", count: 4, spent: 1200 },
              { category: "Harvesters", count: 3, spent: 800 },
            ],
            monthlySpending: [
              { month: "January", amount: 1500 },
              { month: "February", amount: 3000 },
            ],
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get analytics: ${error}`,
        });
      }
    }),

  /**
   * Rate rental equipment
   */
  rateRentalEquipment: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          bookingId: input.bookingId,
          rating: input.rating,
          message: "Rating submitted successfully",
          ratedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to rate equipment: ${error}`,
        });
      }
    }),
});
