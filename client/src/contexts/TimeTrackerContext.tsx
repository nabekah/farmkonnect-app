import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface PersistentTimeEntry {
  id: string;
  taskId: string;
  workerId: string;
  startTime: number; // timestamp in ms
  pausedTime: number; // total paused time in ms
  isPaused: boolean;
  pausedAt?: number; // timestamp when paused
  createdAt: number;
}

interface TimeTrackerContextType {
  activeEntry: PersistentTimeEntry | null;
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
  startTracking: (taskId: string, workerId: string) => string;
  pauseTracking: () => void;
  resumeTracking: () => void;
  stopTracking: () => PersistentTimeEntry | null;
  getFormattedTime: (seconds: number) => string;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

const STORAGE_KEY = 'farmkonnect_active_time_entry';

/**
 * Persistent time tracker that survives page navigation
 * Uses localStorage to persist timer state across page reloads
 */
export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const [activeEntry, setActiveEntry] = useState<PersistentTimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted timer on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const entry = JSON.parse(stored) as PersistentTimeEntry;
        setActiveEntry(entry);
        setIsRunning(!entry.isPaused);
        setIsPaused(entry.isPaused);
      } catch (error) {
        console.error('Failed to load time entry:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!activeEntry || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = now - activeEntry.startTime - activeEntry.pausedTime;
      setElapsedTime(Math.round(elapsed / 1000));
    };

    updateElapsedTime();

    intervalRef.current = setInterval(updateElapsedTime, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeEntry, isPaused]);

  // Persist entry to localStorage whenever it changes
  useEffect(() => {
    if (activeEntry) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeEntry));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeEntry]);

  const startTracking = useCallback((taskId: string, workerId: string) => {
    const entryId = `time_${Date.now()}`;
    const newEntry: PersistentTimeEntry = {
      id: entryId,
      taskId,
      workerId,
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false,
      createdAt: Date.now(),
    };

    setActiveEntry(newEntry);
    setIsRunning(true);
    setIsPaused(false);
    setElapsedTime(0);

    return entryId;
  }, []);

  const pauseTracking = useCallback(() => {
    if (!activeEntry || isPaused) return;

    const updatedEntry: PersistentTimeEntry = {
      ...activeEntry,
      isPaused: true,
      pausedAt: Date.now(),
    };

    setActiveEntry(updatedEntry);
    setIsPaused(true);
    setIsRunning(false);
  }, [activeEntry, isPaused]);

  const resumeTracking = useCallback(() => {
    if (!activeEntry || !isPaused || !activeEntry.pausedAt) return;

    const pauseDuration = Date.now() - activeEntry.pausedAt;
    const updatedEntry: PersistentTimeEntry = {
      ...activeEntry,
      pausedTime: activeEntry.pausedTime + pauseDuration,
      isPaused: false,
      pausedAt: undefined,
    };

    setActiveEntry(updatedEntry);
    setIsPaused(false);
    setIsRunning(true);
  }, [activeEntry, isPaused]);

  const stopTracking = useCallback(() => {
    if (!activeEntry) return null;

    const result = { ...activeEntry };
    setActiveEntry(null);
    setIsRunning(false);
    setIsPaused(false);
    setElapsedTime(0);

    return result;
  }, [activeEntry]);

  const getFormattedTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  const value: TimeTrackerContextType = {
    activeEntry,
    elapsedTime,
    isRunning,
    isPaused,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    getFormattedTime,
  };

  return (
    <TimeTrackerContext.Provider value={value}>
      {children}
    </TimeTrackerContext.Provider>
  );
}

export function useTimeTrackerContext() {
  const context = useContext(TimeTrackerContext);
  if (!context) {
    throw new Error('useTimeTrackerContext must be used within TimeTrackerProvider');
  }
  return context;
}
