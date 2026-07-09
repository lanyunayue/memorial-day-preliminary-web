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

add('draft edit function exists', () => {
  assert(script.includes('function editDraft(i)'), 'editDraft missing');
});

add('draft row renders edit action between save and cancel', () => {
  const start = script.indexOf('function renderDrafts()');
  const end = script.indexOf('function saveDraft', start);
  const code = script.slice(start, end);
  assert(code.includes('onclick="editDraft(\'+i+\')"'), 'draft edit button missing');
  assert(code.indexOf('saveDraft') < code.indexOf('editDraft'), 'edit should appear after save');
  assert(code.indexOf('editDraft') < code.indexOf('discardDraft'), 'edit should appear before cancel');
});

add('editing removes the selected draft', () => {
  const start = script.indexOf('function editDraft(i)');
  const end = script.indexOf('function saveAllDrafts', start);
  const code = script.slice(start, end);
  assert(code.includes('importDrafts.splice(i,1);'), 'edit should remove draft from inbox');
  assert(code.includes('renderDrafts();'), 'edit should rerender drafts');
});

add('editing returns to home input', () => {
  const start = script.indexOf('function editDraft(i)');
  const end = script.indexOf('function saveAllDrafts', start);
  const code = script.slice(start, end);
  assert(code.includes("switchPage('home')"), 'edit should switch to home');
  assert(code.includes("var inp=$('quickInput')"), 'edit should target quickInput');
  assert(code.includes('inp.value=d.text'), 'edit should restore original draft text');
});

add('editing reopens parse preview when enabled', () => {
  const start = script.indexOf('function editDraft(i)');
  const end = script.indexOf('function saveAllDrafts', start);
  const code = script.slice(start, end);
  assert(code.includes('if(isParsePreviewEnabled())showParsePreview(inp.value||\'\');'), 'edit should reopen parse preview');
});

add('batch capture still routes multiline input to drafts', () => {
  assert(script.includes('function captureBatchFromInput(text)'), 'batch capture should still exist');
  assert(script.includes('importDrafts=drafts'), 'batch capture should still create drafts');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Draft edit handoff regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Draft edit handoff regression passed: ${checks.length}/${checks.length}`);
