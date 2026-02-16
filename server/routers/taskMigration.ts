/**
 * Task Migration Router
 * Handles gradual migration from mock task data to actual database storage
 * with conflict resolution, validation, and progress tracking
 */

import { router, protectedProcedure } from '../_core/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getDb } from '../db'
import { taskAssignments, users } from '../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

// Mock task data structure (what we're migrating from)
const MockTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  taskType: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  dueDate: z.date(),
  estimatedHours: z.number(),
  actualHours: z.number().optional(),
  workerId: z.number().nullable(),
  farmId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Migration status tracking
interface MigrationStatus {
  farmId: number
  totalMockTasks: number
  migratedTasks: number
  failedTasks: number
  conflictedTasks: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  errors: Array<{ taskId: string; error: string }>
}

// In-memory migration tracking (in production, store in database)
const migrationStatuses = new Map<number, MigrationStatus>()

export const taskMigrationRouter = router({
  /**
   * Start gradual migration from mock to database
   * Analyzes mock data and prepares for migration
   */
  startMigration: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        mockTasks: z.array(MockTaskSchema),
        strategy: z.enum(['overwrite', 'merge', 'skip_existing']).default('merge'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb()
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' })

        // Verify farm ownership
        if (ctx.user.farmId !== input.farmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to migrate this farm' })
        }

        // Initialize migration status
        const migrationId = `migration_${input.farmId}_${Date.now()}`
        const status: MigrationStatus = {
          farmId: input.farmId,
          totalMockTasks: input.mockTasks.length,
          migratedTasks: 0,
          failedTasks: 0,
          conflictedTasks: 0,
          status: 'in_progress',
          startedAt: new Date(),
          errors: [],
        }

        migrationStatuses.set(input.farmId, status)

        // Validate all mock tasks first
        const validationResults = await validateMockTasks(input.mockTasks, input.farmId, db)

        return {
          migrationId,
          status: 'validation_complete',
          validTasks: validationResults.valid.length,
          invalidTasks: validationResults.invalid.length,
          conflicts: validationResults.conflicts.length,
          strategy: input.strategy,
          recommendations: generateRecommendations(validationResults),
        }
      } catch (error) {
        console.error('Error starting migration:', error)
        throw TRPCError.from(error as any)
      }
    }),

  /**
   * Execute migration with specified strategy
   */
  executeMigration: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        mockTasks: z.array(MockTaskSchema),
        strategy: z.enum(['overwrite', 'merge', 'skip_existing']),
        conflictResolution: z.record(z.string(), z.enum(['use_mock', 'use_db', 'merge'])).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb()
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' })

        if (ctx.user.farmId !== input.farmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to migrate this farm' })
        }

        const status = migrationStatuses.get(input.farmId) || {
          farmId: input.farmId,
          totalMockTasks: input.mockTasks.length,
          migratedTasks: 0,
          failedTasks: 0,
          conflictedTasks: 0,
          status: 'in_progress' as const,
          startedAt: new Date(),
          errors: [],
        }

        let migratedCount = 0
        let failedCount = 0
        let conflictCount = 0

        // Process each mock task
        for (const mockTask of input.mockTasks) {
          try {
            // Check for existing task
            const existing = await db
              .select()
              .from(taskAssignments)
              .where(eq(taskAssignments.taskId, mockTask.id))
              .limit(1)

            if (existing.length > 0) {
              // Handle conflict based on strategy
              const resolution = input.conflictResolution?.[mockTask.id] || 'merge'

              if (input.strategy === 'skip_existing' && resolution !== 'use_mock') {
                conflictCount++
                continue
              }

              if (resolution === 'use_mock' || input.strategy === 'overwrite') {
                // Update with mock data
                await db
                  .update(taskAssignments)
                  .set({
                    title: mockTask.title,
                    description: mockTask.description,
                    taskType: mockTask.taskType,
                    priority: mockTask.priority,
                    status: mockTask.status,
                    dueDate: mockTask.dueDate,
                    estimatedHours: mockTask.estimatedHours,
                    actualHours: mockTask.actualHours,
                    workerId: mockTask.workerId,
                    updatedAt: new Date(),
                  })
                  .where(eq(taskAssignments.taskId, mockTask.id))

                migratedCount++
              } else if (resolution === 'merge') {
                // Merge: keep database values, only update empty fields
                const updates: any = { updatedAt: new Date() }

                if (!existing[0].title && mockTask.title) updates.title = mockTask.title
                if (!existing[0].description && mockTask.description) updates.description = mockTask.description
                if (!existing[0].taskType && mockTask.taskType) updates.taskType = mockTask.taskType
                if (!existing[0].estimatedHours && mockTask.estimatedHours) updates.estimatedHours = mockTask.estimatedHours

                if (Object.keys(updates).length > 1) {
                  await db
                    .update(taskAssignments)
                    .set(updates)
                    .where(eq(taskAssignments.taskId, mockTask.id))
                }

                migratedCount++
              }
            } else {
              // Insert new task
              await db.insert(taskAssignments).values({
                taskId: mockTask.id,
                farmId: input.farmId,
                workerId: mockTask.workerId,
                title: mockTask.title,
                description: mockTask.description,
                taskType: mockTask.taskType,
                priority: mockTask.priority,
                status: mockTask.status,
                dueDate: mockTask.dueDate,
                estimatedHours: mockTask.estimatedHours,
                actualHours: mockTask.actualHours,
                createdAt: mockTask.createdAt,
                updatedAt: new Date(),
              })

              migratedCount++
            }
          } catch (error) {
            failedCount++
            status.errors.push({
              taskId: mockTask.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }

        // Update migration status
        status.migratedTasks = migratedCount
        status.failedTasks = failedCount
        status.conflictedTasks = conflictCount
        status.status = failedCount === 0 ? 'completed' : 'failed'
        status.completedAt = new Date()

        migrationStatuses.set(input.farmId, status)

        return {
          success: failedCount === 0,
          migratedTasks: migratedCount,
          failedTasks: failedCount,
          conflictedTasks: conflictCount,
          totalProcessed: migratedCount + failedCount + conflictCount,
          errors: status.errors,
          duration: status.completedAt.getTime() - status.startedAt.getTime(),
        }
      } catch (error) {
        console.error('Error executing migration:', error)
        throw TRPCError.from(error as any)
      }
    }),

  /**
   * Get migration status
   */
  getMigrationStatus: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.farmId !== input.farmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const status = migrationStatuses.get(input.farmId)

      if (!status) {
        return {
          status: 'not_started',
          farmId: input.farmId,
        }
      }

      return {
        farmId: status.farmId,
        totalMockTasks: status.totalMockTasks,
        migratedTasks: status.migratedTasks,
        failedTasks: status.failedTasks,
        conflictedTasks: status.conflictedTasks,
        status: status.status,
        progress: Math.round((status.migratedTasks / status.totalMockTasks) * 100),
        startedAt: status.startedAt,
        completedAt: status.completedAt,
        errors: status.errors,
      }
    }),

  /**
   * Validate mock tasks before migration
   */
  validateMockTasks: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        mockTasks: z.array(MockTaskSchema),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb()
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' })

        if (ctx.user.farmId !== input.farmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
        }

        const results = await validateMockTasks(input.mockTasks, input.farmId, db)

        return {
          totalTasks: input.mockTasks.length,
          validTasks: results.valid.length,
          invalidTasks: results.invalid.length,
          conflicts: results.conflicts.length,
          validationDetails: {
            valid: results.valid.map((t) => ({ id: t.id, title: t.title })),
            invalid: results.invalid.map((r) => ({ id: r.taskId, errors: r.errors })),
            conflicts: results.conflicts.map((c) => ({
              mockTaskId: c.mockTaskId,
              dbTaskId: c.dbTaskId,
              differences: c.differences,
            })),
          },
        }
      } catch (error) {
        console.error('Error validating tasks:', error)
        throw TRPCError.from(error as any)
      }
    }),

  /**
   * Rollback migration
   */
  rollbackMigration: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        taskIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb()
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' })

        if (ctx.user.farmId !== input.farmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
        }

        // Delete migrated tasks (rollback)
        let deletedCount = 0
        for (const taskId of input.taskIds) {
          const result = await db
            .delete(taskAssignments)
            .where(
              and(
                eq(taskAssignments.taskId, taskId),
                eq(taskAssignments.farmId, input.farmId)
              )
            )

          if (result) deletedCount++
        }

        return {
          success: true,
          deletedTasks: deletedCount,
          message: `Rolled back ${deletedCount} migrated tasks`,
        }
      } catch (error) {
        console.error('Error rolling back migration:', error)
        throw TRPCError.from(error as any)
      }
    }),

  /**
   * Get migration recommendations
   */
  getMigrationRecommendations: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        mockTasks: z.array(MockTaskSchema),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.farmId !== input.farmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const db = await getDb()
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' })

      const results = await validateMockTasks(input.mockTasks, input.farmId, db)
      return generateRecommendations(results)
    }),
})

