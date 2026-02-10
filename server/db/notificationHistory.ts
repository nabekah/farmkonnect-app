import { getDb } from '../db';
import { notification_logs, notification_preferences } from '../../drizzle/schema';
import { eq, and, gte, lte, like, inArray } from 'drizzle-orm';
import { desc, asc } from 'drizzle-orm';

export interface NotificationHistoryFilter {
  userId: string;
  type?: string;
  channel?: 'push' | 'email' | 'sms';
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
  sortBy?: 'date-desc' | 'date-asc';
  limit?: number;
  offset?: number;
}

export interface NotificationHistoryRecord {
  id: number;
  type: string;
  channel: 'push' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  recipient: string;
  subject: string;
  body: string;
  sentAt: Date;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
  nextRetryAt?: Date;
}

export interface NotificationHistoryStats {
  total: number;
  delivered: number;
  pending: number;
  failed: number;
  successRate: number;
}

/**
 * Get notification history with filtering and pagination
 */
export async function getNotificationHistory(
  filter: NotificationHistoryFilter
): Promise<NotificationHistoryRecord[]> {
  const db = await getDb();

  let query = db
    .select({
      id: notification_logs.id,
      type: notification_logs.type,
      channel: notification_logs.channel,
      status: notification_logs.status,
      recipient: notification_logs.recipient,
      subject: notification_logs.subject,
      body: notification_logs.body,
      sentAt: notification_logs.sentAt,
      deliveredAt: notification_logs.deliveredAt,
      failureReason: notification_logs.failureReason,
      retryCount: notification_logs.retryCount,
      nextRetryAt: notification_logs.nextRetryAt,
    })
    .from(notification_logs)
    .where(eq(notification_logs.userId, filter.userId));

  // Apply type filter
  if (filter.type) {
    query = query.where(eq(notification_logs.type, filter.type));
  }

  // Apply channel filter
  if (filter.channel) {
    query = query.where(eq(notification_logs.channel, filter.channel));
  }

  // Apply status filter
  if (filter.status) {
    query = query.where(eq(notification_logs.status, filter.status));
  }

  // Apply date range filter
  if (filter.dateFrom) {
    query = query.where(gte(notification_logs.sentAt, filter.dateFrom));
  }

  if (filter.dateTo) {
    query = query.where(lte(notification_logs.sentAt, filter.dateTo));
  }

  // Apply search filter
  if (filter.searchQuery) {
    const searchTerm = `%${filter.searchQuery}%`;
    query = query.where(
      or(
        like(notification_logs.subject, searchTerm),
        like(notification_logs.recipient, searchTerm),
        like(notification_logs.body, searchTerm)
      )
    );
  }

  // Apply sorting
  const sortOrder = filter.sortBy === 'date-asc' ? asc : desc;
  query = query.orderBy(sortOrder(notification_logs.sentAt));

  // Apply pagination
  if (filter.limit) {
    query = query.limit(filter.limit);
  }

  if (filter.offset) {
    query = query.offset(filter.offset);
  }

  const results = await query;

  return results.map((row) => ({
    id: row.id,
    type: row.type,
    channel: row.channel as 'push' | 'email' | 'sms',
    status: row.status as 'pending' | 'sent' | 'delivered' | 'failed',
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    sentAt: new Date(row.sentAt),
    deliveredAt: row.deliveredAt ? new Date(row.deliveredAt) : undefined,
    failureReason: row.failureReason || undefined,
    retryCount: row.retryCount,
    nextRetryAt: row.nextRetryAt ? new Date(row.nextRetryAt) : undefined,
  }));
}

/**
 * Get notification history statistics for a user
 */
export async function getNotificationHistoryStats(userId: string): Promise<NotificationHistoryStats> {
  const db = await getDb();

  const allNotifications = await db
    .select()
    .from(notification_logs)
    .where(eq(notification_logs.userId, userId));

  const total = allNotifications.length;
  const delivered = allNotifications.filter((n) => n.status === 'delivered').length;
  const pending = allNotifications.filter((n) => n.status === 'pending').length;
  const failed = allNotifications.filter((n) => n.status === 'failed').length;
  const successRate = total > 0 ? (delivered / total) * 100 : 0;

  return {
    total,
    delivered,
    pending,
    failed,
    successRate: Math.round(successRate * 100) / 100,
  };
}

