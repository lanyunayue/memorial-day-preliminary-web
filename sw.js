// Service Worker for 时刻 (Shike) - v0.7.2
var CACHE_NAME = 'shike-v072-v23';
self.addEventListener('install', function(event){self.skipWaiting();});
self.addEventListener('message',function(event){if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',function(event){event.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function isHtmlOrNav(req){if(req.mode==='navigate')return true;var a=req.headers.get('accept');return a&&a.indexOf('text/html')!==-1;}
function isSwJs(url){return url.pathname.endsWith('/sw.js');}
self.addEventListener('fetch',function(event){
  var req=event.request;if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(isHtmlOrNav(req)||isSwJs(url)){
    event.respondWith(fetch(req,{cache:'no-store'}).then(function(r){if(r&&r.status===200){var c=r.clone();caches.open(CACHE_NAME).then(function(cache){cache.put(req,c);});}return r;}).catch(function(){return caches.match(req).then(function(cached){return cached||caches.match('./index.html');});}));
    return;
  }
  event.respondWith(caches.match(req).then(function(cached){if(cached)return cached;return fetch(req).then(function(r){if(r&&r.status===200){var c=r.clone();caches.open(CACHE_NAME).then(function(cache){cache.put(req,c);});}return r;}).catch(function(){return cached;});}));
});
