'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface CompletionRecord {
  taskId: string;
  taskTitle: string;
  workerId: string;
  workerName: string;
  completedAt: string;
  estimatedHours: number;
  actualHours: number;
  efficiency: number;
  notes: string;
}

export const TaskCompletionTracking = () => {
  const [completionRecords, setCompletionRecords] = useState<CompletionRecord[]>([
    {
      taskId: 'task_1',
      taskTitle: 'Prepare Field A for Planting',
      workerId: 'worker_1',
      workerName: 'John Smith',
      completedAt: '2026-02-15',
      estimatedHours: 8,
      actualHours: 7,
      efficiency: 87.5,
      notes: 'Completed ahead of schedule'
    },
    {
      taskId: 'task_2',
      taskTitle: 'Irrigation System Check',
      workerId: 'worker_2',
      workerName: 'Maria Garcia',
      completedAt: '2026-02-14',
      estimatedHours: 4,
      actualHours: 4.5,
      efficiency: 88.9,
      notes: 'Fixed two leaks in line B'
    },
    {
      taskId: 'task_3',
      taskTitle: 'Equipment Maintenance',
      workerId: 'worker_3',
      workerName: 'Ahmed Hassan',
      completedAt: '2026-02-13',
      estimatedHours: 6,
      actualHours: 5.5,
      efficiency: 91.7,
      notes: 'All equipment serviced'
    }
  ]);

  const [selectedWorker, setSelectedWorker] = useState('all');

  const totalTasks = completionRecords.length;
  const avgEfficiency = (completionRecords.reduce((sum, r) => sum + r.efficiency, 0) / totalTasks).toFixed(1);
  const totalEstimatedHours = completionRecords.reduce((sum, r) => sum + r.estimatedHours, 0);
  const totalActualHours = completionRecords.reduce((sum, r) => sum + r.actualHours, 0);
  const timeSavings = totalEstimatedHours - totalActualHours;

  const workerPerformance = [
    { name: 'John Smith', tasks: 5, avgEfficiency: 89, hoursWorked: 32 },
    { name: 'Maria Garcia', tasks: 4, avgEfficiency: 87, hoursWorked: 24 },
    { name: 'Ahmed Hassan', tasks: 6, avgEfficiency: 92, hoursWorked: 38 }
  ];

  const completionTrend = [
    { date: 'Feb 8', completed: 3, pending: 5 },
    { date: 'Feb 9', completed: 5, pending: 4 },
    { date: 'Feb 10', completed: 8, pending: 3 },
    { date: 'Feb 11', completed: 10, pending: 4 },
    { date: 'Feb 12', completed: 12, pending: 3 },
    { date: 'Feb 13', completed: 15, pending: 2 },
    { date: 'Feb 14', completed: 18, pending: 1 }
  ];

  const efficiencyData = [
    { range: '80-85%', count: 2, fill: '#fbbf24' },
    { range: '85-90%', count: 5, fill: '#60a5fa' },
    { range: '90-95%', count: 6, fill: '#34d399' },
    { range: '95-100%', count: 3, fill: '#10b981' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Task Completion Tracking</h1>
        <p className="text-gray-600">Monitor task completion rates, worker efficiency, and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks}</p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Avg Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{avgEfficiency}%</p>
            <p className="text-xs text-gray-500 mt-2">Estimated vs Actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Time Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{timeSavings.toFixed(1)}h</p>
            <p className="text-xs text-gray-500 mt-2">Hours saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalActualHours}h</p>
            <p className="text-xs text-gray-500 mt-2">Actual hours worked</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workers">Worker Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="records">Completion Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Efficiency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={efficiencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Worker Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workerPerformance.map((worker, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{worker.name}</p>
                        <p className="text-xs text-gray-600">{worker.tasks} tasks completed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{worker.avgEfficiency}%</p>
                        <p className="text-xs text-gray-600">{worker.hoursWorked}h worked</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${worker.avgEfficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker Productivity Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="tasks" fill="#3b82f6" name="Tasks Completed" />
                  <Bar yAxisId="left" dataKey="avgEfficiency" fill="#10b981" name="Avg Efficiency %" />
                  <Bar yAxisId="right" dataKey="hoursWorked" fill="#f59e0b" name="Hours Worked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Worker Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workerPerformance.map((worker, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-lg">{worker.name}</h4>
                      <span className="text-2xl font-bold text-green-600">{worker.avgEfficiency}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tasks Completed</p>
                        <p className="text-xl font-bold">{worker.tasks}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hours Worked</p>
                        <p className="text-xl font-bold">{worker.hoursWorked}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg per Task</p>
                        <p className="text-xl font-bold">{(worker.hoursWorked / worker.tasks).toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-3">
          {completionRecords.map((record, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{record.taskTitle}</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Completed By</p>
                        <p className="font-semibold">{record.workerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Completed Date</p>
                        <p className="font-semibold">{new Date(record.completedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hours</p>
                        <p className="font-semibold">{record.estimatedHours}h → {record.actualHours}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className={`font-semibold ${record.efficiency >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {record.efficiency}%
                        </p>
                      </div>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-3 italic">"{record.notes}"</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskCompletionTracking;
