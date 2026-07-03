// Service Worker for 时刻 (Shike) - Real Product v2
// Cache name: shike-real-product-v2 - bump to invalidate old caches
var CACHE_NAME = 'shike-real-product-v2';
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

// Activate: clean all old caches
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

// Fetch: network-first for HTML (ensure updates), cache-first for other assets
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML navigation - always try network first to get latest version
  if (event.request.mode === 'navigate' || event.request.destination === 'document' ||
      event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then(function(response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Network-first for manifest.json and sw.js too
  if (event.request.url.endsWith('manifest.json') || event.request.url.endsWith('sw.js')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then(function(response) {
        if (response && response.status === 200) {
          var copy2 = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy2);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
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
          var copy3 = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy3);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });
    })
  );
});
