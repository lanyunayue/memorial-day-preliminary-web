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
  const events = {};
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
        addEventListener(type, handler) { events[`${id}:${type}`] = handler; },
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
      addEventListener(type, handler) { events[type] = handler; },
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
    __events: events
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
    showToast=function(){};
  `, sandbox);
  return sandbox;
}

function run(code) {
  const sandbox = createSandbox();
  return vm.runInContext(code, sandbox);
}

add('guard helpers are present and registered during init', () => {
  assert(script.includes('function hasUnsavedWork()'), 'hasUnsavedWork helper missing');
  assert(script.includes('function registerUnsavedWorkGuard()'), 'registerUnsavedWorkGuard helper missing');
  assert(script.includes("window.addEventListener('beforeunload'"), 'beforeunload listener missing');
  assert(script.includes('registerUnsavedWorkGuard();'), 'init should register guard');
});

add('guard checks quick input import text drafts and parse preview', () => {
  const start = script.indexOf('function hasUnsavedWork()');
  const end = script.indexOf('function registerUnsavedWorkGuard', start);
  const code = script.slice(start, end);
  ['quickInput', 'importTextInput', 'importDrafts&&importDrafts.length', 'pendingParsePreview'].forEach((token) => {
    assert(code.includes(token), `${token} should be checked`);
  });
});

add('beforeunload event is only blocked when work is unsaved', () => {
  const result = run(`(() => {
    registerUnsavedWorkGuard();
    const handler=__events.beforeunload;
    const clean={prevented:false,returnValue:undefined,preventDefault(){this.prevented=true;}};
    handler(clean);
    document.getElementById('quickInput').value='明天下午三点开会';
    const dirty={prevented:false,returnValue:undefined,preventDefault(){this.prevented=true;}};
    handler(dirty);
    return {clean, dirty, hasHandler:typeof handler==='function'};
  })()`);
  assert(result.hasHandler, 'beforeunload handler missing');
  assert(result.clean.prevented === false && result.clean.returnValue === undefined, 'clean page should not be blocked');
  assert(result.dirty.prevented === true && result.dirty.returnValue === '', 'dirty page should be blocked');
});

add('quick input and import textarea count as unsaved work', () => {
  const result = run(`(() => {
    const quick=document.getElementById('quickInput');
    const importText=document.getElementById('importTextInput');
    const clean=hasUnsavedWork();
    quick.value='  明天下午三点开会  ';
    const quickDirty=hasUnsavedWork();
    quick.value='';
    importText.value='每月15号还信用卡';
    const importDirty=hasUnsavedWork();
    importText.value='   ';
    const trimmedClean=hasUnsavedWork();
    return {clean, quickDirty, importDirty, trimmedClean};
  })()`);
  assert(result.clean === false, 'empty page should be clean');
  assert(result.quickDirty === true, 'quick input should be dirty');
  assert(result.importDirty === true, 'import textarea should be dirty');
  assert(result.trimmedClean === false, 'whitespace-only text should be clean');
});

add('drafts and parse preview count as unsaved work', () => {
  const result = run(`(() => {
    const clean=hasUnsavedWork();
    importDrafts=prepareBatchCaptureDrafts('明天下午三点开会\\n每月15号还信用卡');
    const draftsDirty=hasUnsavedWork();
    importDrafts=[];
    showParsePreview('明天下午三点开会');
    const previewDirty=hasUnsavedWork();
    pendingParsePreview=null;
    const finalClean=hasUnsavedWork();
    return {clean, draftsDirty, previewDirty, finalClean};
  })()`);
  assert(result.clean === false, 'initial page should be clean');
  assert(result.draftsDirty === true, 'drafts should be dirty');
  assert(result.previewDirty === true, 'parse preview should be dirty');
  assert(result.finalClean === false, 'cleared preview should be clean');
});

add('saving or discarding clears guarded draft state', () => {
  const result = run(`(() => {
    importDrafts=prepareBatchCaptureDrafts('明天下午三点开会\\n每月15号还信用卡');
    const beforeSave=hasUnsavedWork();
    saveAllDrafts();
    const afterSave=hasUnsavedWork();
    importDrafts=prepareBatchCaptureDrafts('明天下午三点开会');
    discardDraft(0);
    const afterDiscard=hasUnsavedWork();
    return {beforeSave, afterSave, afterDiscard, count:records.length};
  })()`);
  assert(result.beforeSave === true, 'drafts should be dirty before save');
  assert(result.afterSave === false, 'save all should clear draft guard');
  assert(result.afterDiscard === false, 'discard should clear draft guard');
  assert(result.count >= 2, 'save all should still save parsed records');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Unsaved work guard regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Unsaved work guard regression passed: ${checks.length}/${checks.length}`);
