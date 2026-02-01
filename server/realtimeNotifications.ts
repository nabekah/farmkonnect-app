import { EventEmitter } from "events";

/**
 * Real-time notification service using EventEmitter
 * Broadcasts farm events to all connected clients
 * Can be extended with WebSocket integration
 */
class RealtimeNotificationService extends EventEmitter {
  private static instance: RealtimeNotificationService;
  private notificationHistory: any[] = [];
  private maxHistorySize = 1000;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): RealtimeNotificationService {
    if (!RealtimeNotificationService.instance) {
      RealtimeNotificationService.instance = new RealtimeNotificationService();
    }
    return RealtimeNotificationService.instance;
  }

  /**
   * Emit animal health alert
   */
  emitHealthAlert(farmId: number, animalId: number, severity: "low" | "medium" | "high", message: string) {
    const notification = {
      id: this.generateId(),
      type: "health_alert",
      farmId,
      animalId,
      severity,
      message,
      timestamp: new Date(),
    };
    this.broadcastNotification(notification);
  }

  /**
   * Emit water quality warning
   */
  emitWaterQualityWarning(farmId: number, pondId: number, parameter: string, value: number, threshold: number) {
    const notification = {
      id: this.generateId(),
      type: "water_quality_warning",
      farmId,
      pondId,
      parameter,
      value,
      threshold,
      timestamp: new Date(),
    };
    this.broadcastNotification(notification);
  }

  /**
   * Emit maintenance reminder
   */
  emitMaintenanceReminder(farmId: number, assetId: number, assetName: string, maintenanceType: string) {
    const notification = {
      id: this.generateId(),
      type: "maintenance_reminder",
      farmId,
      assetId,
      assetName,
      maintenanceType,
      timestamp: new Date(),
    };
    this.broadcastNotification(notification);
  }

  /**
   * Emit financial alert
   */
  emitFinancialAlert(farmId: number, alertType: "low_balance" | "high_expense" | "revenue_milestone", details: any) {
    const notification = {
      id: this.generateId(),
      type: "financial_alert",
      farmId,
      alertType,
      details,
      timestamp: new Date(),
    };
    this.broadcastNotification(notification);
  }

  /**
   * Emit weather alert
   */
  emitWeatherAlert(farmId: number, alertType: string, severity: string, message: string) {
    const notification = {
      id: this.generateId(),
      type: "weather_alert",
      farmId,
      alertType,
      severity,
      message,
      timestamp: new Date(),
    };
    this.broadcastNotification(notification);
  }

  /**
   * Emit workforce alert
   */
  emitWorkforceAlert(farmId: number, workerId: number, alertType: string, message: string) {
    const notification = {
      id: this.generateId(),
      type: "workforce_alert",
      farmId,
      workerId,
      alertType,
      message,
      timestamp: new Date(),
    };
    this.broadcastNotification(notification);
  }

  /**
   * Broadcast notification to all listeners
   */
  private broadcastNotification(notification: any) {
    // Add to history
    this.addToHistory(notification);

    // Emit to all listeners
    this.emit("notification", notification);
    this.emit(`farm:${notification.farmId}`, notification);
    this.emit(`type:${notification.type}`, notification);
  }

  /**
   * Subscribe to all notifications for a farm
   */
  subscribeFarmNotifications(farmId: number, callback: (notification: any) => void) {
    const eventName = `farm:${farmId}`;
    this.on(eventName, callback);

    // Return unsubscribe function
    return () => this.removeListener(eventName, callback);
  }

  /**
   * Subscribe to specific notification type
   */
  subscribeToType(type: string, callback: (notification: any) => void) {
    const eventName = `type:${type}`;
    this.on(eventName, callback);

    return () => this.removeListener(eventName, callback);
  }

  /**
   * Subscribe to all notifications
   */
  subscribeAll(callback: (notification: any) => void) {
    this.on("notification", callback);
    return () => this.removeListener("notification", callback);
  }

  /**
   * Add notification to history
   */
  private addToHistory(notification: any) {
    this.notificationHistory.push(notification);
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory.shift();
    }
  }

  /**
   * Get notification history
   */
  getHistory(limit: number = 50, farmId?: number): any[] {
    let history = this.notificationHistory;

    if (farmId) {
      history = history.filter((n) => n.farmId === farmId);
    }

    return history.slice(-limit).reverse();
  }

  /**
   * Get notifications by type
   */
  getByType(type: string, limit: number = 50, farmId?: number): any[] {
    let history = this.notificationHistory.filter((n) => n.type === type);

    if (farmId) {
      history = history.filter((n) => n.farmId === farmId);
    }

    return history.slice(-limit).reverse();
  }

  /**
   * Get unread notifications
   */
  getUnread(farmId?: number): any[] {
    let history = this.notificationHistory.filter((n) => !n.read);

    if (farmId) {
      history = history.filter((n) => n.farmId === farmId);
    }

    return history;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string) {
    const notification = this.notificationHistory.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.notificationHistory = [];
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get listener count for a farm
   */
  getFarmListenerCount(farmId: number): number {
    return this.listenerCount(`farm:${farmId}`);
  }

  /**
   * Get all active listeners
   */
  getActiveListeners(): { [key: string]: number } {
    const listeners: { [key: string]: number } = {};
    const eventNames = this.eventNames();

    for (const eventName of eventNames) {
      listeners[String(eventName)] = this.listenerCount(eventName);
    }

    return listeners;
  }
}

export const realtimeNotificationService = RealtimeNotificationService.getInstance();
