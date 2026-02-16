import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Play, RotateCcw } from 'lucide-react'

interface MigrationTask {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  error?: string
}

interface MigrationConflict {
  mockTaskId: string
  dbTaskId: string
  differences: Record<string, { mock: any; db: any }>
}

interface MigrationUIProps {
  farmId: number
  mockTasks: any[]
  onMigrationStart?: (strategy: 'overwrite' | 'merge' | 'skip_existing') => void
  onMigrationCancel?: () => void
}

export const TaskMigrationUI: React.FC<MigrationUIProps> = ({
  farmId,
  mockTasks,
  onMigrationStart,
  onMigrationCancel,
}) => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'validating' | 'migrating' | 'completed' | 'failed'>(
    'idle'
  )
  const [selectedStrategy, setSelectedStrategy] = useState<'overwrite' | 'merge' | 'skip_existing'>('merge')
  const [progress, setProgress] = useState(0)
  const [validTasks, setValidTasks] = useState<MigrationTask[]>([])
  const [invalidTasks, setInvalidTasks] = useState<Array<{ id: string; errors: string[] }>>([])
  const [conflicts, setConflicts] = useState<MigrationConflict[]>([])
  const [migratedCount, setMigratedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'use_mock' | 'use_db' | 'merge'>>({})

  // Validate tasks on component mount
  useEffect(() => {
    validateTasks()
  }, [mockTasks])

  const validateTasks = async () => {
    setMigrationStatus('validating')
    setProgress(0)

    // Simulate validation
    const valid: MigrationTask[] = []
    const invalid: Array<{ id: string; errors: string[] }> = []

    for (const task of mockTasks) {
      const errors: string[] = []

      if (!task.title || task.title.trim() === '') errors.push('Missing title')
      if (!task.taskType || task.taskType.trim() === '') errors.push('Missing taskType')
      if (!task.dueDate) errors.push('Missing dueDate')
      if (!task.estimatedHours || task.estimatedHours <= 0) errors.push('Invalid estimatedHours')

      if (errors.length > 0) {
        invalid.push({ id: task.id, errors })
      } else {
        valid.push({ id: task.id, title: task.title, status: 'pending' })
      }

      setProgress(Math.round(((valid.length + invalid.length) / mockTasks.length) * 100))
    }

    setValidTasks(valid)
    setInvalidTasks(invalid)
    setMigrationStatus('idle')
    setProgress(100)
  }

  const handleMigrationStart = async () => {
    setMigrationStatus('migrating')
    setProgress(0)
    setMigratedCount(0)
    setFailedCount(0)

    // Simulate migration
    let migrated = 0
    let failed = 0

    for (let i = 0; i < validTasks.length; i++) {
      const task = validTasks[i]

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Randomly simulate some failures for demo
      if (Math.random() > 0.95) {
        failed++
        setFailedCount(failed)
      } else {
        migrated++
        setMigratedCount(migrated)
      }

      setProgress(Math.round(((migrated + failed) / validTasks.length) * 100))
    }

    setMigrationStatus(failed === 0 ? 'completed' : 'failed')

    if (onMigrationStart) {
      onMigrationStart(selectedStrategy)
    }
  }

  const handleRollback = () => {
    setMigrationStatus('idle')
    setProgress(0)
    setMigratedCount(0)
    setFailedCount(0)
    setValidTasks(validTasks.map((t) => ({ ...t, status: 'pending' })))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'migrating':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'overwrite':
        return 'Replace all database values with mock data'
      case 'merge':
        return 'Update only empty fields, preserve existing data'
      case 'skip_existing':
        return 'Skip tasks that already exist in database'
      default:
        return ''
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Migration Manager</CardTitle>
              <CardDescription>Gradual migration from mock data to database storage</CardDescription>
            </div>
            {getStatusIcon(migrationStatus)}
          </div>
        </CardHeader>
      </Card>

      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-900">Valid Tasks</div>
              <div className="text-2xl font-bold text-green-600">{validTasks.length}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm font-medium text-red-900">Invalid Tasks</div>
              <div className="text-2xl font-bold text-red-600">{invalidTasks.length}</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm font-medium text-yellow-900">Conflicts</div>
              <div className="text-2xl font-bold text-yellow-600">{conflicts.length}</div>
            </div>
          </div>

          {invalidTasks.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="font-medium text-red-900 mb-2">Invalid Tasks Found</div>
              <div className="space-y-2">
                {invalidTasks.map((task) => (
                  <div key={task.id} className="text-sm text-red-800">
                    <span className="font-mono">{task.id}</span>: {task.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      {migrationStatus === 'idle' && validTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Migration Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['overwrite', 'merge', 'skip_existing'] as const).map((strategy) => (
              <label key={strategy} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="strategy"
                  value={strategy}
                  checked={selectedStrategy === strategy}
                  onChange={(e) => setSelectedStrategy(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium capitalize">{strategy.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600">{getStrategyDescription(strategy)}</div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Migration Progress */}
      {(migrationStatus === 'migrating' || migrationStatus === 'completed' || migrationStatus === 'failed') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Migration Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-900">Migrated</div>
                <div className="text-2xl font-bold text-blue-600">{migratedCount}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-900">Failed</div>
                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-900">Total</div>
                <div className="text-2xl font-bold text-gray-600">{migratedCount + failedCount}</div>
              </div>
            </div>

            {migrationStatus === 'completed' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Migration completed successfully!</span>
                </div>
              </div>
            )}

            {migrationStatus === 'failed' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Migration completed with {failedCount} failures</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {migrationStatus === 'idle' && validTasks.length > 0 && (
          <>
            <Button onClick={handleMigrationStart} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Migration
            </Button>
            <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </>
        )}

        {(migrationStatus === 'completed' || migrationStatus === 'failed') && (
          <>
            <Button onClick={handleRollback} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Rollback
            </Button>
            <Button onClick={handleMigrationStart} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Retry Migration
            </Button>
          </>
        )}

        {migrationStatus === 'migrating' && (
          <Button onClick={onMigrationCancel} variant="destructive">
            Cancel Migration
          </Button>
        )}
      </div>

      {/* Detailed Task List */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {validTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{task.id}</span>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>{task.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
