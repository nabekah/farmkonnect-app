import { WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";

interface ProductTrackingEvent {
  id: string;
  productId: string;
  batchNumber: string;
  eventType: "production" | "processing" | "transport" | "delivery" | "certification";
  location: string;
  actor: string;
  timestamp: number;
  temperature?: number;
  humidity?: number;
  gpsCoordinates?: { latitude: number; longitude: number };
  notes?: string;
  stakeholders: string[]; // User IDs to notify
}

interface StakeholderSubscription {
  userId: string;
  productIds: Set<string>;
  batchNumbers: Set<string>;
}

class RealTimeProductTracking {
  private wss: WebSocketServer;
  private stakeholders: Map<string, StakeholderSubscription> = new Map();
  private productSubscribers: Map<string, Set<string>> = new Map(); // productId -> Set<userId>
  private batchSubscribers: Map<string, Set<string>> = new Map(); // batchNumber -> Set<userId>

  constructor(httpServer: HTTPServer) {
    this.wss = new WebSocketServer({ server: httpServer, path: "/ws/product-tracking" });
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[ProductTracking] New WebSocket connection");

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("[ProductTracking] Failed to parse message:", error);
          ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("[ProductTracking] WebSocket error:", error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const { type, userId, productIds, batchNumbers } = message;

    switch (type) {
      case "subscribe":
        this.handleSubscribe(ws, userId, productIds, batchNumbers);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(userId, productIds, batchNumbers);
        break;
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;
      default:
        console.warn("[ProductTracking] Unknown message type:", type);
    }
  }

  private handleSubscribe(ws: WebSocket, userId: string, productIds: string[], batchNumbers: string[]) {
    // Store stakeholder subscription
    if (!this.stakeholders.has(userId)) {
      this.stakeholders.set(userId, {
        userId,
        productIds: new Set(productIds),
        batchNumbers: new Set(batchNumbers),
      });
    } else {
      const subscription = this.stakeholders.get(userId)!;
      productIds.forEach((id) => subscription.productIds.add(id));
      batchNumbers.forEach((bn) => subscription.batchNumbers.add(bn));
    }

    // Subscribe to product updates
    productIds.forEach((productId) => {
      if (!this.productSubscribers.has(productId)) {
        this.productSubscribers.set(productId, new Set());
      }
      this.productSubscribers.get(productId)!.add(userId);
    });

    // Subscribe to batch updates
    batchNumbers.forEach((batchNumber) => {
      if (!this.batchSubscribers.has(batchNumber)) {
        this.batchSubscribers.set(batchNumber, new Set());
      }
      this.batchSubscribers.get(batchNumber)!.add(userId);
    });

    ws.send(
      JSON.stringify({
        type: "subscribed",
        productIds,
        batchNumbers,
        message: "Successfully subscribed to product tracking updates",
      })
    );

    console.log(`[ProductTracking] User ${userId} subscribed to ${productIds.length} products and ${batchNumbers.length} batches`);
  }

  private handleUnsubscribe(userId: string, productIds: string[], batchNumbers: string[]) {
    const subscription = this.stakeholders.get(userId);
    if (!subscription) return;

    // Unsubscribe from products
    productIds.forEach((productId) => {
      subscription.productIds.delete(productId);
      this.productSubscribers.get(productId)?.delete(userId);
    });

    // Unsubscribe from batches
    batchNumbers.forEach((batchNumber) => {
      subscription.batchNumbers.delete(batchNumber);
      this.batchSubscribers.get(batchNumber)?.delete(userId);
    });

    // Remove subscription if empty
    if (subscription.productIds.size === 0 && subscription.batchNumbers.size === 0) {
      this.stakeholders.delete(userId);
    }

    console.log(`[ProductTracking] User ${userId} unsubscribed from ${productIds.length} products and ${batchNumbers.length} batches`);
  }

  private handleDisconnect(ws: WebSocket) {
    console.log("[ProductTracking] WebSocket disconnected");
    // Clean up subscriptions if needed
  }

  /**
   * Broadcast a product tracking event to all interested stakeholders
   */
  public broadcastProductEvent(event: ProductTrackingEvent) {
    const interestedUsers = new Set<string>();

    // Find users interested in this product
    const productSubscribers = this.productSubscribers.get(event.productId) || new Set();
    productSubscribers.forEach((userId) => interestedUsers.add(userId));

    // Find users interested in this batch
    const batchSubscribers = this.batchSubscribers.get(event.batchNumber) || new Set();
    batchSubscribers.forEach((userId) => interestedUsers.add(userId));

    // Add specified stakeholders
    event.stakeholders.forEach((userId) => interestedUsers.add(userId));

    // Send event to all interested users
    const eventMessage = JSON.stringify({
      type: "product-event",
      event: {
        ...event,
        timestamp: event.timestamp || Date.now(),
      },
    });

    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        // In production, you'd need to track which user each client belongs to
        client.send(eventMessage);
      }
    });

    console.log(`[ProductTracking] Broadcasted event for product ${event.productId}, batch ${event.batchNumber} to ${interestedUsers.size} stakeholders`);
  }

  /**
   * Send event to specific user
   */
  public sendToUser(userId: string, event: ProductTrackingEvent) {
    const eventMessage = JSON.stringify({
      type: "product-event",
      event: {
        ...event,
        timestamp: event.timestamp || Date.now(),
      },
    });

    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        // In production, match client to userId
        client.send(eventMessage);
      }
    });
  }

  /**
   * Get subscription statistics
   */
  public getStats() {
    return {
      totalConnections: this.wss.clients.size,
      totalStakeholders: this.stakeholders.size,
      trackedProducts: this.productSubscribers.size,
      trackedBatches: this.batchSubscribers.size,
      stakeholders: Array.from(this.stakeholders.entries()).map(([userId, subscription]) => ({
        userId,
        productCount: subscription.productIds.size,
        batchCount: subscription.batchNumbers.size,
      })),
    };
  }

  /**
   * Simulate real-time tracking events (for testing)
   */
  public simulateTrackingEvent(productId: string, batchNumber: string) {
    const events: ProductTrackingEvent[] = [
      {
        id: `evt-${Date.now()}`,
        productId,
        batchNumber,
        eventType: "production",
        location: "Farm A",
        actor: "farmer",
        timestamp: Date.now(),
        temperature: 22,
        humidity: 65,
        notes: "Harvest completed",
        stakeholders: [],
      },
      {
        id: `evt-${Date.now() + 1000}`,
        productId,
        batchNumber,
        eventType: "processing",
        location: "Processing Plant B",
        actor: "processor",
        timestamp: Date.now() + 86400000, // 1 day later
        temperature: 4,
        humidity: 70,
        notes: "Washing and sorting",
        stakeholders: [],
      },
      {
        id: `evt-${Date.now() + 2000}`,
        productId,
        batchNumber,
        eventType: "transport",
        location: "In Transit",
        actor: "transporter",
        timestamp: Date.now() + 172800000, // 2 days later
        temperature: 8,
        humidity: 60,
        gpsCoordinates: { latitude: 5.6037, longitude: -0.187 },
        notes: "Cold chain maintained",
        stakeholders: [],
      },
      {
        id: `evt-${Date.now() + 3000}`,
        productId,
        batchNumber,
        eventType: "certification",
        location: "Certification Center",
        actor: "certifier",
        timestamp: Date.now() + 259200000, // 3 days later
        notes: "Product certified as organic",
        stakeholders: [],
      },
    ];

    events.forEach((event) => {
      setTimeout(() => {
        this.broadcastProductEvent(event);
      }, Math.random() * 5000);
    });
  }
}

export { RealTimeProductTracking, ProductTrackingEvent };
