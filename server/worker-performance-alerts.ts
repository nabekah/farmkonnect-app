import { db } from "./db";
import {
  taskCompletionRecords,
  workerPerformanceAlerts,
  workerPerformanceMetrics,
  taskAssignments,
  users,
} from "@/drizzle/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { notifyOwner } from "./server/_core/notification";

/**
 * Worker Performance Alert System
 * Monitors worker efficiency, task completion, and generates alerts
 */

export interface AlertConfig {
  lowEfficiencyThreshold: number; // Default: 85%
  timeOverrunThreshold: number; // Default: 110% of estimated hours
  missedDeadlineThreshold: number; // Hours overdue
  highPerformerThreshold: number; // Default: 95%
  qualityRatingThreshold: number; // Default: 4.0 out of 5
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  lowEfficiencyThreshold: 85,
  timeOverrunThreshold: 110,
  missedDeadlineThreshold: 2,
  highPerformerThreshold: 95,
  qualityRatingThreshold: 4.0,
};

/**
 * Check and create performance alerts for a worker
 */
export async function checkWorkerPerformanceAlerts(
  farmId: number,
  workerId: number,
  config: Partial<AlertConfig> = {}
) {
  const finalConfig = { ...DEFAULT_ALERT_CONFIG, ...config };
  const alerts: Array<{ type: string; severity: string; message: string }> = [];

  // Get recent completion records
  const recentRecords = await db
    .select()
    .from(taskCompletionRecords)
    .where(
      and(
        eq(taskCompletionRecords.farmId, farmId),
        eq(taskCompletionRecords.workerId, workerId)
      )
    )
    .orderBy(desc(taskCompletionRecords.completedAt))
    .limit(10);

  if (recentRecords.length === 0) return alerts;

  // Calculate average efficiency
  const avgEfficiency =
    recentRecords.reduce((sum, r) => sum + Number(r.efficiency), 0) /
    recentRecords.length;

  // Check for low efficiency
  if (avgEfficiency < finalConfig.lowEfficiencyThreshold) {
    const alertId = uuidv4();
    const severity =
      avgEfficiency < 70 ? "critical" : avgEfficiency < 80 ? "warning" : "info";

    await createAlert({
      alertId,
      farmId,
      workerId,
      alertType: "low_efficiency",
      threshold: `efficiency < ${finalConfig.lowEfficiencyThreshold}%`,
      currentValue: `efficiency: ${avgEfficiency.toFixed(1)}%`,
      severity,
      taskId: recentRecords[0].taskId,
    });

    alerts.push({
      type: "low_efficiency",
      severity,
      message: `Worker efficiency is ${avgEfficiency.toFixed(1)}% (threshold: ${finalConfig.lowEfficiencyThreshold}%)`,
    });
  }

  // Check for time overruns
  const overrunRecords = recentRecords.filter((r) => {
    const overrunPercentage = (Number(r.actualHours) / Number(r.estimatedHours)) * 100;
    return overrunPercentage > finalConfig.timeOverrunThreshold;
  });

  if (overrunRecords.length > recentRecords.length * 0.5) {
    // More than 50% of tasks are overruns
    const alertId = uuidv4();

    await createAlert({
      alertId,
      farmId,
      workerId,
      alertType: "time_overrun",
      threshold: `time overrun > ${finalConfig.timeOverrunThreshold}%`,
      currentValue: `${overrunRecords.length}/${recentRecords.length} tasks overrun`,
      severity: "warning",
      taskId: overrunRecords[0].taskId,
    });

    alerts.push({
      type: "time_overrun",
      severity: "warning",
      message: `${overrunRecords.length} out of ${recentRecords.length} recent tasks exceeded estimated time`,
    });
  }

  // Check for quality issues
  const qualityRecords = recentRecords.filter((r) => r.qualityRating);
  if (qualityRecords.length > 0) {
    const avgQuality =
      qualityRecords.reduce((sum, r) => sum + r.qualityRating!, 0) /
      qualityRecords.length;

    if (avgQuality < finalConfig.qualityRatingThreshold) {
      const alertId = uuidv4();

      await createAlert({
        alertId,
        farmId,
        workerId,
        alertType: "quality_issue",
        threshold: `quality rating < ${finalConfig.qualityRatingThreshold}`,
        currentValue: `quality rating: ${avgQuality.toFixed(1)}/5`,
        severity: "warning",
        taskId: recentRecords[0].taskId,
      });

      alerts.push({
        type: "quality_issue",
        severity: "warning",
        message: `Average quality rating is ${avgQuality.toFixed(1)}/5 (threshold: ${finalConfig.qualityRatingThreshold})`,
      });
    }
  }

  // Check for high performers
  if (avgEfficiency > finalConfig.highPerformerThreshold) {
    const alertId = uuidv4();

    await createAlert({
      alertId,
      farmId,
      workerId,
      alertType: "high_performer",
      threshold: `efficiency > ${finalConfig.highPerformerThreshold}%`,
      currentValue: `efficiency: ${avgEfficiency.toFixed(1)}%`,
      severity: "info",
    });

    alerts.push({
      type: "high_performer",
      severity: "info",
      message: `Excellent performance! Efficiency is ${avgEfficiency.toFixed(1)}%`,
    });
  }

  // Check for missed deadlines
  const missedDeadlineTasks = await db
    .select()
    .from(taskAssignments)
    .where(
      and(
        eq(taskAssignments.farmId, farmId),
        eq(taskAssignments.workerId, workerId),
        eq(taskAssignments.status, "completed")
      )
    );

  const overdueCount = missedDeadlineTasks.filter((t) => {
    if (!t.completedAt || !t.dueDate) return false;
    const hoursOverdue =
      (t.completedAt.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60);
    return hoursOverdue > finalConfig.missedDeadlineThreshold;
  }).length;

  if (overdueCount > 0) {
    const alertId = uuidv4();

    await createAlert({
      alertId,
      farmId,
      workerId,
      alertType: "missed_deadline",
      threshold: `tasks overdue > ${finalConfig.missedDeadlineThreshold} hours`,
      currentValue: `${overdueCount} tasks completed late`,
      severity: "warning",
    });

    alerts.push({
      type: "missed_deadline",
      severity: "warning",
      message: `${overdueCount} tasks were completed past their due date`,
    });
  }

  return alerts;
}

