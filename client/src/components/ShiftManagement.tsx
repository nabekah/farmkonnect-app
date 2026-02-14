'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Clock, Plus, X, CheckCircle, AlertCircle, Calendar, Users, Zap } from 'lucide-react';

interface Shift {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  color: string;
  description: string;
}

interface WorkerShift {
  workerId: number;
  workerName: string;
  date: string;
  shiftId: string;
  shiftName: string;
  status: 'scheduled' | 'pending_approval' | 'confirmed' | 'completed';
  notes?: string;
}

interface TimeOffRequest {
  requestId: string;
  workerId: number;
  workerName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export const ShiftManagement = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [selectedDate, setSelectedDate] = useState('2026-02-14');
  const [showNewShiftDialog, setShowNewShiftDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);

  const workers = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Maria Garcia' },
    { id: 3, name: 'Ahmed Hassan' },
    { id: 4, name: 'Sarah Johnson' },
    { id: 5, name: 'David Chen' },
    { id: 6, name: 'Emma Wilson' },
  ];

  // Mock shift templates
  const [shifts, setShifts] = useState<Shift[]>([
    {
      shiftId: 'shift_1',
      name: 'Early Morning',
      startTime: '06:00',
      endTime: '14:00',
      duration: 8,
      color: 'bg-orange-100 border-orange-300',
      description: 'Early morning shift for field preparation',
    },
    {
      shiftId: 'shift_2',
      name: 'Standard Day',
      startTime: '08:00',
      endTime: '16:00',
      duration: 8,
      color: 'bg-blue-100 border-blue-300',
      description: 'Standard working hours',
    },
    {
      shiftId: 'shift_3',
      name: 'Afternoon',
      startTime: '14:00',
      endTime: '22:00',
      duration: 8,
      color: 'bg-purple-100 border-purple-300',
      description: 'Afternoon to evening shift',
    },
    {
      shiftId: 'shift_4',
      name: 'Half Day',
      startTime: '08:00',
      endTime: '12:00',
      duration: 4,
      color: 'bg-green-100 border-green-300',
      description: 'Half day shift for light tasks',
    },
  ]);

  // Mock worker schedules
  const [workerShifts, setWorkerShifts] = useState<WorkerShift[]>([
    {
      workerId: 1,
      workerName: 'John Smith',
      date: '2026-02-14',
      shiftId: 'shift_2',
      shiftName: 'Standard Day',
      status: 'confirmed',
    },
    {
      workerId: 2,
      workerName: 'Maria Garcia',
      date: '2026-02-14',
      shiftId: 'shift_1',
      shiftName: 'Early Morning',
      status: 'confirmed',
    },
    {
      workerId: 3,
      workerName: 'Ahmed Hassan',
      date: '2026-02-14',
      shiftId: 'shift_2',
      shiftName: 'Standard Day',
      status: 'confirmed',
    },
    {
      workerId: 4,
      workerName: 'Sarah Johnson',
      date: '2026-02-14',
      shiftId: 'shift_3',
      shiftName: 'Afternoon',
      status: 'pending_approval',
    },
    {
      workerId: 5,
      workerName: 'David Chen',
      date: '2026-02-14',
      shiftId: 'shift_2',
      shiftName: 'Standard Day',
      status: 'confirmed',
    },
    {
      workerId: 6,
      workerName: 'Emma Wilson',
      date: '2026-02-14',
      shiftId: 'shift_4',
      shiftName: 'Half Day',
      status: 'confirmed',
    },
  ]);

  // Mock time off requests
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([
    {
      requestId: 'req_1',
      workerId: 1,
      workerName: 'John Smith',
      startDate: '2026-02-17',
      endDate: '2026-02-19',
      reason: 'Personal leave',
      status: 'pending',
      requestedAt: '2026-02-14T10:30:00',
    },
    {
      requestId: 'req_2',
      workerId: 2,
      workerName: 'Maria Garcia',
      startDate: '2026-02-20',
      endDate: '2026-02-21',
      reason: 'Medical appointment',
      status: 'approved',
      requestedAt: '2026-02-13T14:00:00',
    },
    {
      requestId: 'req_3',
      workerId: 3,
      workerName: 'Ahmed Hassan',
      startDate: '2026-02-24',
      endDate: '2026-02-25',
      reason: 'Family event',
      status: 'pending',
      requestedAt: '2026-02-14T09:00:00',
    },
  ]);

  const getTodaySchedule = () => {
    return workerShifts.filter(ws => ws.date === selectedDate);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleApproveTimeOff = (requestId: string) => {
    setTimeOffRequests(requests =>
      requests.map(r =>
        r.requestId === requestId ? { ...r, status: 'approved' } : r
      )
    );
  };

  const handleRejectTimeOff = (requestId: string) => {
    setTimeOffRequests(requests =>
      requests.map(r =>
        r.requestId === requestId ? { ...r, status: 'rejected' } : r
      )
    );
  };

  const todaySchedule = getTodaySchedule();
  const pendingApprovals = workerShifts.filter(ws => ws.status === 'pending_approval').length;
  const pendingTimeOff = timeOffRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shift Management</h1>
        <p className="text-gray-600">Manage worker shifts, schedules, and time-off requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" /> Scheduled Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todaySchedule.length}</p>
            <p className="text-xs text-gray-600 mt-2">workers on shift</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Shift Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{shifts.length}</p>
            <p className="text-xs text-gray-600 mt-2">available shifts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" /> Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingApprovals}</p>
            <p className="text-xs text-gray-600 mt-2">shift requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Time-Off Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{pendingTimeOff}</p>
            <p className="text-xs text-gray-600 mt-2">pending approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shifts">Daily Schedule</TabsTrigger>
          <TabsTrigger value="templates">Shift Templates</TabsTrigger>
          <TabsTrigger value="timeoff">Time-Off Requests</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        {/* Daily Schedule Tab */}
        <TabsContent value="shifts" className="space-y-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Assign Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Worker</label>
                    <Select value={selectedWorker?.toString() || ''} onValueChange={(val) => setSelectedWorker(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map(w => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Shift</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map(s => (
                          <SelectItem key={s.shiftId} value={s.shiftId}>
                            {s.name} ({s.startTime} - {s.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Assign Shift</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No shifts scheduled</p>
                  <p className="text-gray-600">Assign shifts for this date</p>
                </CardContent>
              </Card>
            ) : (
              todaySchedule.map(ws => {
                const shift = shifts.find(s => s.shiftId === ws.shiftId);
                return (
                  <Card key={`${ws.workerId}-${ws.date}`} className={`border ${shift?.color}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{ws.workerName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {ws.shiftName} • {shift?.startTime} - {shift?.endTime}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{shift?.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ws.status)}
                          <Button variant="ghost" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Shift Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Dialog open={showNewShiftDialog} onOpenChange={setShowNewShiftDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create Shift Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Shift Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Shift Name</label>
                  <Input placeholder="e.g., Early Morning" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input type="time" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Shift description" />
                </div>
                <Button className="w-full">Create Template</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map(shift => (
              <Card key={shift.shiftId} className={`border ${shift.color}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{shift.name}</CardTitle>
                    <Button variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-700">{shift.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{shift.duration} hours</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Time-Off Requests Tab */}
        <TabsContent value="timeoff" className="space-y-6">
          <div className="space-y-3">
            {timeOffRequests.map(request => (
              <Card key={request.requestId}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{request.workerName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Requested: {new Date(request.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {request.status === 'pending' ? (
                        <>
                          <Badge className="bg-yellow-600">Pending</Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveTimeOff(request.requestId)}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectTimeOff(request.requestId)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      ) : request.status === 'approved' ? (
                        <Badge className="bg-green-600">Approved</Badge>
                      ) : (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-green-600" /> Scheduling Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="font-semibold text-green-900">No Conflicts Detected</p>
                  <p className="text-sm text-green-800 mt-1">
                    All current shifts are properly scheduled with no overbooking or conflicts.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Coverage Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-600">Early Morning Shifts</p>
                      <p className="text-2xl font-bold text-blue-600">2</p>
                      <p className="text-xs text-gray-600 mt-1">workers scheduled</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-600">Standard Day Shifts</p>
                      <p className="text-2xl font-bold text-blue-600">3</p>
                      <p className="text-xs text-gray-600 mt-1">workers scheduled</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-600">Afternoon Shifts</p>
                      <p className="text-2xl font-bold text-blue-600">1</p>
                      <p className="text-xs text-gray-600 mt-1">workers scheduled</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Upcoming Conflicts to Monitor</h4>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-900">
                      John Smith has a time-off request for Feb 17-19. Consider reassigning his tasks.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftManagement;
