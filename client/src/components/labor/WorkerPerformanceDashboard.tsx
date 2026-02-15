import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
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
  skills: string[]
  recentPerformance: {
    date: string
    rating: number
    tasksCompleted: number
    hoursWorked: number
  }[]
}

interface PerformanceMetrics {
  totalWorkers: number
  averageTeamRating: number
  totalTasksCompleted: number
  averageProductivity: number
  topPerformer: string
  needsAttention: string[]
}

export default function WorkerPerformanceDashboard() {
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  // Mock data - in production, this would come from tRPC queries
  const mockWorkers: WorkerPerformanceData[] = [
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
      skills: ['Irrigation', 'Pest Control', 'Equipment Operation'],
      recentPerformance: [
        { date: '2026-02-10', rating: 5, tasksCompleted: 8, hoursWorked: 8 },
        { date: '2026-02-09', rating: 4.8, tasksCompleted: 7, hoursWorked: 8 },
        { date: '2026-02-08', rating: 4.7, tasksCompleted: 8, hoursWorked: 8 },
        { date: '2026-02-07', rating: 4.9, tasksCompleted: 9, hoursWorked: 8 },
      ],
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
      skills: ['Soil Management', 'Crop Monitoring'],
      recentPerformance: [
        { date: '2026-02-10', rating: 4.5, tasksCompleted: 7, hoursWorked: 8 },
        { date: '2026-02-09', rating: 4.4, tasksCompleted: 6, hoursWorked: 8 },
        { date: '2026-02-08', rating: 4.6, tasksCompleted: 7, hoursWorked: 8 },
        { date: '2026-02-07', rating: 4.5, tasksCompleted: 7, hoursWorked: 8 },
      ],
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
      skills: ['Equipment Maintenance'],
      recentPerformance: [
        { date: '2026-02-10', rating: 3.5, tasksCompleted: 5, hoursWorked: 8 },
        { date: '2026-02-09', rating: 3.8, tasksCompleted: 6, hoursWorked: 8 },
        { date: '2026-02-08', rating: 4.0, tasksCompleted: 6, hoursWorked: 8 },
        { date: '2026-02-07', rating: 4.2, tasksCompleted: 7, hoursWorked: 8 },
      ],
    },
  ]

  const metrics: PerformanceMetrics = useMemo(() => {
    const avgRating =
      mockWorkers.reduce((sum, w) => sum + w.averageRating, 0) / mockWorkers.length
    const totalTasks = mockWorkers.reduce((sum, w) => sum + w.tasksCompleted, 0)
    const avgProductivity =
      mockWorkers.reduce((sum, w) => sum + w.productivity, 0) / mockWorkers.length
    const topWorker = mockWorkers.reduce((prev, current) =>
      prev.averageRating > current.averageRating ? prev : current
    )
    const needsAttention = mockWorkers
      .filter((w) => w.averageRating < 4.0 || w.attendanceRate < 90)
      .map((w) => w.workerName)

    return {
      totalWorkers: mockWorkers.length,
      averageTeamRating: avgRating,
      totalTasksCompleted: totalTasks,
      averageProductivity: avgProductivity,
      topPerformer: topWorker.workerName,
      needsAttention,
    }
  }, [])

  const selectedWorkerData = selectedWorker
    ? mockWorkers.find((w) => w.workerId === selectedWorker)
    : null

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4 text-gray-600">→</div>
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Worker Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze worker productivity and metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getRatingColor(metrics.averageTeamRating)}`}>
                {metrics.averageTeamRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">/5.0</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{metrics.totalWorkers} workers tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{metrics.totalTasksCompleted}</span>
              <span className="text-sm text-gray-500">tasks</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {(metrics.totalTasksCompleted / metrics.totalWorkers).toFixed(1)} per worker
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">
                {metrics.averageProductivity.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Team efficiency rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-semibold text-gray-900">{metrics.topPerformer}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Highest average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workers</CardTitle>
              <CardDescription>Select a worker to view details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockWorkers.map((worker) => (
                <button
                  key={worker.workerId}
                  onClick={() => setSelectedWorker(worker.workerId)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedWorker === worker.workerId
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{worker.workerName}</p>
                      <p className={`text-sm font-bold ${getRatingColor(worker.averageRating)}`}>
                        {worker.averageRating.toFixed(1)} ★
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(worker.trend)}
                      <span className="text-xs font-semibold text-gray-600">
                        {worker.trendValue > 0 ? '+' : ''}
                        {worker.trendValue}%
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Needs Attention */}
          {metrics.needsAttention.length > 0 && (
            <Card className="mt-4 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-orange-900">
                  <AlertCircle className="w-4 h-4" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.needsAttention.map((name) => (
                    <li key={name} className="text-sm text-orange-800">
                      • {name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Worker Details */}
        {selectedWorkerData && (
          <div className="lg:col-span-2 space-y-4">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedWorkerData.workerName}</CardTitle>
                <CardDescription>Performance Overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Average Rating</p>
                    <p className={`text-2xl font-bold ${getRatingColor(selectedWorkerData.averageRating)}`}>
                      {selectedWorkerData.averageRating.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Productivity</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedWorkerData.productivity.toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tasks Completed</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedWorkerData.tasksCompleted}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Attendance Rate</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedWorkerData.attendanceRate.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Hours Worked</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-lg font-bold text-gray-900">
                      {selectedWorkerData.hoursWorked} hours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Skills & Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkerData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Performance (Last 4 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedWorkerData.recentPerformance.map((perf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{perf.date}</p>
                        <p className="text-xs text-gray-600">
                          {perf.tasksCompleted} tasks • {perf.hoursWorked}h
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${getRatingColor(perf.rating)}`}>
                        {perf.rating.toFixed(1)} ★
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
