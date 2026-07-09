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

add('parse preview card exists', () => {
  assert(html.includes('id="parsePreviewBlock"'), 'parsePreviewBlock missing');
  assert(script.includes('function renderParsePreview()'), 'renderParsePreview missing');
  assert(script.includes('id="parsePreviewCard"'), 'parsePreviewCard missing');
});

add('meeting input can preview reminder title and time', () => {
  assert(script.includes('parseReminderText(text)'), 'preview should reuse parser output');
  assert(script.includes('我理解为'), 'preview heading missing');
  assert(script.includes('15:00'), 'afternoon 3 correction/preview time support missing');
});

add('monthly credit card preview can show monthly', () => {
  assert(script.includes("value:'monthly'"), 'monthly repeat chip missing');
  assert(script.includes('parsePreviewRepeatLabel'), 'repeat preview label missing');
});

add('mom birthday preview can show anniversary', () => {
  assert(script.includes("value:'anniversary'"), 'anniversary kind chip missing');
  assert(script.includes("p.cardStyle=value==='anniversary'?'large':'normal'"), 'anniversary card style correction missing');
});

add('daily bedtime input can show habit', () => {
  assert(script.includes("value:'habit'"), 'habit kind chip missing');
  assert(script.includes("value:'daily'"), 'daily repeat chip missing');
});

add('confirm create button exists', () => {
  assert(script.includes('确认创建'), 'confirm create button missing');
  assert(script.includes('function confirmParsePreview()'), 'confirmParsePreview missing');
});

add('continue editing button exists', () => {
  assert(script.includes('继续修改'), 'continue editing button missing');
  assert(script.includes('function continueEditingPreview()'), 'continueEditingPreview missing');
});

add('preview setting exists', () => {
  assert(script.includes('解析预览'), 'preview setting copy missing');
  assert(script.includes('setParsePreviewEnabled'), 'preview toggle function missing');
});

add('localStorage key is used', () => {
  assert(script.includes("shike_parse_preview_enabled"), 'parse preview localStorage key missing');
  assert(script.includes('localStorage.getItem(PARSE_PREVIEW_KEY)'), 'parse preview key should be read');
});

add('preview code does not intentionally render undefined or null', () => {
  const code = script.slice(script.indexOf('var PARSE_PREVIEW_KEY'), script.indexOf('/* ========== Clock ========== */'));
  assert(!/>undefined</.test(code), 'literal undefined output found');
  assert(!/>null</.test(code), 'literal null output found');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Parse preview regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Parse preview regression passed: ${checks.length}/${checks.length}`);

