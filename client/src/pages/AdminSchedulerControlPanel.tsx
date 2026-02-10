import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Play, Pause, RefreshCw, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  duration?: number;
  errorMessage?: string;
}

interface JobLog {
  id: string;
  jobId: string;
  timestamp: Date;
  status: 'success' | 'failure';
  duration: number;
  message: string;
}

// Sample job data
const SAMPLE_JOBS: ScheduledJob[] = [
  {
    id: 'failed-notifications',
    name: 'Process Failed Notifications',
    description: 'Retry failed notifications with exponential backoff',
    schedule: '*/5 * * * * (Every 5 minutes)',
    status: 'idle',
    lastRun: new Date(Date.now() - 5 * 60 * 1000),
    nextRun: new Date(Date.now() + 5 * 60 * 1000),
    duration: 1250,
  },
  {
    id: 'breeding-reminders',
    name: 'Breeding Reminders',
    description: 'Send breeding due date notifications',
    schedule: '0 6 * * * (Daily at 6 AM)',
    status: 'completed',
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 3450,
  },
  {
    id: 'vaccination-reminders',
    name: 'Vaccination Reminders',
    description: 'Send vaccination due date notifications',
    schedule: '0 7 * * * (Daily at 7 AM)',
    status: 'idle',
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 2890,
  },
  {
    id: 'harvest-reminders',
    name: 'Harvest Reminders',
    description: 'Send harvest ready notifications',
    schedule: '0 8 * * * (Daily at 8 AM)',
    status: 'idle',
    lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 2100,
  },
  {
    id: 'stock-alerts',
    name: 'Stock Alerts',
    description: 'Send low stock level notifications',
    schedule: '0 9 * * * (Daily at 9 AM)',
    status: 'failed',
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 1890,
    errorMessage: 'Database connection timeout',
  },
  {
    id: 'weather-alerts',
    name: 'Weather Alerts',
    description: 'Send severe weather notifications',
    schedule: '0 */3 * * * (Every 3 hours)',
    status: 'idle',
    lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 3 * 60 * 60 * 1000),
    duration: 1560,
  },
  {
    id: 'order-updates',
    name: 'Order Updates',
    description: 'Send marketplace order notifications',
    schedule: '0 * * * * (Every hour)',
    status: 'completed',
    lastRun: new Date(Date.now() - 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 60 * 60 * 1000),
    duration: 890,
  },
  {
    id: 'retry-statistics',
    name: 'Retry Statistics Logging',
    description: 'Log notification retry statistics',
    schedule: '0 */6 * * * (Every 6 hours)',
    status: 'idle',
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000),
    duration: 450,
  },
];

const SAMPLE_LOGS: JobLog[] = [
  {
    id: '1',
    jobId: 'breeding-reminders',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success',
    duration: 3450,
    message: 'Successfully sent 156 breeding reminder notifications',
  },
  {
    id: '2',
    jobId: 'failed-notifications',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'success',
    duration: 1250,
    message: 'Retried 12 failed notifications, 10 successful',
  },
  {
    id: '3',
    jobId: 'stock-alerts',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'failure',
    duration: 1890,
    message: 'Database connection timeout after 30 seconds',
  },
  {
    id: '4',
    jobId: 'order-updates',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'success',
    duration: 890,
    message: 'Sent 45 order update notifications',
  },
];

export default function AdminSchedulerControlPanel() {
  const [jobs, setJobs] = useState<ScheduledJob[]>(SAMPLE_JOBS);
  const [logs, setLogs] = useState<JobLog[]>(SAMPLE_LOGS);
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(SAMPLE_JOBS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, searchTerm]);

  const jobLogs = useMemo(() => {
    if (!selectedJob) return [];
    return logs.filter((log) => log.jobId === selectedJob.id);
  }, [selectedJob, logs]);

  const handleTriggerJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'running' as const } : job
      )
    );
    // Simulate job execution
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: 'completed' as const,
                lastRun: new Date(),
                duration: Math.floor(Math.random() * 5000) + 500,
              }
            : job
        )
      );
    }, 2000);
  };

  const handlePauseJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'idle' as const } : job
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Zap className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Idle</Badge>;
    }
  };

  const stats = {
    total: jobs.length,
    running: jobs.filter((j) => j.status === 'running').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Scheduler Control Panel</h1>
          <p className="text-slate-600">Manage and monitor all scheduled notification jobs</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-yellow-600 mb-2">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Running</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.running}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-red-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by job name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Job List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scheduled Jobs</CardTitle>
                    <CardDescription>{filteredJobs.length} jobs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedJob?.id === job.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{job.name}</p>
                            <p className="text-xs text-slate-500">{job.schedule}</p>
                          </div>
                          {getStatusIcon(job.status)}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Job Details */}
              <div className="lg:col-span-2">
                {selectedJob ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedJob.name}</CardTitle>
                          <CardDescription className="mt-2">{selectedJob.description}</CardDescription>
                        </div>
                        {getStatusBadge(selectedJob.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Schedule</label>
                          <p className="text-sm text-slate-900 mt-1">{selectedJob.schedule}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Status</label>
                          <p className="text-sm text-slate-900 mt-1 capitalize">{selectedJob.status}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Last Run</label>
                          <p className="text-sm text-slate-900 mt-1">
                            {selectedJob.lastRun ? selectedJob.lastRun.toLocaleString() : 'Never'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Next Run</label>
                          <p className="text-sm text-slate-900 mt-1">
                            {selectedJob.nextRun ? selectedJob.nextRun.toLocaleString() : 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Duration</label>
                          <p className="text-sm text-slate-900 mt-1">
                            {selectedJob.duration ? `${selectedJob.duration}ms` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {selectedJob.errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-900">Error</p>
                              <p className="text-sm text-red-700 mt-1">{selectedJob.errorMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleTriggerJob(selectedJob.id)}
                          disabled={selectedJob.status === 'running'}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Trigger Now
                        </Button>
                        <Button
                          onClick={() => handlePauseJob(selectedJob.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button variant="outline" size="icon">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center h-64">
                    <CardContent className="text-center">
                      <p className="text-slate-500">Select a job to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Execution Logs</CardTitle>
                <CardDescription>
                  {selectedJob ? `Logs for: ${selectedJob.name}` : 'Select a job to view logs'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {jobLogs.length > 0 ? (
                    jobLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium text-slate-900">
                                {log.status === 'success' ? 'Success' : 'Failure'}
                              </p>
                              <p className="text-xs text-slate-500">{log.timestamp.toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.duration}ms
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700">{log.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No logs available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
