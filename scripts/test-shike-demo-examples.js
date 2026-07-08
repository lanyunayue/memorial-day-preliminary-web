const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);

if (!match) {
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

const store = {};
const toasts = [];

const sandbox = {
  console,
  Date: FixedDate,
  Math,
  addEventListener() {},
  setTimeout() {},
  setInterval() { return 1; },
  clearInterval() {},
  Blob: function Blob(parts, opts) { this.parts = parts; this.opts = opts; },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  localStorage: {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }
  },
  navigator: { language: 'zh-CN', serviceWorker: null, geolocation: null },
  location: { reload() {} },
  document: {
    documentElement: { lang: '' },
    body: { classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {} },
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    createElement() {
      return {
        className: '',
        textContent: '',
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        appendChild() {},
        removeChild() {},
        setAttribute() {},
        click() {}
      };
    },
    getElementById(id) {
      if (id === 'toastContainer') {
        return { appendChild(node) { toasts.push(node.textContent); } };
      }
      return {
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
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
vm.runInContext(match[1], sandbox, { filename: 'index.html' });
vm.runInContext(
  [
    'updateLayoutState=function(){}',
    'renderHome=function(){}',
    'renderAll=function(){}',
    'renderCalendar=function(){}',
    'renderMy=function(){}',
    'startCountdownTicker=function(){}'
  ].join(';'),
  sandbox
);

function u(hex) {
  return hex.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function call(fn, ...args) {
  if (typeof sandbox[fn] === 'function') return sandbox[fn](...args);
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

function getRecords() {
  return getGlobal('records');
}

function setRecords(records) {
  setGlobal('records', records);
}

function clearState() {
  Object.keys(store).forEach((key) => delete store[key]);
  toasts.length = 0;
  setRecords([]);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function byKey(records, key) {
  return records.find((record) => record.demoKey === key);
}

function countBy(records, field, value) {
  return records.filter((record) => record[field] === value).length;
}

const DEMO_FLAG_KEY = getGlobal('DEMO_FLAG_KEY');
const STORAGE_KEY = getGlobal('STORAGE_KEY');
const mom = u('\\u5988\\u5988\\u751f\\u65e5');
const meeting = u('\\u5f00\\u4f1a');
const lip = u('\\u6d82\\u6da6\\u5507\\u818f');
const credit = u('\\u8fd8\\u4fe1\\u7528\\u5361');
const travel = u('\\u65c5\\u884c\\u6e05\\u5355');

const cases = [];
function add(name, run) {
  cases.push({ name, run });
}

add('demo templates contain five complete v0.7.4 examples', () => {
  clearState();
  const templates = call('buildDemoRecordTemplates');
  assertEqual(templates.length, 5, 'template count');
  assertEqual(new Set(templates.map((r) => r.demoKey)).size, 5, 'unique demo keys');
  assertEqual(byKey(templates, 'v074_mom_birthday').title, mom, 'mom birthday title');
  assertEqual(byKey(templates, 'v074_meeting').title, meeting, 'meeting title');
  assertEqual(byKey(templates, 'v074_lip_balm').title, lip, 'lip balm title');
  assertEqual(byKey(templates, 'v074_credit_card').title, credit, 'credit card title');
  assertEqual(byKey(templates, 'v074_travel_list').title, travel, 'travel title');
});

add('demo templates cover expected kinds, repeats, and dates', () => {
  clearState();
  const records = call('buildDemoRecordTemplates');
  assertEqual(countBy(records, 'recordKind', 'anniversary'), 1, 'anniversary count');
  assertEqual(countBy(records, 'recordKind', 'reminder'), 2, 'reminder count');
  assertEqual(countBy(records, 'recordKind', 'habit'), 1, 'habit count');
  assertEqual(countBy(records, 'recordKind', 'note'), 1, 'note count');

  assertEqual(byKey(records, 'v074_mom_birthday').repeat, 'yearly', 'mom repeat');
  assertEqual(byKey(records, 'v074_meeting').dateKey, '2026-07-09', 'meeting date');
  assertEqual(byKey(records, 'v074_meeting').timeText, '15:00', 'meeting time');
  assertEqual(byKey(records, 'v074_lip_balm').repeat, 'daily', 'lip repeat');
  assertEqual(byKey(records, 'v074_lip_balm').dateKey, '2026-07-08', 'lip date');
  assertEqual(byKey(records, 'v074_lip_balm').timeText, '22:30', 'lip time');
  assertEqual(byKey(records, 'v074_credit_card').repeat, 'monthly', 'credit repeat');
  assertEqual(byKey(records, 'v074_credit_card').dateKey, '2026-07-31', 'credit month-end date');
  assertEqual(byKey(records, 'v074_travel_list').dateKey, '', 'travel note has no date');
});

add('addDemoRecords prepends examples without removing user records', () => {
  clearState();
  const userRecord = {
    id: 'user_1',
    title: u('\\u7528\\u6237\\u81ea\\u5df1\\u7684\\u4e8b'),
    dateKey: '2026-07-08',
    timeText: '',
    recordKind: 'reminder',
    repeat: 'none',
    rawText: u('\\u7528\\u6237\\u81ea\\u5df1\\u7684\\u4e8b'),
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW
  };
  setRecords([userRecord]);
  call('addDemoRecords');
  const records = getRecords();
  assertEqual(records.length, 6, 'records after demo import');
  assertEqual(records[5].id, 'user_1', 'user record should remain after prepended demos');
  assertEqual(store[DEMO_FLAG_KEY], 'true', 'demo flag should be persisted');
  assert(store[STORAGE_KEY], 'records should be persisted');
  assert(toasts.some((text) => text.includes('5')), 'success toast should mention five examples');
});

add('addDemoRecords is idempotent after first click', () => {
  clearState();
  call('addDemoRecords');
  const firstIds = getRecords().map((record) => record.id);
  call('addDemoRecords');
  const secondRecords = getRecords();
  assertEqual(secondRecords.length, 5, 'record count after second click');
  assertEqual(secondRecords.map((record) => record.id).join('|'), firstIds.join('|'), 'second click should not add new records');
  assert(toasts.some((text) => text.includes(call('t', 'demoAlready'))), 'second click should show already toast');
});

add('existing matching records prevent duplicate demo import by content', () => {
  clearState();
  const existing = call('buildDemoRecordTemplates').map((record) => Object.assign({}, record, { id: `existing_${record.demoKey}` }));
  existing.forEach((record) => { delete record.demoKey; });
  setRecords(existing);
  call('addDemoRecords');
  const records = getRecords();
  assertEqual(records.length, 5, 'matching records should not be duplicated');
  assertEqual(store[DEMO_FLAG_KEY], 'true', 'demo flag should be set when matching records already exist');
});

add('demo examples drive calendar dots and search/filter visibility', () => {
  clearState();
  call('addDemoRecords');
  const records = getRecords();
  const creditRecord = byKey(records, 'v074_credit_card');
  const meetingRecord = byKey(records, 'v074_meeting');
  const momRecord = byKey(records, 'v074_mom_birthday');

  const calendarDateKeys = new Set(records.map((record) => record.dateKey).filter(Boolean));
  assert(calendarDateKeys.has('2026-07-31'), 'credit card should provide a month-end calendar date');
  assert(calendarDateKeys.has('2026-07-09'), 'meeting should provide tomorrow calendar date');
  assert(calendarDateKeys.has(momRecord.dateKey), 'mom birthday should provide a calendar date');
  assertEqual(creditRecord.repeat, 'monthly', 'credit card should remain monthly');
  assertEqual(meetingRecord.recordKind, 'reminder', 'meeting should remain reminder');
  assertEqual(momRecord.recordKind, 'anniversary', 'mom birthday should remain anniversary');
  assert(records.some((record) => record.title.includes(u('\\u4fe1\\u7528\\u5361'))), 'search credit card should find demo');
  assert(records.some((record) => record.title.includes(u('\\u5988\\u5988'))), 'search mom should find demo');
  assert(records.filter((record) => record.recordKind === 'habit').some((record) => record.repeat === 'daily'), 'habit filter should include daily demo');
});

const failures = [];
for (const test of cases) {
  try {
    test.run();
  } catch (error) {
    failures.push(`[${test.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Demo examples regression failed: ${cases.length - failures.length}/${cases.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Demo examples regression passed: ${cases.length}/${cases.length}`);
