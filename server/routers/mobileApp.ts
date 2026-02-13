import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';
import { expenses, revenue } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const mobileAppRouter = router({
  // Sync offline expenses and revenue
  syncOfflineTransactions: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        expenses: z.array(
          z.object({
            localId: z.string(),
            category: z.string(),
            amount: z.number().positive(),
            description: z.string(),
            date: z.date(),
            receiptUrl: z.string().optional(),
            notes: z.string().optional(),
          })
        ),
        revenue: z.array(
          z.object({
            localId: z.string(),
            type: z.string(),
            amount: z.number().positive(),
            description: z.string(),
            date: z.date(),
            receiptUrl: z.string().optional(),
            buyerName: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const syncResults = {
        expensesSynced: 0,
        revenueSynced: 0,
        errors: [] as string[],
      };

      try {
        // Sync expenses
        for (const exp of input.expenses) {
          try {
            await ctx.db.insert(expenses).values({
              farmId: input.farmId,
              userId: ctx.user.id,
              category: exp.category,
              amount: exp.amount,
              description: exp.description,
              date: exp.date,
              receiptUrl: exp.receiptUrl,
              notes: exp.notes,
            });
            syncResults.expensesSynced++;
          } catch (error) {
            syncResults.errors.push(`Failed to sync expense ${exp.localId}`);
          }
        }

        // Sync revenue
        for (const rev of input.revenue) {
          try {
            await ctx.db.insert(revenue).values({
              farmId: input.farmId,
              userId: ctx.user.id,
              type: rev.type,
              amount: rev.amount,
              description: rev.description,
              date: rev.date,
              receiptUrl: rev.receiptUrl,
              buyerName: rev.buyerName,
            });
            syncResults.revenueSynced++;
          } catch (error) {
            syncResults.errors.push(`Failed to sync revenue ${rev.localId}`);
          }
        }

        return syncResults;
      } catch (error) {
        throw new Error('Failed to sync offline transactions');
      }
    }),

  // Upload receipt image
  uploadReceipt: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        imageBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In a real implementation, this would upload to S3
        // For now, we'll return a mock URL
        const receiptUrl = `https://receipts.example.com/${input.farmId}/${Date.now()}-${input.fileName}`;

        return {
          success: true,
          receiptUrl,
          message: 'Receipt uploaded successfully',
        };
      } catch (error) {
        throw new Error('Failed to upload receipt');
      }
    }),

  // Get sync status and pending transactions
  getSyncStatus: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const recentExpenses = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id)
            )
          )
          .limit(10);

        const recentRevenue = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id)
            )
          )
          .limit(10);

        return {
          lastSyncTime: new Date(),
          pendingTransactions: 0,
          recentExpenses: recentExpenses.length,
          recentRevenue: recentRevenue.length,
          status: 'synced',
        };
      } catch (error) {
        throw new Error('Failed to get sync status');
      }
    }),

  // Get offline data snapshot
  getOfflineSnapshot: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const allExpenses = await ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.farmId, input.farmId),
              eq(expenses.userId, ctx.user.id)
            )
          );

        const allRevenue = await ctx.db
          .select()
          .from(revenue)
          .where(
            and(
              eq(revenue.farmId, input.farmId),
              eq(revenue.userId, ctx.user.id)
            )
          );

        return {
          expenses: allExpenses,
          revenue: allRevenue,
          timestamp: new Date(),
          totalExpenses: allExpenses.reduce((sum, e) => sum + e.amount, 0),
          totalRevenue: allRevenue.reduce((sum, r) => sum + r.amount, 0),
        };
      } catch (error) {
        throw new Error('Failed to get offline snapshot');
      }
    }),
});
