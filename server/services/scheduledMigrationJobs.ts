/**
 * Scheduled Migration Jobs Service
 * Handles automatic background migrations of mock data to database
 */

import { getDb } from '../db'
import { taskAssignments } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'

export interface ScheduledMigrationJob {
  id: string
  farmId: number
  name: string
  description: string
  schedule: 'daily' | 'weekly' | 'monthly' | 'once'
  scheduledTime: Date
  strategy: 'overwrite' | 'merge' | 'skip_existing'
  status: 'pending' | 'running' | 'completed' | 'failed'
  lastRun?: Date
  nextRun?: Date
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  createdAt: Date
  updatedAt: Date
}

export interface MigrationJobResult {
  jobId: string
  farmId: number
  startTime: Date
  endTime: Date
  duration: number
  status: 'success' | 'failed' | 'partial'
  migratedTasks: number
  failedTasks: number
  totalTasks: number
  errors: Array<{ taskId: string; error: string }>
}

// In-memory job storage (in production, store in database)
const migrationJobs = new Map<string, ScheduledMigrationJob>()
const jobResults = new Map<string, MigrationJobResult[]>()
const activeJobs = new Set<string>()

/**
 * Create a new scheduled migration job
 */
export async function createScheduledMigrationJob(
  farmId: number,
  name: string,
  description: string,
  schedule: 'daily' | 'weekly' | 'monthly' | 'once',
  scheduledTime: Date,
  strategy: 'overwrite' | 'merge' | 'skip_existing'
): Promise<ScheduledMigrationJob> {
  const jobId = `job_${farmId}_${Date.now()}`

  const job: ScheduledMigrationJob = {
    id: jobId,
    farmId,
    name,
    description,
    schedule,
    scheduledTime,
    strategy,
    status: 'pending',
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  migrationJobs.set(jobId, job)
  jobResults.set(jobId, [])

  // Schedule the job
  scheduleJobExecution(job)

  return job
}

/**
 * Get all scheduled jobs for a farm
 */
export function getScheduledJobs(farmId: number): ScheduledMigrationJob[] {
  return Array.from(migrationJobs.values()).filter((job) => job.farmId === farmId)
}

/**
 * Get job by ID
 */
export function getScheduledJob(jobId: string): ScheduledMigrationJob | undefined {
  return migrationJobs.get(jobId)
}

/**
 * Update job schedule
 */
export function updateJobSchedule(
  jobId: string,
  schedule: 'daily' | 'weekly' | 'monthly' | 'once',
  scheduledTime: Date
): ScheduledMigrationJob | undefined {
  const job = migrationJobs.get(jobId)
  if (!job) return undefined

  job.schedule = schedule
  job.scheduledTime = scheduledTime
  job.updatedAt = new Date()

  migrationJobs.set(jobId, job)

  // Reschedule the job
  scheduleJobExecution(job)

  return job
}

/**
 * Delete scheduled job
 */
export function deleteScheduledJob(jobId: string): boolean {
  return migrationJobs.delete(jobId)
}

/**
 * Get job execution results
 */
export function getJobResults(jobId: string): MigrationJobResult[] {
  return jobResults.get(jobId) || []
}

/**
 * Get job statistics
 */
export function getJobStatistics(jobId: string) {
  const job = migrationJobs.get(jobId)
  if (!job) return null

  const results = jobResults.get(jobId) || []

  return {
    jobId,
    totalRuns: job.totalRuns,
    successfulRuns: job.successfulRuns,
    failedRuns: job.failedRuns,
    successRate: job.totalRuns > 0 ? Math.round((job.successfulRuns / job.totalRuns) * 100) : 0,
    lastRun: job.lastRun,
    nextRun: job.nextRun,
    totalMigratedTasks: results.reduce((sum, r) => sum + r.migratedTasks, 0),
    totalFailedTasks: results.reduce((sum, r) => sum + r.failedTasks, 0),
    averageDuration: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length) : 0,
  }
}

/**
 * Execute migration job
 */
