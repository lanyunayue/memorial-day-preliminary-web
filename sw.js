// Service Worker for 时刻 (Shike) - v1.5.0
var CACHE_NAME = 'shike-v220alpha31-v64';
var PRECACHE_URLS = [
  './','./index.html','./manifest.json','./assets/styles/app.css','./assets/styles/chronos.css','./src/config/release-notes.js',
  './src/config/version.js','./src/config/constants.js','./src/utilities/sanitize.js','./src/utilities/ids.js','./src/storage/legacy-storage.js','./src/storage/data-integrity.js','./src/storage/indexeddb-storage.js','./src/storage/local-first-bridge.js','./src/legacy-app.js','./src/app.js',
  './src/core/event-bus.js','./src/core/state.js','./src/core/errors.js','./src/core/router.js',
  './src/storage/repository.js','./src/storage/migrations.js','./src/storage/backup.js',
  './src/records/record-service.js','./src/records/record-normalizer.js','./src/records/dedupe.js','./src/records/recurrence.js',
  './src/parser/parser-adapter.js','./src/calendar/calendar-service.js','./src/calendar/ics-export.js',
  './src/intelligence/temporal-domain.js','./src/intelligence/temporal-validator.js','./src/intelligence/temporal-normalizer.js',
  './src/intelligence/multi-intent-segmenter.js','./src/intelligence/negation-detector.js','./src/intelligence/condition-detector.js',
  './src/intelligence/commitment-detector.js','./src/intelligence/waiting-for-detector.js','./src/intelligence/goal-detector.js',
  './src/intelligence/anniversary-detector.js','./src/intelligence/habit-detector.js','./src/intelligence/confidence-model.js','./src/intelligence/explanation-builder.js',
  './src/intelligence/intelligence-controller.js','./src/intelligence/temporal-repository.js','./src/intelligence/waiting-for-engine.js','./src/intelligence/waiting-for-repository.js',
  './src/intelligence/next-action-engine.js','./src/intelligence/conflict-engine.js','./src/intelligence/temporal-web-controller.js',
  './src/intelligence/daily-brief.js','./src/intelligence/weekly-review.js','./src/intelligence/correction-store.js','./src/intelligence/adaptation-rule-store.js','./src/intelligence/adaptation-engine.js','./src/intelligence/temporal-memory.js',
  './src/intelligence/transactions/temporal-operation.js','./src/intelligence/transactions/operation-journal.js','./src/intelligence/transactions/operation-lock.js','./src/intelligence/transactions/multi-tab-coordinator.js','./src/intelligence/transactions/operation-coordinator.js','./src/intelligence/transactions/operation-recovery.js','./src/intelligence/transactions/consistency-auditor.js','./src/intelligence/testing/fault-injection.js',
  './src/intelligence/adapters/legacy-record-adapter.js','./src/intelligence/adapters/backup-adapter.js',
  './src/intelligence/ui/life-inbox-preview.js','./src/intelligence/ui/next-action-card.js','./src/intelligence/ui/review-panel.js',
  './src/research/participant-consent.js','./src/research/research-session.js','./src/research/local-event-log.js','./src/research/validation-metrics.js','./src/research/feedback-exporter.js','./src/research/research-data-viewer.js','./src/research/research-data-cleaner.js','./src/research/product-validation-mode.js',
  './src/graph/graph-domain.js','./src/graph/graph-builder.js','./src/graph/graph-integrity.js','./src/graph/graph-migration.js','./src/graph/graph-serializer.js','./src/graph/graph-repository.js',
  './src/views/view-registry.js','./src/components/legacy-components.js','./src/i18n/index.js',
  './src/utilities/dates.js','./src/utilities/clipboard.js','./src/utilities/downloads.js',
  './src/composer/composer-state.js','./src/composer/composer-controller.js','./src/composer/composer-classifier.js','./src/composer/composer-view.js',
  './src/permissions/permission-center.js','./src/permissions/notification-permission.js','./src/permissions/microphone-permission.js','./src/permissions/storage-permission.js','./src/permissions/pwa-install-state.js',
  './src/storage/trash-repository.js','./src/commands/command-bus.js','./src/commands/undo-manager.js','./src/storage/snapshot-service.js','./src/storage/encrypted-backup.js','./src/safety/dangerous-actions.js','./src/safety/storage-persistence.js',
  './src/reminders/reminder-engine.js','./src/reminders/reminder-repository.js','./src/reminders/reminder-scheduler.js','./src/reminders/reminder-status.js','./src/reminders/calendar-bridge.js','./src/reminders/reminder-diagnostics.js',
  './src/sync/device-identity.js','./src/sync/crypto-envelope.js','./src/sync/sync-client.js','./src/sync/sync-conflict.js','./src/sync/sync-status.js','./src/sync/sync-quarantine-migration.js','./src/analytics/analytics-core.js','./src/analytics/local-analytics.js','./src/analytics/consent.js','./src/analytics/event-schema.js',
  './src/assistant/sprite-create-intent.js','./src/assistant/bear-state-machine.js','./src/assistant/sprite-customization.js','./src/assistant/sprite-renderer-2d.js','./src/assistant/sprite-renderer-3d.js','./src/assistant/sprite-audio.js','./src/agent/namespace.js','./src/agent/safety-policy.js','./src/agent/confirmation-policy.js','./src/agent/intent-router.js','./src/agent/context-builder.js',
  './src/retrieval/query-classifier.js','./src/retrieval/provider-registry.js','./src/retrieval/result-normalizer.js','./src/retrieval/result-ranker.js','./src/retrieval/extractive-summarizer.js','./src/retrieval/source-cache.js','./src/retrieval/search-fallback.js','./src/retrieval/browser-ai.js','./src/retrieval/providers/wikipedia.js','./src/retrieval/providers/wikidata.js','./src/retrieval/providers/github.js','./src/retrieval/providers/stackexchange.js','./src/retrieval/providers/open-meteo.js','./src/retrieval/retrieval-engine.js',
  './src/agent/proactive-task-detector.js','./src/agent/session-context.js','./src/agent/tool-registry.js','./src/agent/tools/tool-definitions.js','./src/agent/planner.js','./src/agent/executor.js','./src/agent/conversation-repository.js','./src/agent/result-formatter.js','./src/agent/agent-core.js','./src/agent/ui.js'
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
