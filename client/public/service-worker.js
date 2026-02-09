const CACHE_NAME = 'farmkonnect-v1';
const RUNTIME_CACHE = 'farmkonnect-runtime-v1';
const OFFLINE_PAGE = '/offline.html';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - handle separately
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for failed requests
          return caches.match(OFFLINE_PAGE);
        });
    })
  );
});

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful API responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Offline - cached data not available',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle background sync for offline operations
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  try {
    const db = await openIndexedDB();
    const pendingOps = await getPendingOperations(db);

    for (const op of pendingOps) {
      try {
        const response = await fetch(op.url, {
          method: op.method,
          headers: op.headers,
          body: op.body,
        });

        if (response.ok) {
          await deletePendingOperation(db, op.id);
        }
      } catch (error) {
        console.error('Failed to sync operation:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * IndexedDB helpers for offline data storage
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FarmKonnect', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingOperations')) {
        db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingOperations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingOperations'], 'readonly');
    const store = transaction.objectStore('pendingOperations');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingOperation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingOperations'], 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FarmKonnect', options)
  );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/**
 * Message event for client communication
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE);
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }
});
