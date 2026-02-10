import { protectedProcedure, adminProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  initializeNotificationScheduler,
  stopNotificationScheduler,
  getSchedulerStatus,
  enableJob,
  disableJob,
  runJobNow,
} from '../services/notificationScheduler';

export const notificationSchedulerRouter = router({
  /**
   * Get status of all scheduled notification jobs
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const status = getSchedulerStatus();
      return {
        success: true,
        status,
      };
    } catch (error) {
      console.error('[NotificationScheduler] Error getting status:', error);
      throw new Error('Failed to get scheduler status');
    }
  }),

  /**
   * Enable a specific notification job (admin only)
   */
  enableJob: adminProcedure
    .input(z.object({ jobName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const success = enableJob(input.jobName);
        return {
          success,
          message: success ? `Job ${input.jobName} enabled` : `Failed to enable job ${input.jobName}`,
        };
      } catch (error) {
        console.error('[NotificationScheduler] Error enabling job:', error);
        throw new Error('Failed to enable job');
      }
    }),

  /**
   * Disable a specific notification job (admin only)
   */
  disableJob: adminProcedure
    .input(z.object({ jobName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const success = disableJob(input.jobName);
        return {
          success,
          message: success ? `Job ${input.jobName} disabled` : `Failed to disable job ${input.jobName}`,
        };
      } catch (error) {
        console.error('[NotificationScheduler] Error disabling job:', error);
        throw new Error('Failed to disable job');
      }
    }),

  /**
   * Run a job immediately (admin only)
   */
  runJobNow: adminProcedure
    .input(z.object({ jobName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const success = await runJobNow(input.jobName);
        return {
          success,
          message: success ? `Job ${input.jobName} executed` : `Failed to execute job ${input.jobName}`,
        };
      } catch (error) {
        console.error('[NotificationScheduler] Error running job:', error);
        throw new Error('Failed to run job');
      }
    }),

  /**
   * Initialize scheduler (admin only)
   */
  initialize: adminProcedure.mutation(async ({ ctx }) => {
    try {
      initializeNotificationScheduler();
      const status = getSchedulerStatus();
      return {
        success: true,
        message: 'Notification scheduler initialized',
        status,
      };
    } catch (error) {
      console.error('[NotificationScheduler] Error initializing scheduler:', error);
      throw new Error('Failed to initialize scheduler');
    }
  }),

  /**
   * Stop scheduler (admin only)
   */
  stop: adminProcedure.mutation(async ({ ctx }) => {
    try {
      stopNotificationScheduler();
      return {
        success: true,
        message: 'Notification scheduler stopped',
      };
    } catch (error) {
      console.error('[NotificationScheduler] Error stopping scheduler:', error);
      throw new Error('Failed to stop scheduler');
    }
  }),
});
