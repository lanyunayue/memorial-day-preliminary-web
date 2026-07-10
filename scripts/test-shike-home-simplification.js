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

add('home keeps brand and primary input', () => {
  assert(html.includes('id="quickInput"'), 'quick input missing');
  assert(html.includes('data-i18n="appName"'), 'brand missing');
  assert(html.includes('id="todayOverviewBlock"'), 'today overview missing');
});

add('home example and route entries are visually muted', () => {
  assert(html.includes('home-muted-entry'), 'home muted entry class missing');
  assert(style.includes('.home-muted-entry{display:none!important;}'), 'home muted entries should be hidden');
});

add('home renderer no longer fills example chips or demo route', () => {
  const start = script.indexOf('function renderHome()');
  const end = script.indexOf('/* ========== Render: Week Strip', start);
  const code = script.slice(start, end);
  assert(!code.includes('renderExampleChips();'), 'home should not render example chips');
  assert(!code.includes('renderDemoRoute();'), 'home should not render demo route');
});

add('example records entry moved to My page', () => {
  assert(html.includes('id="experienceExampleSection"'), 'My example section missing');
  assert(html.includes('id="demoBtnMy"'), 'My demo button missing');
  assert(script.includes("b('demoBtnMy','click',addDemoRecords)"), 'My demo button should call addDemoRecords');
});

add('existing demo safety remains', () => {
  assert(script.includes('function addDemoRecords()'), 'addDemoRecords missing');
  assert(script.includes('hasDemoRecords()'), 'demo duplicate check missing');
  assert(script.includes('demoRecordExists'), 'demo record duplicate check missing');
});

add('future plan is restrained', () => {
  assert(html.includes('id="futurePlanSection"'), 'future plan section missing');
  ['股票', '大模型自动', '云端同步'].forEach((text) => {
    assert(!html.includes(`已支持${text}`), `future plan should not claim ${text}`);
  });
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Home simplification regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Home simplification regression passed: ${checks.length}/${checks.length}`);