/**
 * Create a performance alert
 */
async function createAlert(data: {
  alertId: string;
  farmId: number;
  workerId: number;
  alertType: string;
  threshold: string;
  currentValue: string;
  severity: string;
  taskId?: string;
}) {
  // Check if similar unresolved alert exists
  const existingAlert = await db.query.workerPerformanceAlerts.findFirst({
    where: and(
      eq(workerPerformanceAlerts.farmId, data.farmId),
      eq(workerPerformanceAlerts.workerId, data.workerId),
      eq(workerPerformanceAlerts.alertType, data.alertType as any),
      eq(workerPerformanceAlerts.isResolved, false)
    ),
  });

  if (existingAlert) {
    // Update existing alert instead of creating duplicate
    await db
      .update(workerPerformanceAlerts)
      .set({
        currentValue: data.currentValue,
        updatedAt: new Date(),
      })
      .where(eq(workerPerformanceAlerts.alertId, existingAlert.alertId));
    return;
  }

  // Create new alert
  await db.insert(workerPerformanceAlerts).values({
    alertId: data.alertId,
    farmId: data.farmId,
    workerId: data.workerId,
    alertType: data.alertType as any,
    threshold: data.threshold,
    currentValue: data.currentValue,
    taskId: data.taskId,
    severity: data.severity as any,
    isResolved: false,
    notificationSent: false,
  });
}

/**
 * Send notifications for unnotified alerts
 */
export async function sendPerformanceAlertNotifications(farmId: number) {
  const unnotifiedAlerts = await db
    .select()
    .from(workerPerformanceAlerts)
    .where(
      and(
        eq(workerPerformanceAlerts.farmId, farmId),
        eq(workerPerformanceAlerts.notificationSent, false),
        eq(workerPerformanceAlerts.isResolved, false)
      )
    );

  if (unnotifiedAlerts.length === 0) return;

  // Group alerts by type
  const alertsByType: Record<string, typeof unnotifiedAlerts> = {};
  for (const alert of unnotifiedAlerts) {
    if (!alertsByType[alert.alertType]) {
      alertsByType[alert.alertType] = [];
    }
    alertsByType[alert.alertType].push(alert);
  }

  // Create notification message
  let notificationContent = `<h3>Worker Performance Alerts</h3>`;

  for (const [type, alerts] of Object.entries(alertsByType)) {
    notificationContent += `<h4>${type.replace(/_/g, " ")}</h4><ul>`;
    for (const alert of alerts) {
      notificationContent += `<li>${alert.currentValue}</li>`;
    }
    notificationContent += `</ul>`;
  }

  // Send notification to farm owner
  try {
    await notifyOwner({
      title: `Worker Performance Alerts - Farm ${farmId}`,
      content: notificationContent,
    });

    // Mark alerts as notified
    for (const alert of unnotifiedAlerts) {
      await db
        .update(workerPerformanceAlerts)
        .set({ notificationSent: true })
        .where(eq(workerPerformanceAlerts.alertId, alert.alertId));
    }
  } catch (error) {
    console.error("Failed to send performance alert notification:", error);
  }
}

/**
 * Generate performance improvement recommendations
 */
