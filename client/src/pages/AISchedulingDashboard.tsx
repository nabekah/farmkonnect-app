import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { AlertCircle, Zap, CheckCircle, Clock, Users } from 'lucide-react';

export default function AISchedulingDashboard() {
  const [farmId, setFarmId] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: schedules, isLoading, refetch } = trpc.aiShiftScheduling.getOptimizedSchedules.useQuery({
    farmId,
    daysAhead: 7,
  });

  const generateScheduleMutation = trpc.aiShiftScheduling.generateOptimizedSchedule.useMutation({
    onSuccess: () => {
      setIsGenerating(false);
      refetch();
    },
  });

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      await generateScheduleMutation.mutateAsync({
        farmId,
        daysAhead: 7,
        optimizationGoal: 'balanced',
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading AI Scheduling...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI-Powered Shift Scheduling</h1>
        <Button
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Optimal Schedule'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Shifts</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules?.totalShifts || 0}</div>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers Assigned</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules?.workersAssigned || 0}</div>
            <p className="text-xs text-gray-500">Active workers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules?.conflicts || 0}</div>
            <p className="text-xs text-gray-500">Scheduling issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules?.optimizationScore || 0}%</div>
            <p className="text-xs text-gray-500">Schedule efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Details */}
      <Card>
        <CardHeader>
          <CardTitle>Optimized Schedule</CardTitle>
          <CardDescription>AI-generated shift assignments for next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules?.schedules && schedules.schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.schedules.map((schedule: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{schedule.date}</h4>
                      <p className="text-sm text-gray-500">{schedule.shiftType}</p>
                    </div>
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {schedule.workersNeeded} workers
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Start Time</p>
                      <p className="font-medium">{schedule.startTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Time</p>
                      <p className="font-medium">{schedule.endTime}</p>
                    </div>
                  </div>
                  {schedule.assignedWorkers && schedule.assignedWorkers.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Assigned Workers:</p>
                      <div className="flex flex-wrap gap-2">
                        {schedule.assignedWorkers.map((worker: any, widx: number) => (
                          <span key={widx} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {worker}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No schedules generated yet. Click "Generate Optimal Schedule" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Insights</CardTitle>
          <CardDescription>AI analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedules?.insights && schedules.insights.length > 0 ? (
            <ul className="space-y-2">
              {schedules.insights.map((insight: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No insights available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Conflict Resolution */}
      {schedules?.conflicts && schedules.conflicts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Scheduling Conflicts</CardTitle>
            <CardDescription>Issues that need manual review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                The AI scheduler detected {schedules.conflicts} potential conflicts. 
                Please review and resolve them manually or adjust worker availability.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
