const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

add('example chip area exists', () => {
  assert(html.includes('id="exampleChips"'), 'exampleChips container missing');
  assert(script.includes('function renderExampleChips()'), 'renderExampleChips missing');
});

add('at least five example chips exist', () => {
  const match = script.match(/var exampleChipTexts=\[([^\]]+)\]/);
  assert(match, 'exampleChipTexts missing');
  const count = (match[1].match(/'/g) || []).length / 2;
  assert(count >= 5, `expected at least 5 examples, got ${count}`);
});

add('clicking example fills input', () => {
  assert(script.includes('function useExampleChip(text)'), 'useExampleChip missing');
  assert(script.includes('inp.value=text'), 'example chip should fill quick input');
});

add('clicking example triggers parse preview', () => {
  assert(script.includes('showParsePreview(text)'), 'example chip should trigger parse preview');
});

add('clicking example does not directly save', () => {
  const code = script.slice(script.indexOf('function useExampleChip'), script.indexOf('function getUndatedRecords'));
  assert(!code.includes('saveParsedRecord'), 'example chip should not save directly');
});

add('mobile horizontal overflow is guarded', () => {
  assert(style.includes('.example-chips{display:flex'), 'example chip flex style missing');
  assert(style.includes('overflow-x:auto'), 'example chips should scroll horizontally');
  assert(style.includes('scrollbar-width:none'), 'example chips should hide scrollbar gently');
});

add('dark theme readability uses theme tokens', () => {
  assert(style.includes('background:var(--bg-soft)'), 'example chips should use theme background token');
  assert(style.includes('color:var(--ink-soft)'), 'example chips should use theme color token');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Example chips regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Example chips regression passed: ${checks.length}/${checks.length}`);

