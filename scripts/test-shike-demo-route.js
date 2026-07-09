const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function bodyBetween(start, end) {
  const from = script.indexOf(start);
  const to = script.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `cannot extract ${start}`);
  return script.slice(from, to);
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

function createNode(id) {
  return {
    id,
    value: '',
    innerHTML: '',
    textContent: '',
    placeholder: '',
    dataset: {},
    style: {},
    scrollHeight: 32,
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    setAttribute() {},
    addEventListener() {},
    appendChild() {},
    removeChild() {},
    focus() {},
    scrollIntoView() {
      this.scrolled = true;
    }
  };
}

function loadApp() {
  const store = {};
  const elements = {};
  const toasts = [];
  const ids = [
    'app', 'quickInput', 'parsePreviewBlock', 'demoRouteBlock', 'importTextInput',
    'importDraftList', 'laterInboxBlock', 'page-home', 'page-import', 'page-my',
    'calendarExportSection', 'dataSafetySection', 'toastContainer'
  ];
  ids.forEach((id) => { elements[id] = createNode(id); });
  elements.toastContainer.appendChild = (node) => { toasts.push(node.textContent); };

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

  const sandbox = {
    console,
    Date: FixedDate,
    Math,
    addEventListener() {},
    scrollTo() {},
    setTimeout(fn) {
      if (typeof fn === 'function') fn();
      return 1;
    },
    setInterval() { return 1; },
    clearInterval() {},
    Blob: function Blob(parts, opts) { this.parts = parts; this.opts = opts; },
    URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
    localStorage: {
      getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem(key, value) { store[key] = String(value); },
      removeItem(key) { delete store[key]; }
    },
    navigator: { language: 'zh-CN', userAgent: 'test', serviceWorker: null, geolocation: null },
    location: { reload() {} },
    document: {
      documentElement: { lang: '' },
      body: { classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {} },
      addEventListener() {},
      querySelectorAll() { return []; },
      querySelector() { return null; },
      createElement() { return createNode('created'); },
      getElementById(id) {
        if (!elements[id]) elements[id] = createNode(id);
        return elements[id];
      }
    },
    matchMedia() { return { matches: false, addEventListener() {} }; }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: 'index.html' });
  vm.runInContext(
    [
      'renderHome=function(){}',
      'renderAll=function(){}',
      'renderCalendar=function(){}',
      'renderMy=function(){}',
      'renderTimeSprite=function(){}',
      'startCountdownTicker=function(){}'
    ].join(';'),
    sandbox
  );

  return {
    sandbox,
    store,
    elements,
    toasts,
    run(code) {
      return vm.runInContext(code, sandbox);
    }
  };
}

add('route entry and version are present', () => {
  assert(html.includes('id="demoRouteBlock"'), 'missing home route container');
  assert(script.includes("var APP_VERSION='v0.9.6'"), 'APP_VERSION should be v0.9.6');
  assert(sw.includes("shike-v096-v42"), 'service worker cache should be v096');
});

add('route title and subtitle match requested copy', () => {
  assert(html.includes('演示路线'), 'missing route entry title');
  assert(html.includes('从一句话到日历，看看时刻如何整理你的时间。'), 'missing route subtitle');
});

add('five route steps are defined', () => {
  ['一句话创建', '批量整理', '去重保护', '接入日历', '数据安全'].forEach((text) => {
    assert(html.includes(text), `missing step ${text}`);
  });
});

add('route examples are exact and complete', () => {
  ['明天下午三点开会', '每月15号还信用卡', '7月8日妈妈生日', '每天睡前涂润唇膏'].forEach((text) => {
    assert(html.includes(text), `missing example ${text}`);
  });
});

add('route action buttons are defined', () => {
  ['填入示例', '打开批量整理', '查看日历导出', '查看数据安全'].forEach((text) => {
    assert(html.includes(text), `missing button ${text}`);
  });
});

add('collapsed state key is stable', () => {
  assert(script.includes("shike_demo_route_collapsed"), 'missing localStorage key');
  assert(script.includes('DEMO_ROUTE_COLLAPSED_KEY'), 'missing collapsed key constant');
});

add('forbidden promise text is absent', () => {
  ['自动同步', '绑定 Google Calendar', '云同步'].forEach((text) => {
    assert(!html.includes(text), `forbidden text present: ${text}`);
  });
});

