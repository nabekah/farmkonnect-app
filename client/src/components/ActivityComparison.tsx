import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Activity {
  id: number;
  logId: string;
  activityType: string;
  title: string;
  description?: string;
  observations?: string;
  status: string;
  userId: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface ActivityComparisonProps {
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityComparison({ activities, isOpen, onClose }: ActivityComparisonProps) {
  if (activities.length === 0) return null;

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      crop_health: 'Crop Health',
      pest_monitoring: 'Pest Monitoring',
      disease_detection: 'Disease Detection',
      irrigation: 'Irrigation',
      fertilizer_application: 'Fertilizer Application',
      weed_control: 'Weed Control',
      harvest: 'Harvest',
      equipment_check: 'Equipment Check',
      soil_test: 'Soil Test',
      weather_observation: 'Weather Observation',
      general_note: 'General Note',
    };
    return labels[type] || type;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Comparison ({activities.length} activities)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm line-clamp-2">{activity.title}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">{activity.logId}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Activity Type */}
                  <div>
                    <p className="text-xs font-medium text-gray-600">Activity Type</p>
                    <Badge variant="outline" className="mt-1">
                      {getActivityTypeLabel(activity.activityType)}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-medium text-gray-600">Status</p>
                    <Badge
                      className="mt-1"
                      variant={
                        activity.status === 'reviewed'
                          ? 'default'
                          : activity.status === 'submitted'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>

                  {/* User ID */}
                  <div>
                    <p className="text-xs font-medium text-gray-600">User ID</p>
                    <p className="text-sm mt-1">{activity.userId}</p>
                  </div>

                  {/* Created Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600">Created</p>
                    <p className="text-xs text-gray-700 mt-1">{formatDate(activity.createdAt)}</p>
                  </div>

                  {/* Description */}
                  {activity.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Description</p>
                      <p className="text-xs text-gray-700 mt-1 line-clamp-3">{activity.description}</p>
                    </div>
                  )}

                  {/* Observations */}
                  {activity.observations && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Observations</p>
                      <p className="text-xs text-gray-700 mt-1 line-clamp-3">{activity.observations}</p>
                    </div>
                  )}

                  {/* GPS Location */}
                  {activity.gpsLatitude && activity.gpsLongitude && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">GPS Location</p>
                      <p className="text-xs text-gray-700 mt-1">
                        {activity.gpsLatitude.toFixed(4)}, {activity.gpsLongitude.toFixed(4)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Statistics */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Total Activities</p>
                <p className="text-lg font-bold mt-1">{activities.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reviewed</p>
                <p className="text-lg font-bold mt-1">
                  {activities.filter((a) => a.status === 'reviewed').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Submitted</p>
                <p className="text-lg font-bold mt-1">
                  {activities.filter((a) => a.status === 'submitted').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Draft</p>
                <p className="text-lg font-bold mt-1">
                  {activities.filter((a) => a.status === 'draft').length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
