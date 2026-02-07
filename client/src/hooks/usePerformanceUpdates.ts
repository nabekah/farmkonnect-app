import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export interface PerformanceUpdate {
  userId: number;
  totalHours: number;
  totalEntries: number;
  avgDuration: number;
  lastActive: Date;
}

interface UsePerformanceUpdatesOptions {
  onUpdate?: (update: PerformanceUpdate) => void;
  onBatchUpdate?: (updates: PerformanceUpdate[]) => void;
  enabled?: boolean;
}

/**
 * Hook for real-time performance updates via WebSocket
 * Listens for activity logs and time tracking events
 * Automatically updates performance metrics
 */
export function usePerformanceUpdates({
  onUpdate,
  onBatchUpdate,
  enabled = true,
}: UsePerformanceUpdatesOptions) {
  const updateQueueRef = useRef<PerformanceUpdate[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout>();

  // Debounced batch update handler
  const processBatchUpdates = useCallback(() => {
    if (updateQueueRef.current.length > 0) {
      onBatchUpdate?.(updateQueueRef.current);
      updateQueueRef.current = [];
    }
  }, [onBatchUpdate]);

  // Handle individual performance update
  const handlePerformanceUpdate = useCallback(
    (update: PerformanceUpdate) => {
      if (!enabled) return;

      // Call immediate callback
      onUpdate?.(update);

      // Queue for batch update
      updateQueueRef.current.push(update);

      // Reset batch timer
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }

      // Set new batch timer (500ms debounce)
      batchTimerRef.current = setTimeout(processBatchUpdates, 500);
    },
    [enabled, onUpdate, processBatchUpdates]
  );

  // Set up WebSocket listeners
  useWebSocket({
    onActivityLogged: (data: any) => {
      if (!enabled) return;
      
      // Calculate performance metrics from activity
      const update: PerformanceUpdate = {
        userId: data.userId,
        totalHours: (data.duration || 0) / 60,
        totalEntries: 1,
        avgDuration: data.duration || 0,
        lastActive: new Date(data.createdAt),
      };
      handlePerformanceUpdate(update);
    },
    onClockInOut: (data: any) => {
      if (!enabled) return;
      
      const durationMinutes = data.durationMinutes || 0;
      const update: PerformanceUpdate = {
        userId: data.userId,
        totalHours: durationMinutes / 60,
        totalEntries: 1,
        avgDuration: durationMinutes,
        lastActive: new Date(),
      };
      handlePerformanceUpdate(update);
    },
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, []);

  return {
    processBatchUpdates,
    updateQueue: updateQueueRef.current,
  };
}
