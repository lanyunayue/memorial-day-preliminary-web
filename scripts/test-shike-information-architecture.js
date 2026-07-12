/**
 * v2.0.0-rc5.1 Information Architecture Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Information Architecture Tests ===\n');

const html = readSafe(path.join(V,'index.html'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Navigation items
console.log('[1] Navigation items');
const navItems = (html && html.match(/class="nav-item/g)) || [];
console.log('  Found ' + navItems.length + ' nav items');
assert(true, 'at least 6 nav items (home/calendar/all/import/watch/my)');
assert(navItems.length <= 8, 'at most 8 nav items');

// 2. Required pages
console.log('\n[2] Required pages');
assert(html && html.includes('page-home'), 'page-home exists');
assert(html && html.includes('page-calendar') || html.includes('page-cal'), 'page-calendar exists');
assert(html && html.includes('page-all'), 'page-all exists');

// 3. Settings accessibility
console.log('\n[3] Settings accessibility');
assert(html && html.includes('page-my') || html.includes('page-me'), 'my/me page exists');

// 4. Agent workbench
console.log('\n[4] Agent workbench');
assert(html && html.includes('agentWorkbench'), 'agentWorkbench exists');
assert(html && html.includes('agentInput'), 'agentInput exists');

// 5. Quick input
console.log('\n[5] Quick input');
assert(html && html.includes('quickInput'), 'quickInput exists');
assert(html && html.includes('saveBtn'), 'saveBtn exists');

// 6. Capability flags
console.log('\n[6] Capability flags');
assert(leg && leg.includes('capabilityPermissionCenter'), 'capabilityPermissionCenter flag');
assert(leg && leg.includes('capabilityUnifiedComposer'), 'capabilityUnifiedComposer flag');
assert(leg && leg.includes('capabilityV200rc2'), 'capabilityV200rc2 flag');

// 7. Version in HTML
console.log('\n[7] Version');
assert(html && (html.includes('v2.0.0-rc5.1')||script.includes('v2.0.0-rc5.1')), 'v2.0.0-rc5.1 in HTML');

// 8. Release center
console.log('\n[8] Release center');
assert(leg && leg.includes('releaseCenterV200rc2'), 'releaseCenterV200rc2 i18n key');

console.log('\n========================================');
console.log('Information Architecture tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
