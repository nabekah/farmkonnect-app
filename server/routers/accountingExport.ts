import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

const db = getDb();

export const accountingExportRouter = router({
  // Export to QuickBooks format (CSV)
  exportToQuickBooks: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Get expenses
      const expenseResult = await db.execute(sql`
        SELECT * FROM expenses 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${input.startDate} 
          AND date <= ${input.endDate}
        ORDER BY date ASC
      `);

      // Get revenues
      const revenueResult = await db.execute(sql`
        SELECT * FROM revenues 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${input.startDate} 
          AND date <= ${input.endDate}
        ORDER BY date ASC
      `);

      // QuickBooks CSV format
      const headers = ["Date", "Account", "Description", "Amount", "Type"];
      const rows: string[] = [];

      // Add expenses
      if (expenseResult.rows) {
        expenseResult.rows.forEach((exp: any) => {
          const row = [
            new Date(exp.date).toLocaleDateString(),
            `Expense:${exp.category}`,
            exp.description,
            exp.amount.toFixed(2),
            "Debit",
          ];
          rows.push(row.join(","));
        });
      }

      // Add revenues
      if (revenueResult.rows) {
        revenueResult.rows.forEach((rev: any) => {
          const row = [
            new Date(rev.date).toLocaleDateString(),
            `Income:${rev.source}`,
            rev.description,
            rev.amount.toFixed(2),
            "Credit",
          ];
          rows.push(row.join(","));
        });
      }

      const csvContent = [headers.join(","), ...rows].join("\n");

      return {
        format: "quickbooks",
        filename: `farm-accounting-${input.farmId}-${new Date().toISOString().split("T")[0]}.csv`,
        content: csvContent,
        recordCount: (expenseResult.rows?.length || 0) + (revenueResult.rows?.length || 0),
      };
    }),

  // Export to Xero format (CSV)
  exportToXero: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Get expenses
      const expenseResult = await db.execute(sql`
        SELECT * FROM expenses 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${input.startDate} 
          AND date <= ${input.endDate}
        ORDER BY date ASC
      `);

      // Get revenues
      const revenueResult = await db.execute(sql`
        SELECT * FROM revenues 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${input.startDate} 
          AND date <= ${input.endDate}
        ORDER BY date ASC
      `);

      // Xero CSV format
      const headers = [
        "ContactName",
        "InvoiceNumber",
        "Reference",
        "Description",
        "Date",
        "Amount",
        "AccountCode",
        "TaxType",
        "TaxAmount",
      ];
      const rows: string[] = [];

      // Add expenses
      if (expenseResult.rows) {
        expenseResult.rows.forEach((exp: any, idx: number) => {
          const row = [
            "Farm Expenses",
            `EXP-${idx + 1}`,
            exp.category,
            exp.description,
            new Date(exp.date).toLocaleDateString(),
            exp.amount.toFixed(2),
            `200-${exp.category.substring(0, 3).toUpperCase()}`,
            "Tax on Purchases",
            (exp.amount * 0.05).toFixed(2), // 5% tax
          ];
          rows.push(row.map((r) => `"${r}"`).join(","));
        });
      }

      // Add revenues
      if (revenueResult.rows) {
        revenueResult.rows.forEach((rev: any, idx: number) => {
          const row = [
            "Farm Sales",
            `INV-${idx + 1}`,
            rev.source,
            rev.description,
            new Date(rev.date).toLocaleDateString(),
            rev.amount.toFixed(2),
            `400-${rev.source.substring(0, 3).toUpperCase()}`,
            "Tax on Sales",
            (rev.amount * 0.05).toFixed(2), // 5% tax
          ];
          rows.push(row.map((r) => `"${r}"`).join(","));
        });
      }

      const csvContent = [headers.join(","), ...rows].join("\n");

      return {
        format: "xero",
        filename: `farm-accounting-xero-${input.farmId}-${new Date().toISOString().split("T")[0]}.csv`,
        content: csvContent,
        recordCount: (expenseResult.rows?.length || 0) + (revenueResult.rows?.length || 0),
      };
    }),

  // Export to generic accounting format
  exportToGenericFormat: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(["json", "csv"]),
      })
    )
    .query(async ({ input }) => {
      // Get expenses
      const expenseResult = await db.execute(sql`
        SELECT * FROM expenses 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${input.startDate} 
          AND date <= ${input.endDate}
        ORDER BY date ASC
      `);

      // Get revenues
      const revenueResult = await db.execute(sql`
        SELECT * FROM revenues 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${input.startDate} 
          AND date <= ${input.endDate}
        ORDER BY date ASC
      `);

      // Get budgets
      const budgetResult = await db.execute(sql`
        SELECT * FROM budgets 
        WHERE farm_id = ${input.farmId}
      `);

      const data = {
        exportDate: new Date().toISOString(),
        farmId: input.farmId,
        period: {
          startDate: input.startDate.toISOString(),
          endDate: input.endDate.toISOString(),
        },
        expenses: expenseResult.rows || [],
        revenues: revenueResult.rows || [],
        budgets: budgetResult.rows || [],
        summary: {
          totalExpenses: (expenseResult.rows || []).reduce((sum: number, exp: any) => sum + exp.amount, 0),
          totalRevenues: (revenueResult.rows || []).reduce((sum: number, rev: any) => sum + rev.amount, 0),
          netProfit:
            (revenueResult.rows || []).reduce((sum: number, rev: any) => sum + rev.amount, 0) -
            (expenseResult.rows || []).reduce((sum: number, exp: any) => sum + exp.amount, 0),
        },
      };

      if (input.format === "json") {
        return {
          format: "json",
          filename: `farm-accounting-${input.farmId}-${new Date().toISOString().split("T")[0]}.json`,
          content: JSON.stringify(data, null, 2),
        };
      } else {
        // CSV format
        const headers = ["Date", "Type", "Category/Source", "Description", "Amount"];
        const rows: string[] = [];

        // Add expenses
        (expenseResult.rows || []).forEach((exp: any) => {
          const row = [
            new Date(exp.date).toLocaleDateString(),
            "Expense",
            exp.category,
            exp.description,
            exp.amount.toFixed(2),
          ];
          rows.push(row.join(","));
        });

        // Add revenues
        (revenueResult.rows || []).forEach((rev: any) => {
          const row = [
            new Date(rev.date).toLocaleDateString(),
            "Revenue",
            rev.source,
            rev.description,
            rev.amount.toFixed(2),
          ];
          rows.push(row.join(","));
        });

        const csvContent = [headers.join(","), ...rows].join("\n");

        return {
          format: "csv",
          filename: `farm-accounting-${input.farmId}-${new Date().toISOString().split("T")[0]}.csv`,
          content: csvContent,
        };
      }
    }),

  // Generate tax report for export
  generateTaxReport: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        taxYear: z.number(),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date(input.taxYear, 0, 1);
      const endDate = new Date(input.taxYear, 11, 31);

      // Get expenses
      const expenseResult = await db.execute(sql`
        SELECT category, SUM(amount) as total 
        FROM expenses 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${startDate} 
          AND date <= ${endDate}
        GROUP BY category
      `);

      // Get revenues
      const revenueResult = await db.execute(sql`
        SELECT source, SUM(amount) as total 
        FROM revenues 
        WHERE farm_id = ${input.farmId} 
          AND date >= ${startDate} 
          AND date <= ${endDate}
        GROUP BY source
      `);

      const totalExpenses = (expenseResult.rows || []).reduce((sum: number, row: any) => sum + (row.total || 0), 0);
      const totalRevenues = (revenueResult.rows || []).reduce((sum: number, row: any) => sum + (row.total || 0), 0);
      const netIncome = totalRevenues - totalExpenses;
      const taxableIncome = Math.max(0, netIncome); // No negative taxable income
      const estimatedTax = taxableIncome * 0.15; // 15% tax rate for Ghana

      // Generate CSV
      const headers = ["Item", "Amount (GHS)"];
      const rows = [
        ["Total Revenue", totalRevenues.toFixed(2)],
        ["Total Expenses", totalExpenses.toFixed(2)],
        ["Net Income", netIncome.toFixed(2)],
        ["Taxable Income", taxableIncome.toFixed(2)],
        ["Tax Rate", "15%"],
        ["Estimated Tax Liability", estimatedTax.toFixed(2)],
      ];

      // Add expense breakdown
      rows.push(["", ""]);
      rows.push(["Expense Breakdown", ""]);
      (expenseResult.rows || []).forEach((row: any) => {
        rows.push([row.category, (row.total || 0).toFixed(2)]);
      });

      // Add revenue breakdown
      rows.push(["", ""]);
      rows.push(["Revenue Breakdown", ""]);
      (revenueResult.rows || []).forEach((row: any) => {
        rows.push([row.source, (row.total || 0).toFixed(2)]);
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return {
        filename: `tax-report-${input.farmId}-${input.taxYear}.csv`,
        content: csvContent,
        summary: {
          taxYear: input.taxYear,
          totalRevenues,
          totalExpenses,
          netIncome,
          taxableIncome,
          estimatedTax,
        },
      };
    }),

  // Export invoices for accounting
  exportInvoices: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT i.*, COUNT(ii.id) as item_count, SUM(ii.amount) as items_total
        FROM invoices i
        LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
        WHERE i.farm_id = ${input.farmId} 
          AND i.created_at >= ${input.startDate} 
          AND i.created_at <= ${input.endDate}
        GROUP BY i.id
        ORDER BY i.created_at DESC
      `);

      const headers = [
        "Invoice Number",
        "Client Name",
        "Total Amount",
        "Status",
        "Due Date",
        "Created Date",
        "Item Count",
      ];
      const rows: string[] = [];

      if (result.rows) {
        result.rows.forEach((inv: any) => {
          const row = [
            inv.invoiceNumber,
            inv.clientName,
            inv.totalAmount.toFixed(2),
            inv.status,
            new Date(inv.dueDate).toLocaleDateString(),
            new Date(inv.createdAt).toLocaleDateString(),
            inv.item_count || 0,
          ];
          rows.push(row.join(","));
        });
      }

      const csvContent = [headers.join(","), ...rows].join("\n");

      return {
        filename: `invoices-${input.farmId}-${new Date().toISOString().split("T")[0]}.csv`,
        content: csvContent,
        recordCount: result.rows?.length || 0,
      };
    }),
});
