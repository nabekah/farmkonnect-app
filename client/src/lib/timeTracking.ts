export interface TimeEntry {
  id: string;
  taskId: string;
  workerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  breakTime?: number; // in seconds
  notes?: string;
  status: 'running' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeTrackingStats {
  totalTime: number; // in seconds
  totalTimeFormatted: string;
  breakTime: number; // in seconds
  activeTime: number; // in seconds
  averageSessionTime: number; // in seconds
  sessionsCount: number;
}

export class TimeTracker {
  private startTime: Date | null = null;
  private pauseTime: Date | null = null;
  private totalPausedTime = 0;
  private isRunning = false;
  private isPaused = false;
  private listeners: Set<(time: number) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  start(): void {
    if (!this.isRunning) {
      this.startTime = new Date();
      this.isRunning = true;
      this.isPaused = false;
      this.totalPausedTime = 0;
      this.startTimer();
    }
  }

  pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.pauseTime = new Date();
      this.isPaused = true;
      this.stopTimer();
    }
  }

  resume(): void {
    if (this.isRunning && this.isPaused && this.pauseTime) {
      const pauseDuration = new Date().getTime() - this.pauseTime.getTime();
      this.totalPausedTime += pauseDuration;
      this.isPaused = false;
      this.pauseTime = null;
      this.startTimer();
    }
  }

  stop(): TimeEntry | null {
    if (!this.isRunning || !this.startTime) {
      return null;
    }

    this.stopTimer();
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime() - this.totalPausedTime;

    const entry: TimeEntry = {
      id: `time_${Date.now()}`,
      taskId: '',
      workerId: '',
      startTime: this.startTime,
      endTime,
      duration: Math.round(totalDuration / 1000),
      breakTime: Math.round(this.totalPausedTime / 1000),
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reset();
    return entry;
  }

  reset(): void {
    this.stopTimer();
    this.startTime = null;
    this.pauseTime = null;
    this.totalPausedTime = 0;
    this.isRunning = false;
    this.isPaused = false;
  }

  getElapsedTime(): number {
    if (!this.isRunning || !this.startTime) {
      return 0;
    }

    const now = new Date();
    const elapsed = now.getTime() - this.startTime.getTime() - this.totalPausedTime;
    return Math.round(elapsed / 1000); // Return in seconds
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  subscribe(callback: (time: number) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private startTimer(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const elapsed = this.getElapsedTime();
      this.listeners.forEach((callback) => callback(elapsed));
    }, 1000);
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isActive(): boolean {
    return this.isRunning && !this.isPaused;
  }

  getStatus(): 'idle' | 'running' | 'paused' {
    if (!this.isRunning) return 'idle';
    return this.isPaused ? 'paused' : 'running';
  }
}

// React hook for time tracking
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimeTracker() {
  const trackerRef = useRef(new TimeTracker());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  useEffect(() => {
    const tracker = trackerRef.current;
    const unsubscribe = tracker.subscribe((time) => {
      setElapsedTime(time);
    });

    return unsubscribe;
  }, []);

  const start = useCallback(() => {
    trackerRef.current.start();
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    trackerRef.current.pause();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    trackerRef.current.resume();
    setStatus('running');
  }, []);

  const stop = useCallback(() => {
    const entry = trackerRef.current.stop();
    setStatus('idle');
    setElapsedTime(0);
    return entry;
  }, []);

  const reset = useCallback(() => {
    trackerRef.current.reset();
    setStatus('idle');
    setElapsedTime(0);
  }, []);

  return {
    elapsedTime,
    status,
    formattedTime: trackerRef.current.formatTime(elapsedTime),
    start,
    pause,
    resume,
    stop,
    reset,
    isActive: status === 'running',
  };
}

// Calculate time tracking statistics
export function calculateTimeStats(entries: TimeEntry[]): TimeTrackingStats {
  const totalTime = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const breakTime = entries.reduce((sum, entry) => sum + (entry.breakTime || 0), 0);
  const activeTime = totalTime - breakTime;
  const sessionsCount = entries.length;
  const averageSessionTime = sessionsCount > 0 ? Math.round(totalTime / sessionsCount) : 0;

  return {
    totalTime,
    totalTimeFormatted: formatTimeSeconds(totalTime),
    breakTime,
    activeTime,
    averageSessionTime,
    sessionsCount,
  };
}

export function formatTimeSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
