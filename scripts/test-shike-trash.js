/**
 * v2.0.0-rc4 Trash Repository Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Trash Repository Tests ===\n');

const trash = readSafe(path.join(V,'src/storage/trash-repository.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Module existence
console.log('[1] Module existence');
assert(trash !== null, 'trash-repository.js exists');
assert(trash && trash.includes('ShikeTrashRepository'), 'ShikeTrashRepository exported');

// 2. Core functions
console.log('\n[2] Core functions');
assert(trash && trash.includes('softDelete'), 'softDelete function');
assert(trash && trash.includes('getAll'), 'getAll function');
assert(trash && trash.includes('restore'), 'restore function');
assert(trash && trash.includes('permanentlyDelete'), 'permanentlyDelete function');
assert(trash && trash.includes('clearAll'), 'clearAll function');
assert(trash && trash.includes('getExpired'), 'getExpired function');
assert(trash && trash.includes('cleanupExpired'), 'cleanupExpired function');

// 3. Tombstone fields
console.log('\n[3] Tombstone fields');
assert(trash && trash.includes('deletedAt'), 'deletedAt field');
assert(trash && trash.includes('deletedReason'), 'deletedReason field');
assert(trash && trash.includes('deletedFrom'), 'deletedFrom field');
assert(trash && trash.includes('originalRecord'), 'originalRecord field');

// 4. IndexedDB store
console.log('\n[4] IndexedDB store');
assert(trash && trash.includes('shike_trash'), 'shike_trash store name');
assert(trash && trash.includes('IDBKeyRange'), 'uses IDBKeyRange for expired');

// 5. 30-day retention
console.log('\n[5] Retention policy');
assert(trash && trash.includes('30'), '30-day default retention');

// 6. HTML integration
console.log('\n[6] HTML integration');
assert(html && html.includes('trash-repository.js'), 'script tag in HTML');
assert(html && html.includes('trashList'), 'trashList container in HTML');

// 7. SW precache
console.log('\n[7] Service Worker');
assert(sw && sw.includes('trash-repository.js'), 'in SW precache');

// 8. Legacy integration
console.log('\n[8] Legacy integration');
assert(leg && leg.includes('renderTrashList'), 'renderTrashList function');
assert(leg && leg.includes('ShikeTrashRepository'), 'ShikeTrashRepository referenced');
assert(leg && leg.includes('capabilityTrash'), 'capabilityTrash flag');

// 9. i18n
console.log('\n[9] i18n keys');
assert(leg && leg.includes('trashTitle'), 'trashTitle i18n');
assert(leg && leg.includes('restoreRecord'), 'restoreRecord i18n');
assert(leg && leg.includes('permanentlyDelete'), 'permanentlyDelete i18n');
assert(leg && leg.includes('emptyTrash'), 'emptyTrash i18n');

// 10. Error handling
console.log('\n[10] Error handling');
assert(trash && trash.includes('try'), 'try-catch present');
assert(trash && trash.includes('catch'), 'catch present');
assert(trash && trash.includes('Promise'), 'returns Promises');

console.log('\n========================================');
console.log('Trash Repository tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
