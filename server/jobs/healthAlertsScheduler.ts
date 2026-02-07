import cron from "node-cron";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

interface HealthAlert {
  id: number;
  animalId: number;
  tagId: string;
  breed: string;
  alertType: string;
  severity: string;
  message: string;
  dueDate: string;
}

export class HealthAlertsScheduler {
  private static instance: HealthAlertsScheduler;
  private job: cron.ScheduledTask | null = null;

  private constructor() {}

  static getInstance(): HealthAlertsScheduler {
    if (!HealthAlertsScheduler.instance) {
      HealthAlertsScheduler.instance = new HealthAlertsScheduler();
    }
    return HealthAlertsScheduler.instance;
  }

  start(): void {
    if (this.job) {
      console.log("[HealthAlertsScheduler] Already running");
      return;
    }

    // Run daily at 8:00 AM
    this.job = cron.schedule("0 8 * * *", async () => {
      console.log("[HealthAlertsScheduler] Running health alerts check...");
      await this.checkAndNotifyAlerts();
    });

    console.log("[HealthAlertsScheduler] Started - runs daily at 8:00 AM");
  }

  stop(): void {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log("[HealthAlertsScheduler] Stopped");
    }
  }

  private async checkAndNotifyAlerts(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[HealthAlertsScheduler] Database connection failed");
        return;
      }

      // Get overdue vaccinations
      const overdueVaccinations = await db.execute(
        sql`
          SELECT 
            a.id, a.tagId, a.breed, v.vaccineName, v.nextDueDate, 'vaccination' as alertType, 'high' as severity
          FROM animals a
          JOIN vaccinations v ON a.id = v.animalId
          WHERE v.nextDueDate < CURDATE() AND a.status = 'active'
          ORDER BY v.nextDueDate ASC
          LIMIT 50
        `
      );

      // Get high severity health issues from past 7 days
      const healthIssues = await db.execute(
        sql`
          SELECT 
            a.id, a.tagId, a.breed, h.description, h.recordDate, 'health_issue' as alertType, h.severity
          FROM animals a
          JOIN healthRecords h ON a.id = h.animalId
          WHERE h.severity = 'high' AND h.recordDate > DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND a.status = 'active'
          ORDER BY h.recordDate DESC
          LIMIT 50
        `
      );

      const alerts: HealthAlert[] = [
        ...((overdueVaccinations as any).rows || []),
        ...((healthIssues as any).rows || []),
      ];

      if (alerts.length === 0) {
        console.log("[HealthAlertsScheduler] No alerts to send");
        return;
      }

      // Group alerts by severity
      const highSeverity = alerts.filter((a) => a.severity === "high");
      const mediumSeverity = alerts.filter((a) => a.severity === "medium");
      const lowSeverity = alerts.filter((a) => a.severity === "low");

      // Create summary
      const summary = `
Daily Health Alert Summary:
- High Severity: ${highSeverity.length} alerts
- Medium Severity: ${mediumSeverity.length} alerts
- Low Severity: ${lowSeverity.length} alerts

High Priority Alerts:
${highSeverity.slice(0, 10).map((a) => `• ${a.tagId} (${a.breed}): ${a.message}`).join("\n")}

Please review the health dashboard for full details.
      `;

      // Send notification to farm owner
      await notifyOwner({
        title: `Daily Health Alerts - ${alerts.length} issues detected`,
        content: summary,
      });

      // Mark alerts as notified
      for (const alert of alerts) {
        await db.execute(
          sql`
            UPDATE healthAlerts
            SET notificationSent = true, notificationSentAt = NOW()
            WHERE id = ${alert.id}
          `
        );
      }

      console.log(`[HealthAlertsScheduler] Sent ${alerts.length} alerts`);
    } catch (error) {
      console.error("[HealthAlertsScheduler] Error:", error);
    }
  }

  // Manual trigger for testing
  async triggerNow(): Promise<void> {
    console.log("[HealthAlertsScheduler] Manually triggered");
    await this.checkAndNotifyAlerts();
  }
}

// Export singleton instance
export const healthAlertsScheduler = HealthAlertsScheduler.getInstance();
