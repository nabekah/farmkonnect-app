
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle, Plus, X, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface WorkerSchedule {
  workerId: number;
  workerName: string;
  date: string;
  availableHours: number;
  scheduledHours: number;
  tasks: ScheduledTask[];
  status: 'available' | 'busy' | 'overbooked' | 'off';
}

interface ScheduledTask {
  taskId: string;
  title: string;
  estimatedHours: number;
  priority: string;
  status: string;
}

interface ConflictWarning {
  workerId: number;
  workerName: string;
  date: string;
  overageHours: number;
  tasks: string[];
}

export const WorkerAvailabilityCalendar = ({ farmId = 1 }: { farmId?: number }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 14)); // Feb 14, 2026
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Fetch data from database
  const { data: workersData, isLoading: workersLoading } = trpc.workforce.workers.list.useQuery({ farmId, status: 'active' });
  const { data: availabilityData, isLoading: availabilityLoading } = trpc.laborManagement.availability.list.useQuery({ farmId });
  const { data: workerShiftsData, isLoading: shiftsLoading } = trpc.laborManagement.workerShifts.list.useQuery({ farmId });
  const { data: tasksData, isLoading: tasksLoading } = trpc.fieldWorker.getTasks.useQuery({ farmId });

  // Transform schedule data
  const scheduleData = useMemo(() => {
    if (!availabilityData || !workerShiftsData || !tasksData) return [];

    return availabilityData.map((avail: any) => {
      const worker = workersData?.find((w: any) => w.id === avail.workerId);
      const shifts = workerShiftsData.filter((ws: any) => ws.workerId === avail.workerId && ws.date === avail.date);
      const assignedTasks = tasksData.filter((t: any) => t.assignedTo === avail.workerId);

      const scheduledHours = shifts.reduce((sum: number, s: any) => sum + (s.duration || 8), 0);
      const availableHours = avail.availableHours || 8;

      return {
        workerId: avail.workerId,
        workerName: worker?.name || 'Unknown',
        date: new Date(avail.date).toISOString().split('T')[0],
        availableHours,
        scheduledHours,
        status: scheduledHours > availableHours ? 'overbooked' : scheduledHours === availableHours ? 'busy' : 'available',
        tasks: assignedTasks.map((t: any) => ({
          taskId: t.id.toString(),
          title: t.title,
          estimatedHours: t.estimatedHours || 8,
          priority: t.priority,
          status: t.status
        }))
      };
    });
  }, [availabilityData, workerShiftsData, tasksData, workersData]);

  // Get conflicts
  const conflicts = useMemo(() => {
    return scheduleData
      .filter(s => s.status === 'overbooked')
      .map(s => ({
        workerId: s.workerId,
        workerName: s.workerName,
        date: s.date,
        overageHours: s.scheduledHours - s.availableHours,
        tasks: s.tasks.map(t => t.title)
      }));
  }, [scheduleData]);

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isLoading = workersLoading || availabilityLoading || shiftsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Worker Availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Worker Availability Calendar</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">+ Update Availability</Button>
      </div>

      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Scheduling Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict, idx) => (
                <div key={idx} className="p-3 bg-white rounded border border-red-200">
                  <p className="font-semibold text-sm">{conflict.workerName} - {conflict.date}</p>
                  <p className="text-sm text-red-600">{conflict.overageHours}h overbooked</p>
                  <p className="text-xs text-gray-600 mt-1">{conflict.tasks.join(', ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm p-2">
                    {day}
                  </div>
                ))}
                {Array(firstDay).fill(null).map((_, idx) => (
                  <div key={`empty-${idx}`} className="p-2"></div>
                ))}
                {days.map(day => {
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const daySchedules = scheduleData.filter(s => s.date === dateStr);
                  const hasConflict = daySchedules.some(s => s.status === 'overbooked');

                  return (
                    <div
                      key={day}
                      className={`p-2 border rounded text-sm ${
                        hasConflict ? 'bg-red-50 border-red-300' : 'bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold">{day}</p>
                      <p className="text-xs text-gray-600">{daySchedules.length} workers</p>
                      {hasConflict && <AlertTriangle className="w-3 h-3 text-red-600 mt-1" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker Availability Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleData.map((schedule, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{schedule.workerName}</p>
                        <p className="text-sm text-gray-600">{schedule.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`
                          ${schedule.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                          ${schedule.status === 'busy' ? 'bg-blue-100 text-blue-800' : ''}
                          ${schedule.status === 'overbooked' ? 'bg-red-100 text-red-800' : ''}
                          ${schedule.status === 'off' ? 'bg-gray-100 text-gray-800' : ''}
                        `}
                      >
                        {schedule.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.scheduledHours}/{schedule.availableHours}h</span>
                      </div>
                    </div>
                    {schedule.tasks.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600">Assigned Tasks:</p>
                        {schedule.tasks.map(task => (
                          <div key={task.taskId} className="p-2 bg-gray-50 rounded text-xs">
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-gray-600">{task.estimatedHours}h - {task.priority} priority</p>
                          </div>
                        ))}
                      </div>
                    )}
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
