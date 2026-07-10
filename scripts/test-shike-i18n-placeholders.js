const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values) {
  return [...new Set(values)];
}

function placeholders(value) {
  return unique([...String(value || '').matchAll(/\{([A-Za-z_$][\w$]*)\}/g)].map((m) => m[1])).sort();
}

function sameSet(a, b) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function loadI18n() {
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
  vm.runInContext(script, sandbox, { filename: 'index.html' });
  return vm.runInContext('I18N', sandbox);
}

function extractTfRequirements() {
  const byKey = new Map();
  [...script.matchAll(/\btf\(['"]([^'"]+)['"]\s*,\s*\{([^}]*)\}\)/g)].forEach((match) => {
    const key = match[1];
    const vars = [...match[2].matchAll(/([A-Za-z_$][\w$]*)\s*:/g)].map((m) => m[1]);
    byKey.set(key, unique((byKey.get(key) || []).concat(vars)).sort());
  });
  return byKey;
}

function renderTemplate(template, vars) {
  let text = String(template || '');
  Object.keys(vars).forEach((key) => {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(vars[key]));
  });
  return text;
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

const I18N = loadI18n();
const languages = Object.keys(I18N);
const tfRequirements = extractTfRequirements();

add('tf calls with object literals are discovered', () => {
  assert(tfRequirements.size >= 10, `expected many tf keys, got ${tfRequirements.size}`);
  ['importConfirm', 'demoAdded', 'hourCountdown', 'spriteNextLine'].forEach((key) => {
    assert(tfRequirements.has(key), `missing discovered tf key ${key}`);
  });
});

add('every tf key exists in every language', () => {
  const missing = [];
  tfRequirements.forEach((vars, key) => {
    languages.forEach((lang) => {
      if (!Object.prototype.hasOwnProperty.call(I18N[lang], key)) missing.push(`${lang}:${key}`);
    });
  });
  assert(missing.length === 0, `missing tf keys: ${missing.join(', ')}`);
});

add('tf placeholders match provided variable names in every language', () => {
  const bad = [];
  tfRequirements.forEach((vars, key) => {
    languages.forEach((lang) => {
      const actual = placeholders(I18N[lang][key]);
      if (!sameSet(actual, vars)) {
        bad.push(`${lang}:${key} expected {${vars.join(',')}} got {${actual.join(',')}}`);
      }
    });
  });
  assert(bad.length === 0, `placeholder mismatch: ${bad.join(' | ')}`);
});

add('tf templates render without leftover placeholders', () => {
  const bad = [];
  tfRequirements.forEach((vars, key) => {
    const sample = {};
    vars.forEach((name, index) => { sample[name] = `${name}_${index + 1}`; });
    languages.forEach((lang) => {
      const rendered = renderTemplate(I18N[lang][key], sample);
      const leftover = placeholders(rendered);
      if (leftover.length) bad.push(`${lang}:${key} leftover {${leftover.join(',')}}`);
    });
  });
  assert(bad.length === 0, `leftover placeholders: ${bad.join(' | ')}`);
});

add('mon_fmt keeps month placeholder in every language', () => {
  const bad = [];
  languages.forEach((lang) => {
    const value = I18N[lang].mon_fmt;
    if (!String(value || '').includes('{m}')) bad.push(`${lang}:mon_fmt=${JSON.stringify(value)}`);
    const rendered = String(value || '').replace('{m}', '7');
    if (placeholders(rendered).length) bad.push(`${lang}:mon_fmt leftover`);
  });
  assert(bad.length === 0, `bad mon_fmt values: ${bad.join(' | ')}`);
});

add('language dictionaries use the same tf placeholder keys', () => {
  const expectedKeys = [...tfRequirements.keys()].sort();
  assert(expectedKeys.includes('userDaysText'), 'expected userDaysText in tf keys');
  assert(expectedKeys.includes('tomorrowTime'), 'expected tomorrowTime in tf keys');
  assert(expectedKeys.includes('overdueDay'), 'expected overdueDay in tf keys');
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`I18N placeholder regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`I18N placeholder regression passed: ${checks.length}/${checks.length}`);
