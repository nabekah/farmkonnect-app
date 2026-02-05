/**
 * Collaborative Annotations Service
 * Enables multiple field workers to annotate photos in real-time with cursor tracking
 */

export interface UserCursor {
  userId: number;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  isDrawing: boolean;
  tool: string;
  timestamp: number;
}

export interface CollaborativeAnnotation {
  id: string;
  userId: number;
  userName: string;
  userColor: string;
  type: 'pen' | 'circle' | 'rectangle' | 'arrow' | 'text';
  points?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  lineWidth: number;
  timestamp: number;
  isLocked: boolean;
}

export interface CollaborativeSession {
  photoId: number;
  sessionId: string;
  activeUsers: Map<number, UserCursor>;
  annotations: CollaborativeAnnotation[];
  createdAt: number;
}

export class CollaborativeAnnotationService {
  private static sessions: Map<number, CollaborativeSession> = new Map();
  private static ws: WebSocket | null = null;
  private static currentUserId: number | null = null;
  private static currentUserColor: string = '#FF0000';
  private static listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Initialize collaborative session for a photo
   */
  static initializeSession(
    photoId: number,
    userId: number,
    userName: string,
    userColor: string
  ): CollaborativeSession {
    const sessionId = `session-${photoId}-${Date.now()}`;
    const session: CollaborativeSession = {
      photoId,
      sessionId,
      activeUsers: new Map(),
      annotations: [],
      createdAt: Date.now(),
    };

    this.sessions.set(photoId, session);
    this.currentUserId = userId;
    this.currentUserColor = userColor;

    // Broadcast session created
    this.emit('session:created', { photoId, sessionId });

    return session;
  }

  /**
   * Add user cursor to session
   */
  static updateUserCursor(
    photoId: number,
    userId: number,
    userName: string,
    x: number,
    y: number,
    isDrawing: boolean,
    tool: string
  ): void {
    const session = this.sessions.get(photoId);
    if (!session) return;

    const cursor: UserCursor = {
      userId,
      userName,
      userColor: this.currentUserColor,
      x,
      y,
      isDrawing,
      tool,
      timestamp: Date.now(),
    };

    session.activeUsers.set(userId, cursor);

    // Broadcast cursor update
    this.emit('cursor:updated', cursor);

    // Send to server
    this.broadcastToServer({
      type: 'cursor_update',
      photoId,
      cursor,
    });
  }

  /**
   * Add collaborative annotation
   */
  static addAnnotation(
    photoId: number,
    userId: number,
    userName: string,
    annotation: Omit<CollaborativeAnnotation, 'id' | 'userId' | 'userName' | 'userColor' | 'timestamp' | 'isLocked'>
  ): CollaborativeAnnotation {
    const session = this.sessions.get(photoId);
    if (!session) throw new Error('Session not found');

    const collaborativeAnnotation: CollaborativeAnnotation = {
      ...annotation,
      id: `annotation-${Date.now()}-${Math.random()}`,
      userId,
      userName,
      userColor: this.currentUserColor,
      timestamp: Date.now(),
      isLocked: false,
    };

    session.annotations.push(collaborativeAnnotation);

    // Broadcast annotation
    this.emit('annotation:added', collaborativeAnnotation);

    // Send to server
    this.broadcastToServer({
      type: 'annotation_added',
      photoId,
      annotation: collaborativeAnnotation,
    });

    return collaborativeAnnotation;
  }

  /**
   * Update annotation (only by creator)
   */
  static updateAnnotation(
    photoId: number,
    annotationId: string,
    updates: Partial<CollaborativeAnnotation>
  ): CollaborativeAnnotation | null {
    const session = this.sessions.get(photoId);
    if (!session) return null;

    const annotation = session.annotations.find((a) => a.id === annotationId);
    if (!annotation) return null;

    // Only allow creator to update
    if (annotation.userId !== this.currentUserId) {
      console.warn('Only annotation creator can update');
      return null;
    }

    Object.assign(annotation, updates);

    // Broadcast update
    this.emit('annotation:updated', annotation);

    // Send to server
    this.broadcastToServer({
      type: 'annotation_updated',
      photoId,
      annotation,
    });

    return annotation;
  }

  /**
   * Delete annotation (only by creator)
   */
  static deleteAnnotation(photoId: number, annotationId: string): boolean {
    const session = this.sessions.get(photoId);
    if (!session) return false;

    const index = session.annotations.findIndex((a) => a.id === annotationId);
    if (index === -1) return false;

    const annotation = session.annotations[index];

    // Only allow creator to delete
    if (annotation.userId !== this.currentUserId) {
      console.warn('Only annotation creator can delete');
      return false;
    }

    session.annotations.splice(index, 1);

    // Broadcast deletion
    this.emit('annotation:deleted', { annotationId });

    // Send to server
    this.broadcastToServer({
      type: 'annotation_deleted',
      photoId,
      annotationId,
    });

    return true;
  }