add('default route state is collapsed', () => {
  const app = loadApp();
  assert(app.run('readDemoRouteCollapsed()') === true, 'default should be collapsed');
  app.run('demoRouteCollapsed=readDemoRouteCollapsed();renderDemoRoute();');
  assert(app.elements.demoRouteBlock.innerHTML.includes('demo-route-card collapsed'), 'rendered card should be collapsed');
});

add('toggle persists collapsed state', () => {
  const app = loadApp();
  app.run('demoRouteCollapsed=readDemoRouteCollapsed();renderDemoRoute();toggleDemoRoute();');
  assert(app.store.shike_demo_route_collapsed === 'false', 'expanded state should persist');
  assert(app.elements.demoRouteBlock.innerHTML.includes('aria-expanded="true"'), 'expanded aria state missing');
});

add('empty data hint is visible without records', () => {
  const app = loadApp();
  app.run('demoRouteCollapsed=false;records=[];renderDemoRoute();');
  assert(app.elements.demoRouteBlock.innerHTML.includes('也可以先点体验示例。'), 'missing empty hint');
});

add('sentence demo fills input and opens parse preview without saving', () => {
  const app = loadApp();
  app.run(`records=[{id:'user_1',title:'用户记录',dateKey:'2026-07-08',timeText:'',recordKind:'note',repeat:'none',rawText:'用户记录'}];`);
  const before = app.run('records.length');
  app.run('fillDemoRouteSentence();');
  assert(app.elements.quickInput.value === '明天下午三点开会', 'quick input not filled');
  assert(app.elements.parsePreviewBlock.innerHTML.includes('parse-preview'), 'parse preview not rendered');
  assert(app.run('records.length') === before, 'records changed by sentence demo');
});

add('batch demo fills textarea and drafts without saving', () => {
  const app = loadApp();
  app.run(`records=[{id:'user_1',title:'用户记录',dateKey:'2026-07-08',timeText:'',recordKind:'note',repeat:'none',rawText:'用户记录'}];`);
  const before = app.run('records.length');
  app.run('openDemoRouteBatch();');
  assert(app.elements.importTextInput.value.includes('每月15号还信用卡'), 'batch textarea not filled');
  assert(app.run('importDrafts.length') >= 4, 'batch drafts not prepared');
  assert(app.run('records.length') === before, 'records changed by batch demo');
});

add('calendar export button jumps to my page target', () => {
  const app = loadApp();
  app.run("currentPage='home';jumpDemoRouteCalendarExport();");
  assert(app.run('currentPage') === 'my', 'calendar jump should switch to my page');
  assert(app.elements.calendarExportSection.scrolled === true, 'calendar section not scrolled');
});

add('data safety button jumps to my page target', () => {
  const app = loadApp();
  app.run("currentPage='home';jumpDemoRouteDataSafety();");
  assert(app.run('currentPage') === 'my', 'data safety jump should switch to my page');
  assert(app.elements.dataSafetySection.scrolled === true, 'data safety section not scrolled');
});

add('route action bodies do not save, clear, import, or export', () => {
  const bodies = [
    bodyBetween('function fillDemoRouteSentence', 'function openDemoRouteBatch'),
    bodyBetween('function openDemoRouteBatch', 'function jumpToMySection'),
    bodyBetween('function jumpDemoRouteCalendarExport', 'function jumpDemoRouteDataSafety')
  ].join('\n');
  ['saveParsedRecord', 'saveDraft', 'saveAllDrafts', 'exportIcsFile', 'exportBackupFile', 'records=[]', 'clearData'].forEach((token) => {
    assert(!bodies.includes(token), `route action contains ${token}`);
  });
});

add('route renders no undefined or null visible text', () => {
  const app = loadApp();
  app.run('demoRouteCollapsed=false;renderDemoRoute();');
  const text = app.elements.demoRouteBlock.innerHTML;
  assert(!/\bundefined\b|\bnull\b/.test(text), 'route includes undefined/null text');
});

add('calendar copy is honest manual .ics export', () => {
  assert(html.includes('带日期的记录可以导出 .ics，导入 Google Calendar、Apple Calendar 或 Outlook。'), 'missing honest calendar copy');
});

add('data safety copy states browser local JSON backup', () => {
  assert(html.includes('时刻数据保存在当前浏览器。重要记录建议定期导出 JSON 备份。'), 'missing data safety copy');
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Demo route regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Demo route regression passed: ${checks.length}/${checks.length}`);
