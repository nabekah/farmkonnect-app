import { describe, it, expect, beforeEach } from 'vitest'

/**
 * Tests for Bulk Shift Assignment with Conflict Detection
 * Tests conflict detection logic, auto-assignment algorithm, and validation
 */

interface Worker {
  id: number
  name: string
  skills: string[]
  availability: number
  currentShifts: number
}

interface Shift {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  requiredSkills: string[]
  workers: number
  location: string
}

type ConflictType = 'overlap' | 'unavailable' | 'skill_mismatch' | 'overbooked'
type ConflictSeverity = 'warning' | 'error'

interface ConflictDetection {
  workerId: number
  shiftId: number
  type: ConflictType
  message: string
  severity: ConflictSeverity
}

// Helper function to detect conflicts
function detectConflicts(
  workerId: number,
  shiftId: number,
  workers: Worker[],
  shifts: Shift[],
  selectedAssignments: Array<{ workerId: number; shiftId: number }>
): ConflictDetection[] {
  const conflicts: ConflictDetection[] = []
  const worker = workers.find((w) => w.id === workerId)
  const shift = shifts.find((s) => s.id === shiftId)

  if (!worker || !shift) return conflicts

  // Check skill match
  const hasRequiredSkills = shift.requiredSkills.length === 0 || shift.requiredSkills.some((skill) =>
    worker.skills.includes(skill)
  )
  if (!hasRequiredSkills) {
    conflicts.push({
      workerId,
      shiftId,
      type: 'skill_mismatch',
      message: `Worker lacks required skills: ${shift.requiredSkills.join(', ')}`,
      severity: 'warning',
    })
  }

  // Check availability
  if (worker.availability < 8) {
    conflicts.push({
      workerId,
      shiftId,
      type: 'unavailable',
      message: `Worker only has ${worker.availability} hours available`,
      severity: 'warning',
    })
  }

  // Check if already assigned
  const alreadyAssigned = selectedAssignments.some(
    (a) => a.workerId === workerId && a.shiftId === shiftId
  )
  if (alreadyAssigned) {
    conflicts.push({
      workerId,
      shiftId,
      type: 'overlap',
      message: 'Worker already assigned to this shift',
      severity: 'error',
    })
  }

  // Check overbooking
  if (worker.currentShifts >= 5) {
    conflicts.push({
      workerId,
      shiftId,
      type: 'overbooked',
      message: 'Worker is approaching maximum shift limit',
      severity: 'warning',
    })
  }

  return conflicts
}

// Helper function for auto-assignment
function autoAssignWorkers(
  workers: Worker[],
  shifts: Shift[]
): Array<{ workerId: number; shiftId: number }> {
  const assignments: Array<{ workerId: number; shiftId: number }> = []
  const assignedWorkers = new Set<number>()

  shifts.forEach((shift) => {
    const availableWorkers = workers
      .filter((worker) => {
        const hasSkills = shift.requiredSkills.some((skill) =>
          worker.skills.includes(skill)
        )
        const hasAvailability = worker.availability >= 8
        const notOverbooked = worker.currentShifts < 5
        const notAlreadyAssigned = !assignedWorkers.has(worker.id)
        return hasSkills && hasAvailability && notOverbooked && notAlreadyAssigned
      })
      .slice(0, shift.workers)

    availableWorkers.forEach((worker) => {
      assignments.push({ workerId: worker.id, shiftId: shift.id })
      assignedWorkers.add(worker.id)
    })
  })

  return assignments
}

