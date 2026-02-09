import { useEffect, useState } from 'react';

/**
 * Hook for optimizing UI for field workers on mobile devices
 * Provides utilities for touch-friendly interfaces, offline support, and quick actions
 */
export const useMobileFieldWorker = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerHeight < window.innerWidth);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isOnline,
    isMobile,
    isLandscape,
    isFieldWorkerMode: isMobile && !isLandscape,
  };
};

/**
 * Hook for managing offline data sync
 * Stores operations locally and syncs when connection is restored
 */
export const useOfflineSync = () => {
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addPendingOperation = (operation: any) => {
    const stored = localStorage.getItem('pendingOperations');
    const operations = stored ? JSON.parse(stored) : [];
    operations.push({
      ...operation,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('pendingOperations', JSON.stringify(operations));
    setPendingOperations(operations);
  };

  const syncPendingOperations = async (syncFn: (ops: any[]) => Promise<void>) => {
    const stored = localStorage.getItem('pendingOperations');
    const operations = stored ? JSON.parse(stored) : [];

    if (operations.length === 0) return;

    setIsSyncing(true);
    try {
      await syncFn(operations);
      localStorage.removeItem('pendingOperations');
      setPendingOperations([]);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearPendingOperations = () => {
    localStorage.removeItem('pendingOperations');
    setPendingOperations([]);
  };

  return {
    pendingOperations,
    isSyncing,
    addPendingOperation,
    syncPendingOperations,
    clearPendingOperations,
  };
};

/**
 * Hook for voice input support
 * Enables hands-free data entry for field workers
 */
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsBrowserSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      let interim_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(transcript);
        } else {
          interim_transcript += transcript;
        }
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.abort();
    }
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    isBrowserSupported,
    startListening,
    stopListening,
    setTranscript,
  };
};

/**
 * Hook for quick action shortcuts
 * Provides common task shortcuts for field workers
 */
export const useQuickActions = () => {
  const [recentActions, setRecentActions] = useState<any[]>([]);

  const addQuickAction = (action: {
    id: string;
    label: string;
    icon: string;
    handler: () => void;
  }) => {
    setRecentActions((prev) => {
      const filtered = prev.filter((a) => a.id !== action.id);
      return [action, ...filtered].slice(0, 6);
    });
  };

  const getQuickActions = () => {
    return recentActions;
  };

  return {
    recentActions,
    addQuickAction,
    getQuickActions,
  };
};
