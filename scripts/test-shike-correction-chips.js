const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

add('kind chips exist', () => {
  assert(script.includes("renderPreviewChips('类型','kind'"), 'kind chips missing');
  ['reminder', 'anniversary', 'habit', 'note'].forEach((kind) => assert(script.includes(`value:'${kind}'`), `${kind} chip missing`));
});

add('repeat chips exist', () => {
  assert(script.includes("renderPreviewChips('重复','repeat'"), 'repeat chips missing');
  ['none', 'daily', 'monthly', 'yearly'].forEach((rep) => assert(script.includes(`value:'${rep}'`), `${rep} chip missing`));
});

add('date chips exist', () => {
  assert(script.includes("renderPreviewChips('日期','date'"), 'date chips missing');
  ['keep', 'today', 'tomorrow', 'none'].forEach((value) => assert(script.includes(`value:'${value}'`), `${value} date chip missing`));
});

add('time chips exist', () => {
  assert(script.includes("renderPreviewChips('时间','time'"), 'time chips missing');
  ['keep', 'none', 'morning', 'afternoon', 'evening'].forEach((value) => assert(script.includes(`value:'${value}'`), `${value} time chip missing`));
});

add('corrected kind is used on save', () => {
  assert(script.includes('p.recordKind=value'), 'kind correction should mutate parsed record');
  assert(script.includes('saveParsedRecord(p,pendingParsePreview.raw)'), 'save should use corrected parsed record');
});

add('tomorrow correction writes dateKey', () => {
  assert(script.includes("value==='tomorrow'"), 'tomorrow branch missing');
  assert(script.includes('p.dateKey=dateKeyFromDate(tm)'), 'tomorrow correction should write dateKey');
});

add('afternoon correction writes 15:00', () => {
  assert(script.includes("p.timeText='15:00'"), 'afternoon correction should write 15:00');
});

add('no-date correction clears date', () => {
  assert(script.includes("value==='none'){p.dateKey='';p.dateText='';}"), 'no-date correction should clear date');
});

add('corrected records remain compatible with calendar and ics', () => {
  assert(script.includes('parsePreviewCalendarState'), 'calendar state preview missing');
  assert(script.includes('parsePreviewIcsState'), 'ics state preview missing');
  assert(script.includes('normalizeRecord(item)'), 'saved corrected record should still normalize');
});

add('original parser remains reused', () => {
  assert(!script.includes('function parseReminderTextV2'), 'parser should not be rewritten');
  assert(script.includes('var parsed=parseReminderText(text)'), 'correction should reuse original parser');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Correction chips regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Correction chips regression passed: ${checks.length}/${checks.length}`);

