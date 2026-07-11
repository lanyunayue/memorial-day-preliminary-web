/**
 * v2.0.0-rc4 Product Rescue Release Candidate Tests
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== v2.0.0-rc4 Product Rescue Tests ===\n');

// 1. Version
console.log('[1] Version');
const vjs = readSafe(path.join(V,'src/config/version.js'));
assert(vjs && vjs.includes('v2.0.0-rc4'), 'APP_VERSION is v2.0.0-rc4');
const sw = readSafe(path.join(V,'sw.js'));
assert(sw && sw.includes('shike-v200rc4-v58'), 'CACHE_NAME is shike-v200rc4-v58');

// 2. Parser integrity
console.log('\n[2] Parser integrity');
const parser = readSafe(path.join(V,'src/parser/parser-adapter.js'));
const hash = parser ? crypto.createHash('sha256').update(parser).digest('hex') : '';
assert(hash === 'd6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32', 'parser hash unchanged');
assert(parser && parser.includes('parseReminderText'), 'parseReminderText exists');

// 3. Composer modules
console.log('\n[3] Composer modules');
assert(fs.existsSync(path.join(V,'src/composer/composer-state.js')), 'composer-state.js exists');
assert(fs.existsSync(path.join(V,'src/composer/composer-controller.js')), 'composer-controller.js exists');
assert(fs.existsSync(path.join(V,'src/composer/composer-classifier.js')), 'composer-classifier.js exists');
assert(fs.existsSync(path.join(V,'src/composer/composer-view.js')), 'composer-view.js exists');

// 4. Permission modules
console.log('\n[4] Permission modules');
assert(fs.existsSync(path.join(V,'src/permissions/permission-center.js')), 'permission-center.js exists');
assert(fs.existsSync(path.join(V,'src/permissions/notification-permission.js')), 'notification-permission.js exists');
assert(fs.existsSync(path.join(V,'src/permissions/microphone-permission.js')), 'microphone-permission.js exists');
assert(fs.existsSync(path.join(V,'src/permissions/storage-permission.js')), 'storage-permission.js exists');
assert(fs.existsSync(path.join(V,'src/permissions/pwa-install-state.js')), 'pwa-install-state.js exists');

// 5. HTML structure
console.log('\n[5] HTML structure');
const html = readSafe(path.join(V,'index.html'));
assert(html && html.includes('page-permissions'), 'permission page exists');
assert(html && html.includes('navPermissions'), 'permission nav exists');
assert(html && html.includes('permissionContainer'), 'permission container exists');
assert(html && html.includes('composer-state.js'), 'composer script tag');

// 6. SW precache includes new modules
console.log('\n[6] SW precache');
assert(sw && sw.includes('composer-state.js'), 'composer in precache');
assert(sw && sw.includes('permission-center.js'), 'permission in precache');

// 7. i18n
console.log('\n[7] i18n');
const leg = readSafe(path.join(V,'src/legacy-app.js'));
assert(leg && leg.includes('navPermissions'), 'navPermissions i18n');
assert(leg && leg.includes('permissionCenter'), 'permissionCenter i18n');
assert(leg && leg.includes('releaseCenterV200rc2'), 'releaseCenterV200rc2 i18n');

// 8. Capabilities
console.log('\n[8] Capabilities');
assert(leg && leg.includes('capabilityV200rc2'), 'capabilityV200rc2 flag');
assert(leg && leg.includes('capabilityPermissionCenter'), 'capabilityPermissionCenter flag');
assert(leg && leg.includes('capabilityUnifiedComposer'), 'capabilityUnifiedComposer flag');

// 9. No secrets
console.log('\n[9] Security');
assert(!leg.includes('sk-') || leg.includes('skip'), 'no OpenAI keys');
assert(!leg.includes('ghp_'), 'no GitHub tokens');

// 10. Data schema
console.log('\n[10] Data schema');
const consts = readSafe(path.join(V,'src/config/constants.js'));
assert(consts && consts.includes('shike_records'), 'shike_records key preserved');
assert(consts && consts.includes('shike_settings'), 'shike_settings key preserved');

// 11. Agent tools
console.log('\n[11] Agent tools');
const tools = readSafe(path.join(V,'src/agent/tools/tool-definitions.js'));
assert(tools && tools.includes('create_record'), 'create_record tool');
assert(tools && tools.includes('manage_subscription'), 'manage_subscription tool');
assert(tools && tools.includes('watch_center_not_available'), 'security error preserved');

// 12. Placeholder fix
console.log('\n[12] Placeholder fix');
assert(leg && leg.includes('探索'), '探索 token exists');
assert(leg && leg.includes('正在规划'), '正在规划 token preserved');
assert(!leg.includes('更主动的智能助手能力正在规划中'), 'old placeholder removed');

console.log('\n========================================');
console.log('v2.0.0-rc4 Product Rescue tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
