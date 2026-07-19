/**
 * v2.2.0-alpha4 Information Architecture Tests
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

// 1. Navigation items (consolidated to 4: home/calendar/all/my)
console.log('[1] Navigation items');
const navItems = (html && html.match(/class="nav-item/g)) || [];
console.log('  Found ' + navItems.length + ' nav items');
assert(navItems.length === 4, 'exactly 4 nav items (home/calendar/all/my), found ' + navItems.length);
const navPageMatches = (html && html.match(/data-page="([^"]+)"/g)) || [];
assert(navPageMatches.length === 4, 'exactly 4 data-page nav attributes');

// 2. Required pages
console.log('\n[2] Required pages');
assert(html && html.includes('page-home'), 'page-home exists');
assert(html && html.includes('page-calendar') || html.includes('page-cal'), 'page-calendar exists');
assert(html && html.includes('page-all'), 'page-all exists');
assert(html && html.includes('page-import'), 'page-import exists');
assert(html && html.includes('page-my'), 'page-my exists');
assert(!html.includes('id="page-watch"'), 'page-watch removed');
assert(!html.includes('id="page-permissions"'), 'page-permissions removed');
assert(!html.includes('id="page-data-safety"'), 'page-data-safety removed');
assert(!html.includes('id="page-reminder-diagnostics"'), 'page-reminder-diagnostics removed');

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
const versionJs = readSafe(path.join(V,'src/config/version.js'));
assert((html && html.includes('v2.2.0-alpha4')) || (versionJs && versionJs.includes('v2.2.0-alpha4')), 'v2.2.0-alpha4 referenced');

// 8. Release center
console.log('\n[8] Release center');
assert(leg && leg.includes('releaseCenterV200rc2'), 'releaseCenterV200rc2 i18n key');

console.log('\n========================================');
console.log('Information Architecture tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
