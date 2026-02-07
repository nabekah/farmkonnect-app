import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void;
  presets?: Array<{ label: string; days: number }>;
}

const DEFAULT_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'This Year', days: 365 },
];

export function DateRangePicker({ onDateRangeChange, presets = DEFAULT_PRESETS }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    onDateRangeChange({
      startDate: start,
      endDate: end,
    });
  };

  const handleApplyRange = () => {
    if (startDate && endDate) {
      onDateRangeChange({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange({
      startDate: null,
      endDate: null,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {startDate && endDate ? `${startDate} to ${endDate}` : 'Date Range'}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Select Date Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={
                    startDate && endDate ? 'outline' : 'ghost'
                  }
                  size="sm"
                  onClick={() => handlePresetClick(preset.days)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range */}
            <div className="space-y-2 border-t pt-4">
              <div>
                <label className="text-xs font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t pt-4">
              <Button
                size="sm"
                onClick={handleApplyRange}
                disabled={!startDate || !endDate}
                className="flex-1"
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
