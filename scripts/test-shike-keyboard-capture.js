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

add('pending preview can be matched to current input', () => {
  assert(script.includes('function isPendingPreviewForText(text)'), 'isPendingPreviewForText missing');
  assert(script.includes("pendingParsePreview.raw===(text||'').trim()"), 'pending preview should compare raw text');
});

add('enter confirms an existing preview', () => {
  const start = script.indexOf('function saveFromInput()');
  const end = script.indexOf('function deleteRecord', start);
  const code = script.slice(start, end);
  assert(code.includes('if(isPendingPreviewForText(text)){confirmParsePreview();return;}'), 'saveFromInput should confirm matching preview');
});

add('first enter still opens preview when no pending preview exists', () => {
  const start = script.indexOf('function saveFromInput()');
  const end = script.indexOf('function deleteRecord', start);
  const code = script.slice(start, end);
  assert(code.includes('if(!showParsePreview(text)){showToast'), 'saveFromInput should still show preview first');
});

add('direct save button bypasses preview confirmation', () => {
  assert(script.includes('onclick="directSaveFromInput()">'), 'direct save button should call directSaveFromInput');
});

add('ctrl or command enter direct saves from input', () => {
  assert(script.includes("if((e.ctrlKey||e.metaKey)&&e.key==='Enter')"), 'ctrl/meta enter handler missing');
  assert(script.includes('directSaveFromInput();return;'), 'ctrl/meta enter should direct save');
});

add('escape cancels current parse preview', () => {
  assert(script.includes("if(e.key==='Escape'&&pendingParsePreview)"), 'escape handler missing');
  assert(script.includes('pendingParsePreview=null;renderParsePreview();return;'), 'escape should clear preview');
});

add('shift enter remains available for multiline text', () => {
  assert(script.includes("if(e.key==='Enter'&&!e.shiftKey)"), 'plain enter handler should preserve shift enter multiline behavior');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Keyboard capture regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Keyboard capture regression passed: ${checks.length}/${checks.length}`);
