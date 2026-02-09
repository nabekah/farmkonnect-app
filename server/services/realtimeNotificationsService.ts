import { EventEmitter } from "events";

/**
 * Real-time Notifications Service
 * Handles WebSocket connections, notification broadcasting, and delivery tracking
 */

export interface Notification {
  id: string;
  userId: number;
  farmId: number;
  type: "maintenance" | "performance" | "sales" | "compliance" | "alert";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  data?: Record<string, any>;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
}

export interface NotificationPreference {
  userId: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  maintenanceAlerts: boolean;
  performanceAlerts: boolean;
  salesAlerts: boolean;
  complianceAlerts: boolean;
  digestFrequency: "immediate" | "daily" | "weekly";
}

class RealtimeNotificationsService extends EventEmitter {
  private notifications: Map<number, Notification[]> = new Map();
  private userConnections: Map<number, Set<string>> = new Map();
  private preferences: Map<number, NotificationPreference> = new Map();

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    console.log("Real-time Notifications Service initialized");
  }

  /**
   * Register user WebSocket connection
   */
  registerUserConnection(userId: number, connectionId: string): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);
    console.log(`User ${userId} connected: ${connectionId}`);
  }

  /**
   * Unregister user WebSocket connection
   */
  unregisterUserConnection(userId: number, connectionId: string): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
    console.log(`User ${userId} disconnected: ${connectionId}`);
  }

  /**
   * Send notification to user
   */
  async sendNotification(notification: Notification): Promise<void> {
    // Store notification
    if (!this.notifications.has(notification.userId)) {
      this.notifications.set(notification.userId, []);
    }
    this.notifications.get(notification.userId)!.push(notification);

    // Emit to connected clients
    const connections = this.userConnections.get(notification.userId);
    if (connections && connections.size > 0) {
      this.emit("notification", {
        userId: notification.userId,
        notification,
        connections: Array.from(connections),
      });
    }

    // Check preferences for additional delivery
    const prefs = this.preferences.get(notification.userId);
    if (prefs) {
      if (prefs.emailNotifications && this.shouldSendEmail(notification, prefs)) {
        await this.sendEmailNotification(notification);
      }
      if (prefs.pushNotifications) {
        await this.sendPushNotification(notification);
      }
      if (prefs.smsNotifications && notification.priority === "critical") {
        await this.sendSMSNotification(notification);
      }
    }
  }

  /**
   * Send maintenance alert notification
   */
  async sendMaintenanceAlert(
    userId: number,
    farmId: number,
    equipmentName: string,
    maintenanceType: string,
    daysOverdue: number
  ): Promise<void> {
    const priority = daysOverdue > 7 ? "critical" : daysOverdue > 3 ? "high" : "medium";

    const notification: Notification = {
      id: `maint-${Date.now()}`,
      userId,
      farmId,
      type: "maintenance",
      title: `Maintenance Alert: ${equipmentName}`,
      message: `${maintenanceType} is ${daysOverdue} days overdue. Please schedule immediately.`,
      priority,
      data: {
        equipmentName,
        maintenanceType,
        daysOverdue,
      },
      createdAt: new Date(),
      read: false,
    };

    await this.sendNotification(notification);
  }

  /**
   * Send performance alert notification
   */
  async sendPerformanceAlert(
    userId: number,
    farmId: number,
    workerName: string,
    metric: string,
    value: number,
    threshold: number
  ): Promise<void> {
    const notification: Notification = {
      id: `perf-${Date.now()}`,
      userId,
      farmId,
      type: "performance",
      title: `Performance Alert: ${workerName}`,
      message: `${metric} has dropped to ${value}% (threshold: ${threshold}%)`,
      priority: value < threshold - 20 ? "high" : "medium",
      data: {
        workerName,
        metric,
        value,
        threshold,
      },
      createdAt: new Date(),
      read: false,
    };

    await this.sendNotification(notification);
  }

  /**
   * Send sales notification
   */
  async sendSalesNotification(
    userId: number,
    farmId: number,
    productName: string,
    quantity: number,
    amount: number
  ): Promise<void> {
    const notification: Notification = {
      id: `sale-${Date.now()}`,
      userId,
      farmId,
      type: "sales",
      title: `New Sale: ${productName}`,
      message: `${quantity} units sold for GH₵${amount}`,
      priority: "low",
      data: {
        productName,
        quantity,
        amount,
      },
      createdAt: new Date(),
      read: false,
    };

    await this.sendNotification(notification);
  }

  /**
   * Send compliance alert notification
   */
  async sendComplianceAlert(
    userId: number,
    farmId: number,
    workerName: string,
    missingCertifications: string[]
  ): Promise<void> {
    const notification: Notification = {
      id: `comp-${Date.now()}`,
      userId,
      farmId,
      type: "compliance",
      title: `Compliance Alert: ${workerName}`,
      message: `Missing certifications: ${missingCertifications.join(", ")}`,
      priority: "high",
      data: {
        workerName,
        missingCertifications,
      },
      createdAt: new Date(),
      read: false,
    };

    await this.sendNotification(notification);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(-limit).reverse();
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: number, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
      }
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach((n) => {
        n.read = true;
        n.readAt = new Date();
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: number, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const index = userNotifications.findIndex((n) => n.id === notificationId);
      if (index > -1) {
        userNotifications.splice(index, 1);
      }
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: number): Promise<NotificationPreference> {
    return (
      this.preferences.get(userId) || {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        maintenanceAlerts: true,
        performanceAlerts: true,
        salesAlerts: true,
        complianceAlerts: true,
        digestFrequency: "daily",
      }
    );
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: number, preferences: Partial<NotificationPreference>): Promise<void> {
    const current = await this.getPreferences(userId);
    this.preferences.set(userId, { ...current, ...preferences, userId });
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      // Mock email sending
      console.log(`Email sent to user ${notification.userId}: ${notification.title}`);
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Mock push notification
      console.log(`Push notification sent to user ${notification.userId}: ${notification.title}`);
    } catch (error) {
      console.error("Failed to send push notification:", error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    try {
      // Mock SMS sending
      console.log(`SMS sent to user ${notification.userId}: ${notification.title}`);
    } catch (error) {
      console.error("Failed to send SMS notification:", error);
    }
  }

  /**
   * Determine if email should be sent based on preferences
   */
  private shouldSendEmail(notification: Notification, prefs: NotificationPreference): boolean {
    if (prefs.digestFrequency === "immediate" && notification.priority === "critical") {
      return true;
    }
    if (prefs.digestFrequency === "daily" && notification.priority === "high") {
      return true;
    }
    return false;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter((n) => !n.read).length;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: number): Promise<Record<string, number>> {
    const userNotifications = this.notifications.get(userId) || [];
    const stats: Record<string, number> = {
      total: userNotifications.length,
      unread: 0,
      maintenance: 0,
      performance: 0,
      sales: 0,
      compliance: 0,
      alert: 0,
    };

    userNotifications.forEach((n) => {
      if (!n.read) stats.unread++;
      stats[n.type]++;
    });

    return stats;
  }
}

// Export singleton instance
export const realtimeNotificationsService = new RealtimeNotificationsService();
