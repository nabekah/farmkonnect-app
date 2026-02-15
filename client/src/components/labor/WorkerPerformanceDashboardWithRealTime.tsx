import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, TrendingDown, Minus, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useWebSocketUpdates, useWorkerAvailabilityUpdates } from '@/hooks/useWebSocketUpdates'
import { useAuth } from '@/hooks/useAuth'

/**
 * Worker Performance Dashboard with Real-Time WebSocket Updates
 * Displays live worker performance metrics with auto-refresh
 */

interface WorkerPerformance {
  id: number
  name: string
  rating: number
  tasksCompleted: number
  productivity: number
  attendance: number
  hoursWorked: number
  skills: string[]
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  lastUpdated: Date
}

interface TeamMetrics {
  averageRating: number
  totalTasksCompleted: number
  averageProductivity: number
  topPerformer: string
  lastUpdated: Date
}

export const WorkerPerformanceDashboardWithRealTime: React.FC = () => {
  const { user } = useAuth()
  const farmId = user?.farmId || 1

  const [workers, setWorkers] = useState<WorkerPerformance[]>([])
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics>({
    averageRating: 0,
    totalTasksCompleted: 0,
    averageProductivity: 0,
    topPerformer: '',
    lastUpdated: new Date(),
  })
  const [selectedWorker, setSelectedWorker] = useState<WorkerPerformance | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // WebSocket hooks for real-time updates
  const { isConnected: wsConnected, subscribe, unsubscribe } = useWebSocketUpdates({
    userId: user?.id || 1,
    farmId,
    channels: [`farm:${farmId}:workers`, `farm:${farmId}:performance`],
    onMessage: handleWebSocketMessage,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
  })

  const { workers: cachedWorkers } = useWorkerAvailabilityUpdates(
    farmId,
    user?.id || 1,
    handleWorkerUpdate
  )

  /**
   * Handle WebSocket messages
   */
  function handleWebSocketMessage(message: any) {
    if (message.type === 'worker_availability_update') {
      console.log('[Dashboard] Worker availability update:', message.payload)
      updateWorkerPerformance(message.payload)
    } else if (message.type === 'performance_update') {
      console.log('[Dashboard] Performance update:', message.payload)
      updateTeamMetrics(message.payload)
    }
  }

  /**
   * Handle WebSocket connection
   */
  function handleWebSocketConnect() {
    console.log('[Dashboard] WebSocket connected, subscribing to channels')
    setIsRefreshing(false)
  }

  /**
   * Handle WebSocket disconnection
   */
  function handleWebSocketDisconnect() {
    console.log('[Dashboard] WebSocket disconnected')
  }

  /**
   * Handle worker update from WebSocket
   */
  function handleWorkerUpdate(data: any) {
    console.log('[Dashboard] Worker update:', data)
    updateWorkerPerformance(data)
  }

  /**
   * Update worker performance data
   */
  const updateWorkerPerformance = useCallback((data: any) => {
    setWorkers((prev) => {
      const updated = [...prev]
      const index = updated.findIndex((w) => w.id === data.workerId)

      if (index >= 0) {
        updated[index] = {
          ...updated[index],
          ...data,
          lastUpdated: new Date(),
        }
      } else {
        updated.push({
          id: data.workerId,
          name: data.workerName,
          rating: data.rating || 0,
          tasksCompleted: data.tasksCompleted || 0,
          productivity: data.productivity || 0,
          attendance: data.attendance || 0,
          hoursWorked: data.hoursWorked || 0,
          skills: data.skills || [],
          trend: data.trend || 'stable',
          trendPercent: data.trendPercent || 0,
          lastUpdated: new Date(),
        })
      }

      return updated
    })

    // Update selected worker if it's the one being updated
    setSelectedWorker((prev) => {
      if (prev && prev.id === data.workerId) {
        return {
          ...prev,
          ...data,
          lastUpdated: new Date(),
        }
      }
      return prev
    })
  }, [])

  /**
   * Update team metrics
   */
  const updateTeamMetrics = useCallback((data: any) => {
    setTeamMetrics((prev) => ({
      ...prev,
      ...data,
      lastUpdated: new Date(),
    }))
  }, [])

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate refresh delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('[Dashboard] Manual refresh completed')
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Load initial data
   */
  useEffect(() => {
    loadInitialData()
  }, [timeRange])

  const loadInitialData = async () => {
    try {
      // Mock data - in production would fetch from API
      const mockWorkers: WorkerPerformance[] = [
        {
          id: 1,
          name: 'John Doe',
          rating: 4.8,
          tasksCompleted: 45,
          productivity: 92,
          attendance: 98,
          hoursWorked: 160,
          skills: ['Planting', 'Harvesting', 'Equipment Operation'],
          trend: 'up',
          trendPercent: 5,
          lastUpdated: new Date(),
        },
        {
          id: 2,
          name: 'Maria Garcia',
          rating: 4.5,
          tasksCompleted: 38,
          productivity: 85,
          attendance: 95,
          hoursWorked: 152,
          skills: ['Soil Preparation', 'Irrigation', 'Pest Management'],
          trend: 'stable',
          trendPercent: 0,
          lastUpdated: new Date(),
        },
        {
          id: 3,
          name: 'James Wilson',
          rating: 3.9,
          tasksCompleted: 28,
          productivity: 72,
          attendance: 88,
          hoursWorked: 140,
          skills: ['Equipment Maintenance', 'Logistics'],
          trend: 'down',
          trendPercent: -3,
          lastUpdated: new Date(),
        },
      ]

      setWorkers(mockWorkers)

      // Calculate team metrics
      const avgRating = mockWorkers.reduce((sum, w) => sum + w.rating, 0) / mockWorkers.length
      const totalTasks = mockWorkers.reduce((sum, w) => sum + w.tasksCompleted, 0)
      const avgProductivity = mockWorkers.reduce((sum, w) => sum + w.productivity, 0) / mockWorkers.length
      const topPerformer = mockWorkers.reduce((max, w) => (w.rating > max.rating ? w : max))

      setTeamMetrics({
        averageRating: Math.round(avgRating * 10) / 10,
        totalTasksCompleted: totalTasks,
        averageProductivity: Math.round(avgProductivity),
        topPerformer: topPerformer.name,
        lastUpdated: new Date(),
      })

      setSelectedWorker(mockWorkers[0])
    } catch (error) {
      console.error('[Dashboard] Error loading initial data:', error)
    }
  }

  /**
   * Get trend icon
   */
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  /**
   * Get rating color
   */
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800'
    if (rating >= 4.0) return 'bg-blue-100 text-blue-800'
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Worker Performance Dashboard</h1>
          <p className="text-muted-foreground mt-2">Real-time worker metrics and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted">
            {wsConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-medium">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.totalTasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">this {timeRange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.averageProductivity}%</div>
            <p className="text-xs text-muted-foreground mt-1">team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{teamMetrics.topPerformer}</div>
            <p className="text-xs text-muted-foreground mt-1">highest rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            onClick={() => setTimeRange(range)}
            className="capitalize"
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Worker Performance</h2>
          <div className="space-y-3">
            {workers.map((worker) => (
              <Card
                key={worker.id}
                className={`cursor-pointer transition ${
                  selectedWorker?.id === worker.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedWorker(worker)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{worker.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {worker.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {worker.skills.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{worker.skills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getRatingColor(worker.rating)}>
                        {worker.rating.toFixed(1)} ⭐
                      </Badge>
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        {getTrendIcon(worker.trend)}
                        <span className={`text-sm font-medium ${
                          worker.trend === 'up' ? 'text-green-600' :
                          worker.trend === 'down' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {worker.trendPercent > 0 ? '+' : ''}{worker.trendPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Bars */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Productivity</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${worker.productivity}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium mt-1">{worker.productivity}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${worker.attendance}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium mt-1">{worker.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tasks</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min((worker.tasksCompleted / 50) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium mt-1">{worker.tasksCompleted}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Updated: {worker.lastUpdated.toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Worker Details */}
        {selectedWorker && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Worker Details</h2>
            <Card>
              <CardHeader>
                <CardTitle>{selectedWorker.name}</CardTitle>
                <CardDescription>Performance Overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-2xl font-bold">{selectedWorker.rating.toFixed(1)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Tasks</p>
                    <p className="text-2xl font-bold">{selectedWorker.tasksCompleted}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Productivity</p>
                    <p className="text-2xl font-bold">{selectedWorker.productivity}%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-2xl font-bold">{selectedWorker.attendance}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorker.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900">
                    <strong>Last Updated:</strong> {selectedWorker.lastUpdated.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Needs Attention */}
      {workers.some((w) => w.rating < 3.5) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workers
                .filter((w) => w.rating < 3.5)
                .map((worker) => (
                  <p key={worker.id} className="text-sm text-red-800">
                    <strong>{worker.name}</strong> has a low rating ({worker.rating.toFixed(1)}) and may need support
                  </p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