/**
 * Helper function to validate mock tasks
 */
async function validateMockTasks(mockTasks: any[], farmId: number, db: any) {
  const valid: any[] = []
  const invalid: Array<{ taskId: string; errors: string[] }> = []
  const conflicts: Array<{
    mockTaskId: string
    dbTaskId: string
    differences: Record<string, { mock: any; db: any }>
  }> = []

  for (const mockTask of mockTasks) {
    const errors: string[] = []

    // Validate required fields
    if (!mockTask.title || mockTask.title.trim() === '') errors.push('Missing title')
    if (!mockTask.taskType || mockTask.taskType.trim() === '') errors.push('Missing taskType')
    if (!mockTask.dueDate) errors.push('Missing dueDate')
    if (!mockTask.estimatedHours || mockTask.estimatedHours <= 0) errors.push('Invalid estimatedHours')

    if (errors.length > 0) {
      invalid.push({ taskId: mockTask.id, errors })
      continue
    }

    // Check for conflicts with existing database tasks
    const existing = await db
      .select()
      .from(taskAssignments)
      .where(eq(taskAssignments.taskId, mockTask.id))
      .limit(1)

    if (existing.length > 0) {
      const differences: Record<string, { mock: any; db: any }> = {}

      if (existing[0].title !== mockTask.title) {
        differences.title = { mock: mockTask.title, db: existing[0].title }
      }
      if (existing[0].priority !== mockTask.priority) {
        differences.priority = { mock: mockTask.priority, db: existing[0].priority }
      }
      if (existing[0].status !== mockTask.status) {
        differences.status = { mock: mockTask.status, db: existing[0].status }
      }

      conflicts.push({
        mockTaskId: mockTask.id,
        dbTaskId: existing[0].id,
        differences,
      })
    }

    valid.push(mockTask)
  }

  return { valid, invalid, conflicts }
}

/**
 * Generate migration recommendations based on validation results
 */
function generateRecommendations(results: any) {
  const recommendations: string[] = []

  if (results.invalid.length > 0) {
    recommendations.push(
      `Fix ${results.invalid.length} invalid tasks before migration (missing required fields)`
    )
  }

  if (results.conflicts.length > 0) {
    recommendations.push(
      `Review ${results.conflicts.length} conflicting tasks - decide whether to overwrite, merge, or skip`
    )
  }

  if (results.valid.length === 0) {
    recommendations.push('No valid tasks to migrate')
  } else {
    recommendations.push(
      `Ready to migrate ${results.valid.length} tasks. Use "merge" strategy to preserve existing data.`
    )
  }

  return recommendations
}
