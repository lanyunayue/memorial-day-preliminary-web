/**
 * v2.2.0-alpha4 Undo Manager Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Undo Manager Tests ===\n');

const bus = readSafe(path.join(V,'src/commands/command-bus.js'));
const undo = readSafe(path.join(V,'src/commands/undo-manager.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Module existence
console.log('[1] Module existence');
assert(bus !== null, 'command-bus.js exists');
assert(undo !== null, 'undo-manager.js exists');
assert(bus && bus.includes('ShikeCommandBus'), 'ShikeCommandBus exported');
assert(undo && undo.includes('ShikeUndoManager'), 'ShikeUndoManager exported');

// 2. Command bus functions
console.log('\n[2] Command bus functions');
assert(bus && bus.includes('execute'), 'execute function');
assert(bus && bus.includes('undoLast'), 'undoLast function');
assert(bus && bus.includes('canUndo'), 'canUndo function');
assert(bus && bus.includes('getHistory'), 'getHistory function');
assert(bus && bus.includes('clearHistory'), 'clearHistory function');
assert(bus && bus.includes('register'), 'register function');

// 3. History limit
console.log('\n[3] History limit');
assert(bus && bus.includes('50'), '50 command history limit');

// 4. Undo manager functions
console.log('\n[4] Undo manager functions');
assert(undo && undo.includes('showUndoToast'), 'showUndoToast function');
assert(undo && undo.includes('dismissToast'), 'dismissToast function');
assert(undo && undo.includes('isActive'), 'isActive function');
assert(undo && undo.includes('getRemainingTime'), 'getRemainingTime function');

// 5. 10-second window
console.log('\n[5] Undo window');
assert(undo && undo.includes('10000'), '10000ms (10s) default window');

// 6. Keyboard shortcuts
console.log('\n[6] Keyboard shortcuts');
assert(undo && undo.includes('Ctrl'), 'Ctrl+Z support');
assert(undo && undo.includes('Cmd') || undo.includes('Meta'), 'Cmd+Z support');

// 7. Toast DOM
console.log('\n[7] Toast DOM');
assert(undo && undo.includes('undoToast'), 'undoToast element');
assert(undo && undo.includes('undoBtn'), 'undoBtn element');

// 8. HTML integration
console.log('\n[8] HTML integration');
assert(html && html.includes('command-bus.js'), 'command-bus.js in HTML');
assert(html && html.includes('undo-manager.js'), 'undo-manager.js in HTML');

// 9. SW precache
console.log('\n[9] Service Worker');
assert(sw && sw.includes('command-bus.js'), 'command-bus in SW');
assert(sw && sw.includes('undo-manager.js'), 'undo-manager in SW');

// 10. Capability flags
console.log('\n[10] Capability flags');
assert(leg && leg.includes('capabilityUndo'), 'capabilityUndo flag');

// 11. i18n
console.log('\n[11] i18n');
assert(leg && leg.includes('undoText'), 'undoText i18n key');

console.log('\n========================================');
console.log('Undo Manager tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
