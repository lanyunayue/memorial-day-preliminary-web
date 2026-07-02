/* Memorial day PWA Service Worker - v4.0 */
const CACHE_VERSION = 'memorial-day-preliminary-v4-0';
const CACHE_NAME = CACHE_VERSION;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
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
  console.log('[SW] Activating, claiming clients');
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

// Fetch strategy - network-first for HTML (navigate), cache-first with network update for others
self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.protocol.startsWith('http')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, copy);
          });
          return networkResponse;
        }
        return caches.match(request).then(function(cached) {
          return cached || networkResponse;
        });
      }).catch(function() {
        return caches.match(request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      var fetchPromise = fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, copy);
          });
        }
        return networkResponse;
      }).catch(function() {
        return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
