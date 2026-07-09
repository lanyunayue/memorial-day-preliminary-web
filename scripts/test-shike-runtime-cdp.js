const CDP_URL = process.env.SHIKE_CDP_URL || 'http://127.0.0.1:9224';
const APP_URL = process.env.SHIKE_APP_URL || 'http://127.0.0.1:8090/index.html';
const VIEWPORTS = [375, 390, 414, 768, 1024, 1366, 1440];
const PAGES = ['home', 'all', 'calendar', 'import', 'my'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function getPageTarget() {
  let targets = await json(`${CDP_URL}/json`);
  let page = targets.find((target) => target.type === 'page');
  if (!page) {
    page = await json(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`, { method: 'PUT' });
  }
  return page;
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.waiters = new Map();
    this.consoleErrors = [];
    this.runtimeErrors = [];
    this.logErrors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
      this.ws.addEventListener('message', (event) => this.onMessage(event));
    });
  }

  onMessage(event) {
    const msg = JSON.parse(event.data);
    if (msg.id && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else resolve(msg.result || {});
      return;
    }
    if (!msg.method) return;
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = (msg.params.args || []).map((arg) => arg.value || arg.description || '').join(' ');
      this.consoleErrors.push(text);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      this.runtimeErrors.push(msg.params.exceptionDetails && msg.params.exceptionDetails.text);
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry && msg.params.entry.level === 'error') {
      this.logErrors.push(msg.params.entry.text);
    }
    const waiters = this.waiters.get(msg.method) || [];
    this.waiters.set(msg.method, []);
    waiters.forEach((waiter) => waiter.resolve(msg.params));
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, 8000);
    });
  }

  waitFor(method, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const list = this.waiters.get(method) || [];
      const waiter = { resolve, reject };
      list.push(waiter);
      this.waiters.set(method, list);
      setTimeout(() => {
        const current = this.waiters.get(method) || [];
        const index = current.indexOf(waiter);
        if (index >= 0) current.splice(index, 1);
        reject(new Error(`${method} wait timed out`));
      }, timeout);
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || 'Runtime.evaluate exception');
    }
    return result.result && result.result.value;
  }

  async navigate(url) {
    const loaded = this.waitFor('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
    await delay(250);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const checks = [];
  const page = await getPageTarget();
  const client = new CdpClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable');

  function add(name, condition, detail) {
    assert(condition, detail || name);
    checks.push(name);
  }

  await client.navigate(APP_URL);
  await client.evaluate(`
    localStorage.setItem('shike_settings_v1', JSON.stringify({
      theme:'paper',language:'zh-CN',calendarMode:'solar',weatherEnabled:false,
      username:'',firstVisitAt:Date.now(),openingSeen:true,notifyDeniedUntil:0,
      notifyRequested:false,weatherCache:null,weatherCacheAt:0,locationDeniedUntil:0
    }));
    localStorage.removeItem('shike_demo_route_collapsed');
    localStorage.setItem('shike_seen_release_note_version', 'v0.9.5');
  `);
  await client.navigate(APP_URL);

  const version = await client.evaluate(`({appVersion:APP_VERSION, cacheFetch:typeof fetchWeather, route:!!document.getElementById('demoRouteBlock')})`);
  add('app loads v0.9.5 route shell', version.appVersion === 'v0.9.5' && version.cacheFetch === 'function' && version.route, JSON.stringify(version));

  const guard = await client.evaluate(`
    (() => {
      const quick=document.getElementById('quickInput');
      const cleanBefore=hasUnsavedWork();
      const cleanEvent=new Event('beforeunload',{cancelable:true});
      const cleanDispatch=window.dispatchEvent(cleanEvent);
      quick.value='remember this';
      const dirtyBefore=hasUnsavedWork();
      const dirtyEvent=new Event('beforeunload',{cancelable:true});
      const dirtyDispatch=window.dispatchEvent(dirtyEvent);
      quick.value='';
      return {
        cleanBefore,
        cleanPrevented:cleanEvent.defaultPrevented,
        cleanDispatch,
        dirtyBefore,
        dirtyPrevented:dirtyEvent.defaultPrevented,
        dirtyDispatch
      };
    })()
  `);
  add('unsaved work beforeunload guard only blocks dirty state', guard.cleanBefore === false && guard.cleanPrevented === false && guard.cleanDispatch === true && guard.dirtyBefore === true && guard.dirtyPrevented === true && guard.dirtyDispatch === false, JSON.stringify(guard));

  const polish = await client.evaluate(`
    (() => {
      switchPage('home');
      const home = {
        exampleHidden: getComputedStyle(document.getElementById('exampleChips')).display === 'none',
        demoHidden: getComputedStyle(document.getElementById('demoRouteBlock')).display === 'none',
        hasInput: !!document.getElementById('quickInput'),
        hasToday: !!document.getElementById('todayOverviewBlock')
      };
      records=[{id:'r1',title:'明天下午三点开会',dateText:'明天',dateKey:'2026-07-10',timeText:'15:00',recordKind:'reminder',repeat:'none',rawText:'明天下午三点开会',createdAt:Date.now(),updatedAt:Date.now()}];
      renderAll();
      const swipe = {
        hasWrapper: !!document.querySelector('.record-swipe'),
        hasEdit: !!document.querySelector('.swipe-action'),
        hasDanger: !!document.querySelector('.swipe-action.danger')
      };
      switchPage('my');
      const my = {
        demo: !!document.getElementById('demoBtnMy'),
        feedback: document.getElementById('feedbackMailLink') && document.getElementById('feedbackMailLink').getAttribute('href') === 'mailto:308138249@qq.com',
        future: !!document.getElementById('futurePlanSection')
      };
      const releaseShown = showReleaseNotes(true);
      const release = {
        shown: releaseShown,
        title: document.getElementById('releaseTitle').textContent,
        bullets: document.querySelectorAll('#releaseList li').length
      };
      closeReleaseNotes();
      saveTimeSpriteCollapsed(false);
      const sprite = {
        bear: !!document.querySelector('.time-sprite-bear'),
        today: !!document.getElementById('timeSpriteTodayBtn'),
        batch: !!document.getElementById('timeSpriteBatchBtn'),
        calendar: !!document.getElementById('timeSpriteCalendarBtn'),
        backup: !!document.getElementById('timeSpriteBackupBtn'),
        update: !!document.getElementById('timeSpriteUpdateBtn')
      };
      return {home, swipe, my, release, sprite};
    })()
  `);
  add('v0.9.5 product polish surfaces work at runtime', polish.home.exampleHidden && polish.home.demoHidden && polish.home.hasInput && polish.home.hasToday && polish.swipe.hasWrapper && polish.swipe.hasEdit && polish.swipe.hasDanger && polish.my.demo && polish.my.feedback && polish.my.future && polish.release.shown && polish.release.bullets >= 5 && polish.sprite.bear && polish.sprite.today && polish.sprite.batch && polish.sprite.calendar && polish.sprite.backup && polish.sprite.update, JSON.stringify(polish));

  const overflows = [];
  for (const width of VIEWPORTS) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: width >= 768 ? 900 : 812,
      deviceScaleFactor: 1,
      mobile: width < 768
    });
    await delay(80);
    for (const pageName of PAGES) {
      const result = await client.evaluate(`
        (() => {
          switchPage('${pageName}');
          const width = window.innerWidth;
          const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
          return { page:'${pageName}', width, overflow: scrollWidth - width };
        })()
      `);
      if (result.overflow > 1) overflows.push(result);
    }
  }
  add('all requested viewports and pages avoid horizontal overflow', overflows.length === 0, JSON.stringify(overflows));

  const route = await client.evaluate(`
    (() => {
      localStorage.removeItem('shike_demo_route_collapsed');
      records=[]; saveRecords();
      switchPage('my');
      const summary = document.querySelector('#page-my summary[data-i18n="demoRouteEntryTitle"]');
      const details = summary && summary.closest('details');
      const steps = details ? details.querySelectorAll('li').length : 0;
      return {
        title: summary && summary.textContent,
        subtitle: details && details.querySelector('p') && details.querySelector('p').textContent,
        steps,
        demoButton: !!document.getElementById('demoBtnMy')
      };
    })()
  `);
  add('route moved to my page with concise steps', route.title === '演示路线' && route.subtitle === '从一句话到日历，看看时刻如何整理你的时间。' && route.steps >= 5 && route.demoButton, JSON.stringify(route));

  const interactions = await client.evaluate(`
    (() => {
      localStorage.removeItem('shike_demo_records_added_v1');
      localStorage.removeItem('shike_demo_route_collapsed');
      records=[{id:'user_keep',title:'用户记录',dateText:'今天',dateKey:'2026-07-08',timeText:'',note:'',repeat:'none',recordKind:'note',rawText:'用户记录',createdAt:Date.now(),updatedAt:Date.now()}];
      saveRecords();
      const beforeSentence = records.length;
      fillDemoRouteSentence();
      const sentence = {
        value: document.getElementById('quickInput').value,
        preview: !!document.getElementById('parsePreviewCard'),
        count: records.length,
        page: currentPage
      };
      const beforeBatch = records.length;
      openDemoRouteBatch();
      const batch = {
        value: document.getElementById('importTextInput').value,
        drafts: importDrafts.length,
        count: records.length,
        page: currentPage
      };
      jumpDemoRouteCalendarExport();
      const calendarJump = currentPage === 'my' && !!document.getElementById('calendarExportSection');
      jumpDemoRouteDataSafety();
      const safetyJump = currentPage === 'my' && !!document.getElementById('dataSafetySection');
      return { beforeSentence, sentence, beforeBatch, batch, calendarJump, safetyJump };
    })()
  `);
  add('sentence demo fills parse preview without saving', interactions.sentence.value === '明天下午三点开会' && interactions.sentence.preview && interactions.sentence.count === interactions.beforeSentence && interactions.sentence.page === 'home', JSON.stringify(interactions.sentence));
  add('batch demo fills drafts without saving', interactions.batch.value.includes('每月15号还信用卡') && interactions.batch.drafts >= 4 && interactions.batch.count === interactions.beforeBatch && interactions.batch.page === 'import', JSON.stringify(interactions.batch));
  add('route buttons jump to my page sections', interactions.calendarJump && interactions.safetyJump, JSON.stringify(interactions));

  const existing = await client.evaluate(`
    (() => {
      records=[]; saveRecords(); localStorage.removeItem('shike_demo_records_added_v1');
      addDemoRecords();
      const demoCount = records.length;
      const batchDrafts = prepareBatchCaptureDrafts('明天下午三点开会\\n每月15号还信用卡\\n7月8日妈妈生日\\n每天睡前涂润唇膏').length;
      const dedupeDrafts = prepareBatchCaptureDrafts('明天下午三点开会\\n明天下午三点开会').length;
      return { demoCount, batchDrafts, dedupeDrafts };
    })()
  `);
  add('existing examples batch and dedupe still work', existing.demoCount === 5 && existing.batchDrafts >= 4 && existing.dedupeDrafts === 1, JSON.stringify(existing));

  const surface = await client.evaluate(`
    (() => {
      switchPage('home');
      applyTheme('night');
      saveTimeSpriteCollapsed(false);
      const sprite = document.querySelector('.time-sprite-orb');
      const bear = document.querySelector('.time-sprite-bear');
      const spriteStyle = getComputedStyle(sprite);
      const spriteReadable = !!sprite && !!bear && spriteStyle.display !== 'none';
      const coverHtml = renderCoverPicker({coverImage:null, coverPreset:0});
      const backgroundOk = coverHtml.includes('coverUpload') && coverHtml.includes('cover-preset');
      const weatherOk = typeof fetchWeather === 'function' && !!document.getElementById('weatherCard');
      applyLanguage('en');
      switchPage('my');
      const enTitle = document.querySelector('#page-my summary[data-i18n="demoRouteEntryTitle"]').textContent;
      applyLanguage('zh-CN');
      switchPage('my');
      const zhTitle = document.querySelector('#page-my summary[data-i18n="demoRouteEntryTitle"]').textContent;
      return { spriteReadable, backgroundOk, weatherOk, enTitle, zhTitle };
    })()
  `);
  add('night theme weather background and language switch remain stable', surface.spriteReadable && surface.backgroundOk && surface.weatherOk && surface.enTitle === 'Demo route' && surface.zhTitle === '演示路线', JSON.stringify(surface));

  await delay(300);
  const allErrors = client.consoleErrors.concat(client.runtimeErrors).concat(client.logErrors)
    .filter(Boolean)
    .filter((text) => !/favicon/i.test(text));
  add('runtime has no console or JS errors', allErrors.length === 0, JSON.stringify(allErrors));

  client.close();
  console.log(`Runtime CDP acceptance passed: ${checks.length}/${checks.length}`);
}

main().catch((error) => {
  console.error(`Runtime CDP acceptance failed: ${error.message}`);
  process.exit(1);
});
