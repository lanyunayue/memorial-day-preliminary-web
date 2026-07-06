// Service Worker for 时刻 (Shike) - v0.6.0 Force-Update
// Strategy: network-first for HTML + sw.js itself; cache-first for other assets
// Aggressively cleans up old caches; responds to SKIP_WAITING for immediate activation
var CACHE_NAME = 'shike-v060-v19';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) {
        return k !== CACHE_NAME;
      }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

function isHtmlOrNav(req) {
  if (req.mode === 'navigate') return true;
  var accept = req.headers.get('accept');
  if (accept && accept.indexOf('text/html') !== -1) return true;
  return false;
}

function isSwJs(url) {
  return url.pathname.endsWith('/sw.js') || url.pathname.endsWith('sw.js');
}

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // Network-first for HTML navigation AND sw.js itself (critical for updates)
  if (isHtmlOrNav(req) || isSwJs(url)) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then(function(networkRes) {
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

  // Cache-first for other assets
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
