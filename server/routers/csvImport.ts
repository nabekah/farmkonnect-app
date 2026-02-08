import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { parseAnimalCSV, generateCSVTemplate } from "../services/csvImportService";
import { getDb } from "../db";
import { animals } from "../../drizzle/schema";

export const csvImportRouter = router({
  validateCSV: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .query(({ input }) => {
      const result = parseAnimalCSV(input.csvContent);
      return result;
    }),

  importAnimals: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        csvContent: z.string(),
        animalTypeId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = parseAnimalCSV(input.csvContent);

      if (!result.success) {
        return {
          success: false,
          imported: 0,
          failed: result.errors.length,
          errors: result.errors,
        };
      }

      try {
        const db = await getDb();
        let importedCount = 0;

        for (const row of result.validRows) {
          await db.insert(animals).values({
            farmId: input.farmId,
            typeId: input.animalTypeId,
            uniqueTagId: row.tagId,
            breed: row.breed,
            gender: row.gender,
            birthDate: row.birthDate ? new Date(row.birthDate) : null,
            userId: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          importedCount++;
        }

        return {
          success: true,
          imported: importedCount,
          failed: 0,
          errors: [],
        };
      } catch (error) {
        return {
          success: false,
          imported: 0,
          failed: result.validRows.length,
          errors: [
            {
              row: 0,
              error: `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }),

  getCSVTemplate: protectedProcedure.query(() => {
    const template = generateCSVTemplate();
    return {
      template,
      headers: ["tagId", "animalType", "breed", "gender", "birthDate", "notes"],
      example: {
        tagId: "TAG001",
        animalType: "Cattle",
        breed: "Holstein",
        gender: "female",
        birthDate: "2023-01-15",
        notes: "Optional notes",
      },
    };
  }),
});
