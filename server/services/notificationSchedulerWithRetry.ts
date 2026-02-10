import cron from 'node-cron';
import { processFailedNotifications, getRetryStatistics, RetryConfig } from './notificationRetryService';
import { sendBreedingReminders, sendVaccinationReminders, sendHarvestReminders, sendStockAlerts, sendWeatherAlerts, sendOrderUpdates } from './notificationTriggers';

/**
 * Notification Scheduler with Retry Integration
 * Manages all scheduled notification tasks and retry processing
 */

interface ScheduledJob {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  job?: cron.ScheduledTask;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastError?: string;
}

const scheduledJobs: Map<string, ScheduledJob> = new Map();

/**
 * Initialize all notification scheduler jobs
 */
export async function initializeNotificationScheduler(): Promise<void> {
  console.log('[NotificationScheduler] Initializing notification scheduler with retry integration...');

  try {
    // Job 1: Process failed notifications every 5 minutes
    registerJob({
      name: 'process-failed-notifications',
      schedule: '*/5 * * * *', // Every 5 minutes
      task: async () => {
        console.log('[NotificationScheduler] Processing failed notifications...');
        const result = await processFailedNotifications();
        console.log(
          `[NotificationScheduler] Processed ${result.processed} notifications: ${result.successful} successful, ${result.scheduled} scheduled for retry`
        );
      },
    });

    // Job 2: Send breeding reminders daily at 6 AM
    registerJob({
      name: 'breeding-reminders',
      schedule: '0 6 * * *', // Daily at 6 AM
      task: async () => {
        console.log('[NotificationScheduler] Sending breeding reminders...');
        await sendBreedingReminders();
        console.log('[NotificationScheduler] Breeding reminders sent');
      },
    });

    // Job 3: Send vaccination reminders daily at 7 AM
    registerJob({
      name: 'vaccination-reminders',
      schedule: '0 7 * * *', // Daily at 7 AM
      task: async () => {
        console.log('[NotificationScheduler] Sending vaccination reminders...');
        await sendVaccinationReminders();
        console.log('[NotificationScheduler] Vaccination reminders sent');
      },
    });

    // Job 4: Send harvest reminders daily at 8 AM
    registerJob({
      name: 'harvest-reminders',
      schedule: '0 8 * * *', // Daily at 8 AM
      task: async () => {
        console.log('[NotificationScheduler] Sending harvest reminders...');
        await sendHarvestReminders();
        console.log('[NotificationScheduler] Harvest reminders sent');
      },
    });

    // Job 5: Send stock alerts daily at 9 AM
    registerJob({
      name: 'stock-alerts',
      schedule: '0 9 * * *', // Daily at 9 AM
      task: async () => {
        console.log('[NotificationScheduler] Sending stock alerts...');
        await sendStockAlerts();
        console.log('[NotificationScheduler] Stock alerts sent');
      },
    });

    // Job 6: Send weather alerts every 3 hours
    registerJob({
      name: 'weather-alerts',
      schedule: '0 */3 * * *', // Every 3 hours
      task: async () => {
        console.log('[NotificationScheduler] Sending weather alerts...');
        await sendWeatherAlerts();
        console.log('[NotificationScheduler] Weather alerts sent');
      },
    });

    // Job 7: Send order updates every hour
    registerJob({
      name: 'order-updates',
      schedule: '0 * * * *', // Every hour
      task: async () => {
        console.log('[NotificationScheduler] Sending order updates...');
        await sendOrderUpdates();
        console.log('[NotificationScheduler] Order updates sent');
      },
    });

    // Job 8: Log retry statistics every 6 hours
    registerJob({
      name: 'retry-statistics',
      schedule: '0 */6 * * *', // Every 6 hours
      task: async () => {
        console.log('[NotificationScheduler] Logging retry statistics...');
        const stats = await getRetryStatistics();
        console.log('[NotificationScheduler] Retry Statistics:', {
          totalFailed: stats.totalFailed,
          totalRetried: stats.totalRetried,
          averageRetries: stats.averageRetries,
          successRate: stats.successRate,
        });
      },
    });

    // Start all jobs
    startAllJobs();

    console.log('[NotificationScheduler] Notification scheduler initialized successfully');
    console.log(`[NotificationScheduler] ${scheduledJobs.size} jobs registered and started`);
  } catch (error) {
    console.error('[NotificationScheduler] Error initializing notification scheduler:', error);
    throw error;
  }
}

/**
 * Register a new scheduled job
 */
function registerJob(jobConfig: Omit<ScheduledJob, 'status' | 'job'>): void {
  const job: ScheduledJob = {
    ...jobConfig,
    status: 'idle',
  };

  scheduledJobs.set(job.name, job);
  console.log(`[NotificationScheduler] Registered job: ${job.name} (${job.schedule})`);
}

/**
 * Start all registered jobs
 */
