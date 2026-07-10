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

add('batch capture helpers exist', () => {
  assert(script.includes('function getBatchCaptureLines(text)'), 'getBatchCaptureLines missing');
  assert(script.includes('function shouldUseBatchCapture(text)'), 'shouldUseBatchCapture missing');
  assert(script.includes('function prepareBatchCaptureDrafts(text)'), 'prepareBatchCaptureDrafts missing');
  assert(script.includes('function captureBatchFromInput(text)'), 'captureBatchFromInput missing');
});

add('batch capture only triggers on multiple non-empty lines', () => {
  assert(script.includes('getBatchCaptureLines(text).length>=2'), 'batch trigger should require at least two lines');
  assert(script.includes('split(/\\r?\\n+/)'), 'batch capture should split on newline blocks');
});

add('batch capture reuses parser and preview normalization', () => {
  assert(script.includes('normalizeCapturePreviewParsed(line,parseReminderText(line))'), 'batch drafts should reuse parser and preview normalization');
});

add('home save routes multi-line input to import drafts before parse preview', () => {
  const start = script.indexOf('function saveFromInput()');
  const end = script.indexOf('function deleteRecord', start);
  const code = script.slice(start, end);
  assert(code.includes('if(captureBatchFromInput(text))return;'), 'saveFromInput should route batch input');
  assert(code.indexOf('captureBatchFromInput(text)') < code.indexOf('isParsePreviewEnabled()'), 'batch route should happen before single-item parse preview');
});

add('direct save also routes multi-line input to import drafts', () => {
  const start = script.indexOf('function directSaveFromInput()');
  const end = script.indexOf('function renderExampleChips', start);
  const code = script.slice(start, end);
  assert(code.includes('if(captureBatchFromInput(text))return;'), 'directSaveFromInput should route batch input');
});

add('batch capture opens import page and renders drafts', () => {
  const start = script.indexOf('function captureBatchFromInput(text)');
  const end = script.indexOf('function renderImport()', start);
  const code = script.slice(start, end);
  assert(code.includes("switchPage('import')"), 'batch capture should switch to import page');
  assert(code.includes('renderImport()'), 'batch capture should render import page');
  assert(code.includes('importDrafts=drafts'), 'batch capture should store drafts');
});

add('import parse button uses same batch draft preparation', () => {
  assert(script.includes('importDrafts=prepareBatchCaptureDrafts(txt);'), 'import parse button should reuse prepareBatchCaptureDrafts');
});

add('single-line save behavior remains available', () => {
  assert(script.includes('if(isPendingPreviewForText(text)){confirmParsePreview();return;}'), 'single-line enter confirm should remain');
  assert(script.includes('directSaveFromInput();'), 'single-line direct save path should remain');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Batch capture inbox regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Batch capture inbox regression passed: ${checks.length}/${checks.length}`);
