import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface UseNotificationPollingOptions {
  interval?: number; // milliseconds
  enabled?: boolean;
}

/**
 * Hook for real-time notification polling
 * Automatically refreshes unread notifications at specified intervals
 */
export function useNotificationPolling(options: UseNotificationPollingOptions = {}) {
  const { interval = 30000, enabled = true } = options; // Default: 30 seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: unreadNotifications = [], refetch } = trpc.notifications.getUnread.useQuery();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up polling
    intervalRef.current = setInterval(() => {
      refetch();
    }, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled, refetch]);

  return {
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    refetch,
  };
}
