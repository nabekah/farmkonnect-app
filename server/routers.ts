import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import {
  farms,
  crops,
  cropCycles,
  soilTests,
  fertilizerApplications,
  yieldRecords,
  animals,
  animalTypes,
  animalHealthRecords,
  trainingPrograms,
  trainingSessions,
  productListings,
  orders,
  iotDevices,
  sensorReadings,
  alerts,
  challenges,
  kpis,
  monitoringVisits,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================================
  // FARM MANAGEMENT
  // ============================================================================
  farms: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(farms).where(eq(farms.farmerUserId, ctx.user.id));
    }),

    create: protectedProcedure
      .input(z.object({
        farmName: z.string().min(1, "Farm name is required"),
        location: z.string().optional(),
        sizeHectares: z.string().optional(),
        farmType: z.enum(["crop", "livestock", "mixed"]).default("mixed"),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(farms).values({
          farmerUserId: ctx.user.id,
          farmName: input.farmName,
          location: input.location,
          sizeHectares: input.sizeHectares as any,
          farmType: input.farmType,
        });

        return result;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(farms).where(eq(farms.id, input.id));
        return result[0] || null;
      }),
  }),

  // ============================================================================
  // CROP MANAGEMENT
  // ============================================================================
  crops: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(crops);
    }),

    create: protectedProcedure
      .input(z.object({
        cropName: z.string().min(1),
        scientificName: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db.insert(crops).values({
          cropName: input.cropName,
          scientificName: input.scientificName,
          description: input.description,
        });
      }),

    cycles: router({
      list: protectedProcedure
        .input(z.object({ farmId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(cropCycles).where(eq(cropCycles.farmId, input.farmId));
        }),

      create: protectedProcedure
        .input(z.object({
          farmId: z.number(),
          cropId: z.number(),
          plantingDate: z.date(),
          expectedHarvestDate: z.date().optional(),
          varietyName: z.string().optional(),
          areaPlantedHectares: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(cropCycles).values({
            farmId: input.farmId,
            cropId: input.cropId,
            plantingDate: input.plantingDate,
            expectedHarvestDate: input.expectedHarvestDate,
            varietyName: input.varietyName,
            areaPlantedHectares: input.areaPlantedHectares as any,
            status: "planning",
          });
        }),
    }),

    soilTests: router({
      list: protectedProcedure
        .input(z.object({ farmId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(soilTests).where(eq(soilTests.farmId, input.farmId));
        }),

      create: protectedProcedure
        .input(z.object({
          farmId: z.number(),
          testDate: z.date(),
          phLevel: z.string().optional(),
          nitrogenLevel: z.string().optional(),
          phosphorusLevel: z.string().optional(),
          potassiumLevel: z.string().optional(),
          organicMatter: z.string().optional(),
          recommendations: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(soilTests).values({
            farmId: input.farmId,
            testDate: input.testDate,
            phLevel: input.phLevel as any,
            nitrogenLevel: input.nitrogenLevel as any,
            phosphorusLevel: input.phosphorusLevel as any,
            potassiumLevel: input.potassiumLevel as any,
            organicMatter: input.organicMatter as any,
            recommendations: input.recommendations,
          });
        }),
    }),

    fertilizers: router({
      list: protectedProcedure
        .input(z.object({ cycleId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(fertilizerApplications).where(eq(fertilizerApplications.cycleId, input.cycleId));
        }),

      create: protectedProcedure
        .input(z.object({
          cycleId: z.number(),
          applicationDate: z.date(),
          fertilizerType: z.string().min(1),
          quantityKg: z.string().min(1),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(fertilizerApplications).values({
            cycleId: input.cycleId,
            applicationDate: input.applicationDate,
            fertilizerType: input.fertilizerType,
            quantityKg: input.quantityKg as any,
            appliedByUserId: ctx.user.id,
            notes: input.notes,
          });
        }),
    }),

    yields: router({
      list: protectedProcedure
        .input(z.object({ cycleId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(yieldRecords).where(eq(yieldRecords.cycleId, input.cycleId));
        }),

      listByFarm: protectedProcedure
        .input(z.object({ farmId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          const cycles = await db.select().from(cropCycles).where(eq(cropCycles.farmId, input.farmId));
          const cycleIds = cycles.map(c => c.id);
          if (cycleIds.length === 0) return [];
          return await db.select().from(yieldRecords).where(eq(yieldRecords.cycleId, cycleIds[0]));
        }),

      create: protectedProcedure
        .input(z.object({
          cycleId: z.number(),
          yieldQuantityKg: z.string().min(1),
          qualityGrade: z.string().optional(),
          postHarvestLossKg: z.string().optional(),
          recordedDate: z.date(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(yieldRecords).values({
            cycleId: input.cycleId,
            yieldQuantityKg: input.yieldQuantityKg as any,
            qualityGrade: input.qualityGrade,
            postHarvestLossKg: input.postHarvestLossKg as any,
            recordedDate: input.recordedDate,
            notes: input.notes,
          });
        }),
    }),
  }),

  // ============================================================================
  // ANIMAL MANAGEMENT
  // ============================================================================
  animals: router({
    types: router({
      list: protectedProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(animalTypes);
      }),
    }),

    list: protectedProcedure
      .input(z.object({ farmId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(animals).where(eq(animals.farmId, input.farmId));
      }),

    create: protectedProcedure
      .input(z.object({
        farmId: z.number(),
        typeId: z.number(),
        uniqueTagId: z.string().optional(),
        breed: z.string().optional(),
        birthDate: z.date().optional(),
        gender: z.enum(["male", "female", "unknown"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db.insert(animals).values({
          farmId: input.farmId,
          typeId: input.typeId,
          uniqueTagId: input.uniqueTagId,
          breed: input.breed,
          birthDate: input.birthDate,
          gender: input.gender,
          status: "active",
        });
      }),

    health: router({
      list: protectedProcedure
        .input(z.object({ animalId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(animalHealthRecords).where(eq(animalHealthRecords.animalId, input.animalId));
        }),

      create: protectedProcedure
        .input(z.object({
          animalId: z.number(),
          recordDate: z.date(),
          eventType: z.enum(["vaccination", "treatment", "illness", "checkup", "other"]),
          details: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(animalHealthRecords).values({
            animalId: input.animalId,
            recordDate: input.recordDate,
            eventType: input.eventType,
            details: input.details,
          });
        }),
    }),
  }),

  // ============================================================================
  // MARKETPLACE
  // ============================================================================
  marketplace: router({
    listings: router({
      list: protectedProcedure
        .input(z.object({ farmId: z.number().optional() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          if (input.farmId) {
            return await db.select().from(productListings).where(eq(productListings.farmId, input.farmId));
          }
          return await db.select().from(productListings);
        }),

      create: protectedProcedure
        .input(z.object({
          farmId: z.number(),
          productType: z.enum(["crop", "livestock", "processed"]),
          productName: z.string().min(1),
          quantityAvailable: z.string().min(1),
          unit: z.string().min(1),
          unitPrice: z.string().min(1),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(productListings).values({
            farmId: input.farmId,
            productType: input.productType,
            productName: input.productName,
            quantityAvailable: input.quantityAvailable as any,
            unit: input.unit,
            unitPrice: input.unitPrice as any,
            description: input.description,
            listingDate: new Date(),
            status: "active",
          });
        }),
    }),

    orders: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(orders).where(eq(orders.buyerUserId, ctx.user.id));
      }),

      create: protectedProcedure
        .input(z.object({
          totalAmount: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(orders).values({
            buyerUserId: ctx.user.id,
            orderDate: new Date(),
            totalAmount: input.totalAmount as any,
            status: "pending",
          });
        }),
    }),
  }),

  // ============================================================================
  // TRAINING
  // ============================================================================
  training: router({
    programs: router({
      list: protectedProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(trainingPrograms);
      }),

      create: protectedProcedure
        .input(z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          targetAudience: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(trainingPrograms).values({
            title: input.title,
            description: input.description,
            targetAudience: input.targetAudience,
          });
        }),
    }),

    sessions: router({
      list: protectedProcedure
        .input(z.object({ programId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(trainingSessions).where(eq(trainingSessions.programId, input.programId));
        }),

      create: protectedProcedure
        .input(z.object({
          programId: z.number(),
          sessionDate: z.date(),
          location: z.string().optional(),
          maxParticipants: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(trainingSessions).values({
            programId: input.programId,
            sessionDate: input.sessionDate,
            location: input.location,
            maxParticipants: input.maxParticipants,
            status: "scheduled",
          });
        }),
    }),
  }),

  // ============================================================================
  // IOT AND SMART FARMING
  // ============================================================================
  iot: router({
    devices: router({
      list: protectedProcedure
        .input(z.object({ farmId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(iotDevices).where(eq(iotDevices.farmId, input.farmId));
        }),

      create: protectedProcedure
        .input(z.object({
          farmId: z.number(),
          deviceSerial: z.string().min(1),
          deviceType: z.enum(["soil_sensor", "weather_station", "animal_monitor", "water_meter", "other"]),
          installationDate: z.date().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(iotDevices).values({
            farmId: input.farmId,
            deviceSerial: input.deviceSerial,
            deviceType: input.deviceType,
            installationDate: input.installationDate,
            status: "active",
          });
        }),
    }),

    readings: router({
      list: protectedProcedure
        .input(z.object({ deviceId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(sensorReadings).where(eq(sensorReadings.deviceId, input.deviceId));
        }),

      create: protectedProcedure
        .input(z.object({
          deviceId: z.number(),
          readingTimestamp: z.date(),
          readingType: z.string().min(1),
          value: z.string().min(1),
          unit: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(sensorReadings).values({
            deviceId: input.deviceId,
            readingTimestamp: input.readingTimestamp,
            readingType: input.readingType,
            value: input.value as any,
            unit: input.unit,
          });
        }),
    }),

    alerts: router({
      list: protectedProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(alerts);
      }),

      create: protectedProcedure
        .input(z.object({
          deviceId: z.number(),
          farmId: z.number(),
          alertType: z.string().min(1),
          message: z.string().optional(),
          severity: z.enum(["info", "warning", "critical"]).optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(alerts).values({
            deviceId: input.deviceId,
            farmId: input.farmId,
            alertType: input.alertType,
            message: input.message,
            severity: input.severity || "warning",
          });
        }),
    }),
  }),

  // ============================================================================
  // MERL (MONITORING, EVALUATION, REPORTING, LEARNING)
  // ============================================================================
  merl: router({
    challenges: router({
      list: protectedProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(challenges);
      }),

      create: protectedProcedure
        .input(z.object({
          farmId: z.number(),
          challengeDescription: z.string().min(1),
          category: z.string().optional(),
          severity: z.enum(["low", "medium", "high", "critical"]).optional(),
          reportedDate: z.date(),
        }))
        .mutation(async ({ ctx, input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(challenges).values({
            farmId: input.farmId,
            reportedByUserId: ctx.user.id,
            challengeDescription: input.challengeDescription,
            category: input.category,
            severity: input.severity || "medium",
            reportedDate: input.reportedDate,
            status: "open",
          });
        }),
    }),

    kpis: router({
      list: protectedProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(kpis);
      }),

      create: protectedProcedure
        .input(z.object({
          kpiName: z.string().min(1),
          description: z.string().optional(),
          targetValue: z.string().optional(),
          unitOfMeasure: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(kpis).values({
            kpiName: input.kpiName,
            description: input.description,
            targetValue: input.targetValue as any,
            unitOfMeasure: input.unitOfMeasure,
          });
        }),
    }),

    visits: router({
      list: protectedProcedure
        .input(z.object({ farmId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];
          return await db.select().from(monitoringVisits).where(eq(monitoringVisits.farmId, input.farmId));
        }),

      create: protectedProcedure
        .input(z.object({
          farmId: z.number(),
          visitDate: z.date(),
          observations: z.string().optional(),
          photoEvidenceUrl: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(monitoringVisits).values({
            farmId: input.farmId,
            visitorUserId: ctx.user.id,
            visitDate: input.visitDate,
            observations: input.observations,
            photoEvidenceUrl: input.photoEvidenceUrl,
          });
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
