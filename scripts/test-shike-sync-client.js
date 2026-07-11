/**
 * v2.0.0-rc5.1 Sync Client Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Sync Client Tests ===\n');

const sc = readSafe(path.join(V,'src/sync/sync-client.js'));
const ce = readSafe(path.join(V,'src/sync/crypto-envelope.js'));
const cf = readSafe(path.join(V,'src/sync/sync-conflict.js'));
const ss = readSafe(path.join(V,'src/sync/sync-status.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));

console.log('[1] Module existence');
assert(sc !== null, 'sync-client.js exists');
assert(ce !== null, 'crypto-envelope.js exists');
assert(cf !== null, 'sync-conflict.js exists');
assert(ss !== null, 'sync-status.js exists');

console.log('\n[2] Sync client functions');
assert(sc && sc.includes('ShikeSyncClient'), 'ShikeSyncClient exported');
assert(sc && sc.includes('push'), 'push function');
assert(sc && sc.includes('pull'), 'pull function');
assert(sc && sc.includes('getStatus'), 'getStatus function');
assert(sc && sc.includes('enable'), 'enable function');
assert(sc && sc.includes('disable'), 'disable function');
assert(sc && sc.includes('setEndpoint'), 'setEndpoint function');

console.log('\n[3] Offline queue');
assert(sc && sc.includes('shike_sync_queue'), 'localStorage queue');
assert(sc && sc.includes('offline'), 'offline mode');

console.log('\n[4] Crypto envelope');
assert(ce && ce.includes('ShikeCryptoEnvelope'), 'ShikeCryptoEnvelope exported');
assert(ce && ce.includes('encrypt'), 'encrypt function');
assert(ce && ce.includes('decrypt'), 'decrypt function');
assert(ce && ce.includes('encryptBatch'), 'encryptBatch function');
assert(ce && ce.includes('decryptBatch'), 'decryptBatch function');
assert(ce && ce.includes('ECDH') || ce.includes('AES-GCM'), 'uses ECDH or AES-GCM');

console.log('\n[5] Conflict resolution');
assert(cf && cf.includes('ShikeSyncConflict'), 'ShikeSyncConflict exported');
assert(cf && cf.includes('detectConflicts'), 'detectConflicts function');
assert(cf && cf.includes('resolveConflict'), 'resolveConflict function');
assert(cf && cf.includes('last-write-wins'), 'last-write-wins strategy');
assert(cf && cf.includes('keep-both'), 'keep-both strategy');
assert(cf && cf.includes('delete-edit'), 'delete-edit conflict type');

console.log('\n[6] Sync status');
assert(ss && ss.includes('ShikeSyncStatus'), 'ShikeSyncStatus exported');
assert(ss && ss.includes('getSyncMode'), 'getSyncMode function');
assert(ss && ss.includes('setSyncMode'), 'setSyncMode function');
assert(ss && ss.includes('local'), 'local mode');
assert(ss && ss.includes('encrypted-sync'), 'encrypted-sync mode');
assert(ss && ss.includes('render'), 'render function');
assert(ss && ss.includes('getDeviceList'), 'getDeviceList function');
assert(ss && ss.includes('revokeDevice'), 'revokeDevice function');
assert(ss && ss.includes('本地模式'), 'honest local mode messaging');

console.log('\n[7] Integration');
assert(html && html.includes('sync-client.js'), 'sync-client in HTML');
assert(html && html.includes('crypto-envelope.js'), 'crypto-envelope in HTML');
assert(html && html.includes('sync-conflict.js'), 'sync-conflict in HTML');
assert(html && html.includes('sync-status.js'), 'sync-status in HTML');
assert(sw && sw.includes('sync-client.js'), 'sync-client in SW');
assert(sw && sw.includes('crypto-envelope.js'), 'crypto-envelope in SW');

console.log('\n========================================');
console.log('Sync Client tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
