import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, Send, Plus, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { Badge } from './ui/badge';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'notification';
  recipients: number;
  scheduledTime: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  createdAt: string;
}

export function CampaignSchedulerUI() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Weekly Newsletter',
      type: 'email',
      recipients: 1250,
      scheduledTime: '2026-02-21 09:00 AM',
      frequency: 'weekly',
      status: 'scheduled',
      createdAt: '2026-02-14',
    },
    {
      id: '2',
      name: 'Harvest Reminder',
      type: 'sms',
      recipients: 850,
      scheduledTime: '2026-02-15 06:00 AM',
      frequency: 'once',
      status: 'running',
      createdAt: '2026-02-14',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as const,
    recipients: '',
    scheduledTime: '',
    frequency: 'once' as const,
  });

  const [showForm, setShowForm] = useState(false);

  const handleAddCampaign = () => {
    if (formData.name && formData.recipients) {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        recipients: parseInt(formData.recipients),
        scheduledTime: formData.scheduledTime,
        frequency: formData.frequency,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCampaigns([...campaigns, newCampaign]);
      setFormData({ name: '', type: 'email', recipients: '', scheduledTime: '', frequency: 'once' });
      setShowForm(false);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: Campaign['status']) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'push': return '🔔';
      case 'notification': return '📢';
      default: return '📨';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Scheduler</h1>
          <p className="text-gray-600 mt-1">Schedule and manage your notification campaigns</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weekly Newsletter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="notification">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Number of Recipients</Label>
                <Input
                  id="recipients"
                  type="number"
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="scheduledTime">Scheduled Date & Time</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCampaign} className="flex-1">Create Campaign</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No campaigns yet. Create your first campaign to get started.
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.type.toUpperCase()} Campaign</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Recipients</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {campaign.recipients.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Scheduled</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {campaign.scheduledTime}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Frequency</p>
                        <p className="font-semibold capitalize">{campaign.frequency}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'scheduled')}
                        className="gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Schedule
                      </Button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'running')}
                        className="gap-1"
                      >
                        <Play className="h-4 w-4" />
                        Send
                      </Button>
                    )}
                    {campaign.status === 'running' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                        className="gap-1"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
