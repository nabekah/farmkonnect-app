import { invokeLLM } from "../_core/llm";

export interface BudgetAlert {
  id: string;
  farmId: number;
  category: string;
  budgetAmount: number;
  currentAmount: number;
  threshold: number; // percentage (e.g., 80 for 80%)
  status: "ok" | "warning" | "exceeded";
  message: string;
  timestamp: Date;
  notificationSent: boolean;
}

export interface BudgetNotification {
  id: string;
  farmId: number;
  userId: number;
  alerts: BudgetAlert[];
  message: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  createdAt: Date;
}

/**
 * Check budget status and generate alerts
 */
export function checkBudgetStatus(
  category: string,
  budgetAmount: number,
  currentAmount: number,
  threshold: number = 80
): BudgetAlert {
  const percentageUsed = (currentAmount / budgetAmount) * 100;
  let status: "ok" | "warning" | "exceeded" = "ok";
  let message = "Within budget";

  if (percentageUsed >= 100) {
    status = "exceeded";
    message = `Budget exceeded by ₵${(currentAmount - budgetAmount).toLocaleString()}`;
  } else if (percentageUsed >= threshold) {
    status = "warning";
    message = `Approaching budget limit (${percentageUsed.toFixed(1)}% used)`;
  }

  return {
    id: `alert_${Date.now()}`,
    farmId: 0, // Will be set by caller
    category,
    budgetAmount,
    currentAmount,
    threshold,
    status,
    message,
    timestamp: new Date(),
    notificationSent: false,
  };
}

/**
 * Generate AI-powered budget insights and recommendations
 */
export async function generateBudgetInsights(
  farmId: number,
  alerts: BudgetAlert[]
): Promise<string> {
  const alertSummary = alerts
    .map((a) => `${a.category}: ${a.message} (${((a.currentAmount / a.budgetAmount) * 100).toFixed(1)}% used)`)
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a farm financial advisor. Provide concise, actionable budget recommendations based on the alerts provided.",
      },
      {
        role: "user",
        content: `Farm ID: ${farmId}\n\nBudget Alerts:\n${alertSummary}\n\nProvide 2-3 specific recommendations to manage these budget concerns.`,
      },
    ],
  });

  return response.choices[0]?.message.content || "Unable to generate insights";
}

/**
 * Create budget notification from alerts
 */
export function createBudgetNotification(
  farmId: number,
  userId: number,
  alerts: BudgetAlert[]
): BudgetNotification {
  const criticalAlerts = alerts.filter((a) => a.status === "exceeded");
  const warningAlerts = alerts.filter((a) => a.status === "warning");

  let severity: "info" | "warning" | "critical" = "info";
  let message = "Budget status update";

  if (criticalAlerts.length > 0) {
    severity = "critical";
    message = `${criticalAlerts.length} budget(s) exceeded`;
  } else if (warningAlerts.length > 0) {
    severity = "warning";
    message = `${warningAlerts.length} budget(s) approaching limit`;
  }

  return {
    id: `notif_${Date.now()}`,
    farmId,
    userId,
    alerts,
    message,
    severity,
    read: false,
    createdAt: new Date(),
  };
}

/**
 * Format budget alert for display
 */
export function formatBudgetAlert(alert: BudgetAlert): string {
  const percentageUsed = ((alert.currentAmount / alert.budgetAmount) * 100).toFixed(1);
  const remaining = alert.budgetAmount - alert.currentAmount;

  return `
${alert.category} Budget Alert
Status: ${alert.status.toUpperCase()}
Message: ${alert.message}
Amount Used: ₵${alert.currentAmount.toLocaleString()} / ₵${alert.budgetAmount.toLocaleString()}
Percentage: ${percentageUsed}%
${remaining > 0 ? `Remaining: ₵${remaining.toLocaleString()}` : `Exceeded by: ₵${Math.abs(remaining).toLocaleString()}`}
  `.trim();
}

/**
 * Get budget alert color based on status
 */
export function getBudgetAlertColor(status: "ok" | "warning" | "exceeded"): string {
  switch (status) {
    case "ok":
      return "green";
    case "warning":
      return "yellow";
    case "exceeded":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Calculate budget trend
 */
export function calculateBudgetTrend(
  previousAmount: number,
  currentAmount: number
): { trend: "up" | "down" | "stable"; percentage: number } {
  const change = currentAmount - previousAmount;
  const percentageChange = (change / previousAmount) * 100;

  let trend: "up" | "down" | "stable" = "stable";
  if (percentageChange > 2) trend = "up";
  else if (percentageChange < -2) trend = "down";

  return {
    trend,
    percentage: Math.abs(percentageChange),
  };
}
