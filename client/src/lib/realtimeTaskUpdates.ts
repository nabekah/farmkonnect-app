import { useEffect, useRef, useCallback } from 'react';

export interface TaskUpdate {
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'task_cancelled';
  taskId: string;
  taskTitle: string;
  assignedTo?: string;
  status?: string;
  priority?: string;
  timestamp: string;
}

export interface RealtimeTaskListener {
  onTaskAssigned: (task: TaskUpdate) => void;
  onTaskUpdated: (task: TaskUpdate) => void;
  onTaskCompleted: (task: TaskUpdate) => void;
  onTaskCancelled: (task: TaskUpdate) => void;
  onError: (error: Error) => void;
}

class RealtimeTaskService {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<RealtimeTaskListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isManualClose = false;

  constructor(url: string = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/tasks`) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('Connected to real-time task updates');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const update: TaskUpdate = JSON.parse(event.data);
            this.notifyListeners(update);
          } catch (error) {
            console.error('Failed to parse task update:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.notifyError(new Error('WebSocket connection error'));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from real-time task updates');
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect().catch(console.error), this.reconnectDelay);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(listener: RealtimeTaskListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(update: TaskUpdate): void {
    this.listeners.forEach((listener) => {
      switch (update.type) {
        case 'task_assigned':
          listener.onTaskAssigned(update);
          break;
        case 'task_updated':
          listener.onTaskUpdated(update);
          break;
        case 'task_completed':
          listener.onTaskCompleted(update);
          break;
        case 'task_cancelled':
          listener.onTaskCancelled(update);
          break;
      }
    });
  }

  private notifyError(error: Error): void {
    this.listeners.forEach((listener) => {
      listener.onError(error);
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let serviceInstance: RealtimeTaskService | null = null;

export function getRealtimeTaskService(): RealtimeTaskService {
  if (!serviceInstance) {
    serviceInstance = new RealtimeTaskService();
  }
  return serviceInstance;
}

// React hook for using real-time task updates
export function useRealtimeTaskUpdates(listener: RealtimeTaskListener) {
  const serviceRef = useRef(getRealtimeTaskService());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const service = serviceRef.current;

    // Connect if not already connected
    if (!service.isConnected()) {
      service.connect().catch(console.error);
    }

    // Subscribe to updates
    unsubscribeRef.current = service.subscribe(listener);

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [listener]);
}

// Hook to refresh task list on updates
export function useTaskListRefresh(refetchFn: () => void) {
  const handleTaskUpdate = useCallback(() => {
    refetchFn();
  }, [refetchFn]);

  useRealtimeTaskUpdates({
    onTaskAssigned: handleTaskUpdate,
    onTaskUpdated: handleTaskUpdate,
    onTaskCompleted: handleTaskUpdate,
    onTaskCancelled: handleTaskUpdate,
    onError: (error) => console.error('Task update error:', error),
  });
}
