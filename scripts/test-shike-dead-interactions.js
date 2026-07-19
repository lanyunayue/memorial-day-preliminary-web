/**
 * v2.2.0-alpha4 Dead Interactions Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Dead Interactions Tests ===\n');

const html = readSafe(path.join(V,'index.html'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. No dead placeholder text
console.log('[1] No dead placeholders');
const deadPatterns = ['即将上线', '暂未开放', 'coming soon', 'not implemented'];
for(const pat of deadPatterns) {
  assert(!leg.includes(pat) && !html.includes(pat), 'no "' + pat + '" found');
}

// 2. Non-committal planning tokens preserved (test expects them)
console.log('\n[2] Non-committal planning tokens');
assert(leg.includes('正在规划') || leg.includes('探索'), 'planning token exists (non-committal)');
assert(leg.includes('being planned') || leg.includes('exploration'), 'EN planning token exists');

// 3. Buttons have handlers
console.log('\n[3] Button handlers');
assert(leg.includes('addEventListener') || leg.includes('onclick'), 'event listeners exist');
assert(leg.includes('showToast'), 'showToast function exists');

// 4. Demo route
console.log('\n[4] Demo route');
assert(leg.includes('demoRoute') || leg.includes('demo_route') || leg.includes('experience'), 'demo route exists');

// 5. No empty pages
console.log('\n[5] No empty pages');
assert(!html.includes('<section class="page" id="page-"></section>'), 'no empty page sections');

// 6. Notification permission button
console.log('\n[6] Permission buttons');
assert(fs.existsSync(path.join(V,'src/permissions/notification-permission.js')), 'notification permission module exists');

// 7. No console-only responses
console.log('\n[7] No console-only responses');
assert(!leg.includes('console.log("clicked")'), 'no console-only click handler');

// 8. All nav items have data-page
console.log('\n[8] Nav items have data-page');
const navMatches = html.match(/class="nav-item[^"]*"[^>]*data-page="([^"]+)"/g) || [];
assert(navMatches.length === 4, 'exactly 4 nav items with data-page (home/calendar/all/my): ' + navMatches.length);

console.log('\n========================================');
console.log('Dead Interactions tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
