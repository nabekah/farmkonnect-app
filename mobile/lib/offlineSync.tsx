import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

interface SyncItem {
  id: string;
  action: "create" | "update" | "delete";
  resource: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineSyncContextType {
  isOnline: boolean;
  syncQueue: SyncItem[];
  addToQueue: (item: Omit<SyncItem, "id" | "timestamp" | "synced">) => Promise<void>;
  syncData: () => Promise<void>;
  clearQueue: () => Promise<void>;
  isSyncing: boolean;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load sync queue from storage on mount
  useEffect(() => {
    loadSyncQueue();
  }, []);

  const loadSyncQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem("syncQueue");
      if (stored) {
        setSyncQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  };

  const saveSyncQueue = async (queue: SyncItem[]) => {
    try {
      await AsyncStorage.setItem("syncQueue", JSON.stringify(queue));
      setSyncQueue(queue);
    } catch (error) {
      console.error("Error saving sync queue:", error);
    }
  };

  const addToQueue = async (item: Omit<SyncItem, "id" | "timestamp" | "synced">) => {
    const newItem: SyncItem = {
      ...item,
      id: `${item.resource}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      synced: false,
    };

    const updatedQueue = [...syncQueue, newItem];
    await saveSyncQueue(updatedQueue);

    // Try to sync immediately if online
    if (isOnline) {
      await syncData();
    }
  };

  const syncData = async () => {
    if (isSyncing || !isOnline || syncQueue.length === 0) {
      return;
    }

    setIsSyncing(true);
    try {
      const unsynced = syncQueue.filter((item) => !item.synced);

      for (const item of unsynced) {
        try {
          // In a real app, you would call your API here
          // await api.sync(item);

          // Mark as synced
          item.synced = true;
        } catch (error) {
          console.error(`Error syncing ${item.resource}:`, error);
          // Keep in queue for retry
        }
      }

      // Remove synced items
      const remaining = syncQueue.filter((item) => !item.synced);
      await saveSyncQueue(remaining);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearQueue = async () => {
    await saveSyncQueue([]);
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        syncQueue,
        addToQueue,
        syncData,
        clearQueue,
        isSyncing,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  }
  return context;
};

// Hook for managing offline-first data
export const useOfflineData = <T,>(
  key: string,
  fetchFn: () => Promise<T>,
  defaultValue: T
) => {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (isOnline) {
        // Fetch from server
        const result = await fetchFn();
        setData(result);

        // Cache locally
        await AsyncStorage.setItem(key, JSON.stringify(result));
      } else {
        // Load from cache
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          setData(JSON.parse(cached));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));

      // Try to load from cache on error
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          setData(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.error("Error loading from cache:", cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await loadData();
  };

  return { data, isLoading, error, refresh, isOnline };
};

// Hook for managing offline-first mutations
export const useOfflineMutation = (resource: string) => {
  const { addToQueue, isOnline } = useOfflineSync();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (
    action: "create" | "update" | "delete",
    data: any
  ) => {
    try {
      setIsLoading(true);

      if (isOnline) {
        // Perform mutation on server immediately
        // In a real app: await api.mutate(resource, action, data);
      }

      // Add to sync queue
      await addToQueue({
        action,
        resource,
        data,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in mutation:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
};

// Enhanced caching for tasks, shifts, workers, notifications
const CACHE_KEYS = {
  TASKS: "farmkonnect_cached_tasks",
  SHIFTS: "farmkonnect_cached_shifts",
  WORKERS: "farmkonnect_cached_workers",
  NOTIFICATIONS: "farmkonnect_cached_notifications",
  LAST_SYNC: "farmkonnect_last_sync_time",
};

// Cache task data
export const cacheTask = async (task: any) => {
  try {
    const tasks = await AsyncStorage.getItem(CACHE_KEYS.TASKS);
    const taskList = tasks ? JSON.parse(tasks) : [];
    const index = taskList.findIndex((t: any) => t.id === task.id);
    if (index >= 0) {
      taskList[index] = { ...taskList[index], ...task, cachedAt: Date.now() };
    } else {
      taskList.push({ ...task, cachedAt: Date.now() });
    }
    await AsyncStorage.setItem(CACHE_KEYS.TASKS, JSON.stringify(taskList));
    console.log("[OfflineSync] Task cached:", task.id);
  } catch (error) {
    console.error("[OfflineSync] Error caching task:", error);
  }
};

// Cache shift data
export const cacheShift = async (shift: any) => {
  try {
    const shifts = await AsyncStorage.getItem(CACHE_KEYS.SHIFTS);
    const shiftList = shifts ? JSON.parse(shifts) : [];
    const index = shiftList.findIndex((s: any) => s.id === shift.id);
    if (index >= 0) {
      shiftList[index] = { ...shiftList[index], ...shift, cachedAt: Date.now() };
    } else {
      shiftList.push({ ...shift, cachedAt: Date.now() });
    }
    await AsyncStorage.setItem(CACHE_KEYS.SHIFTS, JSON.stringify(shiftList));
    console.log("[OfflineSync] Shift cached:", shift.id);
  } catch (error) {
    console.error("[OfflineSync] Error caching shift:", error);
  }
};

// Cache worker data
export const cacheWorker = async (worker: any) => {
  try {
    const workers = await AsyncStorage.getItem(CACHE_KEYS.WORKERS);
    const workerList = workers ? JSON.parse(workers) : [];
    const index = workerList.findIndex((w: any) => w.id === worker.id);
    if (index >= 0) {
      workerList[index] = { ...workerList[index], ...worker, cachedAt: Date.now() };
    } else {
      workerList.push({ ...worker, cachedAt: Date.now() });
    }
    await AsyncStorage.setItem(CACHE_KEYS.WORKERS, JSON.stringify(workerList));
    console.log("[OfflineSync] Worker cached:", worker.id);
  } catch (error) {
    console.error("[OfflineSync] Error caching worker:", error);
  }
};

// Cache notification data
export const cacheNotification = async (notification: any) => {
  try {
    const notifications = await AsyncStorage.getItem(CACHE_KEYS.NOTIFICATIONS);
    const notificationList = notifications ? JSON.parse(notifications) : [];
    notificationList.unshift({ ...notification, cachedAt: Date.now() });
    // Keep only last 100 notifications
    if (notificationList.length > 100) {
      notificationList.pop();
    }
    await AsyncStorage.setItem(CACHE_KEYS.NOTIFICATIONS, JSON.stringify(notificationList));
    console.log("[OfflineSync] Notification cached");
  } catch (error) {
    console.error("[OfflineSync] Error caching notification:", error);
  }
};

// Get cached tasks
export const getCachedTasks = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[OfflineSync] Error getting cached tasks:", error);
    return [];
  }
};

// Get cached shifts
export const getCachedShifts = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.SHIFTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[OfflineSync] Error getting cached shifts:", error);
    return [];
  }
};

// Get cached workers
export const getCachedWorkers = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.WORKERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[OfflineSync] Error getting cached workers:", error);
    return [];
  }
};

// Get cached notifications
export const getCachedNotifications = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[OfflineSync] Error getting cached notifications:", error);
    return [];
  }
};

// Hook to use cached tasks
export const useCachedTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    loadCachedTasks();
  }, [isOnline]);

  const loadCachedTasks = async () => {
    const cachedTasks = await getCachedTasks();
    setTasks(cachedTasks);
  };

  return { tasks, setTasks, loadCachedTasks };
};

// Hook to use cached shifts
export const useCachedShifts = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    loadCachedShifts();
  }, [isOnline]);

  const loadCachedShifts = async () => {
    const cachedShifts = await getCachedShifts();
    setShifts(cachedShifts);
  };

  return { shifts, setShifts, loadCachedShifts };
};

// Hook to use cached workers
export const useCachedWorkers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    loadCachedWorkers();
  }, [isOnline]);

  const loadCachedWorkers = async () => {
    const cachedWorkers = await getCachedWorkers();
    setWorkers(cachedWorkers);
  };

  return { workers, setWorkers, loadCachedWorkers };
};

// Hook to use cached notifications
export const useCachedNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    loadCachedNotifications();
  }, [isOnline]);

  const loadCachedNotifications = async () => {
    const cachedNotifications = await getCachedNotifications();
    setNotifications(cachedNotifications);
  };

  return { notifications, setNotifications, loadCachedNotifications };
};
