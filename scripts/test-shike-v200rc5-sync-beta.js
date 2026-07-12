/**
 * v2.0.0-rc5.1 Optional Sync Beta Release Candidate Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== v2.0.0-rc5.1 Optional Sync Beta Tests ===\n');

const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));
const ver = readSafe(path.join(V,'src/config/version.js'));

console.log('[1] Version');
assert(ver && ver.includes('v2.0.0-rc5.1'), 'APP_VERSION is v2.0.0-rc5.1');
assert(sw && sw.includes('shike-v200rc51-v61'), 'CACHE_NAME is shike-v200rc51-v61');

console.log('\n[2] Parser integrity');
const crypto = require('crypto');
const parser = readSafe(path.join(V,'src/parser/parser-adapter.js'));
if(parser){
  const hash = crypto.createHash('sha256').update(parser).digest('hex');
  assert(hash === 'd6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32', 'parser hash unchanged');
}

console.log('\n[3] Sync modules');
assert(fs.existsSync(path.join(V,'src/sync/device-identity.js')), 'device-identity.js exists');
assert(fs.existsSync(path.join(V,'src/sync/crypto-envelope.js')), 'crypto-envelope.js exists');
assert(fs.existsSync(path.join(V,'src/sync/sync-client.js')), 'sync-client.js exists');
assert(fs.existsSync(path.join(V,'src/sync/sync-conflict.js')), 'sync-conflict.js exists');
assert(fs.existsSync(path.join(V,'src/sync/sync-status.js')), 'sync-status.js exists');

console.log('\n[4] Analytics modules');
assert(fs.existsSync(path.join(V,'src/analytics/analytics-core.js')), 'analytics-core.js exists');
assert(fs.existsSync(path.join(V,'src/analytics/local-analytics.js')), 'local-analytics.js exists');
assert(fs.existsSync(path.join(V,'src/analytics/consent.js')), 'consent.js exists');
assert(fs.existsSync(path.join(V,'src/analytics/event-schema.js')), 'event-schema.js exists');

console.log('\n[5] Capabilities');
assert(leg && leg.includes('capabilityV200rc5'), 'capabilityV200rc5 flag');
assert(leg && leg.includes('capabilitySync'), 'capabilitySync flag');
assert(leg && leg.includes('capabilityAnalytics'), 'capabilityAnalytics flag');
assert(leg && leg.includes('capabilityDeviceIdentity'), 'capabilityDeviceIdentity flag');

console.log('\n[6] i18n');
assert(leg && leg.includes('navSync'), 'navSync i18n');
assert(leg && leg.includes('syncModeLocal'), 'syncModeLocal i18n');
assert(leg && leg.includes('releaseCenterV200rc5'), 'releaseCenterV200rc5 i18n');
assert(leg && leg.includes('analyticsConsent'), 'analyticsConsent i18n');

console.log('\n[7] SW precache');
assert(sw && sw.includes('device-identity.js'), 'device-identity in SW');
assert(sw && sw.includes('crypto-envelope.js'), 'crypto-envelope in SW');
assert(sw && sw.includes('sync-client.js'), 'sync-client in SW');
assert(sw && sw.includes('analytics-core.js'), 'analytics-core in SW');
assert(sw && sw.includes('event-schema.js'), 'event-schema in SW');

console.log('\n[8] HTML integration');
assert(html && html.includes('sync-client.js'), 'sync-client script in HTML');
assert(html && html.includes('analytics-core.js'), 'analytics-core script in HTML');
assert(!html.includes('syncContainer'),'sync panel removed in quarantine');

console.log('\n[9] Privacy defaults');
assert(leg && leg.includes('本地模式'), 'local mode messaging');
assert(!leg || !leg.includes('API_KEY'), 'no API keys');
assert(!leg || !leg.includes('token_'), 'no tokens');
assert(!leg || !leg.includes('已上线'), 'no fake online status');

console.log('\n[10] Honest sync status');
assert(leg && leg.includes('syncModeLocal'), 'sync mode local text');
assert(leg && !leg.includes('sync_beta_launched') && !leg.includes('已部署同步'), 'no fake sync deployment');

console.log('\n========================================');
console.log('v2.0.0-rc5.1 Optional Sync Beta tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
