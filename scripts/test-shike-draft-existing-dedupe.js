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

add('record duplicate key helper exists', () => {
  assert(script.includes('function getRecordDuplicateKey(record)'), 'getRecordDuplicateKey missing');
  assert(script.includes('function isDraftExistingDuplicate(draft)'), 'isDraftExistingDuplicate missing');
});

add('duplicate key includes title date time repeat and kind', () => {
  const start = script.indexOf('function getRecordDuplicateKey(record)');
  const end = script.indexOf('function isDraftExistingDuplicate', start);
  const code = script.slice(start, end);
  ['record.title', 'record.dateKey', 'record.timeText', 'record.repeat', 'record.recordKind'].forEach((token) => {
    assert(code.includes(token), `${token} should be part of duplicate key`);
  });
});

add('draft duplicate check compares against saved records', () => {
  const start = script.indexOf('function isDraftExistingDuplicate(draft)');
  const end = script.indexOf('function prepareBatchCaptureDrafts', start);
  const code = script.slice(start, end);
  assert(code.includes('records.some(function(record)'), 'duplicate check should inspect records');
  assert(code.includes('getRecordDuplicateKey(record)===key'), 'duplicate check should compare normalized keys');
});

add('rendered draft shows existing marker', () => {
  const start = script.indexOf('function renderDrafts()');
  const end = script.indexOf('function saveDraft', start);
  const code = script.slice(start, end);
  assert(code.includes('isDraftExistingDuplicate(d)'), 'renderDrafts should check duplicate drafts');
  assert(code.includes("t('draftExisting')"), 'duplicate draft marker should render via i18n');
});

add('single draft save skips existing duplicate', () => {
  const start = script.indexOf('function saveDraft(i)');
  const end = script.indexOf('function discardDraft', start);
  const code = script.slice(start, end);
  assert(code.includes('if(isDraftExistingDuplicate(d))'), 'saveDraft should guard duplicates');
  assert(code.includes("t('draftDuplicateSkipped')"), 'saveDraft should notify duplicate skip via i18n');
  assert(code.indexOf('isDraftExistingDuplicate(d)') < code.indexOf('saveParsedRecord'), 'duplicate check should happen before saving');
});

add('save all skips existing duplicates', () => {
  const start = script.indexOf('function saveAllDrafts()');
  const end = script.indexOf('/* ========== My page', start);
  const code = script.slice(start, end);
  assert(code.includes('if(isDraftExistingDuplicate(d)){skipped++;return;}'), 'saveAllDrafts should skip duplicates');
  assert(code.indexOf('isDraftExistingDuplicate(d)') < code.indexOf('saveParsedRecord'), 'saveAll duplicate check should happen before saving');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Draft existing dedupe regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Draft existing dedupe regression passed: ${checks.length}/${checks.length}`);
