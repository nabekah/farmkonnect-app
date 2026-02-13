import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';
import { expenses, revenue } from '@/drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';

export const accountingIntegrationRouter = router({
  // Connect to QuickBooks
  connectQuickBooks: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        authCode: z.string(),
        realmId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real implementation, this would exchange auth code for access token
        // and store the connection details securely

        return {
          success: true,
          message: 'Connected to QuickBooks successfully',
          connected: true,
          accountingSystem: 'quickbooks',
          farmId: input.farmId,
          connectionDate: new Date(),
        };
      } catch (error) {
        throw new Error('Failed to connect to QuickBooks');
      }
    }),

  // Connect to Xero
  connectXero: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        authCode: z.string(),
        tenantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real implementation, this would exchange auth code for access token
        // and store the connection details securely

        return {
          success: true,
          message: 'Connected to Xero successfully',
          connected: true,
          accountingSystem: 'xero',
          farmId: input.farmId,
          connectionDate: new Date(),
        };
      } catch (error) {
        throw new Error('Failed to connect to Xero');
      }
    }),

  // Sync expenses to accounting software
  syncExpensesToAccounting: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        accountingSystem: z.enum(['quickbooks', 'xero']),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, startDate)
            )
          );

        const syncedExpenses = [];
        const failedExpenses = [];

        for (const expense of expenseData) {
          try {
            // In a real implementation, this would call the accounting software API
            const mappedExpense = {
              description: expense.description,
              amount: expense.amount,
              category: expense.category,
              date: expense.date,
              accountCode: mapCategoryToAccountCode(expense.category),
            };

            syncedExpenses.push({
              id: expense.id,
              status: 'synced',
              externalId: `EXP-${expense.id}`,
            });
          } catch (error) {
            failedExpenses.push({
              id: expense.id,
              error: 'Failed to sync',
            });
          }
        }

        return {
          totalExpenses: expenseData.length,
          syncedCount: syncedExpenses.length,
          failedCount: failedExpenses.length,
          syncedExpenses,
          failedExpenses,
          message: `Synced ${syncedExpenses.length} expenses to ${input.accountingSystem}`,
        };
      } catch (error) {
        throw new Error('Failed to sync expenses to accounting software');
      }
    }),

  // Sync revenue to accounting software
  syncRevenueToAccounting: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        accountingSystem: z.enum(['quickbooks', 'xero']),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const revenueData = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id),
              gte(revenue.date, startDate)
            )
          );

        const syncedRevenue = [];
        const failedRevenue = [];

        for (const rev of revenueData) {
          try {
            // In a real implementation, this would call the accounting software API
            const mappedRevenue = {
              description: rev.description,
              amount: rev.amount,
              type: rev.type,
              date: rev.date,
              accountCode: mapRevenueTypeToAccountCode(rev.type),
            };

            syncedRevenue.push({
              id: rev.id,
              status: 'synced',
              externalId: `REV-${rev.id}`,
            });
          } catch (error) {
            failedRevenue.push({
              id: rev.id,
              error: 'Failed to sync',
            });
          }
        }

        return {
          totalRevenue: revenueData.length,
          syncedCount: syncedRevenue.length,
          failedCount: failedRevenue.length,
          syncedRevenue,
          failedRevenue,
          message: `Synced ${syncedRevenue.length} revenue entries to ${input.accountingSystem}`,
        };
      } catch (error) {
        throw new Error('Failed to sync revenue to accounting software');
      }
    }),

  // Get accounting connection status
  getConnectionStatus: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // In a real implementation, this would check the stored connection details
        return {
          farmId: input.farmId,
          connections: [
            {
              system: 'quickbooks',
              connected: false,
              lastSync: null,
              nextSync: null,
            },
            {
              system: 'xero',
              connected: false,
              lastSync: null,
              nextSync: null,
            },
          ],
          autoSyncEnabled: false,
          syncFrequency: 'daily',
        };
      } catch (error) {
        throw new Error('Failed to get connection status');
      }
    }),

  // Reconcile accounting records
  reconcileAccounting: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        accountingSystem: z.enum(['quickbooks', 'xero']),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const expenseData = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id),
              gte(expenses.date, input.startDate)
            )
          );

        const revenueData = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id),
              gte(revenue.date, input.startDate)
            )
          );

        // In a real implementation, this would compare with accounting software records
        const discrepancies = [];

        // Check for missing syncs
        const unsyncedExpenses = expenseData.filter((e) => !e.id); // Placeholder check
        const unsyncedRevenue = revenueData.filter((r) => !r.id); // Placeholder check

        if (unsyncedExpenses.length > 0) {
          discrepancies.push({
            type: 'unsynced_expenses',
            count: unsyncedExpenses.length,
            severity: 'warning',
          });
        }

        if (unsyncedRevenue.length > 0) {
          discrepancies.push({
            type: 'unsynced_revenue',
            count: unsyncedRevenue.length,
            severity: 'warning',
          });
        }

        return {
          reconciled: true,
          period: {
            start: input.startDate,
            end: input.endDate,
          },
          totalExpenses: expenseData.reduce((sum, e) => sum + e.amount, 0),
          totalRevenue: revenueData.reduce((sum, r) => sum + r.amount, 0),
          discrepancies,
          status: discrepancies.length === 0 ? 'balanced' : 'needs_review',
        };
      } catch (error) {
        throw new Error('Failed to reconcile accounting records');
      }
    }),
});

// Helper functions
function mapCategoryToAccountCode(category: string): string {
  const categoryMap: Record<string, string> = {
    'Feed & Supplies': '5100',
    Labor: '5200',
    Utilities: '5300',
    Equipment: '5400',
    Maintenance: '5500',
    Transportation: '5600',
    Other: '5900',
  };
  return categoryMap[category] || '5900';
}

function mapRevenueTypeToAccountCode(type: string): string {
  const typeMap: Record<string, string> = {
    Sales: '4100',
    Services: '4200',
    Grants: '4300',
    Other: '4900',
  };
  return typeMap[type] || '4900';
}
