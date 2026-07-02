/* Memorial day PWA Service Worker - v1 */
const CACHE_VERSION = 'memorial-day-v1';
const CACHE_NAME = CACHE_VERSION + '-' + Date.now();

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: cache core static assets
self.addEventListener('install', function(event) {
  console.log('[SW] Installing, cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function(err) {
        console.log('[SW] Cache addAll warning (may be offline):', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key.startsWith('memorial-day-') && key !== CACHE_NAME;
        }).map(function(key) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: cache-first for same-origin GET requests only
self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Only handle same-origin requests (no cross-origin)
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Skip browser-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Return cached response, update cache in background
        fetch(request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(function() {
          // Offline, keep using cache
        });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then(function(networkResponse) {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        // Cache the fresh response
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(function() {
        // Offline and not cached - return a basic fallback for navigation
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
