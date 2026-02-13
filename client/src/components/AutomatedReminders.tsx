import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, Calendar, Phone, Mail, CheckCircle } from 'lucide-react';

interface AutomatedRemindersProps {
  farmId: number;
}

interface Reminder {
  id: string;
  type: 'payment_due' | 'recurring_transaction' | 'budget_alert';
  title: string;
  description: string;
  dueDate: Date;
  reminderDate: Date;
  channels: ('sms' | 'email')[];
  status: 'active' | 'sent' | 'snoozed';
  frequency: 'once' | 'daily' | 'weekly';
}

export function AutomatedReminders({ farmId }: AutomatedRemindersProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [reminderDaysBefore, setReminderDaysBefore] = useState('3');
  const [preferredChannels, setPreferredChannels] = useState<('sms' | 'email')[]>(['email']);

  // Mock data for reminders
  const reminders: Reminder[] = [
    {
      id: 'rem-001',
      type: 'payment_due',
      title: 'Payment Due - Buyer Invoice',
      description: 'Payment due from Mr. John Smith for crop sale',
      dueDate: new Date('2026-02-20'),
      reminderDate: new Date('2026-02-17'),
      channels: ['email', 'sms'],
      status: 'active',
      frequency: 'once',
    },
    {
      id: 'rem-002',
      type: 'recurring_transaction',
      title: 'Monthly Salary Payment',
      description: 'Recurring salary payment for farm workers',
      dueDate: new Date('2026-02-28'),
      reminderDate: new Date('2026-02-25'),
      channels: ['email'],
      status: 'active',
      frequency: 'weekly',
    },
    {
      id: 'rem-003',
      type: 'budget_alert',
      title: 'Feed Budget Alert',
      description: 'Feed expenses approaching 80% of budget',
      dueDate: new Date('2026-02-15'),
      reminderDate: new Date('2026-02-15'),
      channels: ['email', 'sms'],
      status: 'sent',
      frequency: 'once',
    },
    {
      id: 'rem-004',
      type: 'payment_due',
      title: 'Fertilizer Supplier Payment',
      description: 'Payment due to fertilizer supplier',
      dueDate: new Date('2026-02-25'),
      reminderDate: new Date('2026-02-22'),
      channels: ['sms'],
      status: 'snoozed',
      frequency: 'once',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
        return <Calendar className="w-4 h-4" />;
      case 'recurring_transaction':
        return <Bell className="w-4 h-4" />;
      case 'budget_alert':
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'snoozed':
        return <Badge className="bg-yellow-100 text-yellow-800">Snoozed</Badge>;
      default:
        return null;
    }
  };

  const getChannelIcons = (channels: string[]) => {
    return (
      <div className="flex gap-2">
        {channels.includes('email') && (
          <Mail className="w-4 h-4 text-blue-600" title="Email" />
        )}
        {channels.includes('sms') && (
          <Phone className="w-4 h-4 text-green-600" title="SMS" />
        )}
      </div>
    );
  };

  const daysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Automated Reminders
              </CardTitle>
              <CardDescription>
                SMS and email reminders for payments and recurring transactions
              </CardDescription>
            </div>
            <Button onClick={() => setIsConfigOpen(true)}>Configure</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reminders Table */}
          {reminders.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(reminder.type)}
                          <span className="text-sm capitalize">{reminder.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-gray-500">{reminder.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {reminder.dueDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={daysUntilDue(reminder.dueDate) <= 3 ? 'destructive' : 'secondary'}
                        >
                          {daysUntilDue(reminder.dueDate)} days
                        </Badge>
                      </TableCell>
                      <TableCell>{getChannelIcons(reminder.channels)}</TableCell>
                      <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReminder(reminder)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">No active reminders</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Active Reminders</div>
                <div className="text-2xl font-bold text-blue-600">
                  {reminders.filter((r) => r.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Sent This Week</div>
                <div className="text-2xl font-bold text-green-600">
                  {reminders.filter((r) => r.status === 'sent').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Due Soon (3 days)</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {reminders.filter((r) => daysUntilDue(r.dueDate) <= 3).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure Reminders</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Days Before */}
            <div className="space-y-2">
              <Label htmlFor="daysBefore">Days Before Due Date</Label>
              <Input
                id="daysBefore"
                type="number"
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(e.target.value)}
                placeholder="3"
              />
              <p className="text-xs text-gray-500">
                Reminders will be sent this many days before the due date
              </p>
            </div>

            {/* Preferred Channels */}
            <div className="space-y-2">
              <Label>Preferred Notification Channels</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferredChannels.includes('email')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferredChannels([...preferredChannels, 'email']);
                      } else {
                        setPreferredChannels(preferredChannels.filter((c) => c !== 'email'));
                      }
                    }}
                  />
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferredChannels.includes('sms')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferredChannels([...preferredChannels, 'sms']);
                      } else {
                        setPreferredChannels(preferredChannels.filter((c) => c !== 'sms'));
                      }
                    }}
                  />
                  <Phone className="w-4 h-4" />
                  <span>SMS</span>
                </label>
              </div>
            </div>

            {/* Reminder Types */}
            <div className="space-y-2">
              <Label>Reminder Types</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Payment Due Reminders</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Recurring Transaction Reminders</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Budget Alert Reminders</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsConfigOpen(false)}>Save Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
