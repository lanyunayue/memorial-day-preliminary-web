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

const legacyApp = fs.readFileSync(path.join(root, 'src/legacy-app.js'), 'utf8');

// Extract My page section
const myStart = html.indexOf('id="page-my"');
const myEnd = html.indexOf('<!-- Drawer -->', myStart);
const mySection = html.slice(myStart, myEnd);

// [1] My page has reminderSection
section('My page has reminderSection');
check('reminderSection exists in My page', mySection.includes('id="reminderSection"'));
check('reminderSection is within settings-list', mySection.indexOf('id="reminderSection"') > mySection.indexOf('class="settings-list"'));

// [2] My page has permissionSection
section('My page has permissionSection');
check('permissionSection exists in My page', mySection.includes('id="permissionSection"'));
check('permissionSection is within settings-list', mySection.indexOf('id="permissionSection"') > mySection.indexOf('class="settings-list"'));

// [3] My page has dataBackupSection (renamed from dataSafetySection)
section('My page has dataBackupSection (renamed from dataSafetySection)');
check('dataBackupSection exists in My page', mySection.includes('id="dataBackupSection"'));
check('dataBackupSection is within settings-list', mySection.indexOf('id="dataBackupSection"') > mySection.indexOf('class="settings-list"'));
check('Old dataSafetySection ID does not exist in HTML', !html.includes('id="dataSafetySection"'));
check('dataBackupSection contains backup label', mySection.includes('data-i18n="dataBackup"'));

// [4] No data-page entries for removed settings pages
section('No data-page entries for removed settings pages');
const removedPages = ['watch','permissions','data-safety','reminder-diagnostics'];
removedPages.forEach(p => {
  check(`No data-page="${p}" in HTML`, !html.includes(`data-page="${p}"`));
  check(`No id="page-${p}" in HTML`, !html.includes(`id="page-${p}"`));
});
check('No page-permissions div', !html.includes('id="page-permissions"'));
check('No page-data-safety div', !html.includes('id="page-data-safety"'));
check('No page-reminder-diagnostics div', !html.includes('id="page-reminder-diagnostics"'));

// [5] Feature hub buttons that used to open removed pages now jump to my sections
section('Feature hub buttons jump to my sections');
check('safety action jumps to dataBackupSection', /action==='safety'\)\{jumpToMySection\('dataBackupSection'\)/.test(legacyApp));
check('calendar action jumps to calendarExportSection', /action==='calendar'\)\{jumpToMySection\('calendarExportSection'\)/.test(legacyApp));
check('openFeatureHubAction function exists', legacyApp.includes('function openFeatureHubAction'));
// Verify all data-feature-action values in HTML have corresponding handlers
const featureActions = [...html.matchAll(/data-feature-action="([^"]+)"/g)].map(m => m[1]);
const uniqueActions = [...new Set(featureActions)];
uniqueActions.forEach(action => {
  check(`Feature action "${action}" has handler in openFeatureHubAction`, new RegExp(`action===\\s*['"]${action}['"]`).test(legacyApp));
});

// Summary
console.log(`\n========================================`);
console.log(`Settings consolidation: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
