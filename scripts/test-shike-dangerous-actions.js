/**
 * v2.0.0-rc5.1 Dangerous Actions Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Dangerous Actions Tests ===\n');

const dang = readSafe(path.join(V,'src/safety/dangerous-actions.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Module existence
console.log('[1] Module existence');
assert(dang !== null, 'dangerous-actions.js exists');
assert(dang && dang.includes('ShikeDangerousActions'), 'ShikeDangerousActions exported');

// 2. Risk levels
console.log('\n[2] Risk levels');
assert(dang && dang.includes('LOW'), 'LOW level');
assert(dang && dang.includes('MEDIUM'), 'MEDIUM level');
assert(dang && dang.includes('HIGH'), 'HIGH level');
assert(dang && dang.includes('IRREVERSIBLE'), 'IRREVERSIBLE level');

// 3. Core functions
console.log('\n[3] Core functions');
assert(dang && dang.includes('classify'), 'classify function');
assert(dang && dang.includes('confirm'), 'confirm function');
assert(dang && dang.includes('register'), 'register function');
assert(dang && dang.includes('getActionList'), 'getActionList function');

// 4. Pre-registered actions
console.log('\n[4] Pre-registered actions');
assert(dang && dang.includes('delete_record'), 'delete_record');
assert(dang && dang.includes('batch_delete'), 'batch_delete');
assert(dang && dang.includes('clear_all_data'), 'clear_all_data');
assert(dang && dang.includes('empty_trash'), 'empty_trash');
assert(dang && dang.includes('overwrite_import'), 'overwrite_import');
assert(dang && dang.includes('reset_app'), 'reset_app');
assert(dang && dang.includes('reset_sprite'), 'reset_sprite');
assert(dang && dang.includes('clear_all_settings'), 'clear_all_settings');

// 5. Confirmation strategies
console.log('\n[5] Confirmation strategies');
assert(dang && dang.includes('confirm(') || dang.includes('window.confirm'), 'uses window.confirm');
assert(dang && dang.includes('snapshot'), 'IRREVERSIBLE creates snapshot');
assert(dang && dang.includes('cooldown'), 'has cooldown');

// 6. HTML integration
console.log('\n[6] HTML integration');
assert(html && html.includes('dangerous-actions.js'), 'script tag in HTML');

// 7. SW precache
console.log('\n[7] Service Worker');
assert(sw && sw.includes('dangerous-actions.js'), 'in SW precache');

// 8. Data safety page
console.log('\n[8] Data safety page');

// 9. i18n
console.log('\n[9] i18n');
assert(leg && leg.includes('dataSafetyTitle'), 'dataSafetyTitle i18n');
assert(leg && leg.includes('releaseCenterV200rc3'), 'releaseCenterV200rc3 i18n');

console.log('\n========================================');
console.log('Dangerous Actions tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
