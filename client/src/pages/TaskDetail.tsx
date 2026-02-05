import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Clock, MapPin, User, Calendar, CheckCircle2, AlertTriangle, Edit } from 'lucide-react';
import { TaskCompletionWorkflow } from '@/components/TaskCompletionWorkflow';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { TaskHistoryTimeline } from '@/components/TaskHistoryTimeline';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TASK_TYPE_LABELS: Record<string, string> = {
  planting: 'Planting',
  monitoring: 'Monitoring',
  irrigation: 'Irrigation',
  fertilization: 'Fertilization',
  pest_control: 'Pest Control',
  weed_control: 'Weed Control',
  harvest: 'Harvest',
  equipment_maintenance: 'Equipment Maintenance',
  soil_testing: 'Soil Testing',
  other: 'Other',
};

export function TaskDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/field-worker/tasks/:id');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!match) {
    return <div>Task not found</div>;
  }

  const taskId = params?.id || '';
  const { data: task, isLoading, error, refetch } = trpc.fieldWorker.getTask.useQuery({
    taskId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/field-worker/tasks')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <Card>
            <CardContent className="pt-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading task details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/field-worker/tasks')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <Card>
            <CardContent className="pt-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Task Not Found</h2>
              <p className="text-muted-foreground">The task you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/field-worker/tasks')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{task.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge className={PRIORITY_COLORS[task.priority]}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
                <Badge className={STATUS_COLORS[task.status]}>
                  {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {TASK_TYPE_LABELS[task.taskType] || task.taskType}
                </Badge>
              </div>
            </div>
            {task.status !== 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {isOverdue && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">This task is overdue!</p>
              <p className="text-sm text-red-700">Due date was {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{task.description || 'No description provided'}</p>
              </CardContent>
            </Card>

            {/* Notes */}
            {task.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{task.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Task History Timeline */}
            <TaskHistoryTimeline taskId={taskId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned To</p>
                      <p className="text-sm font-medium">{task.assignedToName || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="text-sm font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {task.completedDate && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-sm font-medium">{new Date(task.completedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {task.status !== 'completed' && (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowCompletionDialog(true)}
                  className="w-full"
                >
                  {task.status === 'in_progress' ? 'Continue Task' : 'Start Task'}
                </Button>
              </div>
            )}

            {task.status === 'completed' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Task Completed</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Task Completion Workflow */}
      {showCompletionDialog && (
        <TaskCompletionWorkflow
          taskId={taskId}
          taskTitle={task.title}
          taskDescription={task.description || ''}
          requiredPhotos={0}
          onComplete={async () => {
            setShowCompletionDialog(false);
            await refetch();
            navigate('/field-worker/tasks');
          }}
        />
      )}

      {/* Task Edit Dialog */}
      {showEditDialog && (
        <TaskEditDialog
          taskId={taskId}
          title={task.title}
          description={task.description || ''}
          priority={task.priority}
          dueDate={new Date(task.dueDate)}
          notes={task.notes || ''}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
