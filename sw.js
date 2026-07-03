// Service Worker for 时刻 (Shike) - Ultimate Real Product v3
// Network-first strategy to prevent stale cache issues
var CACHE_NAME = 'shike-ultimate-real-product-v3';
var ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: pre-cache core assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(){});
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch: network-first for all requests
self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // Network-first strategy
  event.respondWith(
    fetch(req, { cache: 'no-store' }).then(function(response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(req, copy).catch(function(){});
        });
      }
      return response;
    }).catch(function() {
      return caches.match(req).then(function(cached) {
        if (cached) return cached;
        return caches.match('./index.html');
      });
    })
  );
});
