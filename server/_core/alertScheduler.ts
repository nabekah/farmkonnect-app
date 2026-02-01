import cron from 'node-cron';
import { runAlertChecks } from './alertMonitoring';
import { getDb } from '../db';
import { farms } from '../../drizzle/schema';

/**
 * Initialize scheduled alert monitoring
 * Runs every hour to check all farms for critical conditions
 */
export function initializeAlertScheduler() {
  // Run alert checks every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[ALERT SCHEDULER] Running hourly alert checks...');
    
    try {
      const db = await getDb();
      if (!db) {
        console.error('[ALERT SCHEDULER] Database not available');
        return;
      }

      // Get all farms
      const allFarms = await db.select().from(farms);
      
      console.log(`[ALERT SCHEDULER] Checking ${allFarms.length} farms`);

      // Run alert checks for each farm
      for (const farm of allFarms) {
        try {
          // Use farm owner as the user ID for notifications
          await runAlertChecks(farm.id, farm.farmerUserId);
          console.log(`[ALERT SCHEDULER] Completed checks for farm ${farm.id} (${farm.farmName})`);
        } catch (error) {
          console.error(`[ALERT SCHEDULER] Error checking farm ${farm.id}:`, error);
        }
      }

      console.log('[ALERT SCHEDULER] Hourly alert checks completed');
    } catch (error) {
      console.error('[ALERT SCHEDULER] Fatal error during alert checks:', error);
    }
  });

  console.log('[ALERT SCHEDULER] Initialized - running every hour');
}

/**
 * Run alert checks immediately for testing
 */
export async function runImmediateAlertCheck() {
  console.log('[ALERT SCHEDULER] Running immediate alert check...');
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('[ALERT SCHEDULER] Database not available');
      return;
    }

    const allFarms = await db.select().from(farms);
    
    for (const farm of allFarms) {
      await runAlertChecks(farm.id, farm.farmerUserId);
    }

    console.log('[ALERT SCHEDULER] Immediate alert check completed');
  } catch (error) {
    console.error('[ALERT SCHEDULER] Error during immediate check:', error);
  }
}
