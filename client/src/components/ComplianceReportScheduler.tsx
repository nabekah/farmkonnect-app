import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Mail, Plus, Trash2, Edit2 } from "lucide-react";

interface ReportSchedule {
  id: number;
  reportType: string;
  frequency: string;
  recipients: string[];
  hour: number;
  minute: number;
  isActive: boolean;
  nextRunAt: string;
  lastRunAt: string;
}

interface ComplianceReportSchedulerProps {
  farmId: string;
}

export const ComplianceReportScheduler: React.FC<ComplianceReportSchedulerProps> = ({ farmId }) => {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([
    {
      id: 1,
      reportType: "ISO 27001 Compliance",
      frequency: "weekly",
      recipients: ["admin@farm.com"],
      hour: 9,
      minute: 0,
      isActive: true,
      nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastRunAt: new Date().toISOString()
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reportType: "ISO 27001 Compliance",
    frequency: "weekly",
    recipients: "",
    hour: 9,
    minute: 0
  });

  const handleAddSchedule = () => {
    const newSchedule: ReportSchedule = {
      id: Math.max(...schedules.map(s => s.id), 0) + 1,
      reportType: formData.reportType,
      frequency: formData.frequency,
      recipients: formData.recipients.split(",").map(r => r.trim()),
      hour: formData.hour,
      minute: formData.minute,
      isActive: true,
      nextRunAt: new Date().toISOString(),
      lastRunAt: new Date().toISOString()
    };
    setSchedules([...schedules, newSchedule]);
    setFormData({
      reportType: "ISO 27001 Compliance",
      frequency: "weekly",
      recipients: "",
      hour: 9,
      minute: 0
    });
    setShowForm(false);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly"
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance Report Scheduling</CardTitle>
              <CardDescription>Automate ISO 27001 compliance report delivery</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Type</Label>
                  <Select value={formData.reportType} onValueChange={(value) => setFormData({...formData, reportType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISO 27001 Compliance">ISO 27001 Compliance</SelectItem>
                      <SelectItem value="Security Audit">Security Audit</SelectItem>
                      <SelectItem value="Access Report">Access Report</SelectItem>
                      <SelectItem value="Incident Summary">Incident Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hour</Label>
                  <Input type="number" min="0" max="23" value={formData.hour} onChange={(e) => setFormData({...formData, hour: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Minute</Label>
                  <Input type="number" min="0" max="59" value={formData.minute} onChange={(e) => setFormData({...formData, minute: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Recipients (comma-separated emails)</Label>
                <Input placeholder="admin@farm.com, manager@farm.com" value={formData.recipients} onChange={(e) => setFormData({...formData, recipients: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSchedule}>Save Schedule</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{schedule.reportType}</h3>
                    <Badge variant={schedule.isActive ? "default" : "secondary"}>
                      {schedule.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{getFrequencyLabel(schedule.frequency)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {String(schedule.hour).padStart(2, "0")}:{String(schedule.minute).padStart(2, "0")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Next: {new Date(schedule.nextRunAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteSchedule(schedule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
