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
        farmName: z.string().min(1),
        location: z.string().optional(),
        sizeHectares: z.string().optional(),
        farmType: z.enum(["crop", "livestock", "mixed"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db.insert(farms).values({
          farmerUserId: ctx.user.id,
          farmName: input.farmName,
          location: input.location,
          sizeHectares: input.sizeHectares as any,
          farmType: input.farmType || "mixed",
        });
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
          varietyName: z.string().optional(),
          plantingDate: z.date(),
          expectedHarvestDate: z.date().optional(),
          areaPlantedHectares: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(cropCycles).values({
            farmId: input.farmId,
            cropId: input.cropId,
            varietyName: input.varietyName,
            plantingDate: input.plantingDate,
            expectedHarvestDate: input.expectedHarvestDate,
            areaPlantedHectares: input.areaPlantedHectares as any,
            status: "planted",
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
          fertilizerType: z.string(),
          quantityKg: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(fertilizerApplications).values({
            cycleId: input.cycleId,
            applicationDate: input.applicationDate,
            fertilizerType: input.fertilizerType,
            quantityKg: input.quantityKg as any,
            notes: input.notes,
          });
        }),
    }),

    yields: router({      list: protectedProcedure
        .input(z.object({ cycleId: z.number() }))
        .query(async ({ input }) => {
          const db = await getDb();
          if (!db) return [];

          return await db.select().from(yieldRecords).where(eq(yieldRecords.cycleId, input.cycleId));
        }),

      create: protectedProcedure
        .input(z.object({
          cycleId: z.number(),
          yieldQuantityKg: z.string(),
          qualityGrade: z.string().optional(),
          notes: z.string().optional(),
          recordedDate: z.date(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          return await db.insert(yieldRecords).values({
            cycleId: input.cycleId,
            recordedDate: input.recordedDate,
            yieldQuantityKg: input.yieldQuantityKg as any,
            qualityGrade: input.qualityGrade,
            notes: input.notes,
          });
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
