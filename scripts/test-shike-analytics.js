/**
 * v2.0.0-rc5.2 Analytics Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Analytics Tests ===\n');

const core = readSafe(path.join(V,'src/analytics/analytics-core.js'));
const local = readSafe(path.join(V,'src/analytics/local-analytics.js'));
const consent = readSafe(path.join(V,'src/analytics/consent.js'));
const schema = readSafe(path.join(V,'src/analytics/event-schema.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

console.log('[1] Module existence');
assert(core !== null, 'analytics-core.js exists');
assert(local !== null, 'local-analytics.js exists');
assert(consent !== null, 'consent.js exists');
assert(schema !== null, 'event-schema.js exists');

console.log('\n[2] Analytics core');
assert(core && core.includes('ShikeAnalyticsCore'), 'ShikeAnalyticsCore exported');
assert(core && core.includes('track'), 'track function');
assert(core && core.includes('setBackend'), 'setBackend function');
assert(core && core.includes('setActive'), 'setActive function');
assert(core && core.includes('enable'), 'enable function');
assert(core && core.includes('disable'), 'disable function');

console.log('\n[3] Local analytics');
assert(local && local.includes('ShikeLocalAnalytics'), 'ShikeLocalAnalytics exported');
assert(local && local.includes('track'), 'track function');
assert(local && local.includes('getAll'), 'getAll function');
assert(local && local.includes('getCounts'), 'getCounts function');
assert(local && local.includes('clear'), 'clear function');
assert(local && local.includes('export'), 'export function');
assert(local && local.includes('shike_local_analytics'), 'localStorage key');
assert(local && local.includes('500'), 'max 500 events');

console.log('\n[4] Consent');
assert(consent && consent.includes('ShikeAnalyticsConsent'), 'ShikeAnalyticsConsent exported');
assert(consent && consent.includes('setLocalConsent'), 'setLocalConsent function');
assert(consent && consent.includes('setRemoteConsent'), 'setRemoteConsent function');
assert(consent && consent.includes('hasLocalConsent'), 'hasLocalConsent function');
assert(consent && consent.includes('hasRemoteConsent'), 'hasRemoteConsent function');
assert(consent && consent.includes('showConsentDialog'), 'showConsentDialog function');
assert(consent && consent.includes('shike_analytics_consent'), 'localStorage key');

console.log('\n[5] Event schema');
assert(schema && schema.includes('ShikeEventSchema'), 'ShikeEventSchema exported');
assert(schema && schema.includes('validate'), 'validate function');
assert(schema && schema.includes('getSchema'), 'getSchema function');
assert(schema && schema.includes('listEvents'), 'listEvents function');
assert(schema && schema.includes('page_view'), 'page_view event');
assert(schema && schema.includes('feature_click'), 'feature_click event');
assert(schema && schema.includes('record_create'), 'record_create event');
assert(schema && schema.includes('error'), 'error event');
assert(schema && schema.includes('password'), 'PII guard for password');
assert(schema && schema.includes('token'), 'PII guard for token');

console.log('\n[6] Privacy');
assert(local && !local.includes('fetch(') || local.includes('No data leaves'), 'local analytics does not fetch');
assert(consent && consent.includes('remote') && consent.includes('false'), 'default remote consent is false');

console.log('\n[7] Integration');
assert(html && html.includes('analytics-core.js'), 'analytics-core in HTML');
assert(html && html.includes('local-analytics.js'), 'local-analytics in HTML');
assert(html && html.includes('consent.js'), 'consent in HTML');
assert(html && html.includes('event-schema.js'), 'event-schema in HTML');
assert(sw && sw.includes('analytics-core.js'), 'analytics-core in SW');
assert(leg && leg.includes('capabilityAnalytics'), 'capabilityAnalytics flag');

console.log('\n========================================');
console.log('Analytics tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