  /**
   * Lock annotation to prevent editing
   */
  static lockAnnotation(photoId: number, annotationId: string): boolean {
    const session = this.sessions.get(photoId);
    if (!session) return false;

    const annotation = session.annotations.find((a) => a.id === annotationId);
    if (!annotation) return false;

    annotation.isLocked = true;

    // Broadcast lock
    this.emit('annotation:locked', { annotationId });

    // Send to server
    this.broadcastToServer({
      type: 'annotation_locked',
      photoId,
      annotationId,
    });

    return true;
  }

  /**
   * Get session annotations
   */
  static getAnnotations(photoId: number): CollaborativeAnnotation[] {
    const session = this.sessions.get(photoId);
    return session ? [...session.annotations] : [];
  }

  /**
   * Get active users in session
   */
  static getActiveUsers(photoId: number): UserCursor[] {
    const session = this.sessions.get(photoId);
    return session ? Array.from(session.activeUsers.values()) : [];
  }

  /**
   * End collaborative session
   */
  static endSession(photoId: number): void {
    const session = this.sessions.get(photoId);
    if (!session) return;

    // Broadcast session ended
    this.emit('session:ended', { photoId, sessionId: session.sessionId });

    // Send to server
    this.broadcastToServer({
      type: 'session_ended',
      photoId,
      sessionId: session.sessionId,
    });

    this.sessions.delete(photoId);
  }

  /**
   * Subscribe to collaboration events
   */
  static subscribe(eventType: string, callback: (data: any) => void): () => void {
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
   * Connect to WebSocket for real-time collaboration
   */
  static connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[CollaborativeAnnotations] Connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[CollaborativeAnnotations] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[CollaborativeAnnotations] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[CollaborativeAnnotations] Disconnected');
          this.ws = null;
        };
      } catch (error) {
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
  }

  // Private helper methods

  private static emit(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[CollaborativeAnnotations] Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  private static broadcastToServer(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[CollaborativeAnnotations] WebSocket not connected');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  private static handleMessage(message: any): void {
    const { type, data } = message;

    switch (type) {
      case 'cursor_update':
        this.emit('remote:cursor', data);
        break;
      case 'annotation_added':
        this.emit('remote:annotation_added', data);
        break;
      case 'annotation_updated':
        this.emit('remote:annotation_updated', data);
        break;
      case 'annotation_deleted':
        this.emit('remote:annotation_deleted', data);
        break;
      case 'user_joined':
        this.emit('user:joined', data);
        break;
      case 'user_left':
        this.emit('user:left', data);
        break;
    }
  }
}

/**
 * React Hook for Collaborative Annotations
 */
export function useCollaborativeAnnotations(photoId: number, userId: number, userName: string) {
  const [annotations, setAnnotations] = React.useState<CollaborativeAnnotation[]>([]);
  const [activeUsers, setActiveUsers] = React.useState<UserCursor[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    // Initialize session
    CollaborativeAnnotationService.initializeSession(photoId, userId, userName, generateUserColor());

    // Subscribe to events
    const unsubscribeAnnotationAdded = CollaborativeAnnotationService.subscribe(
      'annotation:added',
      (annotation) => {
        setAnnotations((prev) => [...prev, annotation]);
      }
    );

    const unsubscribeAnnotationUpdated = CollaborativeAnnotationService.subscribe(
      'annotation:updated',
      (annotation) => {
        setAnnotations((prev) =>
          prev.map((a) => (a.id === annotation.id ? annotation : a))
        );
      }
    );

    const unsubscribeAnnotationDeleted = CollaborativeAnnotationService.subscribe(
      'annotation:deleted',
      ({ annotationId }) => {
        setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
      }
    );

    const unsubscribeCursorUpdated = CollaborativeAnnotationService.subscribe(
      'cursor:updated',
      (cursor) => {
        setActiveUsers((prev) => {
          const existing = prev.findIndex((u) => u.userId === cursor.userId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = cursor;
            return updated;
          }
          return [...prev, cursor];
        });
      }
    );

    return () => {
      unsubscribeAnnotationAdded();
      unsubscribeAnnotationUpdated();
      unsubscribeAnnotationDeleted();
      unsubscribeCursorUpdated();
      CollaborativeAnnotationService.endSession(photoId);
    };
  }, [photoId, userId, userName]);

  return {
    annotations,
    activeUsers,
    isConnected,
    addAnnotation: (annotation: any) =>
      CollaborativeAnnotationService.addAnnotation(photoId, userId, userName, annotation),
    updateAnnotation: (annotationId: string, updates: any) =>
      CollaborativeAnnotationService.updateAnnotation(photoId, annotationId, updates),
    deleteAnnotation: (annotationId: string) =>
      CollaborativeAnnotationService.deleteAnnotation(photoId, annotationId),
    lockAnnotation: (annotationId: string) =>
      CollaborativeAnnotationService.lockAnnotation(photoId, annotationId),
    updateCursor: (x: number, y: number, isDrawing: boolean, tool: string) =>
      CollaborativeAnnotationService.updateUserCursor(
        photoId,
        userId,
        userName,
        x,
        y,
        isDrawing,
        tool
      ),
  };
}

function generateUserColor(): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  return colors[Math.floor(Math.random() * colors.length)];
}

import React from 'react';
