// Service Worker for 时刻 (Shike) - v1.5.0
var CACHE_NAME = 'shike-v200rc51-v61';
var PRECACHE_URLS = [
  './','./index.html','./manifest.json','./assets/styles/app.css','./src/config/release-notes.js',
  './src/config/version.js','./src/config/constants.js','./src/utilities/sanitize.js','./src/utilities/ids.js','./src/storage/legacy-storage.js','./src/storage/data-integrity.js','./src/storage/indexeddb-storage.js','./src/storage/local-first-bridge.js','./src/legacy-app.js','./src/app.js',
  './src/core/event-bus.js','./src/core/state.js','./src/core/errors.js','./src/core/router.js',
  './src/storage/repository.js','./src/storage/migrations.js','./src/storage/backup.js',
  './src/records/record-service.js','./src/records/record-normalizer.js','./src/records/dedupe.js','./src/records/recurrence.js',
  './src/parser/parser-adapter.js','./src/calendar/calendar-service.js','./src/calendar/ics-export.js',
  './src/views/view-registry.js','./src/components/legacy-components.js','./src/i18n/index.js',
  './src/utilities/dates.js','./src/utilities/clipboard.js','./src/utilities/downloads.js',
  './src/composer/composer-state.js','./src/composer/composer-controller.js','./src/composer/composer-classifier.js','./src/composer/composer-view.js',
  './src/permissions/permission-center.js','./src/permissions/notification-permission.js','./src/permissions/microphone-permission.js','./src/permissions/storage-permission.js','./src/permissions/pwa-install-state.js',
  './src/storage/trash-repository.js','./src/commands/command-bus.js','./src/commands/undo-manager.js','./src/storage/snapshot-service.js','./src/storage/encrypted-backup.js','./src/safety/dangerous-actions.js','./src/safety/storage-persistence.js',
  './src/reminders/reminder-engine.js','./src/reminders/reminder-repository.js','./src/reminders/reminder-scheduler.js','./src/reminders/reminder-status.js','./src/reminders/calendar-bridge.js','./src/reminders/reminder-diagnostics.js',
  './src/sync/device-identity.js','./src/sync/crypto-envelope.js','./src/sync/sync-client.js','./src/sync/sync-conflict.js','./src/sync/sync-status.js','./src/sync/sync-quarantine-migration.js','./src/analytics/analytics-core.js','./src/analytics/local-analytics.js','./src/analytics/consent.js','./src/analytics/event-schema.js',
  './src/assistant/sprite-create-intent.js','./src/assistant/bear-state-machine.js','./src/assistant/sprite-customization.js','./src/assistant/sprite-renderer-2d.js','./src/assistant/sprite-renderer-3d.js','./src/assistant/sprite-audio.js','./src/agent/namespace.js','./src/agent/safety-policy.js','./src/agent/confirmation-policy.js','./src/agent/intent-router.js','./src/agent/context-builder.js',
  './src/retrieval/query-classifier.js','./src/retrieval/provider-registry.js','./src/retrieval/result-normalizer.js','./src/retrieval/result-ranker.js','./src/retrieval/extractive-summarizer.js','./src/retrieval/source-cache.js','./src/retrieval/search-fallback.js','./src/retrieval/browser-ai.js','./src/retrieval/providers/wikipedia.js','./src/retrieval/providers/wikidata.js','./src/retrieval/providers/github.js','./src/retrieval/providers/stackexchange.js','./src/retrieval/providers/open-meteo.js','./src/retrieval/retrieval-engine.js',
  './src/agent/proactive-task-detector.js','./src/agent/session-context.js','./src/agent/tool-registry.js','./src/agent/tools/tool-definitions.js','./src/agent/planner.js','./src/agent/executor.js','./src/agent/conversation-repository.js','./src/agent/result-formatter.js','./src/agent/agent-core.js','./src/agent/ui.js','./src/watch/watch-storage.js','./src/watch/watch-center.js'
];
self.addEventListener('install', function(event){event.waitUntil(caches.open(CACHE_NAME).then(function(cache){return cache.addAll(PRECACHE_URLS);}).then(function(){return self.skipWaiting();}));});
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
