import { useTimeTrackerContext } from '@/contexts/TimeTrackerContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Time tracker widget for navigation bar
 * Shows active timer with pause/resume/stop controls
 */
export function TimeTrackerWidget() {
  const { activeEntry, startTracking, pauseTracking, resumeTracking, stopTracking } = useTimeTrackerContext();
  const [displayTime, setDisplayTime] = useState('00:00:00');

  useEffect(() => {
    if (!activeEntry) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - activeEntry.startTime - activeEntry.pausedTime;
      const seconds = Math.floor((elapsed / 1000) % 60);
      const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
      const hours = Math.floor(elapsed / (1000 * 60 * 60));

      setDisplayTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  if (!activeEntry) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => startTracking('task-1', 'worker-1')}
      >
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">Start Timer</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
      <span className="font-mono text-sm font-semibold text-blue-900">{displayTime}</span>
      <div className="flex gap-1">
        {activeEntry.isPaused ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => resumeTracking()}
            title="Resume timer"
          >
            <Play className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => pauseTracking()}
            title="Pause timer"
          >
            <Pause className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          onClick={() => stopTracking()}
          title="Stop timer"
        >
          <Square className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
