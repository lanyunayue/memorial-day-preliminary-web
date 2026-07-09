const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

let currentNow = new Date(2026, 6, 8, 9, 0, 0).getTime();

class FixedDate extends Date {
  constructor(...args) {
    if (args.length === 0) super(currentNow);
    else super(...args);
  }

  static now() {
    return currentNow;
  }
}

function makeClassList() {
  const set = new Set();
  return {
    add(...names) { names.forEach((name) => set.add(name)); },
    remove(...names) { names.forEach((name) => set.delete(name)); },
    toggle(name, force) {
      if (force === undefined) {
        if (set.has(name)) {
          set.delete(name);
          return false;
        }
        set.add(name);
        return true;
      }
      if (force) set.add(name);
      else set.delete(name);
      return !!force;
    },
    contains(name) { return set.has(name); },
    toString() { return [...set].join(' '); }
  };
}

const elements = {};
function node(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      dataset: {},
      attrs: {},
      classList: makeClassList(),
      appendChild() {},
      removeChild() {},
      addEventListener() {},
      focus() { this.focused = true; },
      setAttribute(name, value) { this.attrs[name] = String(value); },
      getAttribute(name) { return this.attrs[name] || null; },
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
  }
  return elements[id];
}

['timeSprite', 'timeSpriteToggle', 'timeSpriteClose', 'timeSpriteTitle', 'timeSpriteInputBtn', 'timeSpriteTodayBtn', 'timeSpriteBatchBtn', 'timeSpriteCalendarBtn', 'timeSpriteExportBtn', 'timeSpriteBackupBtn', 'timeSpriteUpdateBtn', 'timeSpriteDemoBtn', 'timeSpriteResetBtn', 'timeSpriteFuture', 'timeSpriteMessage', 'timeSpriteMeta', 'quickInput'].forEach(node);

const store = {};
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
    setItem(key, value) { store[key] = String(value); },
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
    createElement() { return node('created_' + Math.random().toString(16).slice(2)); },
    getElementById(id) { return node(id); }
  },
  matchMedia(query) { return { matches: /max-width/.test(query) ? false : false, addEventListener() {} }; },
  window: null
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: 'index.html' });

function call(fn, ...args) {
  if (typeof sandbox[fn] === 'function') return sandbox[fn](...args);
  sandbox.__args = args;
  return vm.runInContext(`${fn}(...__args)`, sandbox);
}

function setGlobal(name, value) {
  sandbox.__value = value;
  vm.runInContext(`${name}=__value`, sandbox);
}

function getGlobal(name) {
  return vm.runInContext(name, sandbox);
}

