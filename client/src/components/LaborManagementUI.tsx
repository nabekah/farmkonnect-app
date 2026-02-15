
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, CheckCircle, AlertCircle, TrendingUp, DollarSign, Clock, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Worker {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'on_leave' | 'inactive';
  hourlyRate: number;
  tasksCompleted: number;
  rating: number;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  estimatedHours: number;
}

interface ScheduleEntry {
  date: string;
  workerId: string;
  taskId: string;
  startTime: string;
  endTime: string;
}

export const LaborManagementUI = ({ farmId = 1 }: { farmId?: number }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWeek, setSelectedWeek] = useState('current');

  // Fetch data from database
  const { data: dashboardData, isLoading: dashboardLoading } = trpc.laborManagement.dashboard.summary.useQuery({ farmId });
  const { data: workerShiftsData, isLoading: shiftsLoading } = trpc.laborManagement.workerShifts.list.useQuery({ farmId });
  const { data: performanceData, isLoading: performanceLoading } = trpc.laborManagement.performance.list.useQuery({ farmId });
  const { data: workersData, isLoading: workersLoading } = trpc.workforce.workers.list.useQuery({ farmId, status: 'active' });
  const { data: availabilityData, isLoading: availabilityLoading } = trpc.laborManagement.availability.list.useQuery({ farmId });

  // Transform workers data
  const workers = useMemo(() => {
    if (!workersData) return [];
    return workersData.map((worker: any) => ({
      id: worker.id,
      name: worker.name,
      role: worker.position || 'Field Worker',
      status: worker.status as 'active' | 'on_leave' | 'inactive',
      hourlyRate: worker.hourlyRate || 15,
      tasksCompleted: performanceData?.filter((p: any) => p.workerId === worker.id).reduce((sum: number, p: any) => sum + (p.tasksCompleted || 0), 0) || 0,
      rating: performanceData?.filter((p: any) => p.workerId === worker.id).reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / (performanceData?.filter((p: any) => p.workerId === worker.id).length || 1) || 4.5
    }));
  }, [workersData, performanceData]);

  // Transform shift data to tasks
  const tasks = useMemo(() => {
    if (!workerShiftsData) return [];
    return workerShiftsData.map((shift: any, idx: number) => ({
      id: `t${idx}`,
      title: `Shift Assignment`,
      assignedTo: `w${shift.workerId}`,
      status: shift.status === 'completed' ? 'completed' : shift.status === 'confirmed' ? 'in_progress' : 'pending',
      priority: 'medium' as const,
      dueDate: new Date(shift.date).toISOString().split('T')[0],
      estimatedHours: 8
    }));
  }, [workerShiftsData]);

  // Transform shift data to schedule
  const schedule = useMemo(() => {
    if (!workerShiftsData) return [];
    return workerShiftsData.map((shift: any) => ({
      date: new Date(shift.date).toISOString().split('T')[0],
      workerId: `w${shift.workerId}`,
      taskId: `t${shift.id}`,
      startTime: '06:00',
      endTime: '14:00'
    }));
  }, [workerShiftsData]);

  // Calculate metrics
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalTasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const averageRating = workers.length > 0 ? (workers.reduce((sum, w) => sum + w.rating, 0) / workers.length).toFixed(1) : '0';
  const totalPayroll = workers.reduce((sum, w) => sum + (w.tasksCompleted * 8 * w.hourlyRate), 0);

  const performanceChartData = workers.map(w => ({
    name: w.name.split(' ')[0],
    tasksCompleted: w.tasksCompleted,
    rating: w.rating * 10
  }));

  const taskStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' }
  ];

  const isLoading = dashboardLoading || shiftsLoading || performanceLoading || workersLoading || availabilityLoading;

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Labor Management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labor Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">+ Assign Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" /> Active Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeWorkers}</p>
            <p className="text-xs text-gray-500 mt-2">{workers.length - activeWorkers} on leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasksCompleted}</p>
            <p className="text-xs text-gray-500 mt-2">of {tasks.length} total tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageRating}/5</p>
            <p className="text-xs text-gray-500 mt-2">Team performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${(totalPayroll / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-500 mt-2">Monthly estimate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Due: {task.dueDate} | Est: {task.estimatedHours}h</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.map(worker => (
                  <div key={worker.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{worker.name}</p>
                      <p className="text-sm text-gray-600">{worker.role}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Tasks: {worker.tasksCompleted}</span>
                        <span>Rating: {worker.rating.toFixed(1)}/5</span>
                        <span>${worker.hourlyRate}/hr</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {worker.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Schedule</CardTitle>
                <select className="px-3 py-1 border rounded text-sm" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
                  <option value="current">Current Week</option>
                  <option value="next">Next Week</option>
                  <option value="previous">Previous Week</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Worker</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Task</th>
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry, idx) => {
                      const worker = workers.find(w => w.id.toString() === entry.workerId.replace('w', ''));
                      const startHour = parseInt(entry.startTime.split(':')[0]);
                      const endHour = parseInt(entry.endTime.split(':')[0]);
                      const hours = endHour - startHour;
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-2">{worker?.name || 'Unknown'}</td>
                          <td className="p-2">{entry.date}</td>
                          <td className="p-2">Shift Assignment</td>
                          <td className="p-2">{entry.startTime} - {entry.endTime}</td>
                          <td className="p-2">{hours}h</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasksCompleted" fill="#3b82f6" name="Tasks Completed" />
                  <Bar dataKey="rating" fill="#10b981" name="Rating (x10)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.map(worker => (
                  <div key={worker.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{worker.name}</p>
                      <span className="text-sm font-semibold text-blue-600">{worker.rating.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(worker.rating / 5) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{worker.tasksCompleted} tasks completed</p>
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
