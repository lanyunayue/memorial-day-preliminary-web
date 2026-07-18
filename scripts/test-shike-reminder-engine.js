/**
 * v2.2.0-alpha4 Reminder Engine Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Reminder Engine Tests ===\n');

const eng = readSafe(path.join(V,'src/reminders/reminder-engine.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

console.log('[1] Module existence');
assert(eng !== null, 'reminder-engine.js exists');
assert(eng && eng.includes('ShikeReminderEngine'), 'ShikeReminderEngine exported');

console.log('\n[2] Core functions');
assert(eng && eng.includes('scheduleReminder'), 'scheduleReminder');
assert(eng && eng.includes('checkReminders'), 'checkReminders');
assert(eng && eng.includes('markShown'), 'markShown');
assert(eng && eng.includes('acknowledge'), 'acknowledge');
assert(eng && eng.includes('snooze'), 'snooze');
assert(eng && eng.includes('markMissed'), 'markMissed');
assert(eng && eng.includes('getAllReminders'), 'getAllReminders');
assert(eng && eng.includes('getReminder'), 'getReminder');
assert(eng && eng.includes('removeReminder'), 'removeReminder');
assert(eng && eng.includes('deduplicate'), 'deduplicate');

console.log('\n[3] Reminder states');
assert(eng && eng.includes('scheduled'), 'scheduled state');
assert(eng && eng.includes('due'), 'due state');
assert(eng && eng.includes('shown'), 'shown state');
assert(eng && eng.includes('acknowledged'), 'acknowledged state');
assert(eng && eng.includes('snoozed'), 'snoozed state');
assert(eng && eng.includes('missed'), 'missed state');
assert(eng && eng.includes('failed'), 'failed state');

console.log('\n[4] Persistence');
assert(eng && eng.includes('shike_reminders'), 'localStorage key');
assert(eng && eng.includes('dueTime'), 'dueTime field');
assert(eng && eng.includes('recordId'), 'recordId field');
assert(eng && eng.includes('createdAt'), 'createdAt field');

console.log('\n[5] HTML integration');
assert(html && html.includes('reminder-engine.js'), 'script tag in HTML');

console.log('\n[6] SW precache');
assert(sw && sw.includes('reminder-engine.js'), 'in SW precache');

console.log('\n[7] Capability flags');
assert(leg && leg.includes('capabilityReminderEngine'), 'capabilityReminderEngine flag');

console.log('\n========================================');
console.log('Reminder Engine tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
