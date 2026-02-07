import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    activityType?: string;
    status?: string;
    dateRange?: { start: Date; end: Date };
  };
}

interface FilterPresetsProps {
  presets: FilterPreset[];
  onPresetSelect: (preset: FilterPreset) => void;
  onPresetSave: (preset: FilterPreset) => void;
  onPresetDelete: (presetId: string) => void;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'pending-approval',
    name: 'Pending Approval',
    filters: { status: 'submitted' },
  },
  {
    id: 'this-week',
    name: 'This Week',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    },
  },
  {
    id: 'pest-monitoring',
    name: 'Pest Monitoring',
    filters: { activityType: 'pest_monitoring' },
  },
  {
    id: 'crop-health',
    name: 'Crop Health',
    filters: { activityType: 'crop_health' },
  },
  {
    id: 'draft-activities',
    name: 'Draft Activities',
    filters: { status: 'draft' },
  },
];

export function FilterPresets({
  presets = DEFAULT_PRESETS,
  onPresetSelect,
  onPresetSave,
  onPresetDelete,
}: FilterPresetsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleCreatePreset = () => {
    if (newPresetName.trim()) {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name: newPresetName,
        filters: {
          ...(selectedActivityType && { activityType: selectedActivityType }),
          ...(selectedStatus && { status: selectedStatus }),
        },
      };

      onPresetSave(newPreset);
      setNewPresetName('');
      setSelectedActivityType('');
      setSelectedStatus('');
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Filter Presets</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create New Preset */}
        {isCreating && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
            <Input
              placeholder="Preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="text-sm"
            />
            <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Activity Type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crop_health">Crop Health</SelectItem>
                <SelectItem value="pest_monitoring">Pest Monitoring</SelectItem>
                <SelectItem value="disease_detection">Disease Detection</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
                <SelectItem value="fertilizer_application">Fertilizer Application</SelectItem>
                <SelectItem value="weed_control">Weed Control</SelectItem>
                <SelectItem value="harvest">Harvest</SelectItem>
                <SelectItem value="equipment_check">Equipment Check</SelectItem>
                <SelectItem value="soil_test">Soil Test</SelectItem>
                <SelectItem value="weather_observation">Weather Observation</SelectItem>
                <SelectItem value="general_note">General Note</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Status (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreatePreset}
                disabled={!newPresetName.trim()}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Preset List */}
        <div className="space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPresetSelect(preset)}
                  className="justify-start w-full text-sm font-medium"
                >
                  {preset.name}
                </Button>
                <div className="flex gap-1 mt-1 ml-2">
                  {preset.filters.activityType && (
                    <Badge variant="secondary" className="text-xs">
                      {preset.filters.activityType}
                    </Badge>
                  )}
                  {preset.filters.status && (
                    <Badge variant="secondary" className="text-xs">
                      {preset.filters.status}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPresetDelete(preset.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
