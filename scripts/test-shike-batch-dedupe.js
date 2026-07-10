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

add('batch draft key helper exists', () => {
  assert(script.includes('function getBatchDraftKey(line)'), 'getBatchDraftKey missing');
});

add('batch draft key trims and normalizes whitespace', () => {
  const start = script.indexOf('function getBatchDraftKey(line)');
  const end = script.indexOf('function prepareBatchCaptureDrafts', start);
  const code = script.slice(start, end);
  assert(code.includes("replace(/\\s+/g,' ')"), 'draft key should normalize whitespace');
  assert(code.includes('.trim().toLowerCase()'), 'draft key should trim and lowercase');
});

add('prepare batch drafts tracks seen keys', () => {
  const start = script.indexOf('function prepareBatchCaptureDrafts(text)');
  const end = script.indexOf('function captureBatchFromInput', start);
  const code = script.slice(start, end);
  assert(code.includes('var seen={}'), 'seen map missing');
  assert(code.includes('if(!key||seen[key])return;'), 'duplicate guard missing');
  assert(code.includes('seen[key]=true;'), 'seen assignment missing');
});

add('dedupe happens before parsing to avoid duplicate drafts', () => {
  const start = script.indexOf('function prepareBatchCaptureDrafts(text)');
  const end = script.indexOf('function captureBatchFromInput', start);
  const code = script.slice(start, end);
  assert(code.indexOf('if(!key||seen[key])return;') < code.indexOf('parseReminderText(line)'), 'dedupe should run before parser work');
});

add('unique lines still produce drafts through parser', () => {
  assert(script.includes('normalizeCapturePreviewParsed(line,parseReminderText(line))'), 'unique draft parsing should remain');
  assert(script.includes('drafts.push({text:line,parsed:parsed})'), 'valid parsed draft should be pushed');
});

add('batch capture still stores prepared drafts', () => {
  assert(script.includes('importDrafts=drafts'), 'batch capture should store drafts');
  assert(script.includes("switchPage('import')"), 'batch capture should open import page');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Batch dedupe regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Batch dedupe regression passed: ${checks.length}/${checks.length}`);
