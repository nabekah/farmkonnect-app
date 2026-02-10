import { getDb } from '../db';
import { animals, crops, inventory, orders } from '../../drizzle/schema';
import { eq, and, lt, gte } from 'drizzle-orm';
import { sendBreedingReminder, sendStockAlert, sendWeatherAlert, sendVaccinationReminder, sendHarvestReminder, sendMarketplaceOrderNotification } from './multiChannelNotificationService';
import { broadcastToFarm, broadcastToUser } from '../_core/websocket';

/**
 * Check and send breeding reminders via WebSocket
 */
export async function checkBreedingReminders(): Promise<void> {
  try {
    const db = await getDb();
    
    // Get animals with upcoming breeding dates
    const upcomingBreeding = await db
      .select()
      .from(animals)
      .where(
        and(
          // Breeding due within 7 days
          gte(animals.nextBreedingDate, new Date()),
          lt(animals.nextBreedingDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        )
      );

    for (const animal of upcomingBreeding) {
      const daysUntilDue = Math.ceil(
        (new Date(animal.nextBreedingDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      // Send multi-channel notification
      await sendBreedingReminder(
        animal.userId,
        animal.userEmail || '',
        animal.userPhone || null,
        animal.name,
        daysUntilDue,
        `/animals/${animal.id}`
      );

      // Broadcast to WebSocket
      broadcastToUser(animal.userId, {
        type: 'breeding_reminder',
        data: {
          animalId: animal.id,
          animalName: animal.name,
          daysUntilDue,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`[BreedingReminder] Sent reminder for ${animal.name} (${daysUntilDue} days)`);
    }
  } catch (error) {
    console.error('[BreedingReminder] Error checking breeding reminders:', error);
  }
}

/**
 * Check and send vaccination reminders via WebSocket
 */
export async function checkVaccinationReminders(): Promise<void> {
  try {
    const db = await getDb();
    
    // Get animals with upcoming vaccinations
    const upcomingVaccinations = await db
      .select()
      .from(animals)
      .where(
        and(
          // Vaccination due within 7 days
          gte(animals.nextVaccinationDate, new Date()),
          lt(animals.nextVaccinationDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        )
      );

    for (const animal of upcomingVaccinations) {
      const daysUntilDue = Math.ceil(
        (new Date(animal.nextVaccinationDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      // Send multi-channel notification
      await sendVaccinationReminder(
        animal.userId,
        animal.userEmail || '',
        animal.userPhone || null,
        animal.name,
        animal.vaccinationType || 'routine',
        daysUntilDue,
        `/animals/${animal.id}/health`
      );

      // Broadcast to WebSocket
      broadcastToUser(animal.userId, {
        type: 'vaccination_reminder',
        data: {
          animalId: animal.id,
          animalName: animal.name,
          vaccinationType: animal.vaccinationType || 'routine',
          daysUntilDue,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`[VaccinationReminder] Sent reminder for ${animal.name} (${daysUntilDue} days)`);
    }
  } catch (error) {
    console.error('[VaccinationReminder] Error checking vaccination reminders:', error);
  }
}

/**
 * Check and send harvest reminders via WebSocket
 */
export async function checkHarvestReminders(): Promise<void> {
  try {
    const db = await getDb();
    
    // Get crops with upcoming harvest dates
    const upcomingHarvests = await db
      .select()
      .from(crops)
      .where(
        and(
          // Harvest due within 7 days
          gte(crops.estimatedHarvestDate, new Date()),
          lt(crops.estimatedHarvestDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        )
      );

    for (const crop of upcomingHarvests) {
      const daysUntilHarvest = Math.ceil(
        (new Date(crop.estimatedHarvestDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      // Send multi-channel notification
      await sendHarvestReminder(
        crop.userId,
        crop.userEmail || '',
        crop.userPhone || null,
        crop.cropName,
        daysUntilHarvest,
        `/crops/${crop.id}`
      );

      // Broadcast to WebSocket
      broadcastToUser(crop.userId, {
        type: 'harvest_reminder',
        data: {
          cropId: crop.id,
          cropName: crop.cropName,
          daysUntilHarvest,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`[HarvestReminder] Sent reminder for ${crop.cropName} (${daysUntilHarvest} days)`);
    }
  } catch (error) {
    console.error('[HarvestReminder] Error checking harvest reminders:', error);
  }
}

/**
 * Check and send stock alerts via WebSocket
 */
export async function checkStockAlerts(): Promise<void> {
  try {
    const db = await getDb();
    
    // Get inventory items below minimum threshold
    const lowStockItems = await db
      .select()
      .from(inventory)
      .where(
        and(
          lt(inventory.currentQuantity, inventory.minimumThreshold)
        )
      );

    for (const item of lowStockItems) {
      // Send multi-channel notification
      await sendStockAlert(
        item.userId,
        item.userEmail || '',
        item.userPhone || null,
        item.itemName,
        item.currentQuantity,
        item.minimumThreshold,
        `/inventory/${item.id}`
      );

      // Broadcast to WebSocket
      broadcastToUser(item.userId, {
        type: 'stock_alert',
        data: {
          inventoryId: item.id,
          itemName: item.itemName,
          currentStock: item.currentQuantity,
          minimumThreshold: item.minimumThreshold,
          timestamp: new Date().toISOString(),
        },
      });

      // Also broadcast to farm
      broadcastToFarm(item.farmId, {
        type: 'stock_alert',
        data: {
          inventoryId: item.id,
          itemName: item.itemName,
          currentStock: item.currentQuantity,
          minimumThreshold: item.minimumThreshold,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`[StockAlert] Stock alert for ${item.itemName} (${item.currentQuantity}/${item.minimumThreshold})`);
    }
  } catch (error) {
    console.error('[StockAlert] Error checking stock alerts:', error);
  }
}

/**
 * Check and send order status updates via WebSocket
 */
export async function checkOrderStatusUpdates(): Promise<void> {
  try {
    const db = await getDb();
    
    // Get orders with pending status updates
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.statusUpdated, false)
        )
      );

    for (const order of pendingOrders) {
      // Send multi-channel notification
      await sendMarketplaceOrderNotification(
        order.userId,
        order.userEmail || '',
        order.userPhone || null,
        order.orderNumber,
        order.status,
        `/marketplace/orders/${order.id}`
      );

      // Broadcast to WebSocket
      broadcastToUser(order.userId, {
        type: 'order_status_update',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`[OrderUpdate] Order ${order.orderNumber} status: ${order.status}`);
    }
  } catch (error) {
    console.error('[OrderUpdate] Error checking order updates:', error);
  }
}

/**
 * Broadcast weather alert to all users in a farm
 */
export async function broadcastWeatherAlert(
  farmId: number,
  alertType: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
): Promise<void> {
  try {
    // Broadcast to all users in the farm
    broadcastToFarm(farmId, {
      type: 'weather_alert',
      data: {
        alertType,
        description,
        severity,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[WeatherAlert] Broadcast to farm ${farmId}: ${alertType} (${severity})`);
  } catch (error) {
    console.error('[WeatherAlert] Error broadcasting weather alert:', error);
  }
}

/**
 * Send real-time notification to user via WebSocket
 */
export function sendRealtimeNotification(
  userId: number,
  type: string,
  data: Record<string, unknown>
): void {
  try {
    broadcastToUser(userId, {
      type,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[RealtimeNotification] Sent to user ${userId}: ${type}`);
  } catch (error) {
    console.error('[RealtimeNotification] Error sending notification:', error);
  }
}

/**
 * Send real-time notification to farm via WebSocket
 */
export function sendFarmRealtimeNotification(
  farmId: number,
  type: string,
  data: Record<string, unknown>
): void {
  try {
    broadcastToFarm(farmId, {
      type,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[RealtimeNotification] Sent to farm ${farmId}: ${type}`);
  } catch (error) {
    console.error('[RealtimeNotification] Error sending farm notification:', error);
  }
}
