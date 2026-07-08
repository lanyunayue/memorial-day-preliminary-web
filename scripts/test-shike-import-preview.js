const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';

const FIXED_NOW = new Date(2026, 6, 8, 9, 0, 0).getTime();
class FixedDate extends Date {
  constructor(...args) { args.length ? super(...args) : super(FIXED_NOW); }
  static now() { return FIXED_NOW; }
}

function makeClassList() {
  const set = new Set();
  return {
    add(...names) { names.forEach((name) => set.add(name)); },
    remove(...names) { names.forEach((name) => set.delete(name)); },
    toggle(name, force) { force ? set.add(name) : set.delete(name); },
    contains(name) { return set.has(name); }
  };
}

const nodes = {};
function node(id) {
  if (!nodes[id]) {
    nodes[id] = {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      dataset: {},
      classList: makeClassList(),
      appendChild() {},
      removeChild() {},
      addEventListener() {},
      setAttribute() {},
      click() {}
    };
  }
  return nodes[id];
}

['importPreviewCard', 'restoreFileInput', 'restoreFileInputMy'].forEach(node);

const store = {};
const sandbox = {
  console, Date: FixedDate, Math,
  addEventListener() {}, setTimeout(fn) { if (typeof fn === 'function') fn(); return 1; }, setInterval() { return 1; }, clearInterval() {},
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
    body: { classList: makeClassList(), appendChild() {} },
    addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
    createElement() { return node('created_' + Math.random().toString(16).slice(2)); },
    getElementById(id) { return node(id); }
  },
  matchMedia() { return { matches: false, addEventListener() {} }; }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: 'index.html' });
vm.runInContext('renderCurrent=function(){};renderMy=function(){};showToast=function(){};', sandbox);

function call(fn, ...args) {
  sandbox.__args = args;
  return vm.runInContext(`${fn}(...__args)`, sandbox);
}
function get(name) { return vm.runInContext(name, sandbox); }
function set(name, value) { sandbox.__value = value; vm.runInContext(`${name}=__value`, sandbox); }
function records() { return get('records'); }
function setRecords(value) { set('records', value); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function record(overrides) {
  return Object.assign({
    id: 'r1',
    title: 'record',
    dateKey: '2026-07-08',
    recordKind: 'reminder',
    repeat: 'none',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW
  }, overrides || {});
}

const checks = [];
function add(name, run) { checks.push({ name, run }); }

add('import preview UI copy and buttons exist', () => {
  assert(html.includes('id="importPreviewCard"'), 'preview card should exist');
  assert(script.includes('confirmImportPreview'), 'confirm function should exist');
  assert(script.includes('cancelImportPreview'), 'cancel function should exist');
});

add('preview statistics include required fields', () => {
  const parsed = call('parseBackupPayload', JSON.stringify({ app: 'shike', appVersion: 'v0.8.2', schemaVersion: 2, exportedAt: '2026-07-09T00:00:00.000Z', records: [record({ id: '' }), record({ id: 'dup' }), record({ id: 'dup' }), {}] }));
  const prepared = call('prepareBackupImport', parsed);
  assertEqual(prepared.summary.total, 4, 'total');
  assertEqual(prepared.summary.valid, 3, 'valid');
  assertEqual(prepared.summary.invalid, 1, 'invalid');
  assertEqual(prepared.summary.missing, 1, 'missing id');
  assertEqual(prepared.summary.duplicates, 1, 'duplicate id');
  call('renderImportPreview', prepared);
  const text = node('importPreviewCard').innerHTML;
  ['有效记录', '无效记录', '缺失 id', '重复 id', '冲突 id', '追加导入'].forEach((label) => assert(text.includes(label), `${label} should render`));
});

add('corrupted JSON throws before preview or write', () => {
  setRecords([record({ id: 'safe' })]);
  let threw = false;
  try { call('parseBackupPayload', '{bad json'); } catch (error) { threw = true; }
  assert(threw, 'bad json should throw');
  assertEqual(records().length, 1, 'existing records unchanged');
});

add('cancel import does not write', () => {
  setRecords([record({ id: 'old' })]);
  const parsed = call('parseBackupPayload', JSON.stringify([record({ id: 'new' })]));
  const prepared = call('prepareBackupImport', parsed);
  call('renderImportPreview', prepared);
  call('cancelImportPreview');
  assertEqual(records().length, 1, 'cancel should not import');
  assert(node('importPreviewCard').classList.contains('hidden'), 'preview should hide after cancel');
});

add('confirm import writes only after confirmation', () => {
  setRecords([record({ id: 'old' })]);
  const parsed = call('parseBackupPayload', JSON.stringify([record({ id: 'new' })]));
  const prepared = call('prepareBackupImport', parsed);
  call('renderImportPreview', prepared);
  assertEqual(records().length, 1, 'not written before confirm');
  call('confirmImportPreview');
  assertEqual(records().length, 2, 'written after confirm');
});

add('imported ids remain unique after confirm', () => {
  setRecords([record({ id: 'same' })]);
  const parsed = call('parseBackupPayload', JSON.stringify([record({ id: 'same', title: 'a' }), record({ id: 'same', title: 'b' })]));
  const prepared = call('prepareBackupImport', parsed);
  call('renderImportPreview', prepared);
  call('confirmImportPreview');
  const ids = records().map((item) => item.id);
  assertEqual(new Set(ids).size, ids.length, 'ids should be unique');
});

add('legacy array backup is supported', () => {
  const parsed = call('parseBackupPayload', JSON.stringify([record({ id: 'legacy' })]));
  assertEqual(parsed.sourceType, 'legacyArray', 'legacy array source type');
});

add('new metadata backup is supported', () => {
  const parsed = call('parseBackupPayload', JSON.stringify({ app: 'shike', appVersion: 'v0.8.2', schemaVersion: 2, records: [record({ id: 'newmeta' })] }));
  assertEqual(parsed.sourceType, 'newBackup', 'new backup source type');
});

add('legacy records backup is supported', () => {
  const parsed = call('parseBackupPayload', JSON.stringify({ records: [record({ id: 'legacyrecords' })] }));
  assertEqual(parsed.sourceType, 'legacyRecords', 'legacy records source type');
});

add('existing id conflicts are counted', () => {
  setRecords([record({ id: 'x' })]);
  const parsed = call('parseBackupPayload', JSON.stringify([record({ id: 'x' })]));
  const prepared = call('prepareBackupImport', parsed);
  assertEqual(prepared.summary.conflicts, 1, 'conflict count');
});

const failures = [];
for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Import preview regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Import preview regression passed: ${checks.length}/${checks.length}`);
