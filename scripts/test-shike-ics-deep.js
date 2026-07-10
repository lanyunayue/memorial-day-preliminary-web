const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

const FIXED_NOW = new Date(2026, 6, 8, 9, 0, 0).getTime();
class FixedDate extends Date {
  constructor(...args) { args.length ? super(...args) : super(FIXED_NOW); }
  static now() { return FIXED_NOW; }
}

function makeClassList() { return { add() {}, remove() {}, toggle() {}, contains() { return false; } }; }

const sandbox = {
  console, Date: FixedDate, Math,
  addEventListener() {}, setTimeout(fn) { if (typeof fn === 'function') fn(); return 1; }, setInterval() { return 1; }, clearInterval() {},
  Blob: function Blob(parts, opts) { this.parts = parts; this.opts = opts; },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { language: 'zh-CN', serviceWorker: null, geolocation: null },
  location: { reload() {} },
  document: {
    documentElement: { lang: '' },
    body: { classList: makeClassList(), appendChild() {} },
    addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
    createElement() { return { style: {}, classList: makeClassList(), appendChild() {}, removeChild() {}, setAttribute() {}, click() {} }; },
    getElementById() { return { style: {}, classList: makeClassList(), textContent: '', innerHTML: '', value: '', dataset: {}, appendChild() {}, addEventListener() {} }; }
  },
  matchMedia() { return { matches: false, addEventListener() {} }; }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: 'index.html' });

function call(fn, ...args) {
  sandbox.__args = args;
  return vm.runInContext(`${fn}(...__args)`, sandbox);
}

function assert(condition, message) { if (!condition) throw new Error(message); }
function count(text, needle) { return (text.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; }

function record(overrides) {
  return Object.assign({
    id: 'rec_stable_1',
    title: 'A,B;C',
    note: 'line1\nline2\\end',
    rawText: 'raw text',
    dateKey: '2026-07-08',
    timeText: '',
    recordKind: 'reminder',
    repeat: 'none',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW
  }, overrides || {});
}

const checks = [];
function add(name, run) { checks.push({ name, run }); }

add('calendar uses CRLF line separators', () => {
  const text = call('buildIcsCalendar', [record()]).text;
  assert(text.includes('\r\n'), 'calendar should include CRLF');
  assert(!/[^\r]\n/.test(text), 'calendar should not contain bare LF');
});

add('summary escapes comma and semicolon', () => {
  const text = call('buildIcsCalendar', [record()]).text;
  assert(text.includes('SUMMARY:A\\,B\\;C'), 'SUMMARY should escape comma and semicolon');
});

add('description escapes newline and backslash', () => {
  const text = call('buildIcsCalendar', [record()]).text;
  assert(text.includes('line1\\nline2\\\\end'), 'DESCRIPTION should escape newline and backslash');
});

add('uid contains stable record id', () => {
  const text = call('buildIcsCalendar', [record({ id: 'abc_123' })]).text;
  assert(text.includes('UID:shike-abc_123@local.shike'), 'UID should include record id');
});

add('all-day event ends on next day', () => {
  const text = call('buildIcsCalendar', [record({ timeText: '' })]).text;
  assert(text.includes('DTSTART;VALUE=DATE:20260708'), 'all-day DTSTART');
  assert(text.includes('DTEND;VALUE=DATE:20260709'), 'all-day DTEND should be next day');
});

add('timed event ends 30 minutes after start', () => {
  const text = call('buildIcsCalendar', [record({ timeText: '15:00' })]).text;
  assert(text.includes('DTSTART:20260708T150000'), 'timed DTSTART');
  assert(text.includes('DTEND:20260708T153000'), 'timed DTEND should be 30 minutes later');
});

add('month-end recurrence uses BYMONTHDAY -1', () => {
  const text = call('buildIcsCalendar', [record({ repeat: 'monthly', monthEnd: true })]).text;
  assert(text.includes('RRULE:FREQ=MONTHLY;BYMONTHDAY=-1'), 'month-end RRULE');
});

add('batch export includes multiple VEVENT blocks', () => {
  const text = call('buildIcsCalendar', [record({ id: 'a' }), record({ id: 'b', title: 'B' })]).text;
  assert(count(text, 'BEGIN:VEVENT') === 2, 'two VEVENT starts');
  assert(count(text, 'END:VEVENT') === 2, 'two VEVENT ends');
});

add('undated records are skipped', () => {
  const cal = call('buildIcsCalendar', [record({ id: 'a' }), record({ id: 'note', dateKey: '' })]);
  assert(cal.eventCount === 1, 'one exported event');
  assert(cal.skippedCount === 1, 'one skipped record');
});

add('calendar and event boundaries are balanced', () => {
  const text = call('buildIcsCalendar', [record({ id: 'a' }), record({ id: 'b' })]).text;
  assert(count(text, 'BEGIN:VCALENDAR') === 1 && count(text, 'END:VCALENDAR') === 1, 'VCALENDAR boundaries');
  assert(count(text, 'BEGIN:VEVENT') === count(text, 'END:VEVENT'), 'VEVENT boundaries');
});

add('calendar output does not leak undefined or null strings', () => {
  const text = call('buildIcsCalendar', [record({ note: null, rawText: null })]).text;
  assert(!/\bundefined\b|\bnull\b/.test(text), 'should not contain undefined or null');
});

add('yearly anniversary remains yearly', () => {
  const text = call('buildIcsCalendar', [record({ recordKind: 'anniversary', repeat: 'yearly', timeText: '' })]).text;
  assert(text.includes('RRULE:FREQ=YEARLY'), 'yearly RRULE');
});

add('DTSTAMP is UTC formatted', () => {
  const text = call('buildIcsCalendar', [record()]).text;
  assert(/DTSTAMP:\d{8}T\d{6}Z/.test(text), 'DTSTAMP format');
});

add('PRODID is the Shike standard calendar id', () => {
  const text = call('buildIcsCalendar', [record()]).text;
  assert(text.includes('PRODID:-//Shike//Time Records//CN'), 'PRODID');
});

const failures = [];
for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`ICS deep regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`ICS deep regression passed: ${checks.length}/${checks.length}`);
