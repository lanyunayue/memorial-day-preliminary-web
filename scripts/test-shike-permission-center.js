/**
 * v2.0.0-rc5.2 Permission Center Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Permission Center Tests ===\n');

// 1. Module files exist
console.log('[1] Module existence');
const modFiles = [
  'src/permissions/permission-center.js',
  'src/permissions/notification-permission.js',
  'src/permissions/microphone-permission.js',
  'src/permissions/storage-permission.js',
  'src/permissions/pwa-install-state.js'
];
for(const f of modFiles) {
  assert(fs.existsSync(path.join(V, f)), f + ' exists');
}

// 2. Global exports
console.log('\n[2] Global exports');
const pc = readSafe(path.join(V,'src/permissions/permission-center.js'));
assert(pc && pc.includes('ShikePermissionCenter'), 'ShikePermissionCenter exported');
const np = readSafe(path.join(V,'src/permissions/notification-permission.js'));
assert(np && np.includes('ShikeNotificationPermission'), 'ShikeNotificationPermission exported');
const mp = readSafe(path.join(V,'src/permissions/microphone-permission.js'));
assert(mp && mp.includes('ShikeMicrophonePermission'), 'ShikeMicrophonePermission exported');
const sp = readSafe(path.join(V,'src/permissions/storage-permission.js'));
assert(sp && sp.includes('ShikeStoragePermission'), 'ShikeStoragePermission exported');
const pwa = readSafe(path.join(V,'src/permissions/pwa-install-state.js'));
assert(pwa && pwa.includes('ShikePwaInstallState'), 'ShikePwaInstallState exported');

// 3. Permission states
console.log('\n[3] Permission states');
assert(pc && pc.includes('NOT_REQUESTED') || pc.includes('未申请'), 'not-requested state');
assert(pc && pc.includes('GRANTED') || pc.includes('已允许'), 'granted state');
assert(pc && pc.includes('DENIED') || pc.includes('已拒绝'), 'denied state');
assert(pc && pc.includes('UNSUPPORTED') || pc.includes('不支持'), 'unsupported state');

// 4. Notification permission
console.log('\n[4] Notification permission');
assert(np && np.includes('requestPermission'), 'Notification.requestPermission called');
assert(np && np.includes('restoreHint') || np.includes('恢复'), 'restore hint exists');

// 5. Microphone permission
console.log('\n[5] Microphone permission');
assert(mp && mp.includes('getUserMedia'), 'getUserMedia called');
assert(mp && mp.includes('NotFoundError') || mp.includes('NotReadableError') || mp.includes('NotAllowedError'), 'error handling');

// 6. Storage permission
console.log('\n[6] Storage permission');
assert(sp && sp.includes('persist'), 'persist function');
assert(sp && sp.includes('estimate'), 'estimate function');

// 7. PWA install state
console.log('\n[7] PWA install state');
assert(pwa && pwa.includes('beforeinstallprompt'), 'beforeinstallprompt listener');
assert(pwa && pwa.includes('appinstalled'), 'appinstalled listener');
assert(pwa && pwa.includes('standalone'), 'standalone detection');

// 8. HTML integration (permissions migrated to My page permissionSection)
console.log('\n[8] HTML integration');
const html = readSafe(path.join(V,'index.html'));
assert(!html.includes('id="page-permissions"'), 'standalone page-permissions removed');
assert(!html.includes('data-page="permissions"'), 'permissions nav item removed');
assert(html && html.includes('id="permissionSection"'), 'permissionSection exists in My page');
assert(html && html.includes('permission-center.js'), 'permission-center.js script tag');

// 9. SW precache
console.log('\n[9] Service Worker');
const sw = readSafe(path.join(V,'sw.js'));
assert(sw && sw.includes('permission-center.js'), 'permission-center in SW precache');

// 10. i18n keys
console.log('\n[10] i18n keys');
const leg = readSafe(path.join(V,'src/legacy-app.js'));
assert(leg && leg.includes('permissionSettings'), 'permissionSettings i18n key');
assert(leg && leg.includes('permissionSettingsHint'), 'permissionSettingsHint i18n key');

// 11. No standalone permissions page (capabilities in My page)
console.log('\n[11] No standalone permissions page');
assert(leg && !leg.includes("page==='permissions'"), 'no standalone permissions page switch');

// 12. Initialization
console.log('\n[12] Initialization');
assert(leg && leg.includes('ShikePermissionCenter.init'), 'PermissionCenter init called');

console.log('\n========================================');
console.log('Permission Center tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
