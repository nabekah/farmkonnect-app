import React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface WorkerPerformanceWidgetProps {
  farmId: string;
}

export const WorkerPerformanceWidget: React.FC<WorkerPerformanceWidgetProps> = ({ farmId }) => {
  const { data: summary } = trpc.workerPerformance.getFarmPerformanceSummary.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const { data: workers = [] } = trpc.workerPerformance.getFarmWorkerMetrics.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  // Prepare data for charts
  const performanceData = workers.map((worker: any) => ({
    name: worker.userId.split("@")[0],
    activityScore: worker.activityScore || 0,
    attendanceRate: worker.attendanceRate || 0,
    qualityScore: worker.qualityScore || 0,
    tasksCompleted: worker.tasksCompleted || 0
  }));

  const scoreDistribution = [
    { range: "90-100", count: performanceData.filter((w: any) => w.activityScore >= 90).length },
    { range: "80-89", count: performanceData.filter((w: any) => w.activityScore >= 80 && w.activityScore < 90).length },
    { range: "70-79", count: performanceData.filter((w: any) => w.activityScore >= 70 && w.activityScore < 80).length },
    { range: "<70", count: performanceData.filter((w: any) => w.activityScore < 70).length }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{summary?.totalWorkers || 0}</span>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Activity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{(summary?.averageActivityScore || 0).toFixed(1)}</span>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{summary?.totalTasksCompleted || 0}</span>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{(summary?.totalHoursWorked || 0).toFixed(0)}</span>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Score Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Worker Activity Scores</CardTitle>
            <CardDescription>Individual worker performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activityScore" fill="#3b82f6" name="Activity Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No worker data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Workers by performance bracket</CardDescription>
          </CardHeader>
          <CardContent>
            {scoreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Number of Workers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance & Quality */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance & Quality Metrics</CardTitle>
            <CardDescription>Worker attendance and quality scores</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendanceRate" stroke="#f59e0b" name="Attendance Rate %" />
                  <Line type="monotone" dataKey="qualityScore" stroke="#8b5cf6" name="Quality Score" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No worker data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Worker List */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Performance Details</CardTitle>
          <CardDescription>Detailed metrics for each worker</CardDescription>
        </CardHeader>
        <CardContent>
          {workers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Worker</th>
                    <th className="text-right py-2 px-4">Activity Score</th>
                    <th className="text-right py-2 px-4">Tasks Completed</th>
                    <th className="text-right py-2 px-4">Attendance</th>
                    <th className="text-right py-2 px-4">Quality</th>
                    <th className="text-right py-2 px-4">Hours Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{worker.userId.split("@")[0]}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          worker.activityScore >= 80 ? "bg-green-100 text-green-800" :
                          worker.activityScore >= 60 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {worker.activityScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">{worker.tasksCompleted}</td>
                      <td className="text-right py-3 px-4">{worker.attendanceRate.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4">{worker.qualityScore.toFixed(1)}</td>
                      <td className="text-right py-3 px-4">{worker.totalHoursWorked.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No worker performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
