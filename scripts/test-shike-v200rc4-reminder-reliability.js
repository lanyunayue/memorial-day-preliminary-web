/**
 * v2.0.0-rc5 Reminder Reliability Release Candidate Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== v2.0.0-rc5 Reminder Reliability Tests ===\n');

const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));
const ver = readSafe(path.join(V,'src/config/version.js'));

console.log('[1] Version');
assert(ver && ver.includes('v2.0.0-rc5'), 'APP_VERSION is v2.0.0-rc5');
assert(sw && sw.includes('shike-v200rc5-v59'), 'CACHE_NAME is shike-v200rc5-v59');

console.log('\n[2] Parser integrity');
const crypto = require('crypto');
const parser = readSafe(path.join(V,'src/parser/parser-adapter.js'));
if(parser){
  const hash = crypto.createHash('sha256').update(parser).digest('hex');
  assert(hash === 'd6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32', 'parser hash unchanged');
}

console.log('\n[3] Reminder modules');
assert(fs.existsSync(path.join(V,'src/reminders/reminder-engine.js')), 'reminder-engine.js exists');
assert(fs.existsSync(path.join(V,'src/reminders/reminder-repository.js')), 'reminder-repository.js exists');
assert(fs.existsSync(path.join(V,'src/reminders/reminder-scheduler.js')), 'reminder-scheduler.js exists');
assert(fs.existsSync(path.join(V,'src/reminders/reminder-status.js')), 'reminder-status.js exists');
assert(fs.existsSync(path.join(V,'src/reminders/calendar-bridge.js')), 'calendar-bridge.js exists');
assert(fs.existsSync(path.join(V,'src/reminders/reminder-diagnostics.js')), 'reminder-diagnostics.js exists');

console.log('\n[4] HTML structure');
assert(html && html.includes('page-reminder-diagnostics'), 'reminder diagnostics page');
assert(html && html.includes('reminderDiagContainer'), 'diagnostics container');
assert(html && html.includes('navReminderDiag'), 'nav item');

console.log('\n[5] SW precache');
assert(sw && sw.includes('reminder-engine.js'), 'engine in precache');
assert(sw && sw.includes('reminder-repository.js'), 'repository in precache');
assert(sw && sw.includes('reminder-scheduler.js'), 'scheduler in precache');
assert(sw && sw.includes('reminder-status.js'), 'status in precache');
assert(sw && sw.includes('calendar-bridge.js'), 'calendar in precache');
assert(sw && sw.includes('reminder-diagnostics.js'), 'diagnostics in precache');

console.log('\n[6] Capabilities');
assert(leg && leg.includes('capabilityV200rc4'), 'capabilityV200rc4 flag');
assert(leg && leg.includes('capabilityReminderEngine'), 'capabilityReminderEngine flag');
assert(leg && leg.includes('capabilityCalendarBridge'), 'capabilityCalendarBridge flag');
assert(leg && leg.includes('capabilityReminderDiagnostics'), 'capabilityReminderDiagnostics flag');

console.log('\n[7] i18n');
assert(leg && leg.includes('navReminderDiag'), 'navReminderDiag i18n');
assert(leg && leg.includes('releaseCenterV200rc4'), 'releaseCenterV200rc4 i18n');
assert(leg && leg.includes('reminderAdvice'), 'reminderAdvice i18n');
assert(leg && leg.includes('reminderCheckNote'), 'reminderCheckNote i18n');

console.log('\n[8] Scheduler init');
assert(leg && leg.includes('ShikeReminderScheduler'), 'scheduler referenced in init');
assert(leg && leg.includes('60000'), '60s interval in init');

console.log('\n[9] Honest messaging');
assert(leg && leg.includes('仅依靠本地网页无法保证浏览器完全关闭后准时提醒'), 'honest limitation text');
assert(leg && leg.includes('页面打开时会检查提醒'), 'honest check note');

console.log('\n[10] Security');
assert(!leg || !leg.includes('API_KEY'), 'no API keys');
assert(!leg || !leg.includes('token_'), 'no tokens');

console.log('\n========================================');
console.log('v2.0.0-rc5 Reminder Reliability tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
