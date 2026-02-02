import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { scheduledReportExecutionService } from "../_core/scheduledReportExecutionService";

export const reportExecutionRouter = router({
  /**
   * Execute scheduled reports immediately
   */
  executeScheduledReports: protectedProcedure.mutation(async () => {
    await scheduledReportExecutionService.executeScheduledReports();
    return { success: true, message: "Scheduled reports executed" };
  }),

  /**
   * Get execution history for a schedule
   */
  getExecutionHistory: protectedProcedure
    .input(
      z.object({
        scheduleId: z.number(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      return await scheduledReportExecutionService.getExecutionHistory(
        input.scheduleId,
        input.limit
      );
    }),

  /**
   * Get execution details for a specific execution
   */
  getExecutionDetails: protectedProcedure
    .input(z.object({ executionLogId: z.number() }))
    .query(async ({ input }) => {
      return await scheduledReportExecutionService.getExecutionDetails(
        input.executionLogId
      );
    }),

  /**
   * Retry failed deliveries
   */
  retryFailedDeliveries: protectedProcedure
    .input(z.object({ executionLogId: z.number() }))
    .mutation(async ({ input }) => {
      return await scheduledReportExecutionService.retryFailedDeliveries(
        input.executionLogId
      );
    }),

  /**
   * Get execution statistics
   */
  getExecutionStats: protectedProcedure
    .input(z.object({ scheduleId: z.number() }))
    .query(async ({ input }) => {
      return await scheduledReportExecutionService.getExecutionStats(
        input.scheduleId
      );
    }),
});
