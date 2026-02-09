import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Veterinarian schema
const veterinarianSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  specialty: z.string(),
  region: z.string(),
  phone: z.string(),
  email: z.string().email(),
  clinicName: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  averageRating: z.number().min(0).max(5).optional(),
  verified: z.boolean().default(false),
  consultationFee: z.number().optional(),
  emergencyAvailable: z.boolean().default(true),
  emergencyFee: z.number().optional(),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  languages: z.string().optional(),
  serviceRadius: z.number().optional(),
});

export const veterinaryDirectoryRouter = router({
  /**
   * Search veterinarians by criteria
   */
  search: protectedProcedure
    .input(z.object({
      region: z.string().optional(),
      specialty: z.string().optional(),
      minRating: z.number().min(0).max(5).optional(),
      verified: z.boolean().optional(),
      emergencyAvailable: z.boolean().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      try {
        // Mock data - replace with actual database query
        const veterinarians = [
          {
            id: 1,
            name: 'Dr. Kwame Mensah',
            specialty: 'Cattle',
            region: 'Ashanti',
            phone: '+233 24 123 4567',
            email: 'kwame@vetclinic.com',
            clinicName: 'Ashanti Veterinary Clinic',
            licenseNumber: 'VET-2024-001',
            yearsOfExperience: 12,
            averageRating: 4.8,
            totalReviews: 45,
            verified: true,
            consultationFee: 150,
            emergencyAvailable: true,
            emergencyFee: 300,
            bio: 'Specialized in cattle health and productivity',
            qualifications: 'DVM, University of Ghana',
            languages: 'English, Twi',
            serviceRadius: 50,
            availabilityStatus: 'available',
          },
          {
            id: 2,
            name: 'Dr. Ama Osei',
            specialty: 'Small Ruminants',
            region: 'Greater Accra',
            phone: '+233 24 234 5678',
            email: 'ama@vetcare.com',
            clinicName: 'Accra Veterinary Care',
            licenseNumber: 'VET-2024-002',
            yearsOfExperience: 8,
            averageRating: 4.6,
            totalReviews: 32,
            verified: true,
            consultationFee: 120,
            emergencyAvailable: true,
            emergencyFee: 250,
            bio: 'Expert in goat and sheep health management',
            qualifications: 'DVM, Kwame Nkrumah University',
            languages: 'English, Ga',
            serviceRadius: 30,
            availabilityStatus: 'available',
          },
          {
            id: 3,
            name: 'Dr. Kofi Boateng',
            specialty: 'Poultry',
            region: 'Eastern',
            phone: '+233 24 345 6789',
            email: 'kofi@poultryvet.com',
            clinicName: 'Eastern Poultry Veterinary',
            licenseNumber: 'VET-2024-003',
            yearsOfExperience: 6,
            averageRating: 4.4,
            totalReviews: 18,
            verified: false,
            consultationFee: 100,
            emergencyAvailable: false,
            emergencyFee: null,
            bio: 'Specialized in poultry disease management',
            qualifications: 'DVM, University of Education',
            languages: 'English',
            serviceRadius: 40,
            availabilityStatus: 'available',
          },
        ];

        // Filter based on input
        let filtered = veterinarians;

        if (input.region) {
          filtered = filtered.filter((v) =>
            v.region.toLowerCase().includes(input.region!.toLowerCase())
          );
        }

        if (input.specialty) {
          filtered = filtered.filter((v) =>
            v.specialty.toLowerCase().includes(input.specialty!.toLowerCase())
          );
        }

        if (input.minRating !== undefined) {
          filtered = filtered.filter((v) => v.averageRating >= input.minRating!);
        }

        if (input.verified !== undefined) {
          filtered = filtered.filter((v) => v.verified === input.verified);
        }

        if (input.emergencyAvailable !== undefined) {
          filtered = filtered.filter((v) => v.emergencyAvailable === input.emergencyAvailable);
        }

        // Pagination
        const total = filtered.length;
        const results = filtered.slice(input.offset, input.offset + input.limit);

        return {
          data: results,
          total,
          limit: input.limit,
          offset: input.offset,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        console.error('Error searching veterinarians:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search veterinarians',
        });
      }
    }),

  /**
   * Get veterinarian details
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        // Mock data
        return {
          id: input,
          name: 'Dr. Kwame Mensah',
          specialty: 'Cattle',
          region: 'Ashanti',
          phone: '+233 24 123 4567',
          email: 'kwame@vetclinic.com',
          clinicName: 'Ashanti Veterinary Clinic',
          licenseNumber: 'VET-2024-001',
          yearsOfExperience: 12,
          averageRating: 4.8,
          totalReviews: 45,
          verified: true,
          consultationFee: 150,
          emergencyAvailable: true,
          emergencyFee: 300,
          bio: 'Specialized in cattle health and productivity',
          qualifications: 'DVM, University of Ghana',
          languages: 'English, Twi',
          serviceRadius: 50,
          availabilityStatus: 'available',
          services: [
            {
              id: 1,
              serviceName: 'General Consultation',
              basePrice: 150,
              estimatedDuration: 30,
            },
            {
              id: 2,
              serviceName: 'Vaccination',
              basePrice: 200,
              estimatedDuration: 45,
            },
            {
              id: 3,
              serviceName: 'Surgical Procedure',
              basePrice: 500,
              estimatedDuration: 120,
            },
          ],
          availability: [
            { dayOfWeek: 'monday', startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'wednesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'friday', startTime: '08:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
            { dayOfWeek: 'sunday', startTime: '00:00', endTime: '00:00', isAvailable: false },
          ],
          recentReviews: [
            {
              id: 1,
              rating: 5,
              title: 'Excellent service',
              review: 'Dr. Mensah provided excellent care for my cattle',
              reviewer: 'John Farmer',
              createdAt: new Date('2024-02-05'),
            },
            {
              id: 2,
              rating: 4,
              title: 'Good professional',
              review: 'Professional and knowledgeable',
              reviewer: 'Jane Smith',
              createdAt: new Date('2024-02-01'),
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching veterinarian details:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch veterinarian details',
        });
      }
    }),

  /**
   * Get available time slots for booking
   */
  getAvailableSlots: protectedProcedure
    .input(z.object({
      veterinarianId: z.number(),
      date: z.date(),
      serviceId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock available slots
        const baseSlots = [
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
        ];

        // Simulate some booked slots
        const bookedSlots = ['09:00', '14:00'];
        const availableSlots = baseSlots.filter((slot) => !bookedSlots.includes(slot));

        return {
          veterinarianId: input.veterinarianId,
          date: input.date,
          availableSlots: availableSlots.map((slot) => ({
            time: slot,
            available: true,
          })),
          totalAvailable: availableSlots.length,
        };
      } catch (error) {
        console.error('Error fetching available slots:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch available slots',
        });
      }
    }),

  /**
   * Book an appointment directly from directory
   */
  bookAppointment: protectedProcedure
    .input(z.object({
      veterinarianId: z.number(),
      animalId: z.number(),
      farmId: z.number(),
      appointmentDate: z.date(),
      appointmentTime: z.string(),
      serviceId: z.number().optional(),
      consultationType: z.string().optional(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Mock booking
        return {
          appointmentId: `APT-${Date.now()}`,
          veterinarianId: input.veterinarianId,
          animalId: input.animalId,
          appointmentDate: input.appointmentDate,
          appointmentTime: input.appointmentTime,
          status: 'confirmed',
          confirmationNumber: `CONF-${Math.random().toString(36).substring(7).toUpperCase()}`,
          createdAt: new Date(),
          message: 'Appointment booked successfully. You will receive a confirmation SMS.',
        };
      } catch (error) {
        console.error('Error booking appointment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to book appointment',
        });
      }
    }),

  /**
   * Add a review for a veterinarian
   */
  addReview: protectedProcedure
    .input(z.object({
      veterinarianId: z.number(),
      appointmentId: z.number().optional(),
      rating: z.number().min(1).max(5),
      title: z.string(),
      review: z.string(),
      professionalism: z.number().min(1).max(5).optional(),
      communication: z.number().min(1).max(5).optional(),
      timeliness: z.number().min(1).max(5).optional(),
      valueForMoney: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Mock review submission
        return {
          reviewId: `REV-${Date.now()}`,
          veterinarianId: input.veterinarianId,
          status: 'pending_verification',
          message: 'Thank you for your review. It will be verified and published shortly.',
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Error adding review:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add review',
        });
      }
    }),

  /**
   * Get featured veterinarians
   */
  getFeatured: protectedProcedure
    .input(z.object({
      region: z.string().optional(),
      limit: z.number().default(5),
    }))
    .query(async ({ input }) => {
      try {
        // Mock featured veterinarians
        return [
          {
            id: 1,
            name: 'Dr. Kwame Mensah',
            specialty: 'Cattle',
            region: 'Ashanti',
            averageRating: 4.8,
            totalReviews: 45,
            consultationFee: 150,
            clinicName: 'Ashanti Veterinary Clinic',
            verified: true,
            featured: true,
            featureRank: 1,
          },
          {
            id: 2,
            name: 'Dr. Ama Osei',
            specialty: 'Small Ruminants',
            region: 'Greater Accra',
            averageRating: 4.6,
            totalReviews: 32,
            consultationFee: 120,
            clinicName: 'Accra Veterinary Care',
            verified: true,
            featured: true,
            featureRank: 2,
          },
        ];
      } catch (error) {
        console.error('Error fetching featured veterinarians:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch featured veterinarians',
        });
      }
    }),

  /**
   * Get veterinarian statistics
   */
  getStatistics: protectedProcedure
    .input(z.object({
      region: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock statistics
        return {
          totalVeterinarians: 45,
          verifiedVeterinarians: 38,
          averageRating: 4.5,
          specialties: {
            'Cattle': 18,
            'Small Ruminants': 12,
            'Poultry': 10,
            'Mixed Animals': 5,
          },
          regions: {
            'Ashanti': 12,
            'Greater Accra': 15,
            'Eastern': 8,
            'Western': 10,
          },
          emergencyAvailable: 35,
          averageConsultationFee: 145,
          totalReviews: 523,
          averageResponseTime: '2 hours',
        };
      } catch (error) {
        console.error('Error fetching statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch statistics',
        });
      }
    }),

  /**
   * Get veterinarians near a location
   */
  getNearby: protectedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().default(50),
      specialty: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock nearby veterinarians
        return [
          {
            id: 1,
            name: 'Dr. Kwame Mensah',
            specialty: 'Cattle',
            distance: 12.5,
            phone: '+233 24 123 4567',
            clinicName: 'Ashanti Veterinary Clinic',
            averageRating: 4.8,
            verified: true,
          },
          {
            id: 2,
            name: 'Dr. Ama Osei',
            specialty: 'Small Ruminants',
            distance: 28.3,
            phone: '+233 24 234 5678',
            clinicName: 'Accra Veterinary Care',
            averageRating: 4.6,
            verified: true,
          },
        ];
      } catch (error) {
        console.error('Error fetching nearby veterinarians:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch nearby veterinarians',
        });
      }
    }),
});
