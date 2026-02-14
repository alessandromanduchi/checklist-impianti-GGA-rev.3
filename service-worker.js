const CACHE_NAME = 'nichesafe-v1.0.0';
const BASE_PATH = '/checklist-impianti-GGA-rev.2';

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/styles.css',
  BASE_PATH + '/app.js',
  BASE_PATH + '/niches-data.js',
  BASE_PATH + '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Cache installation failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});

// Background sync for sending data when back online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

async function syncReports() {
  // This function can be implemented to sync reports when back online
  console.log('Syncing reports...');
  // Implementation depends on backend API
}
