/* eslint-disable no-restricted-globals */

/**
 * Service Worker for Nilocate PWA
 * Provides offline functionality for rangers in remote areas
 */

const CACHE_NAME = 'nilocate-v1';
const API_CACHE = 'nilocate-api-v1';

// Resources to cache on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(STATIC_RESOURCES).catch((err) => {
        console.error('Cache addAll error:', err);
      });
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
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful GET requests
            if (request.method === 'GET' && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if offline
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({ error: 'Offline - No cached data available' }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
    return;
  }

  // Handle static resources - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Cache new static resources
        if (response.ok && request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      });
    })
  );
});

// Background sync for offline incident reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incident-reports') {
    event.waitUntil(syncIncidentReports());
  }
});

async function syncIncidentReports() {
  try {
    const db = await openIndexedDB();
    const reports = await getAllPendingReports(db);
    
    for (const report of reports) {
      try {
        const response = await fetch('/api/incidents/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${report.token}`,
          },
          body: JSON.stringify(report.data),
        });

        if (response.ok) {
          await deletePendingReport(db, report.id);
          console.log('Synced report:', report.id);
        }
      } catch (error) {
        console.error('Failed to sync report:', report.id, error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// IndexedDB helpers for offline reports
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NilocateDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingReports')) {
        db.createObjectStore('pendingReports', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPendingReports(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingReports'], 'readonly');
    const objectStore = transaction.objectStore('pendingReports');
    const request = objectStore.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingReport(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingReports'], 'readwrite');
    const objectStore = transaction.objectStore('pendingReports');
    const request = objectStore.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Nilocate Alert';
  const options = {
    body: data.body || 'New notification from Nilocate',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'default',
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
