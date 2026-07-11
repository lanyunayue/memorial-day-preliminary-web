/**
 * v2.0.0-rc5.1 Reminder Scheduler Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Reminder Scheduler Tests ===\n');

const sched = readSafe(path.join(V,'src/reminders/reminder-scheduler.js'));
const repo = readSafe(path.join(V,'src/reminders/reminder-repository.js'));
const stat = readSafe(path.join(V,'src/reminders/reminder-status.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));

console.log('[1] Module existence');
assert(sched !== null, 'reminder-scheduler.js exists');
assert(repo !== null, 'reminder-repository.js exists');
assert(stat !== null, 'reminder-status.js exists');

console.log('\n[2] Scheduler functions');
assert(sched && sched.includes('ShikeReminderScheduler'), 'ShikeReminderScheduler exported');
assert(sched && sched.includes('start'), 'start function');
assert(sched && sched.includes('stop'), 'stop function');
assert(sched && sched.includes('isRunning'), 'isRunning function');
assert(sched && sched.includes('setInterval'), 'setInterval function');
assert(sched && sched.includes('checkNow'), 'checkNow function');

console.log('\n[3] Default interval');
assert(sched && sched.includes('60000'), '60000ms default interval');

console.log('\n[4] Visibility compensation');
assert(sched && sched.includes('visibilitychange'), 'visibilitychange listener');

console.log('\n[5] Repository');
assert(repo && repo.includes('ShikeReminderRepository'), 'ShikeReminderRepository exported');
assert(repo && repo.includes('save'), 'save function');
assert(repo && repo.includes('getAll'), 'getAll function');
assert(repo && repo.includes('getById'), 'getById function');
assert(repo && repo.includes('deleteById'), 'deleteById function');
assert(repo && repo.includes('getByStatus'), 'getByStatus function');
assert(repo && repo.includes('shike_reminder_store'), 'IndexedDB store name');

console.log('\n[6] Status');
assert(stat && stat.includes('ShikeReminderStatus'), 'ShikeReminderStatus exported');
assert(stat && stat.includes('getStatusSummary'), 'getStatusSummary function');
assert(stat && stat.includes('getUpcoming'), 'getUpcoming function');
assert(stat && stat.includes('getOverdue'), 'getOverdue function');
assert(stat && stat.includes('formatStatus'), 'formatStatus function');
assert(stat && stat.includes('已安排'), 'scheduled status text');
assert(stat && stat.includes('已到期'), 'due status text');
assert(stat && stat.includes('已错过'), 'missed status text');

console.log('\n[7] Integration');
assert(html && html.includes('reminder-scheduler.js'), 'scheduler in HTML');
assert(html && html.includes('reminder-repository.js'), 'repository in HTML');
assert(html && html.includes('reminder-status.js'), 'status in HTML');
assert(sw && sw.includes('reminder-scheduler.js'), 'scheduler in SW');
assert(sw && sw.includes('reminder-repository.js'), 'repository in SW');
assert(sw && sw.includes('reminder-status.js'), 'status in SW');

console.log('\n========================================');
console.log('Reminder Scheduler tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
