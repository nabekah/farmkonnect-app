import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageDuration: number;
  estimatedVsActual: number;
}

interface WorkerPerformance {
  workerId: string;
  workerName: string;
  tasksCompleted: number;
  completionRate: number;
  averageDuration: number;
  efficiency: number;
}

interface TaskTypeMetrics {
  taskType: string;
  completed: number;
  total: number;
  completionRate: number;
  averageDuration: number;
}

export const TaskPerformanceDashboard = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock data
  const taskMetrics: TaskMetrics = {
    totalTasks: 156,
    completedTasks: 142,
    completionRate: 91,
    averageDuration: 4.2,
    estimatedVsActual: 1.05,
  };

  const workerPerformance: WorkerPerformance[] = [
    { workerId: '1', workerName: 'John Smith', tasksCompleted: 45, completionRate: 95, averageDuration: 3.8, efficiency: 1.02 },
    { workerId: '2', workerName: 'Maria Garcia', tasksCompleted: 52, completionRate: 93, averageDuration: 4.1, efficiency: 1.03 },
    { workerId: '3', workerName: 'Ahmed Hassan', tasksCompleted: 45, completionRate: 88, averageDuration: 4.5, efficiency: 1.08 },
  ];

  const taskTypeMetrics: TaskTypeMetrics[] = [
    { taskType: 'Planting', completed: 35, total: 38, completionRate: 92, averageDuration: 3.5 },
    { taskType: 'Irrigation', completed: 28, total: 30, completionRate: 93, averageDuration: 4.2 },
    { taskType: 'Weeding', completed: 42, total: 45, completionRate: 93, averageDuration: 3.8 },
    { taskType: 'Harvesting', completed: 25, total: 28, completionRate: 89, averageDuration: 5.1 },
    { taskType: 'Maintenance', completed: 12, total: 15, completionRate: 80, averageDuration: 4.8 },
  ];

  const completionTrend = [
    { date: 'Mon', completed: 18, pending: 2 },
    { date: 'Tue', completed: 22, pending: 3 },
    { date: 'Wed', completed: 20, pending: 4 },
    { date: 'Thu', completed: 25, pending: 2 },
    { date: 'Fri', completed: 28, pending: 1 },
    { date: 'Sat', completed: 19, pending: 3 },
    { date: 'Sun', completed: 10, pending: 2 },
  ];

  const durationTrend = [
    { date: 'Week 1', avgDuration: 4.0 },
    { date: 'Week 2', avgDuration: 4.1 },
    { date: 'Week 3', avgDuration: 4.3 },
    { date: 'Week 4', avgDuration: 4.2 },
  ];

  const taskTypeDistribution = taskTypeMetrics.map(t => ({
    name: t.taskType,
    value: t.total,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Performance Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1 rounded ${timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taskMetrics.totalTasks}</div>
            <p className="text-xs text-gray-500 mt-1">This {timeRange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{taskMetrics.completionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{taskMetrics.completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taskMetrics.averageDuration}h</div>
            <p className="text-xs text-gray-500 mt-1">Per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Est vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taskMetrics.estimatedVsActual.toFixed(2)}x</div>
            <p className="text-xs text-gray-500 mt-1">Ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="completion">Completion Trend</TabsTrigger>
          <TabsTrigger value="duration">Duration Trend</TabsTrigger>
          <TabsTrigger value="tasktype">Task Type</TabsTrigger>
          <TabsTrigger value="workers">Worker Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duration">
          <Card>
            <CardHeader>
              <CardTitle>Average Task Duration Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={durationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgDuration" stroke="#3b82f6" name="Avg Duration (hours)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasktype">
          <Card>
            <CardHeader>
              <CardTitle>Task Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taskTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {taskTypeMetrics.map((metric, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{metric.taskType}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {metric.completionRate}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {metric.completed}/{metric.total} completed • {metric.averageDuration}h avg
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <CardTitle>Worker Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerPerformance.map((worker, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{worker.workerName}</h4>
                        <p className="text-sm text-gray-600">{worker.tasksCompleted} tasks completed</p>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded ${
                        worker.efficiency <= 1.05 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {worker.efficiency.toFixed(2)}x efficiency
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Completion Rate</p>
                        <p className="font-semibold text-lg">{worker.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="font-semibold text-lg">{worker.averageDuration}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className="font-semibold text-lg">{worker.efficiency.toFixed(2)}x</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
