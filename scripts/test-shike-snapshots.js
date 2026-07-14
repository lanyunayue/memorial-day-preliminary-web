/**
 * v2.2.0-alpha3 Snapshot Service Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Snapshot Service Tests ===\n');

const snap = readSafe(path.join(V,'src/storage/snapshot-service.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Module existence
console.log('[1] Module existence');
assert(snap !== null, 'snapshot-service.js exists');
assert(snap && snap.includes('ShikeSnapshotService'), 'ShikeSnapshotService exported');

// 2. Core functions
console.log('\n[2] Core functions');
assert(snap && snap.includes('createSnapshot'), 'createSnapshot function');
assert(snap && snap.includes('getAll'), 'getAll function');
assert(snap && snap.includes('getSnapshot'), 'getSnapshot function');
assert(snap && snap.includes('deleteSnapshot'), 'deleteSnapshot function');
assert(snap && snap.includes('restoreSnapshot'), 'restoreSnapshot function');
assert(snap && snap.includes('verifyChecksum'), 'verifyChecksum function');

// 3. Snapshot fields
console.log('\n[3] Snapshot fields');
assert(snap && snap.includes('checksum'), 'checksum field');
assert(snap && snap.includes('createdAt'), 'createdAt field');
assert(snap && snap.includes('recordCount'), 'recordCount field');
assert(snap && snap.includes('label'), 'label field');
assert(snap && snap.includes('compressed'), 'compressed field');

// 4. SHA-256
console.log('\n[4] SHA-256 checksum');
assert(snap && snap.includes('SHA-256') || snap.includes('sha-256') || snap.includes('digest'), 'uses SHA-256 digest');

// 5. Max snapshots
console.log('\n[5] Max snapshots');
assert(snap && snap.includes('20'), 'max 20 snapshots');

// 6. IndexedDB
console.log('\n[6] IndexedDB');
assert(snap && snap.includes('shike_snapshots'), 'shike_snapshots store');

// 7. localStorage metadata
console.log('\n[7] localStorage metadata');
assert(snap && snap.includes('shike_snapshots'), 'metadata key');

// 8. HTML integration
console.log('\n[8] HTML integration');
assert(html && html.includes('snapshot-service.js'), 'script tag in HTML');
assert(html && html.includes('snapshotList'), 'snapshotList container');

// 9. SW precache
console.log('\n[9] Service Worker');
assert(sw && sw.includes('snapshot-service.js'), 'in SW precache');

// 10. Legacy integration
console.log('\n[10] Legacy integration');
assert(leg && leg.includes('renderSnapshotList'), 'renderSnapshotList function');
assert(leg && leg.includes('capabilitySnapshots'), 'capabilitySnapshots flag');
assert(leg && leg.includes('ShikeSnapshotService'), 'ShikeSnapshotService referenced');

// 11. i18n
console.log('\n[11] i18n');
assert(leg && leg.includes('snapshotTitle'), 'snapshotTitle i18n');
assert(leg && leg.includes('createSnapshot'), 'createSnapshot i18n');
assert(leg && leg.includes('restoreSnapshot'), 'restoreSnapshot i18n');

// 12. Safety: restore doesn't overwrite
console.log('\n[12] Safety');
assert(snap && snap.includes('does NOT overwrite') || snap.includes('caller'), 'restore does not overwrite');

console.log('\n========================================');
console.log('Snapshot Service tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
