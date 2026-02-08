import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

const db = getDb();

export const recurringExpensesRouter = router({
  // Create recurring expense template
  createTemplate: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        name: z.string().min(1, "Template name is required"),
        category: z.enum(["feed", "medication", "labor", "equipment", "utilities", "transport"]),
        description: z.string(),
        amount: z.number().positive("Amount must be positive"),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
        startDate: z.date(),
        endDate: z.date().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO recurring_expense_templates (
          farm_id, name, category, description, amount, frequency, start_date, end_date, is_active, created_at, updated_at
        ) VALUES (
          ${input.farmId}, ${input.name}, ${input.category}, ${input.description}, 
          ${input.amount}, ${input.frequency}, ${input.startDate}, ${input.endDate || null}, 
          ${input.isActive}, NOW(), NOW()
        )
      `);

      return { success: true, message: "Recurring expense template created" };
    }),

  // Get all templates for a farm
  getTemplates: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM recurring_expense_templates 
        WHERE farm_id = ${input.farmId} AND is_active = true
        ORDER BY created_at DESC
      `);

      return result.rows || [];
    }),

  // Get template by ID
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM recurring_expense_templates 
        WHERE id = ${input.templateId}
      `);

      return result.rows?.[0] || null;
    }),

  // Update template
  updateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        amount: z.number().positive().optional(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (input.name !== undefined) {
        updates.push("name = ?");
        values.push(input.name);
      }
      if (input.description !== undefined) {
        updates.push("description = ?");
        values.push(input.description);
      }
      if (input.amount !== undefined) {
        updates.push("amount = ?");
        values.push(input.amount);
      }
      if (input.frequency !== undefined) {
        updates.push("frequency = ?");
        values.push(input.frequency);
      }
      if (input.isActive !== undefined) {
        updates.push("is_active = ?");
        values.push(input.isActive);
      }

      if (updates.length === 0) {
        return { success: false, message: "No updates provided" };
      }

      updates.push("updated_at = NOW()");
      values.push(input.templateId);

      const result = await db.execute(sql`
        UPDATE recurring_expense_templates 
        SET ${sql.raw(updates.join(", "))}
        WHERE id = ?
      `);

      return { success: true, message: "Template updated" };
    }),

  // Delete template
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        UPDATE recurring_expense_templates 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${input.templateId}
      `);

      return { success: true, message: "Template deleted" };
    }),

  // Apply template (create expense from template)
  applyTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        farmId: z.string(),
        customAmount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get template
      const templateResult = await db.execute(sql`
        SELECT * FROM recurring_expense_templates 
        WHERE id = ${input.templateId}
      `);

      if (!templateResult.rows || templateResult.rows.length === 0) {
        return { success: false, message: "Template not found" };
      }

      const template = templateResult.rows[0];

      // Create expense from template
      const amount = input.customAmount || template.amount;

      const result = await db.execute(sql`
        INSERT INTO expenses (
          farm_id, category, description, amount, date, created_at, updated_at
        ) VALUES (
          ${input.farmId}, ${template.category}, ${template.description}, 
          ${amount}, NOW(), NOW(), NOW()
        )
      `);

      return { success: true, message: "Expense created from template" };
    }),

  // Get templates by category
  getTemplatesByCategory: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        category: z.enum(["feed", "medication", "labor", "equipment", "utilities", "transport"]),
      })
    )
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT * FROM recurring_expense_templates 
        WHERE farm_id = ${input.farmId} AND category = ${input.category} AND is_active = true
        ORDER BY created_at DESC
      `);

      return result.rows || [];
    }),

  // Calculate total recurring expenses for a period
  calculateRecurringExpenses: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT 
          category,
          SUM(amount) as total_amount,
          COUNT(*) as frequency_count,
          AVG(amount) as average_amount
        FROM recurring_expense_templates
        WHERE farm_id = ${input.farmId} 
          AND is_active = true
          AND start_date <= ${input.endDate}
          AND (end_date IS NULL OR end_date >= ${input.startDate})
        GROUP BY category
      `);

      const breakdown: Record<string, number> = {};
      let totalRecurring = 0;

      if (result.rows) {
        result.rows.forEach((row: any) => {
          breakdown[row.category] = row.total_amount || 0;
          totalRecurring += row.total_amount || 0;
        });
      }

      return {
        breakdown,
        totalRecurring,
        count: result.rows?.length || 0,
      };
    }),
});
