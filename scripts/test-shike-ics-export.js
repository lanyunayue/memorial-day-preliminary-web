const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

if (!script) {
  console.error('Cannot find inline script in index.html');
  process.exit(1);
}

const FIXED_NOW = new Date(2026, 6, 8, 9, 0, 0).getTime();
class FixedDate extends Date {
  constructor(...args) {
    if (args.length === 0) super(FIXED_NOW);
    else super(...args);
  }
  static now() {
    return FIXED_NOW;
  }
}

function makeClassList() {
  return { add() {}, remove() {}, toggle() {}, contains() { return false; } };
}

const downloads = [];
const sandbox = {
  console,
  Date: FixedDate,
  Math,
  addEventListener() {},
  setTimeout(fn) { if (typeof fn === 'function') fn(); return 1; },
  setInterval() { return 1; },
  clearInterval() {},
  Blob: function Blob(parts, opts) { this.parts = parts; this.opts = opts; },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { language: 'zh-CN', serviceWorker: null, geolocation: null },
  location: { reload() {} },
  document: {
    documentElement: { lang: '' },
    body: { classList: makeClassList(), appendChild() {} },
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    createElement() {
      return {
        style: {},
        classList: makeClassList(),
        appendChild() {},
        removeChild() {},
        setAttribute() {},
        click() { downloads.push(this.download || ''); }
      };
    },
    getElementById() {
      return {
        style: {},
        classList: makeClassList(),
        textContent: '',
        innerHTML: '',
        value: '',
        dataset: {},
        appendChild() {},
        addEventListener() {}
      };
    }
  },
  matchMedia() { return { matches: false, addEventListener() {} }; }
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: 'index.html' });

function u(hex) {
  return hex.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function call(fn, ...args) {
  sandbox.__args = args;
  return vm.runInContext(`${fn}(...__args)`, sandbox);
}

function getGlobal(name) {
  return vm.runInContext(name, sandbox);
}

function setGlobal(name, value) {
  sandbox.__value = value;
  vm.runInContext(`${name}=__value`, sandbox);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function recordFromInput(text, id) {
  const parsed = call('parseReminderText', text);
  const record = Object.assign({
    id,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    ts: FIXED_NOW,
    note: '',
    locationText: ''
  }, parsed);
  call('migrateRecord', record);
  return record;
}

const checks = [];
function add(name, run) {
  checks.push({ name, run });
}

add('timed one-off reminder exports local DTSTART and no RRULE', () => {
  const record = recordFromInput(u('\\u660e\\u5929\\u4e0b\\u5348\\u4e09\\u70b9\\u5f00\\u4f1a'), 'timed');
  assertEqual(record.dateKey, '2026-07-09', 'tomorrow dateKey');
  assertEqual(record.timeText, '15:00', 'meeting time');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('DTSTART:20260709T150000'), 'timed DTSTART should be present');
  assert(ics.includes('DTEND:20260709T153000'), 'timed DTEND should default to 30 minutes');
  assert(!ics.includes('RRULE:'), 'one-off reminder should not repeat');
});

add('dated anniversary exports all-day yearly event', () => {
  const record = recordFromInput(u('7\\u67088\\u65e5\\u5988\\u5988\\u751f\\u65e5'), 'birthday');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('DTSTART;VALUE=DATE:20260708'), 'anniversary all-day DTSTART');
  assert(ics.includes('RRULE:FREQ=YEARLY'), 'anniversary yearly RRULE');
});

add('daily habit exports daily recurrence', () => {
  const record = recordFromInput(u('\\u6bcf\\u5929\\u7761\\u524d\\u6d82\\u6da6\\u5507\\u818f'), 'daily');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('RRULE:FREQ=DAILY'), 'daily habit RRULE');
});

add('monthly day repeat exports monthly recurrence without month-end flag', () => {
  const record = recordFromInput(u('\\u6bcf\\u670815\\u53f7\\u8fd8\\u4fe1\\u7528\\u5361'), 'monthly15');
  assertEqual(record.title, u('\\u8fd8\\u4fe1\\u7528\\u5361'), 'monthly 15 title');
  assertEqual(record.dateKey, '2026-07-15', 'monthly 15 dateKey');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('RRULE:FREQ=MONTHLY'), 'monthly RRULE');
  assert(!ics.includes('BYMONTHDAY=-1'), 'monthly day should not use month-end BYMONTHDAY');
});