export async function generatePerformanceRecommendations(
  farmId: number,
  workerId: number
): Promise<string[]> {
  const recommendations: string[] = [];

  // Get recent records
  const recentRecords = await db
    .select()
    .from(taskCompletionRecords)
    .where(
      and(
        eq(taskCompletionRecords.farmId, farmId),
        eq(taskCompletionRecords.workerId, workerId)
      )
    )
    .orderBy(desc(taskCompletionRecords.completedAt))
    .limit(10);

  if (recentRecords.length === 0) return recommendations;

  const avgEfficiency =
    recentRecords.reduce((sum, r) => sum + Number(r.efficiency), 0) /
    recentRecords.length;

  // Low efficiency recommendations
  if (avgEfficiency < 85) {
    recommendations.push(
      "Consider providing additional training or resources to improve task efficiency."
    );
    recommendations.push(
      "Review task complexity and consider breaking down complex tasks into smaller subtasks."
    );
  }

  // Time overrun recommendations
  const overrunCount = recentRecords.filter((r) => {
    const overrunPercentage = (Number(r.actualHours) / Number(r.estimatedHours)) * 100;
    return overrunPercentage > 110;
  }).length;

  if (overrunCount > recentRecords.length * 0.5) {
    recommendations.push(
      "Review time estimates with the worker - current estimates may be too optimistic."
    );
    recommendations.push(
      "Identify bottlenecks or obstacles that are causing delays."
    );
  }

  // Quality recommendations
  const qualityRecords = recentRecords.filter((r) => r.qualityRating);
  if (qualityRecords.length > 0) {
    const avgQuality =
      qualityRecords.reduce((sum, r) => sum + r.qualityRating!, 0) /
      qualityRecords.length;

    if (avgQuality < 4.0) {
      recommendations.push(
        "Focus on quality improvement - implement quality checks before task completion."
      );
      recommendations.push(
        "Provide feedback on quality issues and discuss improvement strategies."
      );
    }
  }

  // High performer recognition
  if (avgEfficiency > 95) {
    recommendations.push(
      "Recognize this worker's excellent performance and consider them for leadership roles."
    );
  }

  return recommendations;
}

/**
 * Get worker performance summary
 */
export async function getWorkerPerformanceSummary(
  farmId: number,
  workerId: number,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const records = await db
    .select()
    .from(taskCompletionRecords)
    .where(
      and(
        eq(taskCompletionRecords.farmId, farmId),
        eq(taskCompletionRecords.workerId, workerId),
        gte(taskCompletionRecords.completedAt, startDate)
      )
    );

  if (records.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      averageEfficiency: 0,
      totalHoursEstimated: 0,
      totalHoursActual: 0,
      averageQualityRating: 0,
      timeSavings: 0,
      alerts: [],
    };
  }

  const avgEfficiency =
    records.reduce((sum, r) => sum + Number(r.efficiency), 0) / records.length;
  const totalHoursEstimated = records.reduce(
    (sum, r) => sum + Number(r.estimatedHours),
    0
  );
  const totalHoursActual = records.reduce(
    (sum, r) => sum + Number(r.actualHours),
    0
  );
  const timeSavings = totalHoursEstimated - totalHoursActual;

  const qualityRecords = records.filter((r) => r.qualityRating);
  const avgQualityRating =
    qualityRecords.length > 0
      ? qualityRecords.reduce((sum, r) => sum + r.qualityRating!, 0) /
        qualityRecords.length
      : 0;

  // Get active alerts
  const alerts = await db
    .select()
    .from(workerPerformanceAlerts)
    .where(
      and(
        eq(workerPerformanceAlerts.farmId, farmId),
        eq(workerPerformanceAlerts.workerId, workerId),
        eq(workerPerformanceAlerts.isResolved, false)
      )
    );

  return {
    totalTasks: records.length,
    completedTasks: records.length,
    averageEfficiency: parseFloat(avgEfficiency.toFixed(2)),
    totalHoursEstimated: parseFloat(totalHoursEstimated.toFixed(2)),
    totalHoursActual: parseFloat(totalHoursActual.toFixed(2)),
    averageQualityRating: parseFloat(avgQualityRating.toFixed(2)),
    timeSavings: parseFloat(timeSavings.toFixed(2)),
    alerts: alerts.map((a) => ({
      id: a.alertId,
      type: a.alertType,
      severity: a.severity,
      message: a.currentValue,
    })),
  };
}

/**
 * Batch check performance for all workers on a farm
 */
export async function checkAllWorkerPerformance(
  farmId: number,
  config?: Partial<AlertConfig>
) {
  // Get all active workers on farm
  const tasks = await db
    .select({ workerId: taskAssignments.workerId })
    .from(taskAssignments)
    .where(eq(taskAssignments.farmId, farmId))
    .distinct();

  const workerIds = tasks.map((t) => t.workerId);

  for (const workerId of workerIds) {
    await checkWorkerPerformanceAlerts(farmId, workerId, config);
  }

  // Send batch notifications
  await sendPerformanceAlertNotifications(farmId);
}
