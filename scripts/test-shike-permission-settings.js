const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

let pass = 0;
let fail = 0;
const failures = [];
let secNum = 0;

function section(name) {
  secNum++;
  console.log(`\n[${secNum}] ${name}`);
}

function check(name, condition) {
  if (condition) {
    pass++;
    console.log(`  PASS: ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL: ${name}`);
  }
}

// Extract My page and permissionSection
const myStart = html.indexOf('id="page-my"');
const myEnd = html.indexOf('<!-- Drawer -->', myStart);
const mySection = html.slice(myStart, myEnd);
const permStart = mySection.indexOf('id="permissionSection"');
// Find the next setting-group div after permissionSection
const afterPerm = mySection.indexOf('<div class="setting-group">', permStart);
const feedbackStart = mySection.indexOf('id="feedbackSection"');
const permEnd = afterPerm > permStart ? afterPerm : feedbackStart;
const permissionSection = mySection.slice(permStart, permEnd);

// [1] permissionSection contains permNotifyStatus
section('permissionSection contains permNotifyStatus');
check('permNotifyStatus exists in permissionSection', permissionSection.includes('id="permNotifyStatus"'));
check('permNotifyStatus shows notification label', permissionSection.includes('data-i18n="notifyPerm"'));

// [2] permissionSection contains permMicStatus
section('permissionSection contains permMicStatus');
check('permMicStatus exists in permissionSection', permissionSection.includes('id="permMicStatus"'));
check('permMicStatus shows microphone label', permissionSection.includes('data-i18n="microphonePerm"'));

// [3] permissionSection contains permPwaStatus
section('permissionSection contains permPwaStatus');
check('permPwaStatus exists in permissionSection', permissionSection.includes('id="permPwaStatus"'));
check('permPwaStatus shows PWA install label', permissionSection.includes('data-i18n="pwaInstallStatus"'));

// [4] permissionSection contains permStorageStatus
section('permissionSection contains permStorageStatus');
check('permStorageStatus exists in permissionSection', permissionSection.includes('id="permStorageStatus"'));
check('permStorageStatus shows storage persist label', permissionSection.includes('data-i18n="storagePersist"'));

// [5] permissionSection contains reqMicBtn
section('permissionSection contains reqMicBtn');
check('reqMicBtn exists in permissionSection', permissionSection.includes('id="reqMicBtn"'));
check('reqMicBtn has requestMic label', permissionSection.includes('data-i18n="requestMic"'));

// [6] permissionSection contains reqStorageBtn
section('permissionSection contains reqStorageBtn');
check('reqStorageBtn exists in permissionSection', permissionSection.includes('id="reqStorageBtn"'));
check('reqStorageBtn has requestStoragePersist label', permissionSection.includes('data-i18n="requestStoragePersist"'));

// [7] Permission module files still loaded
section('Permission module files still loaded');
const permModules = [
  { file: 'notification-permission.js', path: 'src/permissions/notification-permission.js' },
  { file: 'microphone-permission.js', path: 'src/permissions/microphone-permission.js' },
  { file: 'storage-permission.js', path: 'src/permissions/storage-permission.js' },
  { file: 'pwa-install-state.js', path: 'src/permissions/pwa-install-state.js' },
  { file: 'permission-center.js', path: 'src/permissions/permission-center.js' }
];
permModules.forEach(mod => {
  check(`${mod.file} script tag in HTML`, html.includes(mod.path));
  check(`${mod.file} exists on disk`, fs.existsSync(path.join(root, mod.path)));
});
check('Permission center init called in legacy-app', /ShikePermissionCenter.*?init/.test(fs.readFileSync(path.join(root, 'src/legacy-app.js'), 'utf8')));

// Summary
console.log(`\n========================================`);
console.log(`Permission settings: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
