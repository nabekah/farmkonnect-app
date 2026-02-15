import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';

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

// Mock data for fallback
const MOCK_TASKS: Task[] = [
  {
    id: 1,
    taskId: 'task_001',
    title: 'Prepare Field A for Planting',
    description: 'Clear weeds and level soil in Field A',
    workerId: 1,
    workerName: 'John Smith',
    taskType: 'Planting',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date('2026-02-20'),
    estimatedHours: 8,
    actualHours: 6,
    farmId: 1,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 2,
    taskId: 'task_002',
    title: 'Water Irrigation System Check',
    description: 'Inspect and test all irrigation lines',
    workerId: 2,
    workerName: 'Maria Garcia',
    taskType: 'Maintenance',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2026-02-18'),
    estimatedHours: 4,
    farmId: 1,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 3,
    taskId: 'task_003',
    title: 'Harvest Crop Section B',
    description: 'Harvest mature crops from Section B',
    workerId: 3,
    workerName: 'David Lee',
    taskType: 'Harvesting',
    priority: 'urgent',
    status: 'pending',
    dueDate: new Date('2026-02-17'),
    estimatedHours: 10,
    farmId: 1,
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-15'),
  },
];

export const TaskAssignmentUIWithDatabase = ({ farmId }: { farmId: number }) => {
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

  // Fetch tasks from database with error handling
  const { 
    data: tasks = MOCK_TASKS, 
    isLoading, 
    error,
    refetch 
  } = trpc.taskAssignmentDatabase.getTasksByFarm.useQuery(
    { farmId },
    { 
      enabled: !!farmId,
      retry: 1,
      onError: (err) => {
        console.error('Failed to fetch tasks:', err);
      }
    }
  );

  // Fetch task stats
  const { data: stats } = trpc.taskAssignmentDatabase.getTaskStats.useQuery(
    { farmId },
    { 
      enabled: !!farmId,
      retry: 1,
      onError: (err) => {
        console.error('Failed to fetch stats:', err);
      }
    }
  );

  // Create task mutation
  const createTaskMutation = trpc.taskAssignmentDatabase.createTask.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        workerId: '',
        taskType: 'planting',
        priority: 'medium',
        dueDate: '',
        estimatedHours: 4
      });
    },
    onError: (err) => {
      console.error('Failed to create task:', err);
    }
  });

  // Update task status mutation
  const updateStatusMutation = trpc.taskAssignmentDatabase.updateTaskStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Failed to update task status:', err);
    }
  });

  // Delete task mutation
  const deleteTaskMutation = trpc.taskAssignmentDatabase.deleteTask.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Failed to delete task:', err);
    }
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    await createTaskMutation.mutateAsync({
      farmId,
      workerId: formData.workerId ? parseInt(formData.workerId) : null,
      title: formData.title,
      description: formData.description,
      taskType: formData.taskType,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      estimatedHours: formData.estimatedHours,
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    await updateStatusMutation.mutateAsync({
      taskId,
      status: 'completed'
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTaskMutation.mutateAsync({ taskId });
    }
  };

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === selectedStatus);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Assignment & Tracking</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign New Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.pending || tasks.filter(t => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.inProgress || tasks.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.completed || tasks.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({...formData, estimatedHours: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0.5"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Task Type</label>
                  <select
                    value={formData.taskType}
                    onChange={(e) => setFormData({...formData, taskType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="planting">Planting</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="harvesting">Harvesting</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({tasks.filter(t => t.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({tasks.filter(t => t.status === 'in_progress').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({tasks.filter(t => t.status === 'completed').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="space-y-4 mt-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tasks found
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Assigned To</span>
                            <p className="font-medium">{task.workerName || 'Unassigned'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Due Date</span>
                            <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Estimated Hours</span>
                            <p className="font-medium">{task.estimatedHours}h {task.actualHours ? `(${task.actualHours} actual)` : ''}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Type</span>
                            <p className="font-medium">{task.taskType}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {task.status !== 'completed' && (
                          <Button
                            onClick={() => handleCompleteTask(task.taskId)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteTask(task.taskId)}
                          size="sm"
                          variant="destructive"
                          disabled={deleteTaskMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAssignmentUIWithDatabase;
