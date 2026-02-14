'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Copy, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  taskType: string;
  defaultPriority: string;
  defaultEstimatedHours: number;
  recurrencePattern: string;
  isActive: boolean;
  createdAt: string;
}

interface BulkAssignmentJob {
  id: string;
  templateName: string;
  workerCount: number;
  totalTasks: number;
  successCount: number;
  failureCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startDate: string;
  completedAt?: string;
}

export const TaskTemplatesUI = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: 'template_1',
      name: 'Weekly Irrigation Check',
      description: 'Check irrigation system for leaks and proper functioning',
      taskType: 'irrigation',
      defaultPriority: 'high',
      defaultEstimatedHours: 2,
      recurrencePattern: 'weekly',
      isActive: true,
      createdAt: '2026-02-10',
    },
    {
      id: 'template_2',
      name: 'Daily Field Inspection',
      description: 'Daily inspection of field for pests and diseases',
      taskType: 'inspection',
      defaultPriority: 'medium',
      defaultEstimatedHours: 1.5,
      recurrencePattern: 'daily',
      isActive: true,
      createdAt: '2026-02-08',
    },
    {
      id: 'template_3',
      name: 'Monthly Equipment Maintenance',
      description: 'Maintenance check for all farm equipment',
      taskType: 'maintenance',
      defaultPriority: 'medium',
      defaultEstimatedHours: 4,
      recurrencePattern: 'monthly',
      isActive: true,
      createdAt: '2026-02-01',
    },
  ]);

  const [bulkJobs, setBulkJobs] = useState<BulkAssignmentJob[]>([
    {
      id: 'bulk_1',
      templateName: 'Weekly Irrigation Check',
      workerCount: 5,
      totalTasks: 5,
      successCount: 5,
      failureCount: 0,
      status: 'completed',
      startDate: '2026-02-14',
      completedAt: '2026-02-14',
    },
    {
      id: 'bulk_2',
      templateName: 'Daily Field Inspection',
      workerCount: 8,
      totalTasks: 8,
      successCount: 8,
      failureCount: 0,
      status: 'completed',
      startDate: '2026-02-13',
      completedAt: '2026-02-13',
    },
  ]);

  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  const workers = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Maria Garcia' },
    { id: 3, name: 'Ahmed Hassan' },
    { id: 4, name: 'Sarah Johnson' },
    { id: 5, name: 'David Chen' },
    { id: 6, name: 'Emma Wilson' },
    { id: 7, name: 'Carlos Rodriguez' },
    { id: 8, name: 'Fatima Al-Rashid' },
  ];

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleToggleWorker = (workerId: number) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleBulkAssign = () => {
    if (!selectedTemplate || selectedWorkers.length === 0) return;

    const newJob: BulkAssignmentJob = {
      id: `bulk_${Date.now()}`,
      templateName: selectedTemplate.name,
      workerCount: selectedWorkers.length,
      totalTasks: selectedWorkers.length,
      successCount: selectedWorkers.length,
      failureCount: 0,
      status: 'completed',
      startDate: new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString().split('T')[0],
    };

    setBulkJobs([newJob, ...bulkJobs]);
    setSelectedWorkers([]);
    setSelectedTemplate(null);
    setShowBulkAssignDialog(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Task Templates & Bulk Assignment</h1>
        <p className="text-gray-600">Create reusable task templates and assign them to multiple workers at once</p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="bulk-jobs">Bulk Assignment Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Task Templates</h2>
            <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Task Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input placeholder="e.g., Weekly Irrigation Check" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input placeholder="Describe the task..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Task Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planting">Planting</SelectItem>
                        <SelectItem value="weeding">Weeding</SelectItem>
                        <SelectItem value="irrigation">Irrigation</SelectItem>
                        <SelectItem value="harvesting">Harvesting</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estimated Hours</label>
                    <Input type="number" placeholder="2.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Recurrence Pattern</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Create Template</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Task Type</p>
                      <p className="font-semibold capitalize">{template.taskType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Priority</p>
                      <p className="font-semibold capitalize">{template.defaultPriority}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Est. Hours</p>
                      <p className="font-semibold">{template.defaultEstimatedHours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recurrence</p>
                      <p className="font-semibold capitalize">{template.recurrencePattern}</p>
                    </div>
                  </div>
                  <Dialog open={showBulkAssignDialog && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                    if (open) {
                      setSelectedTemplate(template);
                      setShowBulkAssignDialog(true);
                    } else {
                      setShowBulkAssignDialog(false);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full gap-2" variant="outline">
                        <Copy className="w-4 h-4" /> Bulk Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-96">
                      <DialogHeader>
                        <DialogTitle>Bulk Assign: {template.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Select workers to assign this task to:</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                          {workers.map((worker) => (
                            <div key={worker.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedWorkers.includes(worker.id)}
                                onCheckedChange={() => handleToggleWorker(worker.id)}
                              />
                              <label className="text-sm cursor-pointer flex-1">{worker.name}</label>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm font-semibold">
                          {selectedWorkers.length} worker(s) selected
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleBulkAssign}
                          disabled={selectedWorkers.length === 0}
                        >
                          Assign to {selectedWorkers.length} Worker{selectedWorkers.length !== 1 ? 's' : ''}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bulk-jobs" className="space-y-6">
          <h2 className="text-2xl font-bold">Bulk Assignment Jobs</h2>

          <div className="space-y-3">
            {bulkJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{job.templateName}</h4>
                        {job.status === 'completed' && (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {job.status === 'processing' && (
                          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" /> Processing
                          </span>
                        )}
                        {job.status === 'failed' && (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Workers</p>
                          <p className="font-semibold text-lg">{job.workerCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Tasks</p>
                          <p className="font-semibold text-lg">{job.totalTasks}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success</p>
                          <p className="font-semibold text-lg text-green-600">{job.successCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Failed</p>
                          <p className={`font-semibold text-lg ${job.failureCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {job.failureCount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        Started: {new Date(job.startDate).toLocaleDateString()}
                        {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleDateString()}`}
                      </div>

                      {job.failureCount > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          {job.failureCount} task(s) failed to assign. Review logs for details.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskTemplatesUI;
