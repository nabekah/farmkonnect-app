'use client';
import { useState } from 'react';
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
    }
  });

  // Update task status mutation
  const updateStatusMutation = trpc.taskAssignmentDatabase.updateTaskStatus.useMutation({
    onSuccess: () => refetch()
  });

  // Delete task mutation
  const deleteTaskMutation = trpc.taskAssignmentDatabase.deleteTask.useMutation({
    onSuccess: () => refetch()
  });

  // Filter tasks by status
  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === selectedStatus);

  const handleCreateTask = async () => {
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in required fields');
      return;
    }

    await createTaskMutation.mutateAsync({
      farmId,
      title: formData.title,
      description: formData.description || null,
      workerId: formData.workerId ? parseInt(formData.workerId) : null,
      taskType: formData.taskType,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      estimatedHours: formData.estimatedHours
    });
  };

  const handleCompleteTask = (taskId: string) => {
    updateStatusMutation.mutate({
      taskId,
      status: 'completed'
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate({ taskId });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Task Button */}
      <Button onClick={() => setShowForm(!showForm)} className="gap-2">
        <Plus className="w-4 h-4" />
        Assign New Task
      </Button>

      {/* Create Task Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Estimated Hours"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Tabs */}
      <Tabs value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({stats?.inProgress || 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats?.completed || 0})</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.taskId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteTask(task.taskId)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTask(task.taskId)}
                          disabled={deleteTaskMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Assigned To</p>
                        <p className="font-medium">{task.workerName || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Estimated Hours</p>
                        <p className="font-medium">{task.estimatedHours}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{task.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TaskAssignmentUIWithDatabase;
