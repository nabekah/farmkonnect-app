import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'

/**
 * Offline Conflict Resolution Modal
 * Handles conflicts when offline changes conflict with server data on sync
 */

interface ConflictItem {
  id: string
  resource: string
  field: string
  localValue: any
  serverValue: any
  timestamp: number
  lastModified: Date
}

interface ConflictResolutionModalProps {
  isOpen: boolean
  conflicts: ConflictItem[]
  onResolve: (resolutions: Record<string, 'local' | 'server'>) => Promise<void>
  onCancel: () => void
}

export const OfflineConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  conflicts,
  onResolve,
  onCancel,
}) => {
  const [resolutions, setResolutions] = useState<Record<string, 'local' | 'server'>>({})
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)

  if (!isOpen || conflicts.length === 0) {
    return null
  }

  /**
   * Handle resolution choice
   */
  const handleChooseResolution = (conflictId: string, choice: 'local' | 'server') => {
    setResolutions((prev) => ({
      ...prev,
      [conflictId]: choice,
    }))
  }

  /**
   * Handle resolve all conflicts
   */
  const handleResolveAll = async () => {
    try {
      setIsResolving(true)
      setResolveError(null)

      // Validate all conflicts have been resolved
      const unresolved = conflicts.filter((c) => !resolutions[c.id])
      if (unresolved.length > 0) {
        setResolveError(`Please resolve all ${unresolved.length} conflict(s)`)
        return
      }

      // Call resolve callback
      await onResolve(resolutions)
    } catch (error) {
      console.error('[ConflictResolution] Error resolving conflicts:', error)
      setResolveError(error instanceof Error ? error.message : 'Failed to resolve conflicts')
    } finally {
      setIsResolving(false)
    }
  }

  /**
   * Format value for display
   */
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Empty'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }

  /**
   * Get resource icon
   */
  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'task':
        return '📋'
      case 'shift':
        return '📅'
      case 'worker':
        return '👤'
      case 'notification':
        return '🔔'
      default:
        return '📄'
    }
  }

  const resolvedCount = Object.keys(resolutions).length
  const totalCount = conflicts.length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Resolve Sync Conflicts
              </CardTitle>
              <CardDescription className="mt-2">
                {totalCount} conflict{totalCount !== 1 ? 's' : ''} found between local and server data.
                Choose which version to keep for each item.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {resolvedCount} of {totalCount} resolved
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(resolvedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Conflicts */}
          <div className="space-y-4">
            {conflicts.map((conflict) => {
              const isResolved = !!resolutions[conflict.id]
              const choice = resolutions[conflict.id]

              return (
                <Card key={conflict.id} className={`border ${isResolved ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                  <CardContent className="pt-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getResourceIcon(conflict.resource)}</span>
                          <span className="font-semibold capitalize">
                            {conflict.resource} - {conflict.field}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            ID: {conflict.id}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last modified: {conflict.lastModified.toLocaleString()}
                        </p>
                      </div>
                      {isResolved && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-xs font-medium">Resolved</span>
                        </div>
                      )}
                    </div>

                    {/* Conflict Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Local Version */}
                      <button
                        onClick={() => handleChooseResolution(conflict.id, 'local')}
                        className={`p-3 border-2 rounded-lg text-left transition ${
                          choice === 'local'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold text-sm">Keep Local</span>
                        </div>
                        <div className="text-xs bg-white p-2 rounded border border-gray-200 font-mono overflow-auto max-h-20">
                          {formatValue(conflict.localValue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Your offline changes</p>
                      </button>

                      {/* Server Version */}
                      <button
                        onClick={() => handleChooseResolution(conflict.id, 'server')}
                        className={`p-3 border-2 rounded-lg text-left transition ${
                          choice === 'server'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="w-4 h-4" />
                          <span className="font-semibold text-sm">Keep Server</span>
                        </div>
                        <div className="text-xs bg-white p-2 rounded border border-gray-200 font-mono overflow-auto max-h-20">
                          {formatValue(conflict.serverValue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Latest server data</p>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Error Message */}
          {resolveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-800">{resolveError}</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Tip:</strong> Choose "Keep Local" to preserve your offline changes, or "Keep Server" to use the latest data from the server.
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3 justify-end bg-muted/30">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isResolving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolveAll}
            disabled={isResolving || resolvedCount < totalCount}
            className="gap-2"
          >
            {isResolving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Resolve All Conflicts
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

/**
 * Hook for managing conflict resolution
 */
export const useConflictResolution = () => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const showConflicts = (newConflicts: ConflictItem[]) => {
    setConflicts(newConflicts)
    setIsOpen(true)
  }

  const resolveConflicts = async (resolutions: Record<string, 'local' | 'server'>) => {
    try {
      console.log('[ConflictResolution] Resolving conflicts:', resolutions)

      // In production, would sync with server
      // await trpc.sync.resolveConflicts.useMutation(resolutions)

      setIsOpen(false)
      setConflicts([])
    } catch (error) {
      console.error('[ConflictResolution] Error resolving:', error)
      throw error
    }
  }

  const cancelResolution = () => {
    setIsOpen(false)
    setConflicts([])
  }

  return {
    conflicts,
    isOpen,
    showConflicts,
    resolveConflicts,
    cancelResolution,
  }
}
