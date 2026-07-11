/**
 * v2.0.0-rc5 Calendar Bridge Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Calendar Bridge Tests ===\n');

const cal = readSafe(path.join(V,'src/reminders/calendar-bridge.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

console.log('[1] Module existence');
assert(cal !== null, 'calendar-bridge.js exists');
assert(cal && cal.includes('ShikeCalendarBridge'), 'ShikeCalendarBridge exported');

console.log('\n[2] Core functions');
assert(cal && cal.includes('generateICS'), 'generateICS');
assert(cal && cal.includes('generateAllICS'), 'generateAllICS');
assert(cal && cal.includes('generateCancelICS'), 'generateCancelICS');
assert(cal && cal.includes('downloadICS'), 'downloadICS');
assert(cal && cal.includes('shareICS'), 'shareICS');

console.log('\n[3] ICS format');
assert(cal && cal.includes('VCALENDAR'), 'VCALENDAR');
assert(cal && cal.includes('VEVENT'), 'VEVENT');
assert(cal && cal.includes('DTSTART'), 'DTSTART');
assert(cal && cal.includes('DTEND'), 'DTEND');
assert(cal && cal.includes('SUMMARY'), 'SUMMARY');
assert(cal && cal.includes('DESCRIPTION'), 'DESCRIPTION');
assert(cal && cal.includes('UID'), 'UID');
assert(cal && cal.includes('VALARM'), 'VALARM');

console.log('\n[4] UID format');
assert(cal && cal.includes('shike-'), 'UID prefix shike-');
assert(cal && cal.includes('shike.app'), 'UID domain shike.app');

console.log('\n[5] All-day support');
assert(cal && cal.includes('VALUE=DATE'), 'all-day event support');

console.log('\n[6] Repeat rules');
assert(cal && cal.includes('RRULE'), 'RRULE support');

console.log('\n[7] Download');
assert(cal && cal.includes('Blob'), 'uses Blob');
assert(cal && cal.includes('createObjectURL'), 'uses createObjectURL');

console.log('\n[8] Web Share');
assert(cal && cal.includes('navigator.share') || cal.includes('Web Share'), 'Web Share API');

console.log('\n[9] Integration');
assert(html && html.includes('calendar-bridge.js'), 'script tag in HTML');
assert(sw && sw.includes('calendar-bridge.js'), 'in SW precache');
assert(leg && leg.includes('capabilityCalendarBridge'), 'capabilityCalendarBridge flag');

console.log('\n========================================');
console.log('Calendar Bridge tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
