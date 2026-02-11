import { getDb } from '../_core/db';
import { auditLogs } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
export type AuditResource = 'farm' | 'animal' | 'crop' | 'expense' | 'revenue' | 'appointment' | 'medication' | 'user' | 'budget' | 'order';

export interface AuditLogEntry {
  userId: number;
  action: AuditAction;
  resource: AuditResource;
  resourceId: number | string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

/**
 * Log an audit entry to the database
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId.toString(),
      changes: entry.changes ? JSON.stringify(entry.changes) : null,
      ipAddress: entry.ipAddress || 'unknown',
      userAgent: entry.userAgent || 'unknown',
      status: entry.status,
      errorMessage: entry.errorMessage || null,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to log audit entry:', error);
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters: {
  userId?: number;
  action?: AuditAction;
  resource?: AuditResource;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    const db = await getDb();
    let query = db.select().from(auditLogs);

    // Build WHERE conditions
    const conditions = [];
    if (filters.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters.resource) conditions.push(eq(auditLogs.resource, filters.resource));

    if (conditions.length > 0) {
      query = query.where(conditions[0]);
    }

    // Apply date range if provided
    if (filters.startDate || filters.endDate) {
      // Note: This is a simplified example. In production, use proper date comparison
      console.log('Date filtering not fully implemented in this example');
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const logs = await query.limit(limit).offset(offset);
    return logs;
  } catch (error) {
    console.error('[AuditLogger] Failed to retrieve audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditTrail(resource: AuditResource, resourceId: string | number) {
  try {
    const db = await getDb();
    const logs = await db
      .select()
      .from(auditLogs)
      .where(
        eq(auditLogs.resource, resource) &&
        eq(auditLogs.resourceId, resourceId.toString())
      )
      .orderBy(auditLogs.timestamp);

    return logs;
  } catch (error) {
    console.error('[AuditLogger] Failed to retrieve resource audit trail:', error);
    return [];
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: number, days: number = 30) {
  try {
    const db = await getDb();
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId));

    // Group by action
    const summary = {
      totalActions: logs.length,
      byAction: {} as Record<AuditAction, number>,
      byResource: {} as Record<AuditResource, number>,
      successRate: 0,
    };

    let successCount = 0;
    for (const log of logs) {
      summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
      summary.byResource[log.resource] = (summary.byResource[log.resource] || 0) + 1;
      if (log.status === 'success') successCount++;
    }

    summary.successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

    return summary;
  } catch (error) {
    console.error('[AuditLogger] Failed to get user activity summary:', error);
    return null;
  }
}

/**
 * Middleware to automatically log API calls
 */
export function auditMiddleware(userId: number, ipAddress?: string, userAgent?: string) {
  return {
    logAction: async (
      action: AuditAction,
      resource: AuditResource,
      resourceId: number | string,
      changes?: Record<string, any>
    ) => {
      await logAudit({
        userId,
        action,
        resource,
        resourceId,
        changes,
        ipAddress,
        userAgent,
        status: 'success',
      });
    },
    logError: async (
      action: AuditAction,
      resource: AuditResource,
      resourceId: number | string,
      error: Error
    ) => {
      await logAudit({
        userId,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        status: 'failure',
        errorMessage: error.message,
      });
    },
  };
}

/**
 * Track changes between old and new values
 */
export function trackChanges(oldValue: Record<string, any>, newValue: Record<string, any>): Record<string, any> {
  const changes: Record<string, any> = {};

  for (const key in newValue) {
    if (oldValue[key] !== newValue[key]) {
      changes[key] = {
        old: oldValue[key],
        new: newValue[key],
      };
    }
  }

  return changes;
}