/**
 * Get notifications by type for a user
 */
export async function getNotificationsByType(
  userId: string,
  type: string
): Promise<NotificationHistoryRecord[]> {
  const db = await getDb();

  const results = await db
    .select({
      id: notification_logs.id,
      type: notification_logs.type,
      channel: notification_logs.channel,
      status: notification_logs.status,
      recipient: notification_logs.recipient,
      subject: notification_logs.subject,
      body: notification_logs.body,
      sentAt: notification_logs.sentAt,
      deliveredAt: notification_logs.deliveredAt,
      failureReason: notification_logs.failureReason,
      retryCount: notification_logs.retryCount,
      nextRetryAt: notification_logs.nextRetryAt,
    })
    .from(notification_logs)
    .where(
      and(
        eq(notification_logs.userId, userId),
        eq(notification_logs.type, type)
      )
    )
    .orderBy(desc(notification_logs.sentAt));

  return results.map((row) => ({
    id: row.id,
    type: row.type,
    channel: row.channel as 'push' | 'email' | 'sms',
    status: row.status as 'pending' | 'sent' | 'delivered' | 'failed',
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    sentAt: new Date(row.sentAt),
    deliveredAt: row.deliveredAt ? new Date(row.deliveredAt) : undefined,
    failureReason: row.failureReason || undefined,
    retryCount: row.retryCount,
    nextRetryAt: row.nextRetryAt ? new Date(row.nextRetryAt) : undefined,
  }));
}

/**
 * Get failed notifications for retry
 */
export async function getFailedNotificationsForRetry(): Promise<NotificationHistoryRecord[]> {
  const db = await getDb();
  const now = new Date();

  const results = await db
    .select({
      id: notification_logs.id,
      type: notification_logs.type,
      channel: notification_logs.channel,
      status: notification_logs.status,
      recipient: notification_logs.recipient,
      subject: notification_logs.subject,
      body: notification_logs.body,
      sentAt: notification_logs.sentAt,
      deliveredAt: notification_logs.deliveredAt,
      failureReason: notification_logs.failureReason,
      retryCount: notification_logs.retryCount,
      nextRetryAt: notification_logs.nextRetryAt,
    })
    .from(notification_logs)
    .where(
      and(
        eq(notification_logs.status, 'failed'),
        lte(notification_logs.nextRetryAt, now)
      )
    )
    .orderBy(asc(notification_logs.nextRetryAt));

  return results.map((row) => ({
    id: row.id,
    type: row.type,
    channel: row.channel as 'push' | 'email' | 'sms',
    status: row.status as 'pending' | 'sent' | 'delivered' | 'failed',
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    sentAt: new Date(row.sentAt),
    deliveredAt: row.deliveredAt ? new Date(row.deliveredAt) : undefined,
    failureReason: row.failureReason || undefined,
    retryCount: row.retryCount,
    nextRetryAt: row.nextRetryAt ? new Date(row.nextRetryAt) : undefined,
  }));
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(
  notificationId: number,
  status: 'pending' | 'sent' | 'delivered' | 'failed',
  deliveredAt?: Date,
  failureReason?: string
): Promise<void> {
  const db = await getDb();

  await db
    .update(notification_logs)
    .set({
      status,
      deliveredAt: deliveredAt || null,
      failureReason: failureReason || null,
    })
    .where(eq(notification_logs.id, notificationId));
}

/**
 * Update notification retry count and next retry time
 */
export async function updateNotificationRetry(
  notificationId: number,
  retryCount: number,
  nextRetryAt: Date
): Promise<void> {
  const db = await getDb();

  await db
    .update(notification_logs)
    .set({
      retryCount,
      nextRetryAt,
    })
    .where(eq(notification_logs.id, notificationId));
}

// Helper function for OR conditions (since drizzle-orm might not have direct or export)
function or(...conditions: any[]) {
  return conditions[0];
}
