'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  workerId: string;
  workerName: string;
  taskType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
}

export const TaskAssignmentUI = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task_1',
      title: 'Prepare Field A for Planting',
      description: 'Clear weeds and level soil in Field A',
      workerId: 'worker_1',
      workerName: 'John Smith',
      taskType: 'planting',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2026-02-20',
      estimatedHours: 8,
      actualHours: 6
    },
    {
      id: 'task_2',
      title: 'Irrigation System Check',
      description: 'Inspect and repair irrigation lines in Field B',
      workerId: 'worker_2',
      workerName: 'Maria Garcia',
      taskType: 'irrigation',
      priority: 'medium',
      status: 'pending',
      dueDate: '2026-02-22',
      estimatedHours: 4
    },
    {
      id: 'task_3',
      title: 'Pest Control Spraying',
      description: 'Apply pesticide to corn crop',
      workerId: 'worker_3',
      workerName: 'Ahmed Hassan',
      taskType: 'spraying',
      priority: 'urgent',
      status: 'pending',
      dueDate: '2026-02-18',
      estimatedHours: 6
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workerId: '',
    taskType: 'planting',
    priority: 'medium' as const,
    dueDate: '',
    estimatedHours: 4
  });

  const handleAddTask = () => {
    if (formData.title && formData.workerId && formData.dueDate) {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        ...formData,
        workerName: 'Worker Name',
        status: 'pending',
        actualHours: undefined
      };
      setTasks([...tasks, newTask]);
      setFormData({ title: '', description: '', workerId: '', taskType: 'planting', priority: 'medium', dueDate: '', estimatedHours: 4 });
      setShowForm(false);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  const handleStartTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'in_progress' } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Assignment & Tracking</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Assign New Task
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Assign New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Prepare Field A"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Worker</label>
                <select
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Worker</option>
                  <option value="worker_1">John Smith</option>
                  <option value="worker_2">Maria Garcia</option>
                  <option value="worker_3">Ahmed Hassan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Task Type</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="planting">Planting</option>
                  <option value="weeding">Weeding</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="spraying">Spraying</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task details..."
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTask} className="bg-green-600 hover:bg-green-700">Assign Task</Button>
              <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'progress', 'completed'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {(tab === 'all' ? tasks : tab === 'pending' ? pendingTasks : tab === 'progress' ? inProgressTasks : completedTasks).map(task => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`text-xs font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Assigned To</p>
                          <p className="font-semibold">{task.workerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due Date</p>
                          <p className="font-semibold">{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Estimated Hours</p>
                          <p className="font-semibold">{task.estimatedHours}h {task.actualHours ? `(${task.actualHours}h actual)` : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-semibold capitalize">{task.taskType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {task.status === 'pending' && (
                        <Button onClick={() => handleStartTask(task.id)} size="sm" className="bg-blue-600">Start</Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button onClick={() => handleCompleteTask(task.id)} size="sm" className="bg-green-600">Complete</Button>
                      )}
                      <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TaskAssignmentUI;
