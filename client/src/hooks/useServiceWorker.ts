import { useEffect, useState } from 'react';

/**
 * Hook for registering and managing service worker
 */
export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);

      // Register service worker
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((reg) => {
          console.log('Service Worker registered:', reg);
          setRegistration(reg);
          setIsRegistered(true);

          // Check for updates periodically
          setInterval(() => {
            reg.update();
          }, 60000); // Check every minute

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          setIsRegistered(false);
        });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const clearCache = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  const cacheUrls = (urls: string[]) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
    }
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    updateServiceWorker,
    clearCache,
    cacheUrls,
  };
};

/**
 * Hook for managing push notifications
 */
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);

      // Check current subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  const subscribe = async (vapidPublicKey: string) => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(subscription);
      setIsSubscribed(true);

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);

      // Notify server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
  };
};

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Hook for detecting online/offline status with service worker support
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook for background sync
 */
export const useBackgroundSync = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      setIsSupported(true);
    }
  }, []);

  const requestSync = async (tag: string) => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  };

  return {
    isSupported,
    requestSync,
  };
};
