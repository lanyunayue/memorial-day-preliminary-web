const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

add('time journey entry exists on all page', () => {
  assert(html.includes('id="timelineBlock"'), 'timelineBlock container missing');
  assert(script.includes('function renderTimeline()'), 'renderTimeline function missing');
});

add('today group exists', () => {
  assert(script.includes("timelineToday:'今天'"), 'today timeline label missing');
  assert(script.includes("renderTimelineGroup('today'"), 'today group render missing');
});

add('tomorrow group exists', () => {
  assert(script.includes("timelineTomorrow:'明天'"), 'tomorrow timeline label missing');
  assert(script.includes("renderTimelineGroup('tomorrow'"), 'tomorrow group render missing');
});

add('this week group exists', () => {
  assert(script.includes("timelineWeek:'本周'"), 'week timeline label missing');
  assert(script.includes("renderTimelineGroup('week'"), 'week group render missing');
});

add('future group exists', () => {
  assert(script.includes("timelineFuture:'未来'"), 'future timeline label missing');
  assert(script.includes("renderTimelineGroup('future'"), 'future group render missing');
});

add('undated group exists', () => {
  assert(script.includes("timelineUndated:'无日期'"), 'undated timeline label missing');
  assert(script.includes("renderTimelineGroup('undated'"), 'undated group render missing');
  assert(script.includes('groups.undated.push(r)'), 'undated records should be grouped');
});

add('each group renders at most three representative records', () => {
  assert(script.includes('items.slice(0,3).forEach'), 'timeline should cap each group at 3 records');
});

add('empty state copy exists for each group', () => {
  ['timelineEmptyToday', 'timelineEmptyTomorrow', 'timelineEmptyWeek', 'timelineEmptyFuture', 'timelineEmptyUndated'].forEach((key) => {
    assert(script.includes(`${key}:`), `${key} missing`);
  });
});

add('timeline does not replace original all list', () => {
  assert(html.includes('id="allList"'), 'allList container missing');
  assert(script.includes("var c=$('allList')"), 'renderAll should still target allList');
  assert(script.includes('renderTimeline();'), 'renderAll should render timeline in addition to allList');
});

add('timeline code does not render undefined or null text intentionally', () => {
  const timelineCode = script.slice(script.indexOf('function getTimelineGroups'), script.indexOf('/* ========== Clock ========== */'));
  assert(!/>undefined</.test(timelineCode), 'timeline contains literal undefined output');
  assert(!/>null</.test(timelineCode), 'timeline contains literal null output');
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Timeline regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Timeline regression passed: ${checks.length}/${checks.length}`);

