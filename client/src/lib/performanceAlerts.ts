/**
 * Performance Alerts System
 * Monitors worker performance metrics and generates alerts based on configurable thresholds
 */

export interface AlertThresholds {
  maxDailyHours: number; // Maximum hours per day (e.g., 12)
  minDailyHours: number; // Minimum hours per day (e.g., 4)
  maxWeeklyHours: number; // Maximum hours per week (e.g., 60)
  minWeeklyHours: number; // Minimum hours per week (e.g., 30)
  maxAvgDuration: number; // Maximum average duration in minutes (e.g., 120)
  minAvgDuration: number; // Minimum average duration in minutes (e.g., 15)
  inactivityThreshold: number; // Hours without activity before alert (e.g., 24)
}

export interface PerformanceAlert {
  id: string;
  userId: number;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  dismissed: boolean;
}

// Default thresholds
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  maxDailyHours: 12,
  minDailyHours: 4,
  maxWeeklyHours: 60,
  minWeeklyHours: 30,
  maxAvgDuration: 120,
  minAvgDuration: 15,
  inactivityThreshold: 24,
};

/**
 * Check if worker has exceeded maximum daily hours
 */
export function checkMaxDailyHours(
  totalHours: number,
  threshold: number
): PerformanceAlert | null {
  if (totalHours > threshold) {
    return {
      id: `alert-max-daily-${Date.now()}`,
      userId: 0,
      type: 'warning',
      title: 'Excessive Daily Hours',
      message: `Worker has logged ${totalHours.toFixed(1)} hours today, exceeding the ${threshold} hour limit.`,
      metric: 'Daily Hours',
      currentValue: totalHours,
      threshold,
      timestamp: new Date(),
      dismissed: false,
    };
  }
  return null;
}

/**
 * Check if worker has insufficient daily hours
 */
export function checkMinDailyHours(
  totalHours: number,
  threshold: number
): PerformanceAlert | null {
  if (totalHours < threshold && totalHours > 0) {
    return {
      id: `alert-min-daily-${Date.now()}`,
      userId: 0,
      type: 'info',
      title: 'Low Daily Hours',
      message: `Worker has only logged ${totalHours.toFixed(1)} hours today, below the ${threshold} hour minimum.`,
      metric: 'Daily Hours',
      currentValue: totalHours,
      threshold,
      timestamp: new Date(),
      dismissed: false,
    };
  }
  return null;
}

/**
 * Check if worker has been inactive
 */
export function checkInactivity(
  lastActiveTime: Date,
  thresholdHours: number
): PerformanceAlert | null {
  const now = new Date();
  const hoursInactive = (now.getTime() - lastActiveTime.getTime()) / (1000 * 60 * 60);

  if (hoursInactive > thresholdHours) {
    return {
      id: `alert-inactive-${Date.now()}`,
      userId: 0,
      type: 'warning',
      title: 'Worker Inactive',
      message: `Worker has been inactive for ${hoursInactive.toFixed(1)} hours.`,
      metric: 'Inactivity',
      currentValue: hoursInactive,
      threshold: thresholdHours,
      timestamp: new Date(),
      dismissed: false,
    };
  }
  return null;
}

/**
 * Check average duration
 */
export function checkAvgDuration(
  avgDuration: number,
  maxThreshold: number,
  minThreshold: number
): PerformanceAlert | null {
  if (avgDuration > maxThreshold) {
    return {
      id: `alert-max-duration-${Date.now()}`,
      userId: 0,
      type: 'info',
      title: 'High Average Duration',
      message: `Average activity duration is ${avgDuration.toFixed(0)} minutes, exceeding ${maxThreshold} minutes.`,
      metric: 'Avg Duration',
      currentValue: avgDuration,
      threshold: maxThreshold,
      timestamp: new Date(),
      dismissed: false,
    };
  }

  if (avgDuration < minThreshold && avgDuration > 0) {
    return {
      id: `alert-min-duration-${Date.now()}`,
      userId: 0,
      type: 'info',
      title: 'Low Average Duration',
      message: `Average activity duration is ${avgDuration.toFixed(0)} minutes, below ${minThreshold} minutes.`,
      metric: 'Avg Duration',
      currentValue: avgDuration,
      threshold: minThreshold,
      timestamp: new Date(),
      dismissed: false,
    };
  }

  return null;
}

/**
 * Generate all performance alerts for a worker
 */
export function generatePerformanceAlerts(
  userId: number,
  dailyHours: number,
  weeklyHours: number,
  avgDuration: number,
  lastActiveTime: Date,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  // Check daily hours
  const maxDailyAlert = checkMaxDailyHours(dailyHours, thresholds.maxDailyHours);
  if (maxDailyAlert) {
    maxDailyAlert.userId = userId;
    alerts.push(maxDailyAlert);
  }

  const minDailyAlert = checkMinDailyHours(dailyHours, thresholds.minDailyHours);
  if (minDailyAlert) {
    minDailyAlert.userId = userId;
    alerts.push(minDailyAlert);
  }

  // Check inactivity
  const inactivityAlert = checkInactivity(lastActiveTime, thresholds.inactivityThreshold);
  if (inactivityAlert) {
    inactivityAlert.userId = userId;
    alerts.push(inactivityAlert);
  }

  // Check average duration
  const durationAlert = checkAvgDuration(
    avgDuration,
    thresholds.maxAvgDuration,
    thresholds.minAvgDuration
  );
  if (durationAlert) {
    durationAlert.userId = userId;
    alerts.push(durationAlert);
  }

  return alerts;
}

/**
 * Format alert for display
 */
export function formatAlert(alert: PerformanceAlert): string {
  return `${alert.title}: ${alert.message}`;
}

/**
 * Get alert severity color
 */
export function getAlertColor(type: 'warning' | 'error' | 'info'): string {
  switch (type) {
    case 'error':
      return 'bg-red-100 text-red-900 border-red-300';
    case 'warning':
      return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    case 'info':
      return 'bg-blue-100 text-blue-900 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-900 border-gray-300';
  }
}

/**
 * Get alert icon
 */
export function getAlertIcon(type: 'warning' | 'error' | 'info'): string {
  switch (type) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📋';
  }
}
