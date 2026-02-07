import { useCallback } from "react";
import { notificationService, ProgressNotification } from "@/lib/notificationService";

export function useBulkNotifications() {
  const notifyBatchStart = useCallback((operationType: string, itemCount: number) => {
    return notificationService.showBatchStarted(operationType, itemCount);
  }, []);

  const notifyBatchComplete = useCallback((operationType: string, successCount: number, failureCount = 0) => {
    return notificationService.showBatchCompleted(operationType, successCount, failureCount);
  }, []);

  const notifyBatchError = useCallback((operationType: string, error: string) => {
    return notificationService.showBatchFailed(operationType, error);
  }, []);

  const notifyImportComplete = useCallback((totalCount: number, successCount: number, failureCount: number) => {
    return notificationService.showImportCompleted(totalCount, successCount, failureCount);
  }, []);

  const notifyExportComplete = useCallback((format: string, itemCount: number) => {
    return notificationService.showExportCompleted(format, itemCount);
  }, []);

  const notifyApprovalRequested = useCallback((operationType: string, itemCount: number) => {
    return notificationService.showApprovalRequested(operationType, itemCount);
  }, []);

  const notifyApprovalResult = useCallback((operationType: string, approved: boolean, itemCount: number) => {
    return notificationService.showApprovalResult(operationType, approved, itemCount);
  }, []);

  const createProgress = useCallback((id: string, title: string, total: number): ProgressNotification => {
    return notificationService.createProgressNotification(id, title, total);
  }, []);

  const updateProgress = useCallback((id: string, current: number, message?: string) => {
    return notificationService.updateProgress(id, current, message);
  }, []);

  const completeProgress = useCallback((id: string, message?: string) => {
    return notificationService.completeProgress(id, message);
  }, []);

  const failProgress = useCallback((id: string, message?: string) => {
    return notificationService.failProgress(id, message);
  }, []);

  const getProgress = useCallback((id: string) => {
    return notificationService.getProgress(id);
  }, []);

  const removeProgress = useCallback((id: string) => {
    notificationService.removeProgress(id);
  }, []);

  const getAllProgress = useCallback(() => {
    return notificationService.getAllProgress();
  }, []);

  const dismiss = useCallback((toastId: string | number) => {
    notificationService.dismiss(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    notificationService.dismissAll();
  }, []);

  return {
    notifyBatchStart,
    notifyBatchComplete,
    notifyBatchError,
    notifyImportComplete,
    notifyExportComplete,
    notifyApprovalRequested,
    notifyApprovalResult,
    createProgress,
    updateProgress,
    completeProgress,
    failProgress,
    getProgress,
    removeProgress,
    getAllProgress,
    dismiss,
    dismissAll,
  };
}
