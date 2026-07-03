// Service Worker for 时刻 (Shike)
// Cache name: shike-v-final-mvp - bump this to invalidate old caches
var CACHE_NAME = 'shike-v-final-mvp';
var ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: pre-cache core assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for HTML, cache-first for other assets
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML to ensure users always get the latest version
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copy);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Cache-first for other static assets
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });
    })
  );
});