add('monthly first day rolls to next occurrence', () => {
  const record = recordFromInput(u('\\u6bcf\\u67081\\u53f7\\u4ea4\\u623f\\u79df'), 'monthly1');
  assertEqual(record.dateKey, '2026-08-01', 'monthly first day should roll forward after July 1');
  assertEqual(record.repeat, 'monthly', 'monthly first day repeat');
});

add('monthly end exports BYMONTHDAY -1 for 每月底', () => {
  const record = recordFromInput(u('\\u6bcf\\u6708\\u5e95\\u8fd8\\u4fe1\\u7528\\u5361'), 'monthEnd');
  assertEqual(record.title, u('\\u8fd8\\u4fe1\\u7528\\u5361'), 'month-end title');
  assertEqual(record.dateKey, '2026-07-31', 'month-end dateKey');
  assertEqual(record.repeat, 'monthly', 'month-end repeat');
  assertEqual(record.monthEnd, true, 'monthEnd marker');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('RRULE:FREQ=MONTHLY;BYMONTHDAY=-1'), 'month-end RRULE');
});

add('monthly end exports BYMONTHDAY -1 for 每月末', () => {
  const record = recordFromInput(u('\\u6bcf\\u6708\\u672b\\u8fd8\\u4fe1\\u7528\\u5361'), 'monthLast');
  assertEqual(record.title, u('\\u8fd8\\u4fe1\\u7528\\u5361'), 'month-last title');
  assertEqual(record.dateKey, '2026-07-31', 'month-last dateKey');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('RRULE:FREQ=MONTHLY;BYMONTHDAY=-1'), 'month-last RRULE');
});

add('next month first day remains one-off all-day', () => {
  const record = recordFromInput(u('\\u4e0b\\u4e2a\\u67081\\u53f7\\u4ea4\\u623f\\u79df'), 'nextmonth');
  assertEqual(record.dateKey, '2026-08-01', 'next month dateKey');
  assertEqual(record.repeat, 'none', 'next month first day should not repeat');
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('DTSTART;VALUE=DATE:20260801'), 'next month all-day DTSTART');
  assert(!ics.includes('RRULE:FREQ=MONTHLY'), 'next month one-off should not be monthly');
});

add('undated note is skipped in batch export', () => {
  const dated = recordFromInput(u('\\u660e\\u5929\\u4e0b\\u5348\\u4e09\\u70b9\\u5f00\\u4f1a'), 'dated');
  const undated = { id: 'note', title: u('\\u65c5\\u884c\\u6e05\\u5355'), dateKey: '', recordKind: 'note', repeat: 'none' };
  const cal = call('buildIcsCalendar', [dated, undated]);
  assertEqual(cal.eventCount, 1, 'one dated event');
  assertEqual(cal.skippedCount, 1, 'one undated record skipped');
  assert(cal.text.includes('BEGIN:VCALENDAR'), 'calendar begins');
  assert(cal.text.includes('END:VCALENDAR'), 'calendar ends');
});

add('commas semicolons and newlines are escaped', () => {
  const record = {
    id: 'escape',
    title: 'A,B;C',
    note: 'line1\nline2;end',
    dateKey: '2026-07-08',
    timeText: '',
    recordKind: 'reminder',
    repeat: 'none',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW
  };
  const ics = call('buildIcsCalendar', [record]).text;
  assert(ics.includes('SUMMARY:A\\,B\\;C'), 'summary punctuation escaped');
  assert(ics.includes('line1\\nline2\\;end'), 'description newline and semicolon escaped');
  assert(ics.includes(u('\\u7531\\u65f6\\u523b\\u5bfc\\u51fa')), 'description includes Shike export note');
});

add('single-record export uses readable filename', () => {
  setGlobal('records', [recordFromInput(u('\\u6bcf\\u6708\\u5e95\\u8fd8\\u4fe1\\u7528\\u5361'), 'single')]);
  downloads.length = 0;
  call('exportRecordIcsFile', 'single');
  assert(downloads.some((name) => name.includes('shike-record-') && name.endsWith('.ics')), 'single record filename');
});

const failures = [];
for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`ICS export regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`ICS export regression passed: ${checks.length}/${checks.length}`);
