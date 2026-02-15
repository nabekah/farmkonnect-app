
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Clock, Plus, X, CheckCircle, AlertCircle, Calendar, Users, Zap, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  color: string;
  description?: string;
}

interface WorkerShift {
  id: number;
  workerId: number;
  workerName: string;
  date: string;
  shiftId: number;
  shiftName: string;
  status: 'scheduled' | 'pending_approval' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface TimeOffRequest {
  id: number;
  workerId: number;
  workerName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
}

export const ShiftManagement = ({ farmId = 1 }: { farmId?: number }) => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewShiftDialog, setShowNewShiftDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);

  // Fetch data from database
  const { data: shiftsData, isLoading: shiftsLoading } = trpc.laborManagement.shifts.list.useQuery({ farmId });
  const { data: workerShiftsData, isLoading: workerShiftsLoading } = trpc.laborManagement.workerShifts.list.useQuery({ farmId });
  const { data: timeOffData, isLoading: timeOffLoading } = trpc.laborManagement.timeOff.list.useQuery({ farmId });
  const { data: workersData, isLoading: workersLoading } = trpc.workforce.workers.list.useQuery({ farmId, status: 'active' });

  // Transform shift templates
  const shifts = useMemo(() => {
    if (!shiftsData) return [];
    const colors = ['bg-orange-100 border-orange-300', 'bg-blue-100 border-blue-300', 'bg-green-100 border-green-300', 'bg-purple-100 border-purple-300'];
    return shiftsData.map((shift: any, idx: number) => ({
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      duration: shift.duration,
      color: shift.color || colors[idx % colors.length],
      description: shift.description
    }));
  }, [shiftsData]);

  // Transform worker shifts
  const workerShifts = useMemo(() => {
    if (!workerShiftsData || !workersData) return [];
    return workerShiftsData.map((ws: any) => {
      const worker = workersData.find((w: any) => w.id === ws.workerId);
      const shift = shifts.find(s => s.id === ws.shiftId);
      return {
        id: ws.id,
        workerId: ws.workerId,
        workerName: worker?.name || 'Unknown',
        date: new Date(ws.date).toISOString().split('T')[0],
        shiftId: ws.shiftId,
        shiftName: shift?.name || 'Unknown Shift',
        status: ws.status,
        notes: ws.notes
      };
    });
  }, [workerShiftsData, workersData, shifts]);

  // Transform time off requests
  const timeOffRequests = useMemo(() => {
    if (!timeOffData || !workersData) return [];
    return timeOffData.map((req: any) => {
      const worker = workersData.find((w: any) => w.id === req.workerId);
      return {
        id: req.id,
        workerId: req.workerId,
        workerName: worker?.name || 'Unknown',
        startDate: new Date(req.startDate).toISOString().split('T')[0],
        endDate: new Date(req.endDate).toISOString().split('T')[0],
        reason: req.reason,
        status: req.status,
        requestedAt: new Date(req.requestedAt).toISOString()
      };
    });
  }, [timeOffData, workersData]);

  // Get shifts for selected date
  const shiftsForDate = workerShifts.filter(ws => ws.date === selectedDate);

  // Mutations
  const assignWorkerShift = trpc.laborManagement.workerShifts.assign.useMutation();
  const approveTimeOff = trpc.laborManagement.timeOff.approve.useMutation();
  const rejectTimeOff = trpc.laborManagement.timeOff.reject.useMutation();

  const isLoading = shiftsLoading || workerShiftsLoading || timeOffLoading || workersLoading;

  const handleAssignShift = async (workerId: number, shiftId: number) => {
    try {
      await assignWorkerShift.mutateAsync({
        farmId,
        workerId,
        shiftId,
        date: selectedDate
      });
      setShowScheduleDialog(false);
      setSelectedWorker(null);
    } catch (error) {
      console.error('Failed to assign shift:', error);
    }
  };

  const handleApproveTimeOff = async (requestId: number, approverId: number) => {
    try {
      await approveTimeOff.mutateAsync({
        id: requestId,
        approvedBy: approverId
      });
    } catch (error) {
      console.error('Failed to approve time off:', error);
    }
  };

  const handleRejectTimeOff = async (requestId: number, approverId: number, reason: string) => {
    try {
      await rejectTimeOff.mutateAsync({
        id: requestId,
        approvedBy: approverId,
        rejectionReason: reason
      });
    } catch (error) {
      console.error('Failed to reject time off:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Shift Management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shift Management</h1>
        <Dialog open={showNewShiftDialog} onOpenChange={setShowNewShiftDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Shift Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shift Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Shift Name (e.g., Early Morning)" />
              <Input type="time" placeholder="Start Time" />
              <Input type="time" placeholder="End Time" />
              <Input placeholder="Description" />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Create Shift</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shifts">Shift Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map(shift => (
              <Card key={shift.id} className={`border-2 ${shift.color}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{shift.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Duration: {shift.duration} hours</p>
                    {shift.description && <p className="mt-2">{shift.description}</p>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-600">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Schedule for {selectedDate}</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                  <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Assign Shift
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Shift to Worker</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select onValueChange={(val) => setSelectedWorker(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Worker" />
                          </SelectTrigger>
                          <SelectContent>
                            {workersData?.map((worker: any) => (
                              <SelectItem key={worker.id} value={worker.id.toString()}>
                                {worker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {shifts.map(shift => (
                              <SelectItem key={shift.id} value={shift.id.toString()}>
                                {shift.name} ({shift.startTime} - {shift.endTime})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            if (selectedWorker) {
                              const shiftId = shifts[0]?.id || 1;
                              handleAssignShift(selectedWorker, shiftId);
                            }
                          }}
                        >
                          Assign Shift
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shiftsForDate.length > 0 ? (
                  shiftsForDate.map(ws => (
                    <div key={ws.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{ws.workerName}</p>
                        <p className="text-sm text-gray-600">{ws.shiftName}</p>
                        {ws.notes && <p className="text-xs text-gray-500 mt-1">{ws.notes}</p>}
                      </div>
                      <Badge
                        variant="outline"
                        className={`
                          ${ws.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                          ${ws.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${ws.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                          ${ws.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                        `}
                      >
                        {ws.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No shifts scheduled for this date</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeOffRequests.length > 0 ? (
                  timeOffRequests.map(req => (
                    <div key={req.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{req.workerName}</p>
                          <p className="text-sm text-gray-600">{req.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">{req.startDate} to {req.endDate}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${req.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                            ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${req.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {req.status}
                        </Badge>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveTimeOff(req.id, 1)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleRejectTimeOff(req.id, 1, 'Denied')}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No time off requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
