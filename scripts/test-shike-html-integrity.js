const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values) {
  return [...new Set(values)];
}

function matches(re, text) {
  return [...text.matchAll(re)];
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

function loadGlobals() {
  const store = {};
  const sandbox = {
    console,
    Date,
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
      body: { classList: { add() {}, remove() {}, toggle() {} } },
      addEventListener() {},
      querySelectorAll() { return []; },
      querySelector() { return null; },
      createElement() {
        return {
          style: {},
          classList: { add() {}, remove() {} },
          appendChild() {},
          removeChild() {},
          setAttribute() {},
          click() {}
        };
      },
      getElementById() { return null; }
    },
    matchMedia() { return { matches: false, addEventListener() {} }; }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(scriptMatch[1], sandbox, { filename: 'index.html' });
  return {
    I18N: vm.runInContext('I18N', sandbox)
  };
}

add('index contains one inline app script', () => {
  assert(scriptMatch, 'inline script should exist');
  assert(matches(/<script>/g, html).length === 1, 'index should contain exactly one inline app script');
});

add('html id attributes are unique', () => {
  const ids = matches(/\sid=["']([^"']+)["']/g, html).map((m) => m[1]);
  const duplicates = unique(ids.filter((id, index) => ids.indexOf(id) !== index));
  assert(duplicates.length === 0, `duplicate ids: ${duplicates.join(', ')}`);
});

add('literal DOM id lookups point to existing elements', () => {
  const ids = new Set(matches(/\sid=["']([^"']+)["']/g, html).map((m) => m[1]));
  const dollarIds = matches(/\$\(['"]([^'"]+)['"]\)/g, scriptMatch[1]).map((m) => m[1]);
  const bindIds = matches(/\bb\(['"]([^'"]+)['"]/g, scriptMatch[1]).map((m) => m[1]);
  const missing = unique(dollarIds.concat(bindIds).filter((id) => !ids.has(id)));
  assert(missing.length === 0, `missing literal ids: ${missing.join(', ')}`);
});

add('bottom navigation targets existing pages', () => {
  const pageIds = new Set(matches(/\sid=["']page-([^"']+)["']/g, html).map((m) => m[1]));
  const navPages = unique(matches(/\sdata-page=["']([^"']+)["']/g, html).map((m) => m[1]));
  const missing = navPages.filter((page) => !pageIds.has(page));
  assert(navPages.length >= 5, 'expected bottom navigation page entries');
  assert(missing.length === 0, `missing page targets: ${missing.join(', ')}`);
});

add('inline event handler functions exist', () => {
  const functionNames = new Set(matches(/function\s+([A-Za-z_$][\w$]*)\s*\(/g, scriptMatch[1]).map((m) => m[1]));
  const ignored = new Set(['Date', 'if', 'stopPropagation']);
  const handlerBodies = matches(/<[^>]+\son[a-z]+=["']([^"']+)["'][^>]*>/g, html).map((m) => m[1]);
  const called = unique(handlerBodies.flatMap((body) => matches(/\b([A-Za-z_$][\w$]*)\s*\(/g, body).map((m) => m[1])));
  const missing = called.filter((name) => !ignored.has(name) && !functionNames.has(name));
  assert(missing.length === 0, `missing handler functions: ${missing.join(', ')}`);
});

add('i18n keys used by markup and script exist in every language', () => {
  const { I18N } = loadGlobals();
  const markupKeys = matches(/\sdata-i18n(?:-ph)?=["']([^"']+)["']/g, html).map((m) => m[1]);
  const callKeys = matches(/\b(?:t|tf)\(['"]([^'"]+)['"]/g, scriptMatch[1]).map((m) => m[1]);
  const keys = unique(markupKeys.concat(callKeys)).sort();
  const languages = Object.keys(I18N);
  assert(languages.length >= 4, 'expected four language dictionaries');
  const missing = [];
  languages.forEach((lang) => {
    keys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(I18N[lang], key)) missing.push(`${lang}:${key}`);
    });
  });
  assert(missing.length === 0, `missing i18n keys: ${missing.join(', ')}`);
});

add('local linked assets exist', () => {
  const hrefs = matches(/<link\b[^>]*\shref=["']([^"']+)["'][^>]*>/g, html).map((m) => m[1]);
  const srcs = matches(/<(?:script|img)\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/g, html).map((m) => m[1]);
  const localRefs = hrefs.concat(srcs).filter((ref) => !/^(?:https?:|data:|#)/i.test(ref));
  const missing = localRefs.filter((ref) => !fs.existsSync(path.join(root, ref.replace(/^\.\//, ''))));
  assert(missing.length === 0, `missing local linked assets: ${missing.join(', ')}`);
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`HTML integrity regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`HTML integrity regression passed: ${checks.length}/${checks.length}`);
