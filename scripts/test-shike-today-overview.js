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

function add(name, run) {
  checks.push({ name, run });
}

add('today overview exists', () => {
  assert(html.includes('id="todayOverviewBlock"'), 'todayOverviewBlock container missing');
  assert(script.includes('function renderTodayOverview()'), 'renderTodayOverview function missing');
  assert(script.includes('renderTodayOverview();'), 'renderHome should call renderTodayOverview');
});

add('today record count copy exists', () => {
  assert(script.includes("todayOverviewCount:'今天 {n} 个时刻'"), 'today count copy missing');
  assert(script.includes("tf('todayOverviewCount',{n:data.todayCount})"), 'today count rendering missing');
});

add('nearest future record copy exists', () => {
  assert(script.includes("overviewNext:'最近'"), 'nearest future label missing');
  assert(script.includes('formatOverviewRecord(data.next,false)'), 'nearest future rendering missing');
});

add('nearest anniversary copy exists', () => {
  assert(script.includes("overviewAnniv:'纪念'"), 'anniversary label missing');
  assert(script.includes('formatOverviewRecord(data.anniversary,true)'), 'anniversary rendering missing');
});

add('empty state copy exists', () => {
  assert(script.includes('overviewEmpty'), 'empty overview copy missing');
  assert(script.includes('addDemoRecords()'), 'empty overview should offer demo examples');
});

add('overview does not block the home input', () => {
  const inputIndex = html.indexOf('id="quickInput"');
  const overviewIndex = html.indexOf('id="todayOverviewBlock"');
  assert(inputIndex >= 0 && overviewIndex > inputIndex, 'overview should render after the main input');
});

add('overview is compatible with demo examples', () => {
  assert(script.includes('refreshAfterDemoImport()'), 'demo refresh hook missing');
  assert(script.includes('renderHome();'), 'demo import should rerender home overview');
});

add('overview code does not render undefined or null text intentionally', () => {
  const overviewCode = script.slice(script.indexOf('function formatRecordShortDate'), script.indexOf('function getTimelineGroups'));
  assert(!/>undefined</.test(overviewCode), 'overview contains literal undefined output');
  assert(!/>null</.test(overviewCode), 'overview contains literal null output');
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Today overview regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Today overview regression passed: ${checks.length}/${checks.length}`);

