import { router, protectedProcedure } from './trpc';
import { z } from 'zod';
import { storagePut } from './storage';

/**
 * Prescription Compliance Tracking Router
 * Manages medication adherence monitoring with photo/video evidence
 */

export const complianceTrackingRouter = router({
  // Record daily compliance
  recordDailyCompliance: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        complianceDate: z.date(),
        dosesGiven: z.number(),
        dosesScheduled: z.number(),
        notes: z.string().optional(),
        recordedBy: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const compliancePercentage = (input.dosesGiven / input.dosesScheduled) * 100;

      return {
        id: Math.random(),
        ...input,
        compliancePercentage,
        createdAt: new Date(),
      };
    }),

  // Upload compliance evidence (photo/video)
  uploadComplianceEvidence: protectedProcedure
    .input(
      z.object({
        complianceId: z.number(),
        fileBuffer: z.instanceof(Buffer),
        fileType: z.enum(['image/jpeg', 'image/png', 'video/mp4', 'video/webm']),
        evidenceType: z.enum(['photo', 'video']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const fileName = `compliance-${input.complianceId}-${Date.now()}`;
        const { url } = await storagePut(
          `compliance-evidence/${fileName}`,
          input.fileBuffer,
          input.fileType
        );

        return {
          id: Math.random(),
          complianceId: input.complianceId,
          evidenceType: input.evidenceType,
          fileUrl: url,
          fileType: input.fileType,
          uploadedAt: new Date(),
          notes: input.notes,
        };
      } catch (error) {
        throw new Error(`Failed to upload evidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get compliance record
  getComplianceRecord: protectedProcedure
    .input(z.object({ complianceId: z.number() }))
    .query(async ({ input }) => {
      // Mock implementation
      return {
        id: input.complianceId,
        prescriptionId: 1,
        complianceDate: new Date(),
        dosesGiven: 3,
        dosesScheduled: 3,
        compliancePercentage: 100,
        notes: 'All doses given as prescribed',
        recordedBy: 'John Mensah',
        evidence: [
          {
            id: 1,
            evidenceType: 'photo',
            fileUrl: 'https://example.com/photo1.jpg',
            uploadedAt: new Date(),
          },
        ],
      };
    }),

  // Get prescription compliance history
  getPrescriptionCompliance: protectedProcedure
    .input(z.object({ prescriptionId: z.number() }))
    .query(async ({ input }) => {
      // Mock implementation - return 30 days of compliance data
      const complianceData = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        complianceData.push({
          id: i + 1,
          prescriptionId: input.prescriptionId,
          complianceDate: date,
          dosesGiven: Math.floor(Math.random() * 4) + 2,
          dosesScheduled: 3,
          compliancePercentage: (Math.floor(Math.random() * 4) + 2) / 3 * 100,
          notes: i % 5 === 0 ? 'Missed one dose' : 'All doses given',
        });
      }
      return complianceData;
    }),

  // Get compliance analytics
  getComplianceAnalytics: protectedProcedure
    .input(z.object({ prescriptionId: z.number(), days: z.number().default(30) }))
    .query(async ({ input }) => {
      const totalDays = input.days;
      const fullComplianceDays = Math.floor(totalDays * 0.85);
      const partialComplianceDays = Math.floor(totalDays * 0.10);
      const noComplianceDays = totalDays - fullComplianceDays - partialComplianceDays;

      return {
        prescriptionId: input.prescriptionId,
        period: `Last ${input.days} days`,
        overallCompliance: 87.5,
        fullComplianceDays,
        partialComplianceDays,
        noComplianceDays,
        trend: [
          { day: 'Week 1', compliance: 90 },
          { day: 'Week 2', compliance: 85 },
          { day: 'Week 3', compliance: 88 },
          { day: 'Week 4', compliance: 87 },
        ],
        complianceByDayOfWeek: [
          { day: 'Monday', compliance: 92 },
          { day: 'Tuesday', compliance: 88 },
          { day: 'Wednesday', compliance: 85 },
          { day: 'Thursday', compliance: 87 },
          { day: 'Friday', compliance: 89 },
          { day: 'Saturday', compliance: 86 },
          { day: 'Sunday', compliance: 84 },
        ],
        recommendations: [
          'Consider setting phone reminders for medication times',
          'Compliance is good, continue current schedule',
          'Monitor for any side effects that might affect compliance',
        ],
      };
    }),

  // Get farm-wide compliance summary
  getFarmComplianceSummary: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      return {
        farmId: input.farmId,
        totalPrescriptions: 12,
        highCompliance: 10,
        mediumCompliance: 2,
        lowCompliance: 0,
        averageCompliance: 91.2,
        complianceDistribution: [
          { range: '90-100%', count: 10 },
          { range: '70-89%', count: 2 },
          { range: '50-69%', count: 0 },
          { range: '<50%', count: 0 },
        ],
        topPerformers: [
          { animalName: 'Bessie', compliance: 98 },
          { animalName: 'Daisy', compliance: 96 },
          { animalName: 'Molly', compliance: 94 },
        ],
        needsAttention: [
          { animalName: 'Stella', compliance: 72, reason: 'Missed doses on weekends' },
          { animalName: 'Luna', compliance: 68, reason: 'Animal refuses medication' },
        ],
      };
    }),

  // Get compliance alerts
  getComplianceAlerts: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
      return [
        {
          id: 1,
          type: 'low-compliance',
          severity: 'high',
          message: 'Stella has low medication compliance (72%)',
          animal: 'Stella',
          prescription: 'Antibiotics',
          action: 'Contact farmer to discuss barriers',
        },
        {
          id: 2,
          type: 'missed-dose',
          severity: 'medium',
          message: 'Luna missed 2 doses this week',
          animal: 'Luna',
          prescription: 'Pain reliever',
          action: 'Provide additional support',
        },
        {
          id: 3,
          type: 'expiring-prescription',
          severity: 'low',
          message: 'Bessie prescription expires in 3 days',
          animal: 'Bessie',
          prescription: 'Vitamins',
          action: 'Schedule renewal appointment',
        },
      ];
    }),

  // Generate compliance report
  generateComplianceReport: protectedProcedure
    .input(z.object({ prescriptionId: z.number(), startDate: z.date(), endDate: z.date() }))
    .mutation(async ({ input }) => {
      return {
        prescriptionId: input.prescriptionId,
        reportPeriod: `${input.startDate.toLocaleDateString()} - ${input.endDate.toLocaleDateString()}`,
        totalDays: 30,
        complianceDays: 26,
        overallCompliance: 86.7,
        averageDosesPerDay: 2.9,
        missedDoses: 3,
        extraDoses: 0,
        reportUrl: `https://example.com/reports/compliance-${input.prescriptionId}.pdf`,
        generatedAt: new Date(),
      };
    }),

  // Set compliance reminder
  setComplianceReminder: protectedProcedure
    .input(
      z.object({
        prescriptionId: z.number(),
        reminderTime: z.string(),
        reminderDays: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])),
        reminderType: z.enum(['sms', 'email', 'push']),
      })
    )
    .mutation(async ({ input }) => {
      return {
        id: Math.random(),
        ...input,
        status: 'active',
        createdAt: new Date(),
      };
    }),

  // Get compliance insights
  getComplianceInsights: protectedProcedure
    .input(z.object({ prescriptionId: z.number() }))
    .query(async ({ input }) => {
      return {
        prescriptionId: input.prescriptionId,
        insights: [
          {
            title: 'Best Compliance Day',
            description: 'Monday has the highest compliance rate at 92%',
            actionable: true,
          },
          {
            title: 'Weekend Challenge',
            description: 'Compliance drops to 84% on weekends',
            actionable: true,
            suggestion: 'Consider setting reminders for weekend doses',
          },
          {
            title: 'Positive Trend',
            description: 'Compliance has improved 5% over the last week',
            actionable: false,
          },
          {
            title: 'Medication Tolerance',
            description: 'No adverse reactions reported despite consistent dosing',
            actionable: false,
          },
        ],
      };
    }),
});
