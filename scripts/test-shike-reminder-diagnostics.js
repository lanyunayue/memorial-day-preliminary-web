/**
 * v2.0.0-rc5 Reminder Diagnostics Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Reminder Diagnostics Tests ===\n');

const diag = readSafe(path.join(V,'src/reminders/reminder-diagnostics.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

console.log('[1] Module existence');
assert(diag !== null, 'reminder-diagnostics.js exists');
assert(diag && diag.includes('ShikeReminderDiagnostics'), 'ShikeReminderDiagnostics exported');

console.log('\n[2] Core functions');
assert(diag && diag.includes('runDiagnostics'), 'runDiagnostics');
assert(diag && diag.includes('render'), 'render');
assert(diag && diag.includes('testNotification'), 'testNotification');
assert(diag && diag.includes('testDelayedReminder'), 'testDelayedReminder');
assert(diag && diag.includes('exportCalendar'), 'exportCalendar');
assert(diag && diag.includes('getPushBetaStatus'), 'getPushBetaStatus');

console.log('\n[3] Diagnostic info');
assert(diag && diag.includes('PWA'), 'PWA install state check');
assert(diag && diag.includes('Notification'), 'Notification permission check');
assert(diag && diag.includes('serviceWorker') || diag.includes('Service Worker'), 'SW status check');
assert(diag && diag.includes('visibilityState') || diag.includes('visibility'), 'Page visibility');
assert(diag && diag.includes('shike_last_notification'), 'last notification time');
assert(diag && diag.includes('shike_last_reminder_check'), 'last reminder check');

console.log('\n[4] Honest messaging');
assert(diag && diag.includes('仅依靠本地网页无法保证浏览器完全关闭后准时提醒'), 'honest background limitation text');
assert(diag && diag.includes('页面打开时会检查提醒'), 'honest reminder check note');

console.log('\n[5] Push beta');
assert(diag && diag.includes('not_configured'), 'push beta status not_configured');
assert(diag && diag.includes('云推送') || diag.includes('cloud push'), 'cloud push mention');

console.log('\n[6] HTML integration');
assert(html && html.includes('reminder-diagnostics.js'), 'script tag in HTML');
assert(html && html.includes('page-reminder-diagnostics'), 'reminder diagnostics page');
assert(html && html.includes('reminderDiagContainer'), 'container in HTML');
assert(html && html.includes('navReminderDiag'), 'nav item');

console.log('\n[7] SW precache');
assert(sw && sw.includes('reminder-diagnostics.js'), 'in SW precache');

console.log('\n[8] Legacy integration');
assert(leg && leg.includes('capabilityReminderDiagnostics'), 'capability flag');
assert(leg && leg.includes('ShikeReminderDiagnostics'), 'module referenced');
assert(leg && leg.includes('ShikeReminderScheduler'), 'scheduler started in init');

console.log('\n[9] i18n');
assert(leg && leg.includes('navReminderDiag'), 'navReminderDiag i18n');
assert(leg && leg.includes('testNotification'), 'testNotification i18n');
assert(leg && leg.includes('exportCalendar'), 'exportCalendar i18n');
assert(leg && leg.includes('releaseCenterV200rc4'), 'releaseCenterV200rc4 i18n');

console.log('\n========================================');
console.log('Reminder Diagnostics tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