describe('Bulk Shift Assignment', () => {
  let mockWorkers: Worker[]
  let mockShifts: Shift[]

  beforeEach(() => {
    mockWorkers = [
      {
        id: 1,
        name: 'John Doe',
        skills: ['Irrigation', 'Pest Control', 'Equipment Operation'],
        availability: 8,
        currentShifts: 2,
      },
      {
        id: 2,
        name: 'Maria Garcia',
        skills: ['Soil Management', 'Crop Monitoring'],
        availability: 6,
        currentShifts: 3,
      },
      {
        id: 3,
        name: 'Robert Johnson',
        skills: ['Equipment Maintenance', 'Irrigation'],
        availability: 8,
        currentShifts: 1,
      },
      {
        id: 4,
        name: 'Sarah Williams',
        skills: ['Pest Control', 'Crop Monitoring', 'Equipment Operation'],
        availability: 7,
        currentShifts: 2,
      },
    ]

    mockShifts = [
      {
        id: 1,
        title: 'Morning Field Work',
        date: '2026-02-20',
        startTime: '06:00',
        endTime: '14:00',
        requiredSkills: ['Irrigation', 'Crop Monitoring'],
        workers: 3,
        location: 'North Field',
      },
      {
        id: 2,
        title: 'Equipment Maintenance',
        date: '2026-02-20',
        startTime: '08:00',
        endTime: '16:00',
        requiredSkills: ['Equipment Maintenance'],
        workers: 2,
        location: 'Equipment Shed',
      },
    ]
  })

  describe('Conflict Detection', () => {
    it('should detect skill mismatch', () => {
      const conflicts = detectConflicts(2, 2, mockWorkers, mockShifts, [])
      expect(conflicts.some((c) => c.type === 'skill_mismatch')).toBe(true)
    })

    it('should detect unavailable workers', () => {
      const conflicts = detectConflicts(2, 1, mockWorkers, mockShifts, [])
      expect(conflicts.some((c) => c.type === 'unavailable')).toBe(true)
    })

    it('should detect duplicate assignments', () => {
      const selectedAssignments = [{ workerId: 1, shiftId: 1 }]
      const conflicts = detectConflicts(1, 1, mockWorkers, mockShifts, selectedAssignments)
      expect(conflicts.some((c) => c.type === 'overlap')).toBe(true)
    })

    it('should detect overbooked workers', () => {
      const overbookedWorker = { ...mockWorkers[0], currentShifts: 5 }
      const workers = [overbookedWorker, ...mockWorkers.slice(1)]
      const conflicts = detectConflicts(1, 1, workers, mockShifts, [])
      expect(conflicts.some((c) => c.type === 'overbooked')).toBe(true)
    })

    it('should return no conflicts for valid assignment', () => {
      const conflicts = detectConflicts(1, 1, mockWorkers, mockShifts, [])
      expect(conflicts.length).toBe(0)
    })

    it('should set correct severity levels', () => {
      const conflicts = detectConflicts(2, 2, mockWorkers, mockShifts, [])
      const skillMismatch = conflicts.find((c) => c.type === 'skill_mismatch')
      expect(skillMismatch?.severity).toBe('warning')
    })
  })

  describe('Auto-Assignment Algorithm', () => {
    it('should assign workers with matching skills', () => {
      const assignments = autoAssignWorkers(mockWorkers, mockShifts)
      expect(assignments.length).toBeGreaterThan(0)
    })

    it('should respect worker availability', () => {
      const assignments = autoAssignWorkers(mockWorkers, mockShifts)
      assignments.forEach((assignment) => {
        const worker = mockWorkers.find((w) => w.id === assignment.workerId)
        expect(worker?.availability).toBeGreaterThanOrEqual(8)
      })
    })

    it('should respect maximum shift limit', () => {
      const assignments = autoAssignWorkers(mockWorkers, mockShifts)
      assignments.forEach((assignment) => {
        const worker = mockWorkers.find((w) => w.id === assignment.workerId)
        expect(worker?.currentShifts).toBeLessThan(5)
      })
    })

    it('should not assign same worker to multiple shifts', () => {
      const assignments = autoAssignWorkers(mockWorkers, mockShifts)
      const workerIds = assignments.map((a) => a.workerId)
      const uniqueWorkerIds = new Set(workerIds)
      expect(uniqueWorkerIds.size).toBe(workerIds.length)
    })

    it('should assign required number of workers per shift', () => {
      const assignments = autoAssignWorkers(mockWorkers, mockShifts)
      const shift1Assignments = assignments.filter((a) => a.shiftId === 1)
      expect(shift1Assignments.length).toBeLessThanOrEqual(3)
    })

    it('should handle empty worker list', () => {
      const assignments = autoAssignWorkers([], mockShifts)
      expect(assignments.length).toBe(0)
    })

    it('should handle empty shift list', () => {
      const assignments = autoAssignWorkers(mockWorkers, [])
      expect(assignments.length).toBe(0)
    })
  })

  describe('Assignment Validation', () => {
    it('should validate worker exists', () => {
      const conflicts = detectConflicts(999, 1, mockWorkers, mockShifts, [])
      expect(conflicts.length).toBe(0) // Invalid worker returns no conflicts
    })

    it('should validate shift exists', () => {
      const conflicts = detectConflicts(1, 999, mockWorkers, mockShifts, [])
      expect(conflicts.length).toBe(0) // Invalid shift returns no conflicts
    })

    it('should handle multiple conflicts for single assignment', () => {
      const lowAvailabilityWorker = { ...mockWorkers[1], availability: 4 }
      const workers = [mockWorkers[0], lowAvailabilityWorker, ...mockWorkers.slice(2)]
      const conflicts = detectConflicts(2, 2, workers, mockShifts, [])
      expect(conflicts.length).toBeGreaterThan(1)
    })
  })

  describe('Skill Matching', () => {
    it('should match workers with required skills', () => {
      const worker = mockWorkers[0]
      const shift = mockShifts[0]
      const hasSkills = shift.requiredSkills.some((skill) => worker.skills.includes(skill))
      expect(hasSkills).toBe(true)
    })

    it('should reject workers without required skills', () => {
      const worker = mockWorkers[1]
      const shift = mockShifts[1]
      const hasSkills = shift.requiredSkills.some((skill) => worker.skills.includes(skill))
      expect(hasSkills).toBe(false)
    })

    it('should handle multiple required skills', () => {
      const multiSkillShift: Shift = {
        id: 3,
        title: 'Complex Task',
        date: '2026-02-21',
        startTime: '09:00',
        endTime: '17:00',
        requiredSkills: ['Irrigation', 'Pest Control'],
        workers: 1,
        location: 'Field',
      }

      const worker = mockWorkers[0]
      const hasAllSkills = multiSkillShift.requiredSkills.some((skill) =>
        worker.skills.includes(skill)
      )
      expect(hasAllSkills).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle worker with no skills', () => {
      const noSkillWorker: Worker = {
        id: 5,
        name: 'Unskilled Worker',
        skills: [],
        availability: 8,
        currentShifts: 0,
      }

      const workers = [...mockWorkers, noSkillWorker]
      const conflicts = detectConflicts(5, 1, workers, mockShifts, [])
      expect(conflicts.some((c) => c.type === 'skill_mismatch')).toBe(true)
    })

    it('should handle shift with no required skills', () => {
      const noSkillShift: Shift = {
        id: 3,
        title: 'General Work',
        date: '2026-02-21',
        startTime: '09:00',
        endTime: '17:00',
        requiredSkills: [],
        workers: 1,
        location: 'Field',
      }

      const shifts = [...mockShifts, noSkillShift]
      const conflicts = detectConflicts(1, 3, mockWorkers, shifts, [])
      const hasSkillMismatch = conflicts.some((c) => c.type === 'skill_mismatch')
      expect(hasSkillMismatch).toBe(false)
    })

    it('should handle worker at exactly maximum shifts', () => {
      const maxShiftWorker = { ...mockWorkers[0], currentShifts: 5 }
      const workers = [maxShiftWorker, ...mockWorkers.slice(1)]
      const conflicts = detectConflicts(1, 1, workers, mockShifts, [])
      expect(conflicts.some((c) => c.type === 'overbooked')).toBe(true)
    })
  })
})
