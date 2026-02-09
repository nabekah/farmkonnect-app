import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Medication compliance schema
const medicationComplianceSchema = z.object({
  id: z.number().optional(),
  prescriptionId: z.number(),
  animalId: z.number(),
  farmId: z.number(),
  medicationName: z.string(),
  scheduledDate: z.date(),
  scheduledTime: z.string().optional(),
  administeredDate: z.date().optional(),
  administeredTime: z.string().optional(),
  dosageGiven: z.string().optional(),
  status: z.enum(['pending', 'administered', 'missed', 'skipped']).default('pending'),
  notes: z.string().optional(),
  sideEffects: z.string().optional(),
});

export const medicationComplianceRouter = router({
  /**
   * Get compliance records for a prescription
   */
  getByPrescription: protectedProcedure
    .input(z.object({
      prescriptionId: z.number(),
      status: z.enum(['pending', 'administered', 'missed', 'skipped']).optional(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock data - replace with actual database query
        const records = [
          {
            id: 1,
            prescriptionId: input.prescriptionId,
            animalId: 1,
            medicationName: 'Amoxicillin',
            scheduledDate: new Date('2024-02-10'),
            scheduledTime: '08:00',
            administeredDate: new Date('2024-02-10'),
            administeredTime: '08:15',
            dosageGiven: '500mg',
            status: 'administered',
            notes: 'Animal ate well after medication',
          },
          {
            id: 2,
            prescriptionId: input.prescriptionId,
            animalId: 1,
            medicationName: 'Amoxicillin',
            scheduledDate: new Date('2024-02-11'),
            scheduledTime: '08:00',
            administeredDate: null,
            administeredTime: null,
            dosageGiven: null,
            status: input.status || 'pending',
            notes: null,
          },
        ];

        if (input.status) {
          return records.filter((r) => r.status === input.status);
        }
        return records;
      } catch (error) {
        console.error('Error fetching compliance records:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch compliance records',
        });
      }
    }),

  /**
   * Record medication administration
   */
  recordAdministration: protectedProcedure
    .input(z.object({
      complianceId: z.number(),
      administeredDate: z.date(),
      administeredTime: z.string(),
      dosageGiven: z.string(),
      notes: z.string().optional(),
      sideEffects: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Mock recording
        return {
          complianceId: input.complianceId,
          status: 'administered',
          administeredDate: input.administeredDate,
          administeredTime: input.administeredTime,
          dosageGiven: input.dosageGiven,
          notes: input.notes,
          sideEffects: input.sideEffects,
          updatedAt: new Date(),
        };
      } catch (error) {
        console.error('Error recording administration:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record medication administration',
        });
      }
    }),

  /**
   * Mark medication as missed
   */
  markAsMissed: protectedProcedure
    .input(z.object({
      complianceId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return {
          complianceId: input.complianceId,
          status: 'missed',
          reason: input.reason,
          updatedAt: new Date(),
        };
      } catch (error) {
        console.error('Error marking as missed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark medication as missed',
        });
      }
    }),

  /**
   * Get compliance summary for a prescription
   */
  getSummary: protectedProcedure
    .input(z.object({
      prescriptionId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock summary
        return {
          prescriptionId: input.prescriptionId,
          totalScheduled: 14,
          totalAdministered: 12,
          totalMissed: 2,
          totalSkipped: 0,
          compliancePercentage: 85.71,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-14'),
          status: 'in_progress',
          alerts: [
            {
              type: 'missed_dose',
              message: '2 doses missed',
              severity: 'warning',
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching compliance summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch compliance summary',
        });
      }
    }),

  /**
   * Get compliance dashboard for a farm
   */
  getDashboard: protectedProcedure
    .input(z.object({
      farmId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock dashboard
        return {
          farmId: input.farmId,
          averageCompliance: 82.5,
          totalAnimalsOnMedication: 5,
          animalsWithPerfectCompliance: 3,
          animalsWithLowCompliance: 1,
          recentMissedDoses: 3,
          upcomingScheduledMedications: 8,
          complianceTrend: [
            { date: '2024-02-01', compliance: 75 },
            { date: '2024-02-02', compliance: 78 },
            { date: '2024-02-03', compliance: 82 },
            { date: '2024-02-04', compliance: 85 },
            { date: '2024-02-05', compliance: 83 },
          ],
          animalComplianceBreakdown: [
            {
              animalId: 1,
              animalName: 'Bessie',
              compliance: 90,
              status: 'excellent',
            },
            {
              animalId: 2,
              animalName: 'Daisy',
              compliance: 75,
              status: 'good',
            },
            {
              animalId: 3,
              animalName: 'Goat-01',
              compliance: 60,
              status: 'needs_attention',
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching compliance dashboard:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch compliance dashboard',
        });
      }
    }),

  /**
   * Get compliance alerts
   */
  getAlerts: protectedProcedure
    .input(z.object({
      farmId: z.number(),
      severity: z.enum(['critical', 'warning', 'info']).optional(),
    }))
    .query(async ({ input }) => {
      try {
        // Mock alerts
        const alerts = [
          {
            id: 1,
            farmId: input.farmId,
            animalId: 1,
            animalName: 'Bessie',
            type: 'missed_dose',
            severity: 'warning',
            message: 'Missed dose on 2024-02-10',
            prescriptionId: 1,
            createdAt: new Date('2024-02-10'),
          },
          {
            id: 2,
            farmId: input.farmId,
            animalId: 2,
            animalName: 'Daisy',
            type: 'low_compliance',
            severity: 'critical',
            message: 'Compliance below 70% for prescription',
            prescriptionId: 2,
            createdAt: new Date('2024-02-09'),
          },
        ];

        if (input.severity) {
          return alerts.filter((a) => a.severity === input.severity);
        }
        return alerts;
      } catch (error) {
        console.error('Error fetching alerts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch alerts',
        });
      }
    }),

  /**
   * Generate compliance report
   */
  generateReport: protectedProcedure
    .input(z.object({
      farmId: z.number(),
      startDate: z.date(),
      endDate: z.date(),
      format: z.enum(['pdf', 'csv', 'json']).default('pdf'),
    }))
    .mutation(async ({ input }) => {
      try {
        // Mock report generation
        return {
          farmId: input.farmId,
          reportId: `report_${Date.now()}`,
          format: input.format,
          startDate: input.startDate,
          endDate: input.endDate,
          generatedAt: new Date(),
          downloadUrl: `/reports/${Date.now()}/compliance.${input.format}`,
          summary: {
            totalAnimals: 5,
            averageCompliance: 82.5,
            totalDoses: 150,
            administeredDoses: 124,
            missedDoses: 26,
          },
        };
      } catch (error) {
        console.error('Error generating report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate compliance report',
        });
      }
    }),

  /**
   * Get compliance history for an animal
   */
  getAnimalHistory: protectedProcedure
    .input(z.object({
      animalId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      try {
        // Mock history
        return [
          {
            id: 1,
            prescriptionId: 1,
            medicationName: 'Amoxicillin',
            scheduledDate: new Date('2024-02-10'),
            administeredDate: new Date('2024-02-10'),
            status: 'administered',
            dosageGiven: '500mg',
          },
          {
            id: 2,
            prescriptionId: 1,
            medicationName: 'Amoxicillin',
            scheduledDate: new Date('2024-02-11'),
            administeredDate: null,
            status: 'pending',
            dosageGiven: null,
          },
        ];
      } catch (error) {
        console.error('Error fetching animal history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch animal history',
        });
      }
    }),
});
