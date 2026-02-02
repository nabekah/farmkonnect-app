import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Mail, Play, Trash2, BarChart3, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ReportManagement() {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    console.log(`[Toast] ${title}: ${description}`);
  };

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    farmId: '',
    reportType: 'financial' as 'financial' | 'livestock' | 'complete',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recipients: '',
  });

  // Queries
  const { data: farms } = trpc.farms.list.useQuery();
  const { data: schedules, refetch: refetchSchedules } = trpc.reportScheduling.getSchedules.useQuery();
  const { data: stats } = trpc.reportScheduling.getScheduleStats.useQuery();
  const { data: history } = trpc.reportScheduling.getReportHistory.useQuery({ limit: 20 });

  // Mutations
  const createSchedule = trpc.reportScheduling.createSchedule.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Report schedule created successfully' });
      setIsCreateDialogOpen(false);
      setNewSchedule({ farmId: '', reportType: 'financial', frequency: 'weekly', recipients: '' });
      refetchSchedules();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSchedule = trpc.reportScheduling.deleteSchedule.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Schedule deleted successfully' });
      refetchSchedules();
    },
  });

  const toggleSchedule = trpc.reportScheduling.updateSchedule.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Schedule updated successfully' });
      refetchSchedules();
    },
  });

  const triggerManual = trpc.reportScheduling.triggerManualReport.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Manual report generation triggered' });
    },
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.farmId || !newSchedule.recipients) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const recipientEmails = newSchedule.recipients.split(',').map(e => e.trim()).filter(e => e);
    
    createSchedule.mutate({
      farmId: parseInt(newSchedule.farmId),
      reportType: newSchedule.reportType,
      frequency: newSchedule.frequency,
      recipients: recipientEmails,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Report Management</h1>
          <p className="text-muted-foreground">Schedule automated reports and view delivery history</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Report Schedule</DialogTitle>
              <DialogDescription>
                Set up automated report generation and email delivery
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Farm</Label>
                <Select value={newSchedule.farmId} onValueChange={(value) => setNewSchedule({ ...newSchedule, farmId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms?.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id.toString()}>
                        {farm.farmName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={newSchedule.reportType} onValueChange={(value: any) => setNewSchedule({ ...newSchedule, reportType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="livestock">Livestock Report</SelectItem>
                    <SelectItem value="complete">Complete Farm Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={newSchedule.frequency} onValueChange={(value: any) => setNewSchedule({ ...newSchedule, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recipients (comma-separated emails)</Label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending}>
                {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentReports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Active Schedules
          </CardTitle>
          <CardDescription>Manage your automated report schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {!schedules || schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No report schedules yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold capitalize">{schedule.reportType} Report</h3>
                      <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">{schedule.frequency}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{schedule.recipients.length} recipient(s)</span>
                      </div>
                      {schedule.nextRun && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Next run: {new Date(schedule.nextRun).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerManual.mutate({ scheduleId: schedule.id })}
                      disabled={triggerManual.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSchedule.mutate({ scheduleId: schedule.id, isActive: !schedule.isActive })}
                    >
                      {schedule.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSchedule.mutate({ scheduleId: schedule.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report History
          </CardTitle>
          <CardDescription>Recent report generation and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No report history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium capitalize">{item.reportType} Report</div>
                      <div className="text-sm text-muted-foreground">
                        {item.generatedAt ? new Date(item.generatedAt).toLocaleString() : 'Pending'} • {item.recipientCount} recipient(s)
                      </div>
                      {item.errorMessage && (
                        <div className="text-sm text-red-600 mt-1">{item.errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant={item.status === 'success' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
