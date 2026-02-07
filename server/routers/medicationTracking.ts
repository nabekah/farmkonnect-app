import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const medicationTrackingRouter = router({
  // Add medication to inventory
  addMedication: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        medicationName: z.string(),
        medicationType: z.enum(["antibiotic", "vaccine", "supplement", "treatment", "other"]),
        quantity: z.number().min(1),
        unit: z.string(),
        expirationDate: z.string(),
        cost: z.number().optional(),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;

      const result = await db.execute(
        sql`
          INSERT INTO medicationInventory (farmId, medicationName, medicationType, quantity, unit, expirationDate, cost, supplier, notes, createdAt)
          VALUES (${farmId}, ${input.medicationName}, ${input.medicationType}, ${input.quantity}, ${input.unit}, ${input.expirationDate}, ${input.cost || null}, ${input.supplier || null}, ${input.notes || null}, NOW())
        `
      );

      return { id: (result as any).insertId, ...input };
    }),

  // Record medication usage
  recordMedicationUsage: protectedProcedure
    .input(
      z.object({
        animalId: z.number(),
        medicationId: z.number(),
        dosage: z.string(),
        unit: z.string(),
        administrationDate: z.string(),
        administrationMethod: z.enum(["oral", "injection", "topical", "other"]),
        reason: z.string(),
        veterinarian: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Record usage
      const result = await db.execute(
        sql`
          INSERT INTO medicationUsage (animalId, medicationId, dosage, unit, administrationDate, administrationMethod, reason, veterinarian, notes, createdAt)
          VALUES (${input.animalId}, ${input.medicationId}, ${input.dosage}, ${input.unit}, ${input.administrationDate}, ${input.administrationMethod}, ${input.reason}, ${input.veterinarian || null}, ${input.notes || null}, NOW())
        `
      );

      // Update medication inventory
      await db.execute(
        sql`
          UPDATE medicationInventory
          SET quantity = quantity - 1
          WHERE id = ${input.medicationId}
        `
      );

      return { id: (result as any).insertId, ...input };
    }),

  // Get medication inventory
  getMedicationInventory: protectedProcedure
    .input(z.object({ farmId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;

      const medications = await db.execute(
        sql`
          SELECT 
            id, medicationName, medicationType, quantity, unit, expirationDate, cost, supplier,
            CASE 
              WHEN expirationDate < CURDATE() THEN 'expired'
              WHEN expirationDate < DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
              WHEN quantity < 5 THEN 'low_stock'
              ELSE 'ok'
            END as status
          FROM medicationInventory
          WHERE farmId = ${farmId}
          ORDER BY expirationDate ASC
        `
      );

      return (medications as any).rows || [];
    }),

  // Get medication usage history for animal
  getAnimalMedicationHistory: protectedProcedure
    .input(z.object({ animalId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const history = await db.execute(
        sql`
          SELECT 
            m.id, m.medicationName, m.medicationType, u.dosage, u.unit, u.administrationDate, 
            u.administrationMethod, u.reason, u.veterinarian, u.notes
          FROM medicationUsage u
          JOIN medicationInventory m ON u.medicationId = m.id
          WHERE u.animalId = ${input.animalId}
          ORDER BY u.administrationDate DESC
        `
      );

      return (history as any).rows || [];
    }),

  // Get medication statistics
  getMedicationStats: protectedProcedure
    .input(z.object({ farmId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;

      // Inventory status
      const inventoryStatus = await db.execute(
        sql`
          SELECT 
            CASE 
              WHEN expirationDate < CURDATE() THEN 'expired'
              WHEN expirationDate < DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
              WHEN quantity < 5 THEN 'low_stock'
              ELSE 'ok'
            END as status,
            COUNT(*) as count
          FROM medicationInventory
          WHERE farmId = ${farmId}
          GROUP BY status
        `
      );

      // Usage by type
      const usageByType = await db.execute(
        sql`
          SELECT 
            m.medicationType,
            COUNT(*) as usageCount,
            COUNT(DISTINCT u.animalId) as animalsAffected
          FROM medicationUsage u
          JOIN medicationInventory m ON u.medicationId = m.id
          WHERE m.farmId = ${farmId} AND u.administrationDate > DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          GROUP BY m.medicationType
        `
      );

      // Cost analysis
      const costAnalysis = await db.execute(
        sql`
          SELECT 
            SUM(cost * quantity) as totalInventoryCost,
            AVG(cost) as avgMedicationCost,
            COUNT(*) as totalMedications
          FROM medicationInventory
          WHERE farmId = ${farmId}
        `
      );

      return {
        inventoryStatus: (inventoryStatus as any).rows || [],
        usageByType: (usageByType as any).rows || [],
        costAnalysis: ((costAnalysis as any).rows?.[0]) || {},
      };
    }),

  // Update medication quantity
  updateMedicationQuantity: protectedProcedure
    .input(
      z.object({
        medicationId: z.number(),
        quantity: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.execute(
        sql`
          UPDATE medicationInventory
          SET quantity = ${input.quantity}
          WHERE id = ${input.medicationId}
        `
      );

      return { success: true };
    }),

  // Delete expired medications
  deleteExpiredMedications: protectedProcedure
    .input(z.object({ farmId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;

      const result = await db.execute(
        sql`
          DELETE FROM medicationInventory
          WHERE farmId = ${farmId} AND expirationDate < CURDATE()
        `
      );

      return { deleted: (result as any).affectedRows || 0 };
    }),
});
