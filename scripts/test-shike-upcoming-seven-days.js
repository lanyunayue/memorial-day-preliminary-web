/**
 * v2.0.0-rc5.2 Upcoming Seven Days Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Upcoming Seven Days Tests ===\n');

const leg = readSafe(path.join(V,'src/legacy-app.js'));
const html = readSafe(path.join(V,'index.html'));

// 1. Week strip exists
console.log('[1] Week strip');
assert(html && html.includes('weekStrip'), 'weekStrip element exists');
assert(leg && leg.includes('renderWeekStrip'), 'renderWeekStrip function exists');

// 2. Today highlighting
console.log('\n[2] Today highlighting');
assert(leg && leg.includes('isToday') || leg.includes('today'), 'today detection exists');

// 3. Rolling window concept
console.log('\n[3] Rolling window');
assert(leg && leg.includes('getDate'), 'date functions used');
assert(leg && leg.includes('setDate') || leg.includes('getDate'), 'date manipulation for rolling window');

// 4. Next block
console.log('\n[4] Next block');
assert(html && html.includes('nextBlock'), 'nextBlock element exists');
assert(leg && leg.includes('renderNext') || leg.includes('nextBlock'), 'renderNext function exists');

// 5. Overdue concept
console.log('\n[5] Overdue');
assert(leg && (leg.includes('overdue') || leg.includes('逾期') || leg.includes('past')), 'overdue concept exists');

// 6. Today block
console.log('\n[6] Today block');
assert(leg && leg.includes('todayOverview') || leg.includes('todayOverviewBlock'), 'today overview exists');

// 7. Recent block
console.log('\n[7] Recent block');
assert(html && html.includes('recentBlock'), 'recentBlock element exists');

// 8. Hero cards
console.log('\n[8] Hero cards');
assert(html && html.includes('heroCardsBlock'), 'heroCardsBlock element exists');
assert(leg && leg.includes('pinned') || leg.includes('pinnedRecords'), 'pinned records concept');

console.log('\n========================================');
console.log('Upcoming Seven Days tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
