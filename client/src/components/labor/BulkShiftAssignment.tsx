import React, { useState, useMemo } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Zap,
  ChevronDown,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Worker {
  id: number
  name: string
  skills: string[]
  availability: number // hours available
  currentShifts: number
}

interface Shift {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  requiredSkills: string[]
  workers: number // number of workers needed
  location: string
}

interface ConflictDetection {
  workerId: number
  shiftId: number
  type: 'overlap' | 'unavailable' | 'skill_mismatch' | 'overbooked'
  message: string
  severity: 'warning' | 'error'
}

interface AssignmentPreview {
  workerId: number
  shiftId: number
  status: 'success' | 'warning' | 'error'
  conflicts: ConflictDetection[]
}

export default function BulkShiftAssignment() {
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([])
  const [selectedShifts, setSelectedShifts] = useState<number[]>([])
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'auto'>('manual')
  const [showPreview, setShowPreview] = useState(false)
  const [expandedWorker, setExpandedWorker] = useState<number | null>(null)

  // Mock data - in production, this would come from tRPC queries
  const mockWorkers: Worker[] = [
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

  const mockShifts: Shift[] = [
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
    {
      id: 3,
      title: 'Pest Control Inspection',
      date: '2026-02-21',
      startTime: '07:00',
      endTime: '15:00',
      requiredSkills: ['Pest Control'],
      workers: 2,
      location: 'All Fields',
    },
  ]

  // Detect conflicts for an assignment
  const detectConflicts = (workerId: number, shiftId: number): ConflictDetection[] => {
    const conflicts: ConflictDetection[] = []
    const worker = mockWorkers.find((w) => w.id === workerId)
    const shift = mockShifts.find((s) => s.id === shiftId)

    if (!worker || !shift) return conflicts

    // Check skill match
    const hasRequiredSkills = shift.requiredSkills.some((skill) =>
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

    // Check if already assigned to shift
    if (selectedShifts.includes(shiftId) && selectedWorkers.includes(workerId)) {
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

  // Generate assignment preview
  const assignmentPreview = useMemo<AssignmentPreview[]>(() => {
    const previews: AssignmentPreview[] = []

    selectedWorkers.forEach((workerId) => {
      selectedShifts.forEach((shiftId) => {
        const conflicts = detectConflicts(workerId, shiftId)
        const hasErrors = conflicts.some((c) => c.severity === 'error')

        previews.push({
          workerId,
          shiftId,
          status: hasErrors ? 'error' : conflicts.length > 0 ? 'warning' : 'success',
          conflicts,
        })
      })
    })

    return previews
  }, [selectedWorkers, selectedShifts])

  // Auto-assign workers to shifts based on skills and availability
  const handleAutoAssign = () => {
    const autoAssignments: number[] = []
    const autoShifts: number[] = []

    mockShifts.forEach((shift) => {
      const availableWorkers = mockWorkers
        .filter((worker) => {
          const hasSkills = shift.requiredSkills.some((skill) =>
            worker.skills.includes(skill)
          )
          const hasAvailability = worker.availability >= 8
          const notOverbooked = worker.currentShifts < 5
          return hasSkills && hasAvailability && notOverbooked
        })
        .slice(0, shift.workers)

      availableWorkers.forEach((worker) => {
        if (!autoAssignments.includes(worker.id)) {
          autoAssignments.push(worker.id)
        }
        if (!autoShifts.includes(shift.id)) {
          autoShifts.push(shift.id)
        }
      })
    })

    setSelectedWorkers(autoAssignments)
    setSelectedShifts(autoShifts)
    setShowPreview(true)
  }

  // Handle worker selection
  const toggleWorker = (workerId: number) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    )
  }

  // Handle shift selection
  const toggleShift = (shiftId: number) => {
    setSelectedShifts((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    )
  }

  const successCount = assignmentPreview.filter((a) => a.status === 'success').length
  const warningCount = assignmentPreview.filter((a) => a.status === 'warning').length
  const errorCount = assignmentPreview.filter((a) => a.status === 'error').length

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Shift Assignment</h1>
          <p className="text-gray-600 mt-1">Assign multiple workers to shifts with conflict detection</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={assignmentMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setAssignmentMode('manual')}
          >
            Manual
          </Button>
          <Button
            variant={assignmentMode === 'auto' ? 'default' : 'outline'}
            onClick={() => setAssignmentMode('auto')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-Assign
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Workers Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Workers</CardTitle>
              <CardDescription>
                {selectedWorkers.length} of {mockWorkers.length} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={() =>
                  setSelectedWorkers(
                    selectedWorkers.length === mockWorkers.length
                      ? []
                      : mockWorkers.map((w) => w.id)
                  )
                }
              >
                {selectedWorkers.length === mockWorkers.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>

              <div className="space-y-2">
                {mockWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleWorker(worker.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{worker.name}</p>
                      <p className="text-xs text-gray-600">
                        {worker.skills.join(', ')} • {worker.availability}h available
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {worker.currentShifts} shifts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shifts Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Shifts</CardTitle>
              <CardDescription>
                {selectedShifts.length} of {mockShifts.length} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={() =>
                  setSelectedShifts(
                    selectedShifts.length === mockShifts.length
                      ? []
                      : mockShifts.map((s) => s.id)
                  )
                }
              >
                {selectedShifts.length === mockShifts.length ? 'Deselect All' : 'Select All'}
              </Button>

              <div className="space-y-2">
                {mockShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleShift(shift.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedShifts.includes(shift.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{shift.title}</p>
                      <p className="text-xs text-gray-600">
                        {shift.date} • {shift.startTime}-{shift.endTime} • {shift.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Required: {shift.requiredSkills.join(', ')}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {shift.workers} needed
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-4">
          {/* Assignment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm text-gray-700">Selected Workers</span>
                  <span className="text-lg font-bold text-blue-600">{selectedWorkers.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Selected Shifts</span>
                  <span className="text-lg font-bold text-green-600">{selectedShifts.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-sm text-gray-700">Total Assignments</span>
                  <span className="text-lg font-bold text-purple-600">
                    {selectedWorkers.length * selectedShifts.length}
                  </span>
                </div>
              </div>

              {assignmentMode === 'auto' && (
                <Button onClick={handleAutoAssign} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Run Auto-Assignment
                </Button>
              )}

              {(selectedWorkers.length > 0 || selectedShifts.length > 0) && (
                <Button
                  onClick={() => setShowPreview(true)}
                  className="w-full"
                  variant="default"
                >
                  Preview Assignments
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Conflict Summary */}
          {showPreview && assignmentPreview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conflict Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-xs text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Success
                  </span>
                  <span className="font-bold text-green-600">{successCount}</span>
                </div>
                {warningCount > 0 && (
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-xs text-gray-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Warnings
                    </span>
                    <span className="font-bold text-yellow-600">{warningCount}</span>
                  </div>
                )}
                {errorCount > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-xs text-gray-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Errors
                    </span>
                    <span className="font-bold text-red-600">{errorCount}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && assignmentPreview.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Assignment Preview</CardTitle>
              <CardDescription>Review all assignments before confirming</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assignmentPreview.map((assignment, idx) => {
                const worker = mockWorkers.find((w) => w.id === assignment.workerId)
                const shift = mockShifts.find((s) => s.id === assignment.shiftId)

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-2 ${
                      assignment.status === 'success'
                        ? 'border-green-200 bg-green-50'
                        : assignment.status === 'warning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {worker?.name} → {shift?.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {shift?.date} • {shift?.startTime}-{shift?.endTime}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          assignment.status === 'success'
                            ? 'bg-green-200 text-green-800'
                            : assignment.status === 'warning'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>

                    {assignment.conflicts.length > 0 && (
                      <div className="space-y-1 mt-2 pt-2 border-t border-gray-300">
                        {assignment.conflicts.map((conflict, cidx) => (
                          <p key={cidx} className="text-xs text-gray-700">
                            ⚠️ {conflict.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" disabled={errorCount > 0}>
                Confirm Assignments
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
