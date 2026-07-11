/**
 * v2.0.0-rc4 Data Safety Release Candidate Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== v2.0.0-rc4 Data Safety Tests ===\n');

const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));
const ver = readSafe(path.join(V,'src/config/version.js'));

// 1. Version
console.log('[1] Version');
assert(ver && ver.includes('v2.0.0-rc4'), 'APP_VERSION is v2.0.0-rc4');
assert(sw && sw.includes('shike-v200rc4-v58'), 'CACHE_NAME is shike-v200rc4-v58');

// 2. Parser integrity
console.log('\n[2] Parser integrity');
const parser = readSafe(path.join(V,'src/parser/parser-adapter.js'));
const crypto = require('crypto');
if(parser){
  const hash = crypto.createHash('sha256').update(parser).digest('hex');
  assert(hash === 'd6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32', 'parser hash unchanged');
}

// 3. Data safety modules
console.log('\n[3] Data safety modules');
assert(fs.existsSync(path.join(V,'src/storage/trash-repository.js')), 'trash-repository.js exists');
assert(fs.existsSync(path.join(V,'src/commands/command-bus.js')), 'command-bus.js exists');
assert(fs.existsSync(path.join(V,'src/commands/undo-manager.js')), 'undo-manager.js exists');
assert(fs.existsSync(path.join(V,'src/storage/snapshot-service.js')), 'snapshot-service.js exists');
assert(fs.existsSync(path.join(V,'src/storage/encrypted-backup.js')), 'encrypted-backup.js exists');
assert(fs.existsSync(path.join(V,'src/safety/dangerous-actions.js')), 'dangerous-actions.js exists');
assert(fs.existsSync(path.join(V,'src/safety/storage-persistence.js')), 'storage-persistence.js exists');

// 4. HTML structure
console.log('\n[4] HTML structure');
assert(html && html.includes('page-data-safety'), 'data safety page exists');
assert(html && html.includes('data-safety'), 'data safety nav exists');
assert(html && html.includes('dataSafetyContainer'), 'data safety container exists');
assert(html && html.includes('storageStatus'), 'storage status container');
assert(html && html.includes('snapshotList'), 'snapshot list container');
assert(html && html.includes('trashList'), 'trash list container');

// 5. SW precache
console.log('\n[5] SW precache');
assert(sw && sw.includes('trash-repository.js'), 'trash in precache');
assert(sw && sw.includes('command-bus.js'), 'command-bus in precache');
assert(sw && sw.includes('undo-manager.js'), 'undo-manager in precache');
assert(sw && sw.includes('snapshot-service.js'), 'snapshot in precache');
assert(sw && sw.includes('encrypted-backup.js'), 'encrypted-backup in precache');
assert(sw && sw.includes('dangerous-actions.js'), 'dangerous-actions in precache');
assert(sw && sw.includes('storage-persistence.js'), 'storage-persistence in precache');

// 6. Capabilities
console.log('\n[6] Capabilities');
assert(leg && leg.includes('capabilityV200rc3'), 'capabilityV200rc3 flag');
assert(leg && leg.includes('capabilityDataSafety'), 'capabilityDataSafety flag');
assert(leg && leg.includes('capabilityTrash'), 'capabilityTrash flag');
assert(leg && leg.includes('capabilityUndo'), 'capabilityUndo flag');
assert(leg && leg.includes('capabilitySnapshots'), 'capabilitySnapshots flag');
assert(leg && leg.includes('capabilityEncryptedBackup'), 'capabilityEncryptedBackup flag');

// 7. i18n
console.log('\n[7] i18n');
assert(leg && leg.includes('navDataSafety'), 'navDataSafety i18n');
assert(leg && leg.includes('dataSafetyTitle'), 'dataSafetyTitle i18n');
assert(leg && leg.includes('releaseCenterV200rc3'), 'releaseCenterV200rc3 i18n');

// 8. Security
console.log('\n[8] Security');
assert(!leg || !leg.includes('API_KEY'), 'no API keys');
assert(!leg || !leg.includes('token_'), 'no tokens');

// 9. Data schema preserved
console.log('\n[9] Data schema');
assert(leg && leg.includes('shike_records'), 'shike_records key preserved');
const constants = readSafe(path.join(V,'src/config/constants.js')); assert(constants && constants.includes('shike_settings_v1'), 'shike_settings key preserved');

// 10. Legacy helpers
console.log('\n[10] Legacy helpers');
assert(leg && leg.includes('renderTrashList'), 'renderTrashList function');
assert(leg && leg.includes('renderSnapshotList'), 'renderSnapshotList function');
assert(leg && leg.includes('ShikeStoragePersistence'), 'storage persistence init');

console.log('\n========================================');
console.log('v2.0.0-rc4 Data Safety tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
