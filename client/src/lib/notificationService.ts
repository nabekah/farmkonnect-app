import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning" | "loading";

export interface NotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ProgressNotification {
  id: string;
  title: string;
  current: number;
  total: number;
  status: "pending" | "in-progress" | "completed" | "failed";
  message?: string;
}

class NotificationService {
  private activeNotifications = new Map<string, string>();
  private progressNotifications = new Map<string, ProgressNotification>();

  /**
   * Show a simple toast notification
   */
  showNotification(options: NotificationOptions) {
    const { title, message, type, duration, action } = options;
    const fullMessage = `${title}\n${message}`;

    let toastId: string | number;

    switch (type) {
      case "success":
        toastId = toast.success(fullMessage, {
          duration: duration || 4000,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });
        break;
      case "error":
        toastId = toast.error(fullMessage, {
          duration: duration || 5000,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });
        break;
      case "warning":
        toastId = toast.warning(fullMessage, {
          duration: duration || 4000,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });
        break;
      case "loading":
        toastId = toast.loading(fullMessage);
        break;
      case "info":
      default:
        toastId = toast.info(fullMessage, {
          duration: duration || 3000,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        });
        break;
    }

    this.activeNotifications.set(String(toastId), String(toastId));
    return toastId;
  }

  /**
   * Show batch operation started notification
   */
  showBatchStarted(operationType: string, itemCount: number) {
    return this.showNotification({
      title: "Batch Operation Started",
      message: `Processing ${itemCount} ${operationType}...`,
      type: "loading",
    });
  }

  /**
   * Show batch operation completed notification
   */
  showBatchCompleted(operationType: string, successCount: number, failureCount: number = 0) {
    const message = failureCount > 0
      ? `Successfully processed ${successCount} ${operationType}. ${failureCount} failed.`
      : `Successfully processed ${successCount} ${operationType}.`;

    return this.showNotification({
      title: "Batch Operation Completed",
      message,
      type: failureCount > 0 ? "warning" : "success",
      duration: 5000,
    });
  }

  /**
   * Show batch operation failed notification
   */
  showBatchFailed(operationType: string, error: string) {
    return this.showNotification({
      title: "Batch Operation Failed",
      message: `Failed to process ${operationType}: ${error}`,
      type: "error",
      duration: 6000,
    });
  }

  /**
   * Show import completed notification
   */
  showImportCompleted(totalCount: number, successCount: number, failureCount: number) {
    const message = `Imported ${successCount}/${totalCount} animals${failureCount > 0 ? `. ${failureCount} failed.` : "."}`;
    return this.showNotification({
      title: "Import Completed",
      message,
      type: failureCount > 0 ? "warning" : "success",
      duration: 5000,
    });
  }

  /**
   * Show export completed notification
   */
  showExportCompleted(format: string, itemCount: number) {
    return this.showNotification({
      title: "Export Completed",
      message: `Exported ${itemCount} items as ${format.toUpperCase()}`,
      type: "success",
      duration: 4000,
      action: {
        label: "Download",
        onClick: () => {
          // Download action handled by caller
        },
      },
    });
  }

  /**
   * Show approval request notification
   */
  showApprovalRequested(operationType: string, itemCount: number) {
    return this.showNotification({
      title: "Approval Requested",
      message: `Your ${operationType} for ${itemCount} items is pending approval`,
      type: "info",
      duration: 4000,
    });
  }

  /**
   * Show approval notification
   */
  showApprovalResult(operationType: string, approved: boolean, itemCount: number) {
    return this.showNotification({
      title: approved ? "Approved" : "Rejected",
      message: `${operationType} for ${itemCount} items has been ${approved ? "approved" : "rejected"}`,
      type: approved ? "success" : "warning",
      duration: 4000,
    });
  }

  /**
   * Update a loading notification to success
   */
  updateToSuccess(toastId: string | number, title: string, message: string) {
    toast.dismiss(toastId);
    return this.showNotification({
      title,
      message,
      type: "success",
      duration: 4000,
    });
  }

  /**
   * Update a loading notification to error
   */
  updateToError(toastId: string | number, title: string, message: string) {
    toast.dismiss(toastId);
    return this.showNotification({
      title,
      message,
      type: "error",
      duration: 5000,
    });
  }

  /**
   * Dismiss a notification
   */
  dismiss(toastId: string | number) {
    toast.dismiss(toastId);
    this.activeNotifications.delete(String(toastId));
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    toast.dismiss();
    this.activeNotifications.clear();
  }

  /**
   * Create a progress notification
   */
  createProgressNotification(id: string, title: string, total: number): ProgressNotification {
    const notification: ProgressNotification = {
      id,
      title,
      current: 0,
      total,
      status: "pending",
    };
    this.progressNotifications.set(id, notification);
    return notification;
  }

  /**
   * Update progress notification
   */
  updateProgress(id: string, current: number, message?: string) {
    const notification = this.progressNotifications.get(id);
    if (notification) {
      notification.current = current;
      notification.status = current === notification.total ? "completed" : "in-progress";
      notification.message = message;
    }
    return notification;
  }

  /**
   * Complete progress notification
   */
  completeProgress(id: string, message?: string) {
    const notification = this.progressNotifications.get(id);
    if (notification) {
      notification.current = notification.total;
      notification.status = "completed";
      notification.message = message;
    }
    return notification;
  }

  /**
   * Fail progress notification
   */
  failProgress(id: string, message?: string) {
    const notification = this.progressNotifications.get(id);
    if (notification) {
      notification.status = "failed";
      notification.message = message;
    }
    return notification;
  }

  /**
   * Get progress notification
   */
  getProgress(id: string): ProgressNotification | undefined {
    return this.progressNotifications.get(id);
  }

  /**
   * Remove progress notification
   */
  removeProgress(id: string) {
    this.progressNotifications.delete(id);
  }

  /**
   * Get all progress notifications
   */
  getAllProgress(): ProgressNotification[] {
    return Array.from(this.progressNotifications.values());
  }
}

export const notificationService = new NotificationService();
