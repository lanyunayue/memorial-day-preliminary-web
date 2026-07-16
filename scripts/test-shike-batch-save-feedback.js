const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

function createSandbox() {
  const store = {};
  const elements = new Map();
  const noop = () => {};
  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: '',
        innerHTML: '',
        textContent: '',
        style: {},
        classList: { add: noop, remove: noop, toggle: noop, contains() { return false; } },
        setAttribute: noop,
        addEventListener: noop,
        querySelector() { return null; },
        querySelectorAll() { return []; },
        appendChild: noop,
        focus: noop
      });
    }
    return elements.get(id);
  }

  const sandbox = {
    console,
    window: {
      addEventListener: noop,
      matchMedia() { return { matches: false, addEventListener: noop, removeEventListener: noop }; },
      SpeechRecognition: undefined,
      webkitSpeechRecognition: undefined
    },
    document: {
      addEventListener: noop,
      getElementById: element,
      querySelector() { return element('query'); },
      querySelectorAll() { return []; },
      createElement() { return element(`created-${Math.random()}`); },
      body: element('body'),
      documentElement: { scrollWidth: 390, clientWidth: 390, setAttribute: noop }
    },
    navigator: { userAgent: '', language: 'zh-CN', serviceWorker: null, clipboard: null },
    localStorage: {
      getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem(key, value) { store[key] = String(value); },
      removeItem(key) { delete store[key]; },
      clear() { Object.keys(store).forEach((key) => delete store[key]); }
    },
    setTimeout() { return 1; },
    setInterval() { return 1; },
    clearTimeout: noop,
    clearInterval: noop,
    Date,
    Blob: function Blob() {},
    URL: { createObjectURL() { return 'blob:x'; }, revokeObjectURL: noop },
    FileReader: function FileReader() {},
    alert: noop,
    confirm() { return true; },
    __toasts: []
  };

  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: 'index.html' });
  vm.runInContext(`
    renderDrafts=function(){};
    renderCurrent=function(){};
    renderHome=function(){};
    renderAll=function(){};
    renderCalendar=function(){};
    renderMy=function(){};
    switchPage=function(p){currentPage=p;};
    saveRecords=function(){return true;};
    showToast=function(msg,type){__toasts.push({msg:msg,type:type});};
  `, sandbox);
  return sandbox;
}

function runInSandbox(code) {
  const sandbox = createSandbox();
  return vm.runInContext(code, sandbox);
}

add('feedback i18n keys exist', () => {
  [
    'draftExisting',
    'draftDuplicateSkipped',
    'batchSaveAll',
    'batchSavedOnly',
    'batchSavedResult',
    'batchSkippedOnly'
  ].forEach((key) => assert(script.includes(`${key}:`), `${key} missing`));
});

add('draft UI uses localized labels', () => {
  const start = script.indexOf('function renderDrafts()');
  const end = script.indexOf('function saveDraft', start);
  const code = script.slice(start, end);
  assert(code.includes("t('draftExisting')"), 'existing chip should use i18n');
  assert(code.includes("t('batchSaveAll')"), 'save-all button should use i18n');
});

add('single duplicate skip uses localized toast', () => {
  const start = script.indexOf('function saveDraft(i)');
  const end = script.indexOf('function discardDraft', start);
  const code = script.slice(start, end);
  assert(code.includes("t('draftDuplicateSkipped')"), 'single skip toast should use i18n');
});

add('save all builds real saved and skipped feedback', () => {
  const start = script.indexOf('function saveAllDrafts()');
  const end = script.indexOf('/* ========== My page', start);
  const code = script.slice(start, end);
  assert(code.includes("tf('batchSavedResult'"), 'mixed result feedback missing');
  assert(code.includes("tf('batchSavedOnly'"), 'saved-only feedback missing');
  assert(code.includes("tf('batchSkippedOnly'"), 'skipped-only feedback missing');
  assert(code.includes("showToast(msg,saved?'success':'warn')"), 'toast type should reflect whether anything was saved');
});

add('runtime mixed save-all reports saved and skipped counts', () => {
  const result = runInSandbox(`(() => {
    LANG='zh-CN';
    const meeting='\\u660e\\u5929\\u4e0b\\u5348\\u4e09\\u70b9\\u5f00\\u4f1a';
    const card='\\u6bcf\\u670815\\u53f7\\u8fd8\\u4fe1\\u7528\\u5361';
    const idea='\\u968f\\u4fbf\\u8bb0\\u4e2a\\u60f3\\u6cd5';
    records=[]; importDrafts=[]; __toasts=[];
    saveParsedRecord(normalizeCapturePreviewParsed(meeting, parseReminderText(meeting)), meeting);
    __toasts=[];
    importDrafts=prepareBatchCaptureDrafts(meeting+'\\n'+card+'\\n'+idea);
    saveAllDrafts();
    return {count:records.length, meetingCount:records.filter(r => (r.title||'').includes('\\u5f00\\u4f1a')).length, toast:__toasts[__toasts.length-1]};
  })()`);
  assert(result.count === 3, `expected 3 records, got ${result.count}`);
  assert(result.meetingCount === 1, `expected one meeting, got ${result.meetingCount}`);
  assert(result.toast.type === 'success', `expected success toast, got ${result.toast.type}`);
  assert(result.toast.msg === '\u5df2\u4fdd\u5b58 2 \u6761\uff0c\u8df3\u8fc7 1 \u6761\u91cd\u590d', `unexpected toast: ${result.toast.msg}`);
});

add('runtime skipped-only save-all reports no new records', () => {
  const result = runInSandbox(`(() => {
    LANG='zh-CN';
    const meeting='\\u660e\\u5929\\u4e0b\\u5348\\u4e09\\u70b9\\u5f00\\u4f1a';
    records=[]; importDrafts=[]; __toasts=[];
    saveParsedRecord(normalizeCapturePreviewParsed(meeting, parseReminderText(meeting)), meeting);
    __toasts=[];
    importDrafts=prepareBatchCaptureDrafts(meeting);
    saveAllDrafts();
    return {count:records.length, toast:__toasts[__toasts.length-1]};
  })()`);
  assert(result.count === 1, `expected unchanged record count, got ${result.count}`);
  assert(result.toast.type === 'warn', `expected warn toast, got ${result.toast.type}`);
  assert(result.toast.msg === '\u6ca1\u6709\u65b0\u589e\uff0c\u5df2\u8df3\u8fc7 1 \u6761\u91cd\u590d', `unexpected toast: ${result.toast.msg}`);
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Batch save feedback regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Batch save feedback regression passed: ${checks.length}/${checks.length}`);
