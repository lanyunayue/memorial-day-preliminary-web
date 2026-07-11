/**
 * v2.0.0-rc5 Storage Persistence Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Storage Persistence Tests ===\n');

const sp = readSafe(path.join(V,'src/safety/storage-persistence.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Module existence
console.log('[1] Module existence');
assert(sp !== null, 'storage-persistence.js exists');
assert(sp && sp.includes('ShikeStoragePersistence'), 'ShikeStoragePersistence exported');

// 2. Core functions
console.log('\n[2] Core functions');
assert(sp && sp.includes('isSupported'), 'isSupported function');
assert(sp && sp.includes('isPersisted'), 'isPersisted function');
assert(sp && sp.includes('requestPersist'), 'requestPersist function');
assert(sp && sp.includes('getEstimate'), 'getEstimate function');
assert(sp && sp.includes('getStatus'), 'getStatus function');
assert(sp && sp.includes('formatBytes'), 'formatBytes function');
assert(sp && sp.includes('render'), 'render function');

// 3. navigator.storage API
console.log('\n[3] navigator.storage API');
assert(sp && sp.includes('navigator.storage.persist'), 'uses navigator.storage.persist');
assert(sp && sp.includes('navigator.storage.persisted'), 'uses navigator.storage.persisted');
assert(sp && sp.includes('navigator.storage.estimate'), 'uses navigator.storage.estimate');

// 4. HTML integration
console.log('\n[4] HTML integration');
assert(html && html.includes('storage-persistence.js'), 'script tag in HTML');
assert(html && html.includes('storageStatus'), 'storageStatus container');

// 5. SW precache
console.log('\n[5] Service Worker');
assert(sw && sw.includes('storage-persistence.js'), 'in SW precache');

// 6. Legacy integration
console.log('\n[6] Legacy integration');
assert(leg && leg.includes('ShikeStoragePersistence'), 'ShikeStoragePersistence referenced');
assert(leg && leg.includes('storagePersistence'), 'storagePersistence i18n');

// 7. Advice messages
console.log('\n[7] Advice messages');
assert(sp && sp.includes('定期导出备份') || sp.includes('export'), 'advice mentions backup');

console.log('\n========================================');
console.log('Storage Persistence tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
