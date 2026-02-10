import cron from 'node-cron';
import {
  checkBreedingReminders,
  checkVaccinationReminders,
  checkHarvestReminders,
  checkStockAlerts,
  checkOrderStatusUpdates,
} from './websocketNotificationTriggers';

interface CronJob {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  enabled: boolean;
}

const jobs: Map<string, cron.ScheduledTask> = new Map();

/**
 * Define all cron jobs for notification triggers
 */
const cronJobs: CronJob[] = [
  {
    name: 'Breeding Reminders',
    schedule: '0 9 * * *', // Every day at 9:00 AM
    task: checkBreedingReminders,
    enabled: true,
  },
  {
    name: 'Vaccination Reminders',
    schedule: '0 10 * * *', // Every day at 10:00 AM
    task: checkVaccinationReminders,
    enabled: true,
  },
  {
    name: 'Harvest Reminders',
    schedule: '0 11 * * *', // Every day at 11:00 AM
    task: checkHarvestReminders,
    enabled: true,
  },
  {
    name: 'Stock Alerts',
    schedule: '*/30 * * * *', // Every 30 minutes
    task: checkStockAlerts,
    enabled: true,
  },
  {
    name: 'Order Status Updates',
    schedule: '*/15 * * * *', // Every 15 minutes
    task: checkOrderStatusUpdates,
    enabled: true,
  },
];

/**
 * Initialize all cron jobs
 */
export function initializeNotificationScheduler(): void {
  console.log('[NotificationScheduler] Initializing notification scheduler...');

  for (const job of cronJobs) {
    if (!job.enabled) {
      console.log(`[NotificationScheduler] Skipping disabled job: ${job.name}`);
      continue;
    }

    try {
      const scheduledJob = cron.schedule(job.schedule, async () => {
        console.log(`[NotificationScheduler] Running job: ${job.name}`);
        try {
          await job.task();
        } catch (error) {
          console.error(`[NotificationScheduler] Error in job ${job.name}:`, error);
        }
      });

      jobs.set(job.name, scheduledJob);
      console.log(`[NotificationScheduler] Scheduled job: ${job.name} (${job.schedule})`);
    } catch (error) {
      console.error(`[NotificationScheduler] Error scheduling job ${job.name}:`, error);
    }
  }

  console.log(`[NotificationScheduler] Notification scheduler initialized with ${jobs.size} jobs`);
}

/**
 * Stop all cron jobs
 */
export function stopNotificationScheduler(): void {
  console.log('[NotificationScheduler] Stopping notification scheduler...');

  for (const [jobName, job] of jobs.entries()) {
    try {
      job.stop();
      console.log(`[NotificationScheduler] Stopped job: ${jobName}`);
    } catch (error) {
      console.error(`[NotificationScheduler] Error stopping job ${jobName}:`, error);
    }
  }

  jobs.clear();
  console.log('[NotificationScheduler] Notification scheduler stopped');
}

/**
 * Get status of all cron jobs
 */
export function getSchedulerStatus(): {
  running: boolean;
  jobs: Array<{ name: string; schedule: string; enabled: boolean }>;
} {
  return {
    running: jobs.size > 0,
    jobs: cronJobs.map((job) => ({
      name: job.name,
      schedule: job.schedule,
      enabled: job.enabled && jobs.has(job.name),
    })),
  };
}

/**
 * Enable a specific cron job
 */
export function enableJob(jobName: string): boolean {
  const job = cronJobs.find((j) => j.name === jobName);
  if (!job) {
    console.warn(`[NotificationScheduler] Job not found: ${jobName}`);
    return false;
  }

  if (jobs.has(jobName)) {
    console.log(`[NotificationScheduler] Job already running: ${jobName}`);
    return true;
  }

  try {
    const scheduledJob = cron.schedule(job.schedule, async () => {
      console.log(`[NotificationScheduler] Running job: ${job.name}`);
      try {
        await job.task();
      } catch (error) {
        console.error(`[NotificationScheduler] Error in job ${job.name}:`, error);
      }
    });

    jobs.set(jobName, scheduledJob);
    console.log(`[NotificationScheduler] Enabled job: ${jobName}`);
    return true;
  } catch (error) {
    console.error(`[NotificationScheduler] Error enabling job ${jobName}:`, error);
    return false;
  }
}

/**
 * Disable a specific cron job
 */
export function disableJob(jobName: string): boolean {
  const job = jobs.get(jobName);
  if (!job) {
    console.warn(`[NotificationScheduler] Job not running: ${jobName}`);
    return false;
  }

  try {
    job.stop();
    jobs.delete(jobName);
    console.log(`[NotificationScheduler] Disabled job: ${jobName}`);
    return true;
  } catch (error) {
    console.error(`[NotificationScheduler] Error disabling job ${jobName}:`, error);
    return false;
  }
}

/**
 * Run a job immediately
 */
export async function runJobNow(jobName: string): Promise<boolean> {
  const job = cronJobs.find((j) => j.name === jobName);
  if (!job) {
    console.warn(`[NotificationScheduler] Job not found: ${jobName}`);
    return false;
  }

  try {
    console.log(`[NotificationScheduler] Running job immediately: ${jobName}`);
    await job.task();
    return true;
  } catch (error) {
    console.error(`[NotificationScheduler] Error running job ${jobName}:`, error);
    return false;
  }
}
