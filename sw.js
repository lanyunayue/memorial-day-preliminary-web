// Service Worker for 时刻 (Shike) - v0.4.0 Root Fix
// Strategy: network-first for HTML to ensure root always gets latest; cache-first for static assets
var CACHE_NAME = 'shike-teacher-accept-v12';
var ALWAYS_NETWORK_FIRST = ['./', './index.html', './?'];

self.addEventListener('install', function(event) {
  // Force the waiting service worker to become the active service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      // Delete ALL old caches (any cache that doesn't match current CACHE_NAME)
      return Promise.all(keys.filter(function(k) {
        return k !== CACHE_NAME;
      }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // For HTML navigation requests (including root /), use network-first to always get latest
  if (req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req).then(function(networkRes) {
        if (networkRes && networkRes.status === 200) {
          var clone = networkRes.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, clone);
          });
        }
        return networkRes;
      }).catch(function() {
        return caches.match(req).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // For other assets (JS/CSS inlined in HTML, manifest, etc.), use cache-first with network fallback
  event.respondWith(
    caches.match(req).then(function(cached) {
      if (cached) return cached;
      return fetch(req).then(function(networkRes) {
        if (networkRes && networkRes.status === 200) {
          var clone = networkRes.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, clone);
          });
        }
        return networkRes;
      }).catch(function() {
        return cached;
      });
    })
  );
});
