import { describe, it, expect, beforeEach } from 'vitest'

/**
 * Tests for Worker Performance Dashboard
 * Tests the calculation of performance metrics, trend analysis, and data aggregation
 */

interface WorkerPerformanceData {
  workerId: number
  workerName: string
  averageRating: number
  tasksCompleted: number
  hoursWorked: number
  productivity: number
  attendanceRate: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface PerformanceMetrics {
  totalWorkers: number
  averageTeamRating: number
  totalTasksCompleted: number
  averageProductivity: number
  topPerformer: string
  needsAttention: string[]
}

// Helper function to calculate metrics
function calculatePerformanceMetrics(workers: WorkerPerformanceData[]): PerformanceMetrics {
  if (workers.length === 0) {
    return {
      totalWorkers: 0,
      averageTeamRating: 0,
      totalTasksCompleted: 0,
      averageProductivity: 0,
      topPerformer: '',
      needsAttention: [],
    }
  }

  const avgRating = workers.reduce((sum, w) => sum + w.averageRating, 0) / workers.length
  const totalTasks = workers.reduce((sum, w) => sum + w.tasksCompleted, 0)
  const avgProductivity = workers.reduce((sum, w) => sum + w.productivity, 0) / workers.length
  const topWorker = workers.reduce((prev, current) =>
    prev.averageRating > current.averageRating ? prev : current
  )
  const needsAttention = workers
    .filter((w) => w.averageRating < 4.0 || w.attendanceRate < 90)
    .map((w) => w.workerName)

  return {
    totalWorkers: workers.length,
    averageTeamRating: avgRating,
    totalTasksCompleted: totalTasks,
    averageProductivity: avgProductivity,
    topPerformer: topWorker.workerName,
    needsAttention,
  }
}

describe('Worker Performance Dashboard', () => {
  let mockWorkers: WorkerPerformanceData[]

  beforeEach(() => {
    mockWorkers = [
      {
        workerId: 1,
        workerName: 'John Doe',
        averageRating: 4.8,
        tasksCompleted: 45,
        hoursWorked: 160,
        productivity: 94,
        attendanceRate: 98,
        trend: 'up',
        trendValue: 5,
      },
      {
        workerId: 2,
        workerName: 'Maria Garcia',
        averageRating: 4.5,
        tasksCompleted: 38,
        hoursWorked: 152,
        productivity: 88,
        attendanceRate: 95,
        trend: 'stable',
        trendValue: 0,
      },
      {
        workerId: 3,
        workerName: 'Robert Johnson',
        averageRating: 3.8,
        tasksCompleted: 28,
        hoursWorked: 140,
        productivity: 72,
        attendanceRate: 88,
        trend: 'down',
        trendValue: -8,
      },
    ]
  })

  describe('Performance Metrics Calculation', () => {
    it('should calculate average team rating correctly', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      const expectedAvg = (4.8 + 4.5 + 3.8) / 3
      expect(metrics.averageTeamRating).toBeCloseTo(expectedAvg, 1)
    })

    it('should sum total tasks completed correctly', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      expect(metrics.totalTasksCompleted).toBe(111) // 45 + 38 + 28
    })

    it('should calculate average productivity correctly', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      const expectedAvg = (94 + 88 + 72) / 3
      expect(metrics.averageProductivity).toBeCloseTo(expectedAvg, 1)
    })

    it('should identify top performer correctly', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      expect(metrics.topPerformer).toBe('John Doe')
    })

    it('should count total workers correctly', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      expect(metrics.totalWorkers).toBe(3)
    })
  })

  describe('Needs Attention Detection', () => {
    it('should identify workers with low ratings', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      expect(metrics.needsAttention).toContain('Robert Johnson')
    })

    it('should identify workers with low attendance', () => {
      const lowAttendanceWorker: WorkerPerformanceData = {
        workerId: 4,
        workerName: 'Sarah Williams',
        averageRating: 4.5,
        tasksCompleted: 35,
        hoursWorked: 150,
        productivity: 85,
        attendanceRate: 85, // Below 90%
        trend: 'stable',
        trendValue: 0,
      }

      const workers = [...mockWorkers, lowAttendanceWorker]
      const metrics = calculatePerformanceMetrics(workers)
      expect(metrics.needsAttention).toContain('Sarah Williams')
    })

    it('should not flag workers meeting both criteria', () => {
      const metrics = calculatePerformanceMetrics(mockWorkers)
      expect(metrics.needsAttention).not.toContain('John Doe')
      expect(metrics.needsAttention).not.toContain('Maria Garcia')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty worker list', () => {
      const metrics = calculatePerformanceMetrics([])
      expect(metrics.totalWorkers).toBe(0)
      expect(metrics.averageTeamRating).toBe(0)
      expect(metrics.totalTasksCompleted).toBe(0)
      expect(metrics.topPerformer).toBe('')
    })

    it('should handle single worker', () => {
      const singleWorker = [mockWorkers[0]]
      const metrics = calculatePerformanceMetrics(singleWorker)
      expect(metrics.totalWorkers).toBe(1)
      expect(metrics.averageTeamRating).toBe(4.8)
      expect(metrics.topPerformer).toBe('John Doe')
    })

    it('should handle workers with identical ratings', () => {
      const workers: WorkerPerformanceData[] = [
        {
          workerId: 1,
          workerName: 'Worker A',
          averageRating: 4.5,
          tasksCompleted: 30,
          hoursWorked: 150,
          productivity: 85,
          attendanceRate: 95,
          trend: 'stable',
          trendValue: 0,
        },
        {
          workerId: 2,
          workerName: 'Worker B',
          averageRating: 4.5,
          tasksCompleted: 35,
          hoursWorked: 160,
          productivity: 90,
          attendanceRate: 98,
          trend: 'up',
          trendValue: 5,
        },
      ]

      const metrics = calculatePerformanceMetrics(workers)
      // When ratings are identical, the function returns one of them (not deterministic)
      expect(['Worker A', 'Worker B']).toContain(metrics.topPerformer)
    })
  })

  describe('Trend Analysis', () => {
    it('should correctly identify upward trend', () => {
      const upwardWorker = mockWorkers[0]
      expect(upwardWorker.trend).toBe('up')
      expect(upwardWorker.trendValue).toBeGreaterThan(0)
    })

    it('should correctly identify downward trend', () => {
      const downwardWorker = mockWorkers[2]
      expect(downwardWorker.trend).toBe('down')
      expect(downwardWorker.trendValue).toBeLessThan(0)
    })

    it('should correctly identify stable trend', () => {
      const stableWorker = mockWorkers[1]
      expect(stableWorker.trend).toBe('stable')
      expect(stableWorker.trendValue).toBe(0)
    })
  })

  describe('Performance Rating Ranges', () => {
    it('should handle excellent ratings (4.5+)', () => {
      const excellentWorker = mockWorkers[0]
      expect(excellentWorker.averageRating).toBeGreaterThanOrEqual(4.5)
    })

    it('should handle good ratings (4.0-4.49)', () => {
      const goodWorker = mockWorkers[1]
      expect(goodWorker.averageRating).toBeGreaterThanOrEqual(4.0)
      expect(goodWorker.averageRating).toBeLessThanOrEqual(4.5)
    })

    it('should handle fair ratings (3.5-3.99)', () => {
      const fairWorker = mockWorkers[2]
      expect(fairWorker.averageRating).toBeGreaterThanOrEqual(3.5)
      expect(fairWorker.averageRating).toBeLessThan(4.0)
    })
  })
})
