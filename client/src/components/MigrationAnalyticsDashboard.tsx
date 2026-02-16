import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react'

interface MigrationResult {
  jobId: string
  jobName: string
  startTime: Date
  endTime: Date
  duration: number
  status: 'success' | 'failed' | 'partial'
  migratedTasks: number
  failedTasks: number
  totalTasks: number
}

interface JobStatistics {
  jobId: string
  jobName: string
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  successRate: number
  lastRun?: Date
  nextRun?: Date
  totalMigratedTasks: number
  totalFailedTasks: number
  averageDuration: number
}

interface MigrationAnalyticsDashboardProps {
  farmId: number
  migrationHistory: MigrationResult[]
  jobStatistics: JobStatistics[]
}

export const MigrationAnalyticsDashboard: React.FC<MigrationAnalyticsDashboardProps> = ({
  farmId,
  migrationHistory,
  jobStatistics,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [chartData, setChartData] = useState<any[]>([])

  // Prepare chart data
  useEffect(() => {
    const data = migrationHistory
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .map((result) => ({
        date: new Date(result.startTime).toLocaleDateString(),
        migrated: result.migratedTasks,
        failed: result.failedTasks,
        duration: Math.round(result.duration / 1000), // Convert to seconds
        successRate: result.totalTasks > 0 ? Math.round(((result.migratedTasks / result.totalTasks) * 100)) : 0,
      }))

    setChartData(data)
  }, [migrationHistory])

  // Calculate overall statistics
  const totalMigrations = migrationHistory.length
  const successfulMigrations = migrationHistory.filter((r) => r.status === 'success').length
  const failedMigrations = migrationHistory.filter((r) => r.status === 'failed').length
  const totalTasksMigrated = migrationHistory.reduce((sum, r) => sum + r.migratedTasks, 0)
  const totalTasksFailed = migrationHistory.reduce((sum, r) => sum + r.failedTasks, 0)
  const averageDuration = migrationHistory.length > 0 ? Math.round(migrationHistory.reduce((sum, r) => sum + r.duration, 0) / migrationHistory.length / 1000) : 0
  const overallSuccessRate = totalMigrations > 0 ? Math.round((successfulMigrations / totalMigrations) * 100) : 0

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Successful', value: successfulMigrations, fill: '#10b981' },
    { name: 'Failed', value: failedMigrations, fill: '#ef4444' },
    { name: 'Partial', value: totalMigrations - successfulMigrations - failedMigrations, fill: '#f59e0b' },
  ].filter((item) => item.value > 0)

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Analytics Dashboard</CardTitle>
          <CardDescription>Track migration performance and history</CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Migrations</p>
                <p className="text-2xl font-bold">{totalMigrations}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{overallSuccessRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Migrated</p>
                <p className="text-2xl font-bold">{totalTasksMigrated}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{averageDuration}s</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Migration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Migration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="migrated" stroke="#10b981" name="Migrated Tasks" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed Tasks" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Migration Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Success Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Duration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Migration Duration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#f59e0b" name="Duration (seconds)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Job Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Job Name</th>
                  <th className="text-left py-2 px-4 font-medium">Total Runs</th>
                  <th className="text-left py-2 px-4 font-medium">Successful</th>
                  <th className="text-left py-2 px-4 font-medium">Failed</th>
                  <th className="text-left py-2 px-4 font-medium">Success Rate</th>
                  <th className="text-left py-2 px-4 font-medium">Last Run</th>
                  <th className="text-left py-2 px-4 font-medium">Next Run</th>
                </tr>
              </thead>
              <tbody>
                {jobStatistics.map((stat) => (
                  <tr key={stat.jobId} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{stat.jobName}</td>
                    <td className="py-2 px-4">{stat.totalRuns}</td>
                    <td className="py-2 px-4">
                      <Badge variant="default" className="bg-green-500">
                        {stat.successfulRuns}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant="destructive">{stat.failedRuns}</Badge>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${stat.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stat.successRate}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {stat.lastRun ? new Date(stat.lastRun).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {stat.nextRun ? new Date(stat.nextRun).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Migrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Migrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {migrationHistory.slice(0, 10).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{result.jobName}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(result.startTime).toLocaleString()} - {result.totalTasks} tasks
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {result.migratedTasks} migrated, {result.failedTasks} failed
                    </div>
                    <div className="text-xs text-gray-600">{Math.round(result.duration / 1000)}s</div>
                  </div>
                  <Badge
                    variant={result.status === 'success' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}
                    className={
                      result.status === 'success'
                        ? 'bg-green-500'
                        : result.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
