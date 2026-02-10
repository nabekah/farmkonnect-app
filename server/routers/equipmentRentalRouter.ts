import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const equipmentRentalRouter = router({
  // Get available equipment
  getAvailableEquipment: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        location: z.string().optional(),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      return {
        equipment: [
          {
            id: 1,
            name: "Tractor (60HP)",
            category: "Tractors",
            owner: "John Farmer",
            ownerRating: 4.9,
            dailyRate: 25000,
            weeklyRate: 140000,
            monthlyRate: 450000,
            location: "Lagos, Nigeria",
            distance: 5,
            description: "Well-maintained 60HP tractor, ideal for large farms",
            availability: {
              startDate: Date.now(),
              endDate: Date.now() + 7776000000,
              bookedDates: [
                { start: Date.now() + 604800000, end: Date.now() + 1209600000 },
              ],
            },
            specs: {
              horsepower: 60,
              fuelType: "Diesel",
              transmission: "Manual",
              condition: "Excellent",
            },
            insurance: {
              included: true,
              coverage: "Full coverage",
              deductible: 50000,
            },
            reviews: 42,
            rating: 4.9,
            image: "tractor-1.jpg",
          },
          {
            id: 2,
            name: "Combine Harvester",
            category: "Harvesters",
            owner: "Jane Expert",
            ownerRating: 4.8,
            dailyRate: 35000,
            weeklyRate: 200000,
            monthlyRate: 600000,
            location: "Ibadan, Nigeria",
            distance: 120,
            description: "Modern combine harvester for efficient harvesting",
            availability: {
              startDate: Date.now(),
              endDate: Date.now() + 7776000000,
              bookedDates: [],
            },
            specs: {
              capacity: "8 tons/hour",
              width: "2.5m",
              engine: "100HP",
              condition: "Very Good",
            },
            insurance: {
              included: true,
              coverage: "Full coverage",
              deductible: 100000,
            },
            reviews: 28,
            rating: 4.8,
            image: "harvester-1.jpg",
          },
          {
            id: 3,
            name: "Irrigation Pump Set",
            category: "Irrigation",
            owner: "Mark Breeder",
            ownerRating: 4.7,
            dailyRate: 8000,
            weeklyRate: 45000,
            monthlyRate: 150000,
            location: "Kano, Nigeria",
            distance: 800,
            description: "5HP irrigation pump with hose and fittings",
            availability: {
              startDate: Date.now(),
              endDate: Date.now() + 7776000000,
              bookedDates: [
                { start: Date.now() + 259200000, end: Date.now() + 604800000 },
              ],
            },
            specs: {
              horsepower: 5,
              capacity: "1000 liters/hour",
              fuelType: "Petrol",
              condition: "Good",
            },
            insurance: {
              included: false,
              coverage: "Optional",
              deductible: 0,
            },
            reviews: 56,
            rating: 4.7,
            image: "pump-1.jpg",
          },
          {
            id: 4,
            name: "Spraying Equipment",
            category: "Sprayers",
            owner: "Sarah Innovator",
            ownerRating: 4.6,
            dailyRate: 3000,
            weeklyRate: 15000,
            monthlyRate: 50000,
            location: "Abuja, Nigeria",
            distance: 450,
            description: "Knapsack and boom sprayers for pest management",
            availability: {
              startDate: Date.now(),
              endDate: Date.now() + 7776000000,
              bookedDates: [],
            },
            specs: {
              type: "Knapsack + Boom",
              capacity: "20 liters",
              coverage: "1 hectare/hour",
              condition: "Excellent",
            },
            insurance: {
              included: false,
              coverage: "Not available",
              deductible: 0,
            },
            reviews: 78,
            rating: 4.6,
            image: "sprayer-1.jpg",
          },
        ],
      };
    }),

  // Get equipment details
  getEquipmentDetails: protectedProcedure
    .input(z.object({ equipmentId: z.number() }))
    .query(async ({ input }) => {
      return {
        equipment: {
          id: input.equipmentId,
          name: "Tractor (60HP)",
          category: "Tractors",
          owner: { id: 1, name: "John Farmer", rating: 4.9, reviews: 156 },
          dailyRate: 25000,
          weeklyRate: 140000,
          monthlyRate: 450000,
          location: "Lagos, Nigeria",
          description: "Well-maintained 60HP tractor, ideal for large farms",
          images: ["tractor-1.jpg", "tractor-2.jpg", "tractor-3.jpg"],
          specs: {
            horsepower: 60,
            fuelType: "Diesel",
            transmission: "Manual",
            condition: "Excellent",
            yearManufactured: 2018,
            totalHours: 2500,
          },
          insurance: {
            included: true,
            coverage: "Full coverage including damage and theft",
            deductible: 50000,
            provider: "FarmGuard Insurance",
          },
          reviews: [
            {
              reviewer: "Jane Expert",
              rating: 5,
              comment: "Excellent equipment, very reliable",
              date: Date.now() - 604800000,
            },
            {
              reviewer: "Mark Breeder",
              rating: 4,
              comment: "Good condition, minor maintenance needed",
              date: Date.now() - 1209600000,
            },
          ],
          rentalHistory: [
            { renter: "Ahmed Hassan", duration: "5 days", rating: 5 },
            { renter: "Fatima Okafor", duration: "2 weeks", rating: 5 },
            { renter: "David Mensah", duration: "3 days", rating: 4 },
          ],
        },
      };
    }),

  // Create rental booking
  createRentalBooking: protectedProcedure
    .input(
      z.object({
        equipmentId: z.number(),
        startDate: z.number(),
        endDate: z.number(),
        rentalType: z.enum(["daily", "weekly", "monthly"]),
        insuranceIncluded: z.boolean(),
        deliveryRequired: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const days = (input.endDate - input.startDate) / 86400000;
      const equipment = { dailyRate: 25000 };
      const totalCost = days * equipment.dailyRate;

      return {
        success: true,
        message: "Booking created successfully",
        bookingId: Math.floor(Math.random() * 100000),
        bookingDetails: {
          equipmentId: input.equipmentId,
          startDate: input.startDate,
          endDate: input.endDate,
          rentalDays: days,
          dailyRate: equipment.dailyRate,
          subtotal: totalCost,
          insurance: input.insuranceIncluded ? totalCost * 0.05 : 0,
          delivery: input.deliveryRequired ? 5000 : 0,
          total: totalCost + (input.insuranceIncluded ? totalCost * 0.05 : 0) + (input.deliveryRequired ? 5000 : 0),
        },
        paymentLink: "https://payment.example.com/booking-12345",
      };
    }),

  // Get my rentals
  getMyRentals: protectedProcedure.query(async ({ ctx }) => {
    return {
      activeRentals: 2,
      rentals: [
        {
          id: 1,
          equipmentId: 1,
          equipmentName: "Tractor (60HP)",
          owner: "John Farmer",
          startDate: Date.now() - 172800000,
          endDate: Date.now() + 259200000,
          status: "active",
          daysRemaining: 3,
          dailyRate: 25000,
          totalCost: 200000,
          deliveryAddress: "123 Farm Road, Lagos",
          insuranceIncluded: true,
        },
        {
          id: 2,
          equipmentId: 3,
          equipmentName: "Irrigation Pump Set",
          owner: "Mark Breeder",
          startDate: Date.now() - 86400000,
          endDate: Date.now() + 604800000,
          status: "active",
          daysRemaining: 7,
          dailyRate: 8000,
          totalCost: 64000,
          deliveryAddress: "456 Green Farm, Kano",
          insuranceIncluded: false,
        },
      ],
      completedRentals: [
        {
          id: 3,
          equipmentId: 2,
          equipmentName: "Combine Harvester",
          owner: "Jane Expert",
          startDate: Date.now() - 2592000000,
          endDate: Date.now() - 2419200000,
          status: "completed",
          duration: "2 weeks",
          totalCost: 400000,
          rating: 5,
          review: "Excellent equipment and service",
        },
      ],
    };
  }),

  // List equipment for rental
  listEquipmentForRental: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        dailyRate: z.number(),
        weeklyRate: z.number(),
        monthlyRate: z.number(),
        description: z.string(),
        specs: z.record(z.string()),
        location: z.string(),
        insuranceIncluded: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Equipment listed successfully",
        equipmentId: Math.floor(Math.random() * 100000),
        listingUrl: "https://farmkonnect.com/equipment/12345",
      };
    }),

  // Get rental history
  getRentalHistory: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalRentals: 15,
      totalEarnings: 450000,
      averageRating: 4.8,
      history: [
        {
          id: 1,
          renter: "Ahmed Hassan",
          equipment: "Tractor (60HP)",
          startDate: Date.now() - 2592000000,
          endDate: Date.now() - 2419200000,
          duration: "2 weeks",
          totalCost: 280000,
          rating: 5,
          status: "completed",
        },
        {
          id: 2,
          renter: "Fatima Okafor",
          equipment: "Irrigation Pump Set",
          startDate: Date.now() - 1814400000,
          endDate: Date.now() - 1641600000,
          duration: "5 days",
          totalCost: 40000,
          rating: 5,
          status: "completed",
        },
        {
          id: 3,
          renter: "David Mensah",
          equipment: "Spraying Equipment",
          startDate: Date.now() - 1209600000,
          endDate: Date.now() - 1036800000,
          duration: "3 days",
          totalCost: 9000,
          rating: 4,
          status: "completed",
        },
      ],
    };
  }),

  // Report equipment damage
  reportDamage: protectedProcedure
    .input(
      z.object({
        rentalId: z.number(),
        description: z.string(),
        severity: z.enum(["minor", "moderate", "severe"]),
        photos: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Damage report submitted",
        damageClaimId: Math.floor(Math.random() * 100000),
        status: "under_review",
      };
    }),

  // Get equipment marketplace stats
  getMarketplaceStats: protectedProcedure.query(async () => {
    return {
      totalEquipment: 2340,
      activeListings: 1850,
      totalRentals: 12500,
      totalEarnings: 125000000,
      averageRating: 4.7,
      topCategories: [
        { category: "Tractors", count: 450, earnings: 45000000 },
        { category: "Harvesters", count: 280, earnings: 35000000 },
        { category: "Irrigation", count: 620, earnings: 25000000 },
        { category: "Sprayers", count: 450, earnings: 15000000 },
        { category: "Other", count: 50, earnings: 5000000 },
      ],
    };
  }),
});
