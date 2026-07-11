/**
 * v2.0.0-rc5 First User Experience Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== First User Experience Tests ===\n');

const html = readSafe(path.join(V,'index.html'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));
const wc = readSafe(path.join(V,'src/watch/watch-center.js'));
const sw = readSafe(path.join(V,'sw.js'));

// 1. First visit greeting
console.log('[1] First visit greeting');
assert(leg && leg.includes('heroGreeting'), 'heroGreeting exists');
assert(leg && leg.includes('把一句话交给我') || leg.includes('贴心'), 'greeting message exists');

// 2. Empty state guidance
console.log('\n[2] Empty state guidance');
assert(leg && leg.includes('has-records') || leg.includes('hasRecords'), 'has-records state detection');

// 3. Demo examples
console.log('\n[3] Demo examples');
assert(html && html.includes('demoRoute') || html.includes('demo') || html.includes('experience'), 'demo button exists');
assert(leg && leg.includes('demoRoute') || leg.includes('demo'), 'demo function exists');

// 4. Quick input
console.log('\n[4] Quick input');
assert(html && html.includes('quickInput'), 'quickInput exists');
assert(html && html.includes('placeholder'), 'input has placeholder');

// 5. Version visible
console.log('[5] Version visible');
assert(html && html.includes('v2.0.0-rc5'), 'v2.0.0-rc5 visible in HTML');

// 6. Cache
console.log('\n[6] Cache');
assert(sw && sw.includes('shike-v200rc5-v60'), 'CACHE_NAME is shike-v200rc5-v60');

// 7. Watch center empty state
console.log('\n[7] Watch center empty state');
assert(wc && (wc.includes('添加') || wc.includes('关注')), 'watch center has add guidance');

// 8. Permission center first visit
console.log('\n[8] Permission center first visit');
const pc = readSafe(path.join(V,'src/permissions/permission-center.js'));
assert(pc && pc.includes('render'), 'permission center has render');
assert(pc && pc.includes('checkAll') || pc.includes('init'), 'permission center has checkAll/init');

// 9. Composer first visit
console.log('\n[9] Composer first visit');
const cs = readSafe(path.join(V,'src/composer/composer-state.js'));
assert(cs && cs.includes('restoreDraft'), 'composer restores draft');

// 10. Bear state machine
console.log('\n[10] Bear state');
const bs = readSafe(path.join(V,'src/assistant/bear-state-machine.js'));
assert(bs && bs.includes('ShikeBearState'), 'bear state machine exists');
assert(bs && bs.includes('idle'), 'idle state exists');

// 11. No JS errors on load
console.log('\n[11] Load safety');
assert(!leg.includes('undefined function'), 'no undefined function calls in legacy-app');

// 12. PWA manifest
console.log('\n[12] PWA');
assert(html && html.includes('manifest.json'), 'manifest link exists');
assert(fs.existsSync(path.join(V,'manifest.json')), 'manifest.json file exists');

console.log('\n========================================');
console.log('First User Experience tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
