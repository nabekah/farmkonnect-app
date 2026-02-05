/**
 * Real-time Activity Sync Service
 * Syncs activity updates across all connected field workers using WebSocket
 */

export interface ActivityUpdate {
  id: number;
  type: 'created' | 'updated' | 'completed' | 'photo_added' | 'photo_deleted';
  activityId: number;
  workerId: number;
  timestamp: number;
  data: Record<string, any>;
}

export interface SyncMessage {
  type: 'activity_update' | 'photo_update' | 'sync_request' | 'sync_response';
  payload: ActivityUpdate | ActivityUpdate[];
  timestamp: number;
}

export class ActivitySyncService {
  private static ws: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 3000;
  private static listeners: Map<string, Set<(data: any) => void>> = new Map();
  private static isConnecting = false;

  /**
   * Connect to WebSocket server for real-time sync
   */
  static connect(userId: number, farmId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws?userId=${userId}&farmId=${farmId}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[ActivitySync] Connected to WebSocket');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SyncMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[ActivitySync] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[ActivitySync] WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[ActivitySync] Disconnected from WebSocket');
          this.ws = null;
          this.isConnecting = false;
          this.attemptReconnect(userId, farmId);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  static disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  /**
   * Subscribe to activity updates
   */
  static subscribe(
    eventType: string,
    callback: (data: any) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Send activity update to server
   */
  static sendUpdate(update: ActivityUpdate): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[ActivitySync] WebSocket not connected');
      return;
    }

    const message: SyncMessage = {
      type: 'activity_update',
      payload: update,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Request sync of all activities
   */
  static requestSync(farmId: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[ActivitySync] WebSocket not connected');
      return;
    }

    const message: SyncMessage = {
      type: 'sync_request',
      payload: { farmId } as any,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Get connection status
   */
  static isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  static getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Private helper methods

  private static handleMessage(message: SyncMessage): void {
    const { type, payload } = message;

    if (Array.isArray(payload)) {
      payload.forEach((update) => {
        this.emit(`activity:${update.type}`, update);
        this.emit('activity:update', update);
      });
    } else {
      const update = payload as ActivityUpdate;
      this.emit(`activity:${update.type}`, update);
      this.emit('activity:update', update);
    }
  }

  private static emit(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[ActivitySync] Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  private static attemptReconnect(userId: number, farmId: number): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[ActivitySync] Max reconnect attempts reached');
      this.emit('sync:failed', { reason: 'max_reconnect_attempts' });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[ActivitySync] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect(userId, farmId).catch((error) => {
        console.error('[ActivitySync] Reconnection failed:', error);
      });
    }, delay);
  }
}

/**
 * React Hook for Activity Sync
 */
export function useActivitySync(userId: number, farmId: number) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionState, setConnectionState] = React.useState('disconnected');

  React.useEffect(() => {
    // Connect to WebSocket
    ActivitySyncService.connect(userId, farmId)
      .then(() => {
        setIsConnected(true);
        setConnectionState('connected');
      })
      .catch((error) => {
        console.error('Failed to connect:', error);
        setConnectionState('failed');
      });

    // Listen for connection state changes
    const unsubscribeConnected = ActivitySyncService.subscribe('sync:connected', () => {
      setIsConnected(true);
      setConnectionState('connected');
    });

    const unsubscribeDisconnected = ActivitySyncService.subscribe('sync:disconnected', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    const unsubscribeFailed = ActivitySyncService.subscribe('sync:failed', () => {
      setConnectionState('failed');
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeFailed();
      ActivitySyncService.disconnect();
    };
  }, [userId, farmId]);

  return {
    isConnected,
    connectionState,
    subscribe: ActivitySyncService.subscribe.bind(ActivitySyncService),
    sendUpdate: ActivitySyncService.sendUpdate.bind(ActivitySyncService),
    requestSync: ActivitySyncService.requestSync.bind(ActivitySyncService),
  };
}

import React from 'react';