function u(hex) {
  return hex.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function sampleRecord(overrides) {
  return Object.assign({
    id: 'r1',
    title: u('\\u5f00\\u4f1a'),
    dateText: u('\\u4eca\\u5929'),
    dateKey: '2026-07-08',
    timeText: '10:00',
    recordKind: 'reminder',
    repeat: 'none',
    repeatText: '',
    rawText: '',
    createdAt: currentNow,
    updatedAt: currentNow,
    ts: currentNow,
    notifiedAt: null,
    relativeMinutes: null
  }, overrides || {});
}

const cases = [];
function add(name, run) {
  cases.push({ name, run });
}

add('static sprite markup exists with accessible controls', () => {
  ['timeSprite', 'timeSpritePanel', 'timeSpriteToggle', 'timeSpriteClose', 'timeSpriteInputBtn', 'timeSpriteTodayBtn', 'timeSpriteBatchBtn', 'timeSpriteCalendarBtn', 'timeSpriteBackupBtn', 'timeSpriteUpdateBtn'].forEach((id) => {
    assert(html.includes(`id="${id}"`), `${id} should exist`);
  });
  assert(html.includes('time-sprite-bear'), 'bear sprite markup should exist');
  assert(/id="timeSpriteToggle"[^>]+aria-expanded=/.test(html), 'toggle should expose aria-expanded');
  assert(/id="timeSpriteClose"[^>]+aria-label=/.test(html), 'close button should expose aria-label');
});

add('sprite css avoids bottom nav and supports collapsed state', () => {
  assert(style.includes('.time-sprite{'), 'sprite css should exist');
  assert(style.includes('bottom:calc(78px + var(--safe-bottom))'), 'mobile sprite should sit above bottom nav');
  assert(style.includes('.time-sprite.collapsed .time-sprite-panel'), 'collapsed panel css should exist');
  assert(style.includes('@keyframes spritePulse'), 'subtle pulse animation should exist');
  assert(style.includes('@keyframes spriteFloat'), 'subtle float animation should exist');
  assert(style.includes('@keyframes spriteBlink'), 'subtle blink animation should exist');
});

add('version and service worker cache are ready for v0.9.6 candidate', () => {
  assert(script.includes("APP_VERSION='v0.9.6'"), 'APP_VERSION should be v0.9.6');
  assert(script.includes("APP_UPDATED_AT='2026-07-10 10:20'"), 'APP_UPDATED_AT should be updated');
  assert(sw.includes("CACHE_NAME = 'shike-v096-v42'"), 'service worker cache should be v096');
});

add('all languages include sprite i18n keys', () => {
  const I18N = getGlobal('I18N');
  const keys = ['spriteName', 'spriteOpen', 'spriteClose', 'spriteInputAction', 'spriteTodayAction', 'spriteBatchAction', 'spriteCalendarAction', 'spriteExportAction', 'spriteBackupAction', 'spriteUpdateAction', 'spriteResetAction', 'spriteFutureHint', 'spriteTip1', 'spriteTip2', 'spriteTip3', 'spriteTip4', 'spriteTip5', 'spriteEmptyMessage', 'spriteDemoMessage', 'spriteSoonMessage', 'spriteTodayMessage', 'spriteQuietMessage', 'spriteTodayLine', 'spriteNextLine'];
  Object.keys(I18N).forEach((lang) => {
    keys.forEach((key) => assert(Object.prototype.hasOwnProperty.call(I18N[lang], key), `${lang}:${key}`));
  });
});

add('collapsed preference is persisted', () => {
  call('saveTimeSpriteCollapsed', true);
  assertEqual(store[getGlobal('ASSISTANT_COLLAPSED_KEY')], 'true', 'collapsed setting true');
  assert(node('timeSprite').classList.contains('collapsed'), 'root should be collapsed');
  call('saveTimeSpriteCollapsed', false);
  assertEqual(store[getGlobal('ASSISTANT_COLLAPSED_KEY')], 'false', 'collapsed setting false');
  assert(!node('timeSprite').classList.contains('collapsed'), 'root should be expanded');
});

add('empty state invites one-sentence input', () => {
  setGlobal('records', []);
  call('renderTimeSprite');
  assert(node('timeSpriteMessage').textContent.includes(u('\\u4e00\\u53e5\\u8bdd')), 'empty message should mention one sentence');
  assert(!node('timeSpriteDemoBtn').classList.contains('hidden'), 'demo button should be visible as a sprite quick action');
});

add('records render today count and nearest item', () => {
  setGlobal('records', [sampleRecord()]);
  call('renderTimeSprite');
  assert(node('timeSpriteMessage').textContent.includes('1'), 'message should mention one upcoming/today item');
  assert(node('timeSpriteMeta').textContent.includes(u('\\u4eca\\u65e5')), 'meta should include today count');
  assert(node('timeSpriteMeta').textContent.includes(u('\\u5f00\\u4f1a')), 'meta should include nearest title');
});

add('demo state hides duplicate example action', () => {
  store[getGlobal('DEMO_FLAG_KEY')] = 'true';
  setGlobal('records', [sampleRecord()]);
  call('renderTimeSprite');
  assert(!node('timeSpriteDemoBtn').classList.contains('hidden'), 'demo button should remain a jump shortcut');
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
  console.error(`Time sprite regression failed: ${cases.length - failures.length}/${cases.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Time sprite regression passed: ${cases.length}/${cases.length}`);