function startAllJobs(): void {
  for (const [name, job] of scheduledJobs.entries()) {
    try {
      job.job = cron.schedule(job.schedule, async () => {
        await executeJob(name);
      });

      job.status = 'idle';
      console.log(`[NotificationScheduler] Started job: ${name}`);
    } catch (error) {
      console.error(`[NotificationScheduler] Error starting job ${name}:`, error);
      job.status = 'failed';
      job.lastError = String(error);
    }
  }
}

/**
 * Execute a scheduled job
 */
async function executeJob(jobName: string): Promise<void> {
  const job = scheduledJobs.get(jobName);
  if (!job) {
    console.warn(`[NotificationScheduler] Job not found: ${jobName}`);
    return;
  }

  try {
    job.status = 'running';
    job.lastRun = new Date();

    console.log(`[NotificationScheduler] Executing job: ${jobName}`);
    await job.task();

    job.status = 'completed';
    job.lastError = undefined;

    // Calculate next run time
    if (job.job) {
      const nextDate = job.job.nextDate();
      job.nextRun = nextDate.toDate();
    }

    console.log(`[NotificationScheduler] Job completed: ${jobName}`);
  } catch (error) {
    job.status = 'failed';
    job.lastError = String(error);
    console.error(`[NotificationScheduler] Error executing job ${jobName}:`, error);
  }
}

/**
 * Stop all scheduled jobs
 */
export function stopAllJobs(): void {
  console.log('[NotificationScheduler] Stopping all scheduled jobs...');

  for (const [name, job] of scheduledJobs.entries()) {
    if (job.job) {
      job.job.stop();
      job.status = 'idle';
      console.log(`[NotificationScheduler] Stopped job: ${name}`);
    }
  }

  console.log('[NotificationScheduler] All jobs stopped');
}

/**
 * Get all scheduled jobs status
 */
export function getJobsStatus(): Array<{
  name: string;
  schedule: string;
  status: string;
  lastRun?: string;
  nextRun?: string;
  lastError?: string;
}> {
  const status = [];

  for (const [name, job] of scheduledJobs.entries()) {
    status.push({
      name,
      schedule: job.schedule,
      status: job.status,
      lastRun: job.lastRun?.toISOString(),
      nextRun: job.nextRun?.toISOString(),
      lastError: job.lastError,
    });
  }

  return status;
}

/**
 * Get specific job status
 */
export function getJobStatus(jobName: string): ScheduledJob | null {
  return scheduledJobs.get(jobName) || null;
}

/**
 * Manually trigger a job
 */
export async function triggerJob(jobName: string): Promise<{ success: boolean; error?: string }> {
  try {
    await executeJob(jobName);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Update job schedule
 */
export function updateJobSchedule(jobName: string, newSchedule: string): boolean {
  const job = scheduledJobs.get(jobName);
  if (!job) {
    console.warn(`[NotificationScheduler] Job not found: ${jobName}`);
    return false;
  }

  try {
    // Stop existing job
    if (job.job) {
      job.job.stop();
    }

    // Update schedule
    job.schedule = newSchedule;

    // Start with new schedule
    job.job = cron.schedule(newSchedule, async () => {
      await executeJob(jobName);
    });

    console.log(`[NotificationScheduler] Updated job schedule: ${jobName} -> ${newSchedule}`);
    return true;
  } catch (error) {
    console.error(`[NotificationScheduler] Error updating job schedule ${jobName}:`, error);
    return false;
  }
}

/**
 * Pause a job
 */
export function pauseJob(jobName: string): boolean {
  const job = scheduledJobs.get(jobName);
  if (!job || !job.job) {
    console.warn(`[NotificationScheduler] Job not found: ${jobName}`);
    return false;
  }

  try {
    job.job.stop();
    job.status = 'idle';
    console.log(`[NotificationScheduler] Paused job: ${jobName}`);
    return true;
  } catch (error) {
    console.error(`[NotificationScheduler] Error pausing job ${jobName}:`, error);
    return false;
  }
}

/**
 * Resume a job
 */
export function resumeJob(jobName: string): boolean {
  const job = scheduledJobs.get(jobName);
  if (!job) {
    console.warn(`[NotificationScheduler] Job not found: ${jobName}`);
    return false;
  }

  try {
    job.job = cron.schedule(job.schedule, async () => {
      await executeJob(jobName);
    });

    job.status = 'idle';
    console.log(`[NotificationScheduler] Resumed job: ${jobName}`);
    return true;
  } catch (error) {
    console.error(`[NotificationScheduler] Error resuming job ${jobName}:`, error);
    return false;
  }
}

/**
 * Get retry configuration for a job
 */
export function getRetryConfig(): RetryConfig {
  return {
    maxRetries: 3,
    initialDelayMs: 5 * 60 * 1000, // 5 minutes
    maxDelayMs: 24 * 60 * 60 * 1000, // 24 hours
    backoffMultiplier: 2,
  };
}

/**
 * Get all jobs
 */
export function getAllJobs(): ScheduledJob[] {
  return Array.from(scheduledJobs.values());
}
