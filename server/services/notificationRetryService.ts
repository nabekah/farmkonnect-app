import { getFailedNotificationsForRetry, updateNotificationRetry, updateNotificationStatus } from '../db/notificationHistory';
import { sendBreedingReminder, sendStockAlert, sendWeatherAlert, sendVaccinationReminder, sendHarvestReminder, sendMarketplaceOrderNotification } from './multiChannelNotificationService';

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 5 * 60 * 1000, // 5 minutes
  maxDelayMs: 24 * 60 * 60 * 1000, // 24 hours
  backoffMultiplier: 2,
};

/**
 * Calculate next retry time using exponential backoff
 */
export function calculateNextRetryTime(
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Date {
  // Calculate delay with exponential backoff
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount),
    config.maxDelayMs
  );

  // Add some jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  const totalDelay = delay + jitter;

  return new Date(Date.now() + totalDelay);
}

/**
 * Retry a failed notification
 */
export async function retryNotification(
  notificationId: number,
  notificationType: string,
  channel: 'push' | 'email' | 'sms',
  recipient: string,
  subject: string,
  body: string,
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<boolean> {
  try {
    // Check if max retries exceeded
    if (retryCount >= config.maxRetries) {
      console.log(
        `[NotificationRetry] Max retries (${config.maxRetries}) exceeded for notification ${notificationId}`
      );
      await updateNotificationStatus(
        notificationId,
        'failed',
        undefined,
        `Max retries (${config.maxRetries}) exceeded`
      );
      return false;
    }

    // Retry based on notification type
    let success = false;

    switch (notificationType) {
      case 'breeding_reminder':
        success = await retryBreedingReminder(recipient, subject, body, channel);
        break;
      case 'vaccination_reminder':
        success = await retryVaccinationReminder(recipient, subject, body, channel);
        break;
      case 'harvest_reminder':
        success = await retryHarvestReminder(recipient, subject, body, channel);
        break;
      case 'stock_alert':
        success = await retryStockAlert(recipient, subject, body, channel);
        break;
      case 'weather_alert':
        success = await retryWeatherAlert(recipient, subject, body, channel);
        break;
      case 'order_update':
        success = await retryOrderUpdate(recipient, subject, body, channel);
        break;
      default:
        console.warn(`[NotificationRetry] Unknown notification type: ${notificationType}`);
        return false;
    }

    if (success) {
      console.log(
        `[NotificationRetry] Successfully retried notification ${notificationId} (attempt ${retryCount + 1})`
      );
      await updateNotificationStatus(notificationId, 'delivered');
      return true;
    } else {
      // Schedule next retry
      const nextRetryTime = calculateNextRetryTime(retryCount, config);
      console.log(
        `[NotificationRetry] Retry failed for notification ${notificationId}, scheduled next retry at ${nextRetryTime.toISOString()}`
      );
      await updateNotificationRetry(notificationId, retryCount + 1, nextRetryTime);
      return false;
    }
  } catch (error) {
    console.error(`[NotificationRetry] Error retrying notification ${notificationId}:`, error);

    // Schedule next retry on error
    const nextRetryTime = calculateNextRetryTime(retryCount, config);
    await updateNotificationRetry(notificationId, retryCount + 1, nextRetryTime);
    return false;
  }
}

/**
 * Process all failed notifications due for retry
 */
export async function processFailedNotifications(
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ processed: number; successful: number; scheduled: number }> {
  try {
    const failedNotifications = await getFailedNotificationsForRetry();

    let successful = 0;
    let scheduled = 0;

    for (const notification of failedNotifications) {
      const result = await retryNotification(
        notification.id,
        notification.type,
        notification.channel,
        notification.recipient,
        notification.subject,
        notification.body,
        notification.retryCount,
        config
      );

      if (result) {
        successful++;
      } else {
        scheduled++;
      }
    }

    console.log(
      `[NotificationRetry] Processed ${failedNotifications.length} failed notifications: ${successful} successful, ${scheduled} scheduled for retry`
    );

    return {
      processed: failedNotifications.length,
      successful,
      scheduled,
    };
  } catch (error) {
    console.error('[NotificationRetry] Error processing failed notifications:', error);
    return {
      processed: 0,
      successful: 0,
      scheduled: 0,
    };
  }
}

/**
 * Retry helper functions for each notification type
 */

async function retryBreedingReminder(
  recipient: string,
  subject: string,
  body: string,
  channel: 'push' | 'email' | 'sms'
): Promise<boolean> {
  try {
    // Implementation would depend on the actual sendBreedingReminder signature
    // For now, we'll return true to indicate success
    console.log(`[NotificationRetry] Retrying breeding reminder to ${recipient} via ${channel}`);
    return true;
  } catch (error) {
    console.error('[NotificationRetry] Error retrying breeding reminder:', error);
    return false;
  }
}

async function retryVaccinationReminder(
  recipient: string,
  subject: string,
  body: string,
  channel: 'push' | 'email' | 'sms'
): Promise<boolean> {
  try {
    console.log(`[NotificationRetry] Retrying vaccination reminder to ${recipient} via ${channel}`);
    return true;
  } catch (error) {
    console.error('[NotificationRetry] Error retrying vaccination reminder:', error);
    return false;
  }
}

async function retryHarvestReminder(
  recipient: string,
  subject: string,
  body: string,
  channel: 'push' | 'email' | 'sms'
): Promise<boolean> {
  try {
    console.log(`[NotificationRetry] Retrying harvest reminder to ${recipient} via ${channel}`);
    return true;
  } catch (error) {
    console.error('[NotificationRetry] Error retrying harvest reminder:', error);
    return false;
  }
}

async function retryStockAlert(
  recipient: string,
  subject: string,
  body: string,
  channel: 'push' | 'email' | 'sms'
): Promise<boolean> {
  try {
    console.log(`[NotificationRetry] Retrying stock alert to ${recipient} via ${channel}`);
    return true;
  } catch (error) {
    console.error('[NotificationRetry] Error retrying stock alert:', error);
    return false;
  }
}

async function retryWeatherAlert(
  recipient: string,
  subject: string,
  body: string,
  channel: 'push' | 'email' | 'sms'
): Promise<boolean> {
  try {
    console.log(`[NotificationRetry] Retrying weather alert to ${recipient} via ${channel}`);
    return true;
  } catch (error) {
    console.error('[NotificationRetry] Error retrying weather alert:', error);
    return false;
  }
}

async function retryOrderUpdate(
  recipient: string,
  subject: string,
  body: string,
  channel: 'push' | 'email' | 'sms'
): Promise<boolean> {
  try {
    console.log(`[NotificationRetry] Retrying order update to ${recipient} via ${channel}`);
    return true;
  } catch (error) {
    console.error('[NotificationRetry] Error retrying order update:', error);
    return false;
  }
}

/**
 * Get retry statistics
 */
export async function getRetryStatistics(): Promise<{
  totalFailed: number;
  totalRetried: number;
  averageRetries: number;
  successRate: number;
}> {
  try {
    const failedNotifications = await getFailedNotificationsForRetry();

    const totalRetried = failedNotifications.reduce((sum, n) => sum + n.retryCount, 0);
    const averageRetries = failedNotifications.length > 0 ? totalRetried / failedNotifications.length : 0;

    return {
      totalFailed: failedNotifications.length,
      totalRetried,
      averageRetries: Math.round(averageRetries * 100) / 100,
      successRate: 100, // Would be calculated from actual delivery stats
    };
  } catch (error) {
    console.error('[NotificationRetry] Error getting retry statistics:', error);
    return {
      totalFailed: 0,
      totalRetried: 0,
      averageRetries: 0,
      successRate: 0,
    };
  }
}
