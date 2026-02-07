import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const healthTrendsAnalyticsRouter = router({
  // Get vaccination coverage trends
  getVaccinationTrends: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        breed: z.string().optional(),
        months: z.number().default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;
      const breedFilter = input.breed ? `AND a.breed = '${input.breed}'` : "";

      const trends = await db.execute(
        sql`
          SELECT 
            DATE_FORMAT(v.vaccinationDate, '%Y-%m') as month,
            COUNT(*) as totalVaccinations,
            COUNT(DISTINCT v.animalId) as animalsVaccinated,
            v.vaccineName,
            COUNT(CASE WHEN v.status = 'completed' THEN 1 END) as completedCount,
            COUNT(CASE WHEN v.status = 'pending' THEN 1 END) as pendingCount
          FROM vaccinations v
          JOIN animals a ON v.animalId = a.id
          WHERE a.farmId = ${farmId} ${breedFilter}
            AND v.vaccinationDate > DATE_SUB(CURDATE(), INTERVAL ${input.months} MONTH)
          GROUP BY month, v.vaccineName
          ORDER BY month DESC
        `
      );

      return (trends as any).rows || [];
    }),

  // Get health issues trends
  getHealthIssuesTrends: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        breed: z.string().optional(),
        months: z.number().default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;
      const breedFilter = input.breed ? `AND a.breed = '${input.breed}'` : "";

      const trends = await db.execute(
        sql`
          SELECT 
            DATE_FORMAT(h.recordDate, '%Y-%m') as month,
            COUNT(*) as totalIssues,
            COUNT(DISTINCT h.animalId) as animalsAffected,
            h.severity,
            COUNT(CASE WHEN h.severity = 'high' THEN 1 END) as highSeverity,
            COUNT(CASE WHEN h.severity = 'medium' THEN 1 END) as mediumSeverity,
            COUNT(CASE WHEN h.severity = 'low' THEN 1 END) as lowSeverity
          FROM healthRecords h
          JOIN animals a ON h.animalId = a.id
          WHERE a.farmId = ${farmId} ${breedFilter}
            AND h.recordDate > DATE_SUB(CURDATE(), INTERVAL ${input.months} MONTH)
          GROUP BY month, h.severity
          ORDER BY month DESC
        `
      );

      return (trends as any).rows || [];
    }),

  // Get performance metrics trends
  getPerformanceTrends: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        breed: z.string().optional(),
        metricType: z.enum(["weight", "milk_production", "egg_production", "growth_rate"]).optional(),
        months: z.number().default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;
      const breedFilter = input.breed ? `AND a.breed = '${input.breed}'` : "";
      const metricFilter = input.metricType ? `AND p.metricType = '${input.metricType}'` : "";

      const trends = await db.execute(
        sql`
          SELECT 
            DATE_FORMAT(p.recordDate, '%Y-%m') as month,
            p.metricType,
            AVG(CAST(p.value AS DECIMAL(10,2))) as avgValue,
            MAX(CAST(p.value AS DECIMAL(10,2))) as maxValue,
            MIN(CAST(p.value AS DECIMAL(10,2))) as minValue,
            COUNT(*) as recordCount,
            COUNT(DISTINCT p.animalId) as animalsTracked
          FROM performanceMetrics p
          JOIN animals a ON p.animalId = a.id
          WHERE a.farmId = ${farmId} ${breedFilter} ${metricFilter}
            AND p.recordDate > DATE_SUB(CURDATE(), INTERVAL ${input.months} MONTH)
          GROUP BY month, p.metricType
          ORDER BY month DESC
        `
      );

      return (trends as any).rows || [];
    }),

  // Get breed health comparison
  getBreedHealthComparison: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        months: z.number().default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;

      const comparison = await db.execute(
        sql`
          SELECT 
            a.breed,
            COUNT(DISTINCT a.id) as totalAnimals,
            COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as activeAnimals,
            COUNT(DISTINCT h.id) as healthIssuesCount,
            COUNT(DISTINCT v.id) as vaccinationsCount,
            AVG(CAST(p.value AS DECIMAL(10,2))) as avgPerformance,
            COUNT(CASE WHEN h.severity = 'high' THEN 1 END) as highSeverityIssues,
            ROUND(COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN v.id END) * 100.0 / COUNT(DISTINCT v.id), 2) as vaccinationCoveragePercent
          FROM animals a
          LEFT JOIN healthRecords h ON a.id = h.animalId AND h.recordDate > DATE_SUB(CURDATE(), INTERVAL ${input.months} MONTH)
          LEFT JOIN vaccinations v ON a.id = v.animalId AND v.vaccinationDate > DATE_SUB(CURDATE(), INTERVAL ${input.months} MONTH)
          LEFT JOIN performanceMetrics p ON a.id = p.animalId AND p.recordDate > DATE_SUB(CURDATE(), INTERVAL ${input.months} MONTH)
          WHERE a.farmId = ${farmId}
          GROUP BY a.breed
          ORDER BY highSeverityIssues DESC
        `
      );

      return (comparison as any).rows || [];
    }),

  // Get health score by animal
  getAnimalHealthScores: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;

      const scores = await db.execute(
        sql`
          SELECT 
            a.id, a.tagId, a.breed, a.gender,
            COUNT(DISTINCT CASE WHEN h.severity = 'high' THEN h.id END) as highSeverityCount,
            COUNT(DISTINCT CASE WHEN h.severity = 'medium' THEN h.id END) as mediumSeverityCount,
            COUNT(DISTINCT CASE WHEN h.severity = 'low' THEN h.id END) as lowSeverityCount,
            COUNT(DISTINCT v.id) as totalVaccinations,
            COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN v.id END) as completedVaccinations,
            CASE 
              WHEN COUNT(DISTINCT CASE WHEN h.severity = 'high' THEN h.id END) > 0 THEN 'critical'
              WHEN COUNT(DISTINCT CASE WHEN h.severity = 'medium' THEN h.id END) > 2 THEN 'poor'
              WHEN COUNT(DISTINCT CASE WHEN h.severity = 'medium' THEN h.id END) > 0 THEN 'fair'
              WHEN COUNT(DISTINCT CASE WHEN h.severity = 'low' THEN h.id END) > 0 THEN 'good'
              ELSE 'excellent'
            END as healthStatus,
            ROUND(100 - (COUNT(DISTINCT h.id) * 5 + COUNT(DISTINCT CASE WHEN h.severity = 'high' THEN h.id END) * 20), 0) as healthScore
          FROM animals a
          LEFT JOIN healthRecords h ON a.id = h.animalId AND h.recordDate > DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          LEFT JOIN vaccinations v ON a.id = v.animalId
          WHERE a.farmId = ${farmId} AND a.status = 'active'
          GROUP BY a.id, a.tagId, a.breed, a.gender
          ORDER BY healthScore ASC
          LIMIT ${input.limit}
        `
      );

      return (scores as any).rows || [];
    }),

  // Get vaccination coverage report
  getVaccinationCoverageReport: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        breed: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const farmId = input.farmId || 1;
      const breedFilter = input.breed ? `AND a.breed = '${input.breed}'` : "";

      const report = await db.execute(
        sql`
          SELECT 
            v.vaccineName,
            COUNT(DISTINCT a.id) as totalAnimals,
            COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN a.id END) as vaccinatedAnimals,
            ROUND(COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN a.id END) * 100.0 / COUNT(DISTINCT a.id), 2) as coveragePercent,
            COUNT(DISTINCT CASE WHEN v.status = 'pending' THEN a.id END) as pendingAnimals,
            COUNT(DISTINCT CASE WHEN v.nextDueDate < CURDATE() THEN a.id END) as overdueAnimals,
            MIN(v.vaccinationDate) as firstVaccinationDate,
            MAX(v.vaccinationDate) as lastVaccinationDate
          FROM vaccinations v
          JOIN animals a ON v.animalId = a.id
          WHERE a.farmId = ${farmId} ${breedFilter}
          GROUP BY v.vaccineName
          ORDER BY coveragePercent DESC
        `
      );

      return (report as any).rows || [];
    }),
});
