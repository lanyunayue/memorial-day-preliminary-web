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

add('later inbox block exists', () => {
  assert(html.includes('id="laterInboxBlock"'), 'laterInboxBlock missing');
  assert(script.includes('function renderLaterInbox()'), 'renderLaterInbox missing');
  assert(script.includes('id="laterInbox"'), 'laterInbox panel missing');
});

add('undated count is displayed', () => {
  assert(script.includes('items.length'), 'undated count should use items.length');
  assert(script.includes('条无日期'), 'undated count copy missing');
});

add('latest three undated records are shown', () => {
  assert(script.includes('items.slice(0,3).forEach'), 'later inbox should cap at 3 records');
});

add('set today button exists', () => {
  assert(script.includes("setRecordDateQuick(\\''+r.id+'\\',\\'today\\')") || script.includes("setRecordDateQuick(\\''+r.id+'\\',\\'today\\')"), 'set today action missing');
  assert(script.includes('设为今天'), 'set today copy missing');
});

add('set tomorrow button exists', () => {
  assert(script.includes('设为明天'), 'set tomorrow copy missing');
});

add('set today writes today dateKey', () => {
  assert(script.includes("if(mode==='tomorrow')d.setDate"), 'tomorrow branch missing');
  assert(script.includes('r.dateKey=dateKeyFromDate(d)'), 'quick date action should write dateKey');
  assert(script.includes("r.dateText=mode==='tomorrow'?t('tomorrow'):t('today')"), 'quick date action should write dateText');
});

add('set tomorrow writes tomorrow dateKey', () => {
  assert(script.includes("mode==='tomorrow'"), 'tomorrow mode missing');
  assert(script.includes("setRecordDateQuick(\\''+r.id+'\\',\\'tomorrow\\')") || script.includes('设为明天'), 'tomorrow action missing');
});

add('keep undated clears date without fake date', () => {
  assert(script.includes("if(mode==='none'){r.dateKey='';r.dateText='';}"), 'keep undated should clear date');
});

add('later inbox matches timeline undated logic', () => {
  assert(script.includes('function getUndatedRecords()'), 'getUndatedRecords missing');
  assert(script.includes('return records.filter(function(r){return !r.dateKey;}'), 'undated logic should use missing dateKey');
  assert(script.includes('groups.undated.push(r)'), 'timeline should also use undated group');
});

add('later inbox code does not intentionally render undefined or null', () => {
  const code = script.slice(script.indexOf('function getUndatedRecords'), script.indexOf('/* ========== Clock ========== */'));
  assert(!/>undefined</.test(code), 'literal undefined output found');
  assert(!/>null</.test(code), 'literal null output found');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Later inbox regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Later inbox regression passed: ${checks.length}/${checks.length}`);
