import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const ACTIVITY_TYPES = [
  'crop_health',
  'pest_monitoring',
  'disease_detection',
  'irrigation',
  'fertilizer_application',
  'weed_control',
  'harvest',
  'equipment_check',
  'soil_test',
  'weather_observation',
  'general_note',
];

const WORKER_NAMES = [
  'John Doe',
  'Jane Smith',
  'Michael Johnson',
  'Sarah Williams',
  'David Brown',
  'Emily Davis',
  'Robert Miller',
  'Jessica Wilson',
];

// Generate random time entries for the past 30 days
function generateTimeEntries(count = 50) {
  const entries = [];
  const now = new Date();
  const farmId = 1; // Default farm ID

  for (let i = 0; i < count; i++) {
    // Random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(Math.floor(Math.random() * 8) + 6); // 6 AM to 2 PM
    startDate.setMinutes(Math.floor(Math.random() * 60));

    // Duration: 30 to 480 minutes (30 min to 8 hours)
    const durationMinutes = Math.floor(Math.random() * 450) + 30;
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    // Random worker (1-8)
    const workerId = Math.floor(Math.random() * WORKER_NAMES.length) + 1;
    const workerName = WORKER_NAMES[workerId - 1];

    // Random activity type
    const activityType = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];

    // Random GPS coordinates (within reasonable farm bounds)
    const gpsLatitude = (Math.random() * 0.1 - 0.05 + 37.7749).toFixed(8);
    const gpsLongitude = (Math.random() * 0.1 - 0.05 - 122.4194).toFixed(8);

    // Random notes
    const notes = `${activityType.replace(/_/g, ' ')} - Field work completed`;

    entries.push({
      farmId,
      workerId,
      activityType,
      startTime: startDate,
      endTime: endDate,
      durationMinutes,
      notes,
      gpsLatitude: parseFloat(gpsLatitude),
      gpsLongitude: parseFloat(gpsLongitude),
      photoUrls: JSON.stringify([]), // Empty array for now
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return entries;
}

async function seedTimeTrackerData() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbUrl);
    console.log('🌱 Seeding time tracker data...');

    const entries = generateTimeEntries(50);
    let insertedCount = 0;

    for (const entry of entries) {
      try {
        await connection.execute(
          `INSERT INTO timeTrackerLogs 
           (farmId, workerId, activityType, startTime, endTime, durationMinutes, notes, gpsLatitude, gpsLongitude, photoUrls, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            entry.farmId,
            entry.workerId,
            entry.activityType,
            entry.startTime,
            entry.endTime,
            entry.durationMinutes,
            entry.notes,
            entry.gpsLatitude,
            entry.gpsLongitude,
            entry.photoUrls,
            entry.isActive,
            entry.createdAt,
            entry.updatedAt,
          ]
        );
        insertedCount++;
      } catch (error) {
        console.error(`Failed to insert entry: ${error.message}`);
      }
    }

    console.log(`✅ Successfully seeded ${insertedCount} time tracker entries`);

    // Print summary statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as totalEntries,
        COUNT(DISTINCT workerId) as uniqueWorkers,
        COUNT(DISTINCT activityType) as uniqueActivityTypes,
        SUM(durationMinutes) as totalMinutes,
        AVG(durationMinutes) as avgMinutes
      FROM timeTrackerLogs
      WHERE farmId = 1
    `);

    console.log('\n📊 Time Tracker Statistics:');
    console.log(`   Total Entries: ${stats[0].totalEntries}`);
    console.log(`   Unique Workers: ${stats[0].uniqueWorkers}`);
    console.log(`   Activity Types: ${stats[0].uniqueActivityTypes}`);
    console.log(`   Total Hours: ${(stats[0].totalMinutes / 60).toFixed(1)}`);
    console.log(`   Average Duration: ${Math.round(stats[0].avgMinutes)} minutes`);

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedTimeTrackerData();
