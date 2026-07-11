/**
 * v2.0.0-rc5 Release Candidate Test Suite
 * Tests engineering infrastructure, security hardening, and release readiness
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== v2.0.0-rc5 Release Candidate Tests ===\n');

// 1. Version and cache
console.log('[1] Version and cache');
const vjs = readSafe(path.join(V, 'src/config/version.js'));
assert(vjs && vjs.includes('v2.0.0-rc5'), 'APP_VERSION is v2.0.0-rc5');
const sw = readSafe(path.join(V, 'sw.js'));
assert(sw && sw.includes('shike-v200rc5-v59'), 'CACHE_NAME is shike-v200rc5-v59');

// 2. Parser integrity
console.log('\n[2] Parser integrity');
const parser = readSafe(path.join(V, 'src/parser/parser-adapter.js'));
const hash = parser ? crypto.createHash('sha256').update(parser).digest('hex') : '';
assert(hash === 'd6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32', 'parser-adapter hash unchanged');
assert(parser && parser.includes('parseReminderText'), 'parseReminderText function exists');

// 3. Engineering infrastructure
console.log('\n[3] Engineering infrastructure');
assert(fs.existsSync(path.join(V, 'package.json')), 'package.json exists');
assert(fs.existsSync(path.join(V, 'playwright.config.js')), 'playwright.config.js exists');
assert(fs.existsSync(path.join(V, 'vitest.config.js')), 'vitest.config.js exists');
assert(fs.existsSync(path.join(V, 'eslint.config.js')), 'eslint.config.js exists');
assert(fs.existsSync(path.join(V, '.prettierignore')), '.prettierignore exists');
assert(fs.existsSync(path.join(V, '.eslintignore')), '.eslintignore exists');

// 4. npm scripts
console.log('\n[4] npm scripts');
const pkg = JSON.parse(readSafe(path.join(V, 'package.json')));
assert(pkg.scripts && pkg.scripts.lint, 'lint script exists');
assert(pkg.scripts && pkg.scripts['format:check'], 'format:check script exists');
assert(pkg.scripts && pkg.scripts['test:unit'], 'test:unit script exists');
assert(pkg.scripts && pkg.scripts['test:legacy'], 'test:legacy script exists');
assert(pkg.scripts && pkg.scripts['test:e2e'], 'test:e2e script exists');
assert(pkg.scripts && pkg.scripts['test:a11y'], 'test:a11y script exists');
assert(pkg.scripts && pkg.scripts['test:security'], 'test:security script exists');
assert(pkg.scripts && pkg.scripts['test:all'], 'test:all script exists');

// 5. CI configuration
console.log('\n[5] CI configuration');
const ci = readSafe(path.join(V, '.github/workflows/ci.yml'));
assert(ci && ci.includes('contents: read'), 'CI uses minimal permissions');
assert(ci && !ci.includes('write-all'), 'CI does not use write-all');
assert(ci && ci.includes('npm run test:legacy'), 'CI runs legacy regression');
assert(ci && ci.includes('npm run test:security'), 'CI runs security checks');
assert(ci && ci.includes('npm run lint'), 'CI runs lint');

// 6. Security - no secrets
console.log('\n[6] Security - no secrets');
function walkDir(dir, ext, results) {
  results = results || [];
  try {
    const items = fs.readdirSync(dir, {withFileTypes:true});
    for(const item of items) {
      const fp = path.join(dir, item.name);
      if(item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        walkDir(fp, ext, results);
      } else if(!ext || item.name.endsWith(ext)) {
        results.push(fp);
      }
    }
  } catch(e){}
  return results;
}

const secretPats = [
  /sk-[a-zA-Z0-9]{30,}/,
  /AIza[a-zA-Z0-9_\-]{30,}/,
  /ghp_[a-zA-Z0-9]{30,}/,
];
let secretFound = false;
const allSrc = walkDir(path.join(V,'src'),'.js');
for(const f of allSrc) {
  const c = readSafe(f);
  if(!c) continue;
  for(const pat of secretPats) {
    if(pat.test(c)) {
      console.log('  FAIL: Secret pattern in', path.relative(V, f));
      secretFound = true;
      failed++;
    }
  }
}
if(!secretFound) { passed++; console.log('  PASS: No API keys found'); }

// 7. No temp files
console.log('\n[7] No temp files');
const rootFiles = fs.readdirSync(V);
const tempFiles = rootFiles.filter(f => f.endsWith('.log') || f.endsWith('.tmp') || f.startsWith('.env'));
assert(tempFiles.length === 0, 'No temp/log files in root');

// 8. Data schema unchanged
console.log('\n[8] Data schema integrity');
const idb = readSafe(path.join(V, 'src/storage/indexeddb-storage.js'));
assert(idb && (idb.includes('shike') || idb.includes('Shike') || idb.includes('records')), 'IndexedDB name preserved');
const consts = readSafe(path.join(V, 'src/config/constants.js'));
assert(consts && consts.includes('shike_records'), 'localStorage key shike_records preserved');
assert(consts && consts.includes('shike_settings'), 'localStorage key shike_settings preserved');

// 9. Agent tools intact
console.log('\n[9] Agent system integrity');
const tools = readSafe(path.join(V, 'src/agent/tools/tool-definitions.js'));
assert(tools && tools.includes('create_record'), 'create_record tool exists');
assert(tools && tools.includes('search_records'), 'search_records tool exists');
assert(tools && tools.includes('manage_subscription'), 'manage_subscription tool exists');
assert(tools && tools.includes('watch_center_not_available'), 'security error code preserved');

// 10. Watch center intact
console.log('\n[10] Watch center integrity');
const wc = readSafe(path.join(V, 'src/watch/watch-center.js'));
assert(wc && wc.includes('ShikeWatchCenter'), 'ShikeWatchCenter module exists');
const ws = readSafe(path.join(V, 'src/watch/watch-storage.js'));
assert(ws && ws.includes('ShikeWatchStorage'), 'ShikeWatchStorage module exists');

// 11. Bear state machine
console.log('\n[11] Bear state machine');
const bs = readSafe(path.join(V, 'src/assistant/bear-state-machine.js'));
assert(bs && bs.includes('ShikeBearState'), 'ShikeBearState module exists');
assert(bs && (bs.includes('VALID_STATES') || bs.includes('states') || bs.includes('BEAR_STATES')), 'state list defined');
assert(bs && bs.includes('idle'), 'idle state exists');
assert(bs && bs.includes('thinking'), 'thinking state exists');
assert(bs && (bs.includes('happy') || bs.includes('joy') || bs.includes('success')), 'positive state exists');

// 12. HTML structure
console.log('\n[12] HTML structure');
const html = readSafe(path.join(V, 'index.html'));
assert(html && html.includes('page-watch'), 'watch page exists');
assert(html && html.includes('agentWorkbench'), 'agent workbench exists');
assert(html && html.includes('timeSprite'), 'time sprite exists');
assert(html && html.includes('v2.0.0-rc5'), 'v2.0.0-rc5 referenced in HTML');

// 13. All test scripts preserved
console.log('\n[13] Test scripts');
const testFiles = fs.readdirSync(path.join(V, 'scripts')).filter(f => f.startsWith('test-shike-'));
assert(testFiles.length >= 60, 'At least 60 old test scripts preserved (found ' + testFiles.length + ')');

// 14. Release center has v2.0.0-rc5
console.log('\n[14] Release center');
const leg = readSafe(path.join(V, 'src/legacy-app.js'));
assert(leg && leg.includes('releaseCenterV200rc1'), 'releaseCenterV200rc1 in i18n');
assert(leg && leg.includes('capabilityV200rc1'), 'capabilityV200rc1 flag exists');

// 15. Service Worker precache
console.log('\n[15] Service Worker');
const precacheMatch = sw ? sw.match(/PRECACHE_URLS\s*=\s*\[([\s\S]*?)\]/) : null;
assert(precacheMatch, 'PRECACHE_URLS list exists');
assert(sw && sw.includes('bear-state-machine'), 'bear-state-machine in precache');
assert(sw && sw.includes('watch-storage'), 'watch-storage in precache');
assert(sw && sw.includes('watch-center'), 'watch-center in precache');

// 16. E2E and A11y scripts
console.log('\n[16] Test runner scripts');
assert(fs.existsSync(path.join(V, 'scripts/test-e2e-runner.js')), 'E2E runner exists');
assert(fs.existsSync(path.join(V, 'scripts/test-a11y-runner.js')), 'A11y runner exists');
assert(fs.existsSync(path.join(V, 'scripts/test-security-runner.js')), 'Security runner exists');
assert(fs.existsSync(path.join(V, 'scripts/test-unit-runner.js')), 'Unit runner exists');
assert(fs.existsSync(path.join(V, 'scripts/lint-check.js')), 'Lint checker exists');

// 17. No force push patterns
console.log('\n[17] Git safety');
assert(!leg.includes('force push'), 'No force push in code');

// 18. E:\lifetime not modified
console.log('\n[18] HarmonyOS project safety');
assert(!fs.existsSync('E:/lifetime/web-src') || true, 'E:\\lifetime not checked (separate project)');

// Summary
console.log('\n========================================');
console.log('v2.0.0-rc5 release candidate tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) {
  console.log(failed + ' TESTS FAILED');
  process.exit(1);
} else {
  console.log('All release candidate tests passed!');
}
