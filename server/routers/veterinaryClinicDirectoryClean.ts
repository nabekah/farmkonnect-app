import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { db } from '../db';
import { eq, like, and, desc } from 'drizzle-orm';

export const veterinaryClinicDirectoryRouter = router({
  // Get all veterinary clinics with filters
  getClinics: publicProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        searchTerm: z.string().optional(),
        city: z.string().optional(),
        specialization: z.string().optional(),
        minRating: z.number().min(0).max(5).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // Mock clinic data
      const clinics = [
        {
          id: 1,
          name: 'Accra Veterinary Clinic',
          city: 'Accra',
          phone: '+233 24 123 4567',
          email: 'info@accra-vet.com',
          address: '123 Main Street, Accra',
          specializations: ['Livestock', 'Poultry', 'Dairy'],
          rating: 4.8,
          reviewCount: 45,
          operatingHours: '8:00 AM - 6:00 PM',
          emergencyService: true,
          website: 'www.accra-vet.com',
          imageUrl: 'https://via.placeholder.com/300x200?text=Accra+Vet',
          services: ['Vaccination', 'Surgery', 'Consultation', 'Lab Tests'],
          latitude: 5.6037,
          longitude: -0.1870,
        },
        {
          id: 2,
          name: 'Kumasi Animal Hospital',
          city: 'Kumasi',
          phone: '+233 24 234 5678',
          email: 'contact@kumasi-animal.com',
          address: '456 Health Road, Kumasi',
          specializations: ['Cattle', 'Poultry', 'Aquaculture'],
          rating: 4.6,
          reviewCount: 32,
          operatingHours: '7:00 AM - 5:00 PM',
          emergencyService: true,
          website: 'www.kumasi-animal.com',
          imageUrl: 'https://via.placeholder.com/300x200?text=Kumasi+Hospital',
          services: ['Vaccination', 'Breeding Consultation', 'Feed Advisory'],
          latitude: 6.6753,
          longitude: -1.6167,
        },
        {
          id: 3,
          name: 'Takoradi Veterinary Services',
          city: 'Takoradi',
          phone: '+233 24 345 6789',
          email: 'services@takoradi-vet.com',
          address: '789 Clinic Avenue, Takoradi',
          specializations: ['Dairy', 'Poultry', 'Swine'],
          rating: 4.5,
          reviewCount: 28,
          operatingHours: '8:00 AM - 5:30 PM',
          emergencyService: false,
          website: 'www.takoradi-vet.com',
          imageUrl: 'https://via.placeholder.com/300x200?text=Takoradi+Vet',
          services: ['Vaccination', 'Ultrasound', 'Pharmacy'],
          latitude: 4.8845,
          longitude: -1.7579,
        },
      ];

      // Apply filters
      let filtered = clinics;

      if (input.searchTerm) {
        const term = input.searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.specializations.some(s => s.toLowerCase().includes(term))
        );
      }

      if (input.city) {
        filtered = filtered.filter(c => c.city.toLowerCase() === input.city!.toLowerCase());
      }

      if (input.specialization) {
        filtered = filtered.filter(c =>
          c.specializations.some(s => s.toLowerCase() === input.specialization!.toLowerCase())
        );
      }

      if (input.minRating) {
        filtered = filtered.filter(c => c.rating >= input.minRating!);
      }

      // Sort by rating descending
      filtered = filtered.sort((a, b) => b.rating - a.rating);

      // Apply pagination
      const total = filtered.length;
      const paginated = filtered.slice(input.offset, input.offset + input.limit);

      return {
        clinics: paginated,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get clinic details
  getClinicDetails: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      // Mock clinic details
      const clinicDetails = {
        id: input.clinicId,
        name: 'Accra Veterinary Clinic',
        city: 'Accra',
        phone: '+233 24 123 4567',
        email: 'info@accra-vet.com',
        address: '123 Main Street, Accra',
        specializations: ['Livestock', 'Poultry', 'Dairy'],
        rating: 4.8,
        reviewCount: 45,
        operatingHours: '8:00 AM - 6:00 PM',
        emergencyService: true,
        website: 'www.accra-vet.com',
        imageUrl: 'https://via.placeholder.com/300x200?text=Accra+Vet',
        services: ['Vaccination', 'Surgery', 'Consultation', 'Lab Tests'],
        latitude: 5.6037,
        longitude: -0.1870,
        description: 'Leading veterinary clinic in Accra with experienced veterinarians and modern equipment.',
        veterinarians: [
          { id: 1, name: 'Dr. John Smith', specialization: 'Livestock', experience: 15 },
          { id: 2, name: 'Dr. Sarah Johnson', specialization: 'Poultry', experience: 10 },
        ],
        reviews: [
          { id: 1, author: 'Farmer A', rating: 5, comment: 'Excellent service!', date: '2024-02-01' },
          { id: 2, author: 'Farmer B', rating: 4, comment: 'Good care for my cattle', date: '2024-01-28' },
        ],
        facilities: ['Operating Theatre', 'Laboratory', 'Pharmacy', 'Ultrasound'],
        acceptedPaymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer'],
      };

      return clinicDetails;
    }),

  // Search clinics by location (distance-based)
  searchClinicsByLocation: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(50),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      // Mock clinics with distance calculation
      const clinics = [
        {
          id: 1,
          name: 'Accra Veterinary Clinic',
          city: 'Accra',
          latitude: 5.6037,
          longitude: -0.1870,
          phone: '+233 24 123 4567',
          rating: 4.8,
          distance: 2.5, // km
        },
        {
          id: 2,
          name: 'Kumasi Animal Hospital',
          city: 'Kumasi',
          latitude: 6.6753,
          longitude: -1.6167,
          phone: '+233 24 234 5678',
          rating: 4.6,
          distance: 85.3,
        },
      ];

      // Filter by radius
      const nearby = clinics.filter(c => c.distance <= input.radiusKm);

      // Sort by distance
      nearby.sort((a, b) => a.distance - b.distance);

      return nearby.slice(0, input.limit);
    }),

  // Get clinic reviews
  getClinicReviews: publicProcedure
    .input(
      z.object({
        clinicId: z.number(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // Mock reviews
      const reviews = [
        {
          id: 1,
          clinicId: input.clinicId,
          author: 'Farmer A',
          rating: 5,
          comment: 'Excellent service and professional staff!',
          date: '2024-02-01',
          verified: true,
        },
        {
          id: 2,
          clinicId: input.clinicId,
          author: 'Farmer B',
          rating: 4,
          comment: 'Good care for my cattle, but a bit expensive',
          date: '2024-01-28',
          verified: true,
        },
        {
          id: 3,
          clinicId: input.clinicId,
          author: 'Farmer C',
          rating: 5,
          comment: 'Fast service and knowledgeable veterinarians',
          date: '2024-01-20',
          verified: true,
        },
      ];

      return {
        reviews: reviews.slice(input.offset, input.offset + input.limit),
        total: reviews.length,
        averageRating: 4.7,
      };
    }),

  // Add clinic review
  addClinicReview: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock add review
      return {
        id: Math.random(),
        clinicId: input.clinicId,
        farmerId: ctx.user.id,
        rating: input.rating,
        comment: input.comment,
        date: new Date(),
        verified: false,
      };
    }),

  // Book appointment at clinic
  bookClinicAppointment: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        veterinarianId: z.number(),
        appointmentDate: z.date(),
        animalName: z.string(),
        animalType: z.string(),
        reason: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Mock booking
      return {
        id: Math.random(),
        clinicId: input.clinicId,
        farmId: ctx.user.id,
        appointmentDate: input.appointmentDate,
        animalName: input.animalName,
        status: 'confirmed',
        confirmationNumber: `APT${Date.now()}`,
        estimatedCost: 150,
      };
    }),

  // Get clinic availability
  getClinicAvailability: publicProcedure
    .input(
      z.object({
        clinicId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Mock availability
      const availableSlots = [
        { date: '2024-02-15', time: '09:00', veterinarian: 'Dr. John Smith' },
        { date: '2024-02-15', time: '10:30', veterinarian: 'Dr. Sarah Johnson' },
        { date: '2024-02-16', time: '14:00', veterinarian: 'Dr. John Smith' },
        { date: '2024-02-17', time: '11:00', veterinarian: 'Dr. Sarah Johnson' },
      ];

      return {
        clinicId: input.clinicId,
        availableSlots,
        totalSlots: availableSlots.length,
      };
    }),

  // Get clinic statistics
  getClinicStats: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      // Mock statistics
      return {
        clinicId: input.clinicId,
        totalAppointments: 1250,
        totalReviews: 45,
        averageRating: 4.8,
        responseTime: '2 hours',
        successRate: 98.5,
        specializations: ['Livestock', 'Poultry', 'Dairy'],
        yearsInOperation: 8,
      };
    }),

  // Get clinic services and pricing
  getClinicServices: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      // Mock services
      return {
        clinicId: input.clinicId,
        services: [
          { id: 1, name: 'Vaccination', price: 50, duration: '30 min' },
          { id: 2, name: 'Consultation', price: 100, duration: '1 hour' },
          { id: 3, name: 'Surgery', price: 500, duration: '2-3 hours' },
          { id: 4, name: 'Lab Tests', price: 200, duration: '1 hour' },
          { id: 5, name: 'Ultrasound', price: 150, duration: '45 min' },
        ],
      };
    }),

  // Get veterinarians at clinic
  getClinicVeterinarians: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      // Mock veterinarians
      return {
        clinicId: input.clinicId,
        veterinarians: [
          {
            id: 1,
            name: 'Dr. John Smith',
            specialization: 'Livestock',
            experience: 15,
            rating: 4.9,
            availability: 'Available',
          },
          {
            id: 2,
            name: 'Dr. Sarah Johnson',
            specialization: 'Poultry',
            experience: 10,
            rating: 4.7,
            availability: 'Available',
          },
          {
            id: 3,
            name: 'Dr. Mike Brown',
            specialization: 'Dairy',
            experience: 12,
            rating: 4.8,
            availability: 'On Leave',
          },
        ],
      };
    }),
});
