import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface Task {
  id: number;
  taskId: string;
  title: string;
  description: string | null;
  workerId: number;
  workerName: string | null;
  taskType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  farmId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TaskAssignmentUIWithDatabase = ({ farmId }: { farmId: number }) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workerId: '',
    taskType: 'planting',
    priority: 'medium' as const,
    dueDate: '',
    estimatedHours: 4
  });

  // Fetch tasks from database
  const { data: tasks = [], isLoading, refetch } = trpc.taskAssignmentDatabase.getTasksByFarm.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  // Fetch task stats
  const { data: stats } = trpc.taskAssignmentDatabase.getTaskStats.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  // Mutations
  const createTaskMutation = trpc.taskAssignmentDatabase.createTask.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ title: '', description: '', workerId: '', taskType: 'planting', priority: 'medium', dueDate: '', estimatedHours: 4 });
      setShowForm(false);
    }
  });

  const updateStatusMutation = trpc.taskAssignmentDatabase.updateTaskStatus.useMutation({
    onSuccess: () => refetch()
  });

  const deleteTaskMutation = trpc.taskAssignmentDatabase.deleteTask.useMutation({
    onSuccess: () => refetch()
  });

  const handleAddTask = async () => {
    if (formData.title && formData.workerId && formData.dueDate) {
      await createTaskMutation.mutateAsync({
        farmId,
        workerId: parseInt(formData.workerId),
        title: formData.title,
        description: formData.description || undefined,
        taskType: formData.taskType as any,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate),
        estimatedHours: formData.estimatedHours
      });
    }
  };

  const handleCompleteTask = async (taskId: string, actualHours?: number) => {
    await updateStatusMutation.mutateAsync({
      taskId,
      status: 'completed',
      actualHours
    });
  };

  const handleStartTask = async (taskId: string) => {
    await updateStatusMutation.mutateAsync({
      taskId,
      status: 'in_progress'
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskMutation.mutateAsync({ taskId });
  };

  const getFilteredTasks = () => {
    if (selectedStatus === 'all') return tasks;
    return tasks.filter(t => t.status === selectedStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Assignment & Tracking</h2>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Assign New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.pending || 0}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats?.inProgress || 0}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.completed || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <select
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select Worker</option>
                <option value="1">Worker 1</option>
                <option value="2">Worker 2</option>
                <option value="3">Worker 3</option>
              </select>
              <select
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="planting">Planting</option>
                <option value="weeding">Weeding</option>
                <option value="irrigation">Irrigation</option>
                <option value="harvesting">Harvesting</option>
                <option value="spraying">Spraying</option>
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="px-3 py-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="number"
                placeholder="Estimated Hours"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                className="px-3 py-2 border rounded"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddTask} disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <Tabs defaultValue="all" onValueChange={(val) => setSelectedStatus(val as any)}>
        <TabsList>
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({stats?.inProgress || 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats?.completed || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tasks found</div>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.taskId}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Assigned To:</span>
                          <p className="font-medium">{task.workerName || 'Unassigned'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Estimated Hours:</span>
                          <p className="font-medium">{task.estimatedHours}h ({task.actualHours || 0} actual)</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <p className="font-medium capitalize">{task.taskType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {task.status === 'pending' && (
                        <Button
                          onClick={() => handleStartTask(task.taskId)}
                          size="sm"
                          variant="outline"
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          onClick={() => handleCompleteTask(task.taskId)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      {task.status !== 'completed' && (
                        <Button
                          onClick={() => handleDeleteTask(task.taskId)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.taskId}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.workerName}</p>
                  </div>
                  <Button onClick={() => handleStartTask(task.taskId)} size="sm">
                    Start Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.taskId}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.workerName}</p>
                  </div>
                  <Button onClick={() => handleCompleteTask(task.taskId)} size="sm" className="bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.taskId}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.workerName}</p>
                    <p className="text-sm text-green-600">Completed on {new Date(task.completedAt || task.updatedAt).toLocaleDateString()}</p>
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
