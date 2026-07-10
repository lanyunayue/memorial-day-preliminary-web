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

const store = {};
let failWrites = false;
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
  localStorage: {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) {
      if (failWrites) throw new Error('storage failed');
      store[key] = String(value);
    },
    removeItem(key) { delete store[key]; }
  },
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
        click() {}
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
vm.runInContext('renderCurrent=function(){};showToast=function(){};', sandbox);

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

function getRecords() {
  return getGlobal('records');
}

function setRecords(records) {
  setGlobal('records', records);
}

function record(overrides) {
  return Object.assign({
    id: 'r1',
    title: u('\\u5f00\\u4f1a'),
    dateText: u('\\u4eca\\u5929'),
    dateKey: '2026-07-08',
    timeText: '',
    recordKind: 'reminder',
    repeat: 'none',
    repeatText: '',
    rawText: '',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    pinned: false
  }, overrides || {});
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function ids(records) {
  return records.map((item) => item.id);
}

const checks = [];
function add(name, run) {
  checks.push({ name, run });
}

add('new backup JSON includes metadata', () => {
  setRecords([record({ id: 'a' }), record({ id: 'b', title: u('\\u5988\\u5988\\u751f\\u65e5') })]);
  const payload = call('buildBackupPayload');
  assertEqual(payload.app, 'shike', 'backup app');
  assertEqual(payload.appVersion, 'v1.4.0', 'backup appVersion');
  assertEqual(payload.schemaVersion, 2, 'backup schemaVersion');
  assert(payload.exportedAt, 'backup exportedAt');
  assertEqual(payload.recordCount, 2, 'backup recordCount');
  assertEqual(payload.records.length, 2, 'backup records length');
});

add('legacy array backup remains importable', () => {
  const parsed = call('parseBackupPayload', JSON.stringify([record({ id: 'legacy' })]));
  assertEqual(parsed.records.length, 1, 'legacy array length');
  assertEqual(parsed.records[0].id, 'legacy', 'legacy record id');
});

add('records field backup remains importable', () => {
  const parsed = call('parseBackupPayload', JSON.stringify({ app: 'shike', schemaVersion: 2, records: [record({ id: 'nested' })] }));
  assertEqual(parsed.records[0].id, 'nested', 'records field id');
});

add('corrupted JSON does not write or clear existing records', () => {
  const existing = [record({ id: 'keep' })];
  setRecords(existing.slice());
  let threw = false;
  try {
    call('parseBackupPayload', '{bad json');
  } catch (error) {
    threw = true;
  }
  assert(threw, 'corrupted JSON should throw');
  assertEqual(getRecords().length, 1, 'existing records should remain');
  assertEqual(getRecords()[0].id, 'keep', 'existing record id remains');
});

add('missing ids are filled', () => {
  setRecords([]);
  const prepared = call('prepareBackupImport', { meta: {}, records: [record({ id: '' })] });
  assertEqual(prepared.summary.missing, 1, 'missing count');
  assert(prepared.records[0].id, 'missing id should be generated');
});

add('duplicate ids inside import are repaired', () => {
  setRecords([]);
  const prepared = call('prepareBackupImport', { meta: {}, records: [record({ id: 'dup' }), record({ id: 'dup', title: 'two' })] });
  assertEqual(prepared.summary.duplicates, 1, 'duplicate count');
  assertEqual(new Set(ids(prepared.records)).size, 2, 'prepared ids unique');
});

add('existing id conflicts rebuild imported ids', () => {
  setRecords([record({ id: 'existing' })]);
  const prepared = call('prepareBackupImport', { meta: {}, records: [record({ id: 'existing', title: 'incoming' })] });
  assertEqual(prepared.summary.conflicts, 1, 'conflict count');
  assert(prepared.records[0].id !== 'existing', 'conflicting id should be rebuilt');
});

add('invalid records are skipped without blank screen risk', () => {
  setRecords([]);
  const prepared = call('prepareBackupImport', { meta: {}, records: [{ id: 'bad' }, null, record({ id: 'ok' })] });
  assertEqual(prepared.summary.invalid, 2, 'invalid count');
  assertEqual(prepared.records.length, 1, 'only valid record prepared');
  assertEqual(prepared.records[0].id, 'ok', 'valid record kept');
});

add('append import does not overwrite existing records', () => {
  setRecords([record({ id: 'old', title: 'old', pinned: true })]);
  const prepared = call('prepareBackupImport', { meta: {}, records: [record({ id: 'new', title: 'new' })] });
  failWrites = false;
  const result = call('mergePreparedImport', prepared);
  assertEqual(result.added, 1, 'one record added');
  assertEqual(getRecords().length, 2, 'append count');
  assertEqual(getRecords().find((item) => item.id === 'old').pinned, true, 'existing pinned state preserved');
});

add('all ids remain unique after import', () => {
  setRecords([record({ id: 'x' })]);
  const prepared = call('prepareBackupImport', { meta: {}, records: [record({ id: 'x', title: 'conflict' }), record({ id: 'x', title: 'duplicate' })] });
  call('mergePreparedImport', prepared);
  assertEqual(new Set(ids(getRecords())).size, getRecords().length, 'all ids unique');
});

add('import save failure rolls in-memory records back', () => {
  const original = [record({ id: 'safe' })];
  setRecords(original.slice());
  const prepared = call('prepareBackupImport', { meta: {}, records: [record({ id: 'incoming' })] });
  failWrites = true;
  const result = call('mergePreparedImport', prepared);
  failWrites = false;
  assert(result.error, 'save failure should report error');
  assertEqual(getRecords().length, 1, 'in-memory records rolled back');
  assertEqual(getRecords()[0].id, 'safe', 'original record remains');
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
  console.error(`Backup hardening regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Backup hardening regression passed: ${checks.length}/${checks.length}`);