export async function executeMigrationJob(
  jobId: string,
  mockTasks: any[]
): Promise<MigrationJobResult> {
  const job = migrationJobs.get(jobId)
  if (!job) throw new Error(`Job ${jobId} not found`)

  if (activeJobs.has(jobId)) {
    throw new Error(`Job ${jobId} is already running`)
  }

  activeJobs.add(jobId)
  const startTime = new Date()

  try {
    const db = await getDb()
    if (!db) throw new Error('Database unavailable')

    let migratedCount = 0
    let failedCount = 0
    const errors: Array<{ taskId: string; error: string }> = []

    // Process each mock task
    for (const mockTask of mockTasks) {
      try {
        // Check for existing task
        const existing = await db
          .select()
          .from(taskAssignments)
          .where(eq(taskAssignments.taskId, mockTask.id))
          .limit(1)

        if (existing.length > 0) {
          // Handle conflict based on strategy
          if (job.strategy === 'skip_existing') {
            continue
          }

          if (job.strategy === 'overwrite') {
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
          } else if (job.strategy === 'merge') {
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
            farmId: job.farmId,
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
        errors.push({
          taskId: mockTask.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    const status = failedCount === 0 ? 'success' : failedCount === mockTasks.length ? 'failed' : 'partial'

    const result: MigrationJobResult = {
      jobId,
      farmId: job.farmId,
      startTime,
      endTime,
      duration,
      status,
      migratedTasks: migratedCount,
      failedTasks: failedCount,
      totalTasks: mockTasks.length,
      errors,
    }

    // Update job statistics
    job.lastRun = endTime
    job.totalRuns++
    if (status === 'success') {
      job.successfulRuns++
    } else {
      job.failedRuns++
    }
    job.status = status === 'success' ? 'completed' : 'failed'
    job.updatedAt = new Date()

    // Calculate next run
    if (job.schedule !== 'once') {
      job.nextRun = calculateNextRun(job.schedule, job.scheduledTime)
    }

    migrationJobs.set(jobId, job)

    // Store result
    const results = jobResults.get(jobId) || []
    results.push(result)
    jobResults.set(jobId, results)

    return result
  } finally {
    activeJobs.delete(jobId)
  }
}

/**
 * Schedule job execution
 */
function scheduleJobExecution(job: ScheduledMigrationJob) {
  const now = new Date()
  let nextRun = job.scheduledTime

  // Calculate next run based on schedule
  if (job.schedule === 'daily') {
    nextRun = new Date(now)
    nextRun.setDate(nextRun.getDate() + 1)
    nextRun.setHours(job.scheduledTime.getHours(), job.scheduledTime.getMinutes(), 0)
  } else if (job.schedule === 'weekly') {
    nextRun = new Date(now)
    nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay() + job.scheduledTime.getDay()) % 7)
    nextRun.setHours(job.scheduledTime.getHours(), job.scheduledTime.getMinutes(), 0)
  } else if (job.schedule === 'monthly') {
    nextRun = new Date(now)
    nextRun.setMonth(nextRun.getMonth() + 1)
    nextRun.setDate(job.scheduledTime.getDate())
    nextRun.setHours(job.scheduledTime.getHours(), job.scheduledTime.getMinutes(), 0)
  }

  job.nextRun = nextRun

  // In production, use a job queue like Bull or Agenda
  // For now, just set the next run time
}

/**
 * Calculate next run time based on schedule
 */
function calculateNextRun(schedule: string, baseTime: Date): Date {
  const now = new Date()
  let nextRun = new Date(baseTime)

  if (schedule === 'daily') {
    nextRun.setDate(nextRun.getDate() + 1)
  } else if (schedule === 'weekly') {
    nextRun.setDate(nextRun.getDate() + 7)
  } else if (schedule === 'monthly') {
    nextRun.setMonth(nextRun.getMonth() + 1)
  }

  return nextRun
}

/**
 * Get all pending jobs that should run now
 */
export function getPendingJobs(): ScheduledMigrationJob[] {
  const now = new Date()

  return Array.from(migrationJobs.values()).filter((job) => {
    if (job.status === 'running') return false
    if (job.schedule === 'once' && job.status === 'completed') return false

    const nextRun = job.nextRun || job.scheduledTime
    return nextRun <= now
  })
}

/**
 * Get job execution history
 */
export function getJobHistory(farmId: number, limit: number = 50) {
  const jobs = getScheduledJobs(farmId)
  const allResults: Array<MigrationJobResult & { jobName: string }> = []

  for (const job of jobs) {
    const results = jobResults.get(job.id) || []
    for (const result of results) {
      allResults.push({
        ...result,
        jobName: job.name,
      })
    }
  }

  // Sort by endTime descending and limit
  return allResults.sort((a, b) => b.endTime.getTime() - a.endTime.getTime()).slice(0, limit)
}

/**
 * Clear old job results (keep last 100 per job)
 */
export function cleanupOldResults(jobId: string, keepCount: number = 100) {
  const results = jobResults.get(jobId) || []
  if (results.length > keepCount) {
    const newResults = results.slice(-keepCount)
    jobResults.set(jobId, newResults)
  }
}
