const fs = require('fs');
const path = require('path');

const CDP_URL = process.env.SHIKE_CDP_URL || 'http://127.0.0.1:9251';
const APP_URL = process.env.SHIKE_APP_URL || 'http://127.0.0.1:8090/';
const EXPECTED_VERSION = process.env.SHIKE_EXPECTED_VERSION || 'v2.0.0-rc4';
const LAYOUT_BASELINE = process.env.SHIKE_LAYOUT_BASELINE === '1';
const LAYOUT_ONLY = LAYOUT_BASELINE || process.env.SHIKE_LAYOUT_ONLY === '1';
const REQUIRE_STANDALONE = process.env.SHIKE_REQUIRE_STANDALONE === '1';
const ARTIFACT_DIR = process.env.SHIKE_ARTIFACT_DIR || path.resolve(__dirname, '..', 'docs', 'day-work', 'screenshots-v141-experience');
const DEFAULT_VIEWPORTS = [
  [360, 640], [375, 667], [390, 844], [414, 896], [768, 1024],
  [1024, 768], [1366, 768], [1440, 900], [1920, 1080]
];
const VIEWPORTS = process.env.SHIKE_VIEWPORT
  ? [process.env.SHIKE_VIEWPORT.split('x').map(Number)]
  : DEFAULT_VIEWPORTS;

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function assert(condition, message) { if (!condition) throw new Error(message); }

class CdpClient {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.runtimeErrors = [];
  }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const item = this.pending.get(message.id);
        this.pending.delete(message.id);
        message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result || {});
      }
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        this.consoleErrors.push((message.params.args || []).map((arg) => arg.value || arg.description || '').join(' '));
      }
      if (message.method === 'Runtime.exceptionThrown') {
        this.runtimeErrors.push(message.params.exceptionDetails && message.params.exceptionDetails.text || 'runtime exception');
      }
    });
  }
  send(method, params = {}, timeout = 30000) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, timeout);
    });
  }
  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (response.exceptionDetails) {
      const detail = response.exceptionDetails.exception && response.exceptionDetails.exception.description;
      throw new Error(detail || response.exceptionDetails.text || 'Runtime.evaluate failed');
    }
    return response.result && response.result.value;
  }
  close() { if (this.ws) this.ws.close(); }
}

async function waitFor(client, expression, label, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { if (await client.evaluate(expression)) return; } catch (_) {}
    await delay(100);
  }
  throw new Error(`${label} timed out`);
}

async function navigate(client) {
  await client.send('Page.navigate', { url: APP_URL });
  const stabilizationGate = LAYOUT_BASELINE
    ? `!!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready && getComputedStyle(document.getElementById('opening')).display==='none'`
    : `!!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready && history.scrollRestoration==='manual' && getComputedStyle(document.getElementById('opening')).display==='none'`;
  await waitFor(
    client,
    `document.readyState==='complete' && window.APP_VERSION===${JSON.stringify(EXPECTED_VERSION)} && !!document.getElementById('quickInput') && ${stabilizationGate}`,
    'application bootstrap'
  );
  await delay(900);
}

async function metrics(client) {
  return client.evaluate(`(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {top:Math.round(box.top*100)/100,left:Math.round(box.left*100)/100,width:Math.round(box.width*100)/100,height:Math.round(box.height*100)/100};
    };
    const viewport = window.visualViewport;
    const hero = rect('#homeHero');
    return {
      version: window.APP_VERSION,
      scrollY: window.scrollY,
      documentScrollTop: document.documentElement.scrollTop,
      visualViewportOffsetTop: viewport ? viewport.offsetTop : 0,
      visualViewportHeight: viewport ? viewport.height : window.innerHeight,
      app: rect('#app'),
      home: rect('#page-home'),
      firstEffective: rect('#homeHero .hero-title'),
      input: rect('#quickInput'),
      topBlank: hero ? Math.max(0, hero.top) : null,
      bodyScrollHeight: document.body.scrollHeight,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth-window.innerWidth),
      activePage: window.currentPage,
      openingDisplay: getComputedStyle(document.getElementById('opening')).display,
      releaseVisible: document.getElementById('releaseBox').classList.contains('show'),
      historyRestoration: history.scrollRestoration,
      standalone: matchMedia('(display-mode: standalone)').matches,
      focused: document.activeElement && document.activeElement.id || '',
      storage: window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus()
    };
  })()`);
}

async function capture(client, file) {
  const result = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
}

async function runAgentFlow(client) {
  return client.evaluate(`(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const wait = async (predicate, timeout=8000) => {
      const started=Date.now();
      while(Date.now()-started<timeout){if(predicate())return true;await sleep(50);}
      return false;
    };
    records=[];
    saveRecords();
    if(window.ShikeLocalFirst)await ShikeLocalFirst.persist(records);
    await ShikeAgent.clearHistory();
    saveTimeSpriteCollapsed(false);
    document.getElementById('agentWorkbench').open=true;
    const input=document.getElementById('agentInput');
    const send=document.getElementById('agentSendBtn');
    const execute=document.getElementById('agentExecuteBtn');
    const modify=document.getElementById('agentModifyBtn');
    const cancel=document.getElementById('agentCancelBtn');
    const plan=document.getElementById('agentPlan');
    async function submit(text){input.value=text;send.click();await wait(()=>!plan.hidden);await sleep(80);return {
      intent:document.getElementById('agentPlanIntent').textContent,
      item:document.getElementById('agentPlanTool').textContent,
      change:document.getElementById('agentPlanChange').textContent,
      execute:execute.textContent,
      modifyVisible:!document.getElementById('agentModifyBtn').hidden,
      count:records.length
    };}
    const before=records.length;
    const jobPreview=await submit('今天还有作业要做，帮我登记');
    const beforeConfirm=records.length;
    execute.click();execute.click();
    await wait(()=>plan.hidden&&records.length===before+1,12000);
    await sleep(300);
    const afterJob=records.length;
    const job=records.find((record)=>/作业/.test(record.title));
    const dbRecords=window.ShikeIndexedDb ? await ShikeIndexedDb.getAll('records') : [];
    const overview=document.getElementById('todayOverviewBlock').textContent;
    switchPage('calendar');renderCalendar();
    const calendarDot=!!document.querySelector('#page-calendar .cal-dot');
    switchPage('all');
    const search=document.getElementById('allSearchInput');search.value='作业';search.dispatchEvent(new Event('input',{bubbles:true}));await sleep(260);
    const searchFound=/作业/.test(document.getElementById('allList').textContent);
    switchPage('home');
    const milkBefore=records.length;
    const milkPreview=await submit('帮我记一下买牛奶');
    cancel.click();await wait(()=>plan.hidden);await sleep(80);
    const milkCancelled=records.length===milkBefore;
    const modifyBefore=records.length;
    const modifyPreview=await submit('周五交论文，记录一下');
    modify.click();await wait(()=>plan.hidden);await sleep(80);
    const modifyNoWrite=records.length===modifyBefore;
    const modifyFocused=document.activeElement===input&&input.placeholder.includes('改成');
    const reportPreview=await submit('明天下午三点交报告');
    cancel.click();await wait(()=>plan.hidden);await sleep(80);
    const monthlyPreview=await submit('每月15号还信用卡，帮我记着');
    const monthlyParsed=ShikeSpriteCreateIntent.extract('每月15号还信用卡，帮我记着');
    cancel.click();await wait(()=>plan.hidden);await sleep(80);
    const failureBefore=records.length;
    const failureTextBefore=document.getElementById('agentConversation').textContent;
    const failurePreview=await submit('明天测试保存失败，帮我登记');
    const originalBridge=window.ShikeLocalFirst;
    window.ShikeLocalFirst={persist:()=>Promise.reject(new Error('simulated_write_failure')),getStatus:originalBridge.getStatus};
    execute.click();await wait(()=>!execute.disabled);await sleep(120);
    window.ShikeLocalFirst=originalBridge;
    const failureText=document.getElementById('agentConversation').textContent.slice(failureTextBefore.length);
    const failureNoWrite=records.length===failureBefore;
    cancel.click();await wait(()=>plan.hidden);await sleep(80);
    const watchParent=document.getElementById('page-watch').parentElement.id;
    switchPage('watch');
    const watchVisible=getComputedStyle(document.getElementById('page-watch')).display!=='none';
    switchPage('home');
    return {
      before,beforeConfirm,afterJob,job,dbCount:dbRecords.length,
      jobPreview,overviewHasJob:/作业/.test(overview),calendarDot,searchFound,
      milkPreview,milkCancelled,modifyPreview,modifyNoWrite,modifyFocused,reportPreview,monthlyPreview,
      monthlyRepeat:monthlyParsed&&monthlyParsed.repeat,
      failurePreview,failureNoWrite,failureText,
      watchParent,watchVisible,
      storage:ShikeLocalFirst&&ShikeLocalFirst.getStatus(),
      successText:document.getElementById('agentConversation').textContent
    };
  })()`);
}

async function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const targets = await fetch(`${CDP_URL}/json`).then((response) => response.json());
  const page = targets.find((target) => target.type === 'page');
  assert(page, 'No Edge page target');
  const client = new CdpClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable');
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    try {
      localStorage.setItem('shike_settings_v1', JSON.stringify({theme:'paper',language:'zh-CN',calendarMode:'solar',weatherEnabled:false,username:'',firstVisitAt:Date.now(),openingSeen:true,notifyDeniedUntil:0,notifyRequested:false,weatherCache:null,weatherCacheAt:0,locationDeniedUntil:0}));
      localStorage.setItem('shike_seen_release_note_version', ${JSON.stringify(EXPECTED_VERSION)});
      localStorage.removeItem('shike_agent_session_v1');
    } catch (error) {}
  ` });
  await navigate(client);

  const results = { url: APP_URL, version: EXPECTED_VERSION, viewports: [], scenarios: {}, agent: null };
  for (const [width, height] of VIEWPORTS) {
    await client.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await client.evaluate(`switchPage('home');window.scrollTo(0,0);`);
    await delay(180);
    const result = await metrics(client);
    if (!LAYOUT_BASELINE) {
      assert(result.scrollY <= 1 && result.documentScrollTop <= 1, `${width}x${height} initial scroll is not at top`);
      assert(result.topBlank >= 0 && result.topBlank <= 60, `${width}x${height} top blank ${result.topBlank}px exceeds threshold`);
      assert(result.input && result.input.top < height, `${width}x${height} main input is outside the first viewport`);
    }
    assert(result.horizontalOverflow <= 1, `${width}x${height} horizontal overflow ${result.horizontalOverflow}px`);
    assert(result.openingDisplay === 'none', `${width}x${height} opening overlay is still visible`);
    if (!LAYOUT_BASELINE) assert(result.historyRestoration === 'manual', `${width}x${height} scroll restoration is not manual`);
    assert(result.storage && result.storage.ready, `${width}x${height} local storage engine is not ready`);
    if (REQUIRE_STANDALONE) assert(result.standalone, `${width}x${height} is not running in standalone display mode`);
    const screenshot = path.join(ARTIFACT_DIR, `v141-home-${width}x${height}.png`);
    await capture(client, screenshot);
    results.viewports.push({ width, height, screenshot, ...result });
  }

  if (LAYOUT_ONLY) {
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'experience-runtime-result.json'), JSON.stringify(results, null, 2));
    console.log(`Experience baseline layout capture completed: ${VIEWPORTS.length}/${VIEWPORTS.length}`);
    console.log(JSON.stringify(results, null, 2));
    client.close();
    return;
  }

  await client.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: false });
  await client.evaluate(`window.scrollTo(0,300);`);
  await client.send('Page.reload', { ignoreCache: true });
  await waitFor(client, `document.readyState==='complete' && window.APP_VERSION===${JSON.stringify(EXPECTED_VERSION)} && !!window.ShikeAgent`, 'reload');
  await delay(900);
  results.scenarios.oldScrollReload = await metrics(client);
  assert(results.scenarios.oldScrollReload.scrollY <= 1, 'old scroll position was restored');

  results.scenarios.pageSwitch = await client.evaluate(`(() => {switchPage('all');window.scrollTo(0,200);switchPage('home');return {scrollY:window.scrollY,page:currentPage};})()`);
  assert(results.scenarios.pageSwitch.page === 'home' && results.scenarios.pageSwitch.scrollY <= 1, 'home page switch did not reset scroll');

  results.scenarios.releaseClose = await client.evaluate(`new Promise((resolve) => {showReleaseNotes(true);window.scrollTo(0,180);closeReleaseNotes();setTimeout(() => resolve({scrollY:window.scrollY,visible:document.getElementById('releaseBox').classList.contains('show')}),120);})`);
  assert(!results.scenarios.releaseClose.visible && results.scenarios.releaseClose.scrollY <= 1, 'release close did not restore top');

  results.scenarios.openingClose = await client.evaluate(`new Promise((resolve) => {document.getElementById('opening').style.display='flex';showOpening();window.scrollTo(0,180);hideOpening();setTimeout(() => resolve({scrollY:window.scrollY,display:getComputedStyle(document.getElementById('opening')).display}),620);})`);
  assert(results.scenarios.openingClose.display === 'none' && results.scenarios.openingClose.scrollY <= 1, 'opening close left layout or scroll residue');

  results.agent = await runAgentFlow(client);
  assert(results.agent.before === results.agent.beforeConfirm, 'preview wrote a record before confirmation');
  assert(results.agent.afterJob === results.agent.before + 1, 'double confirmation did not save exactly once');
  assert(results.agent.job && /作业/.test(results.agent.job.title), 'job title was not parsed');
  const now = new Date();
  const localToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  assert(results.agent.job.dateKey === localToday, 'job date is not today');
  assert(results.agent.job.recordKind === 'reminder', 'job type is not reminder');
  assert(results.agent.jobPreview.intent.includes('我理解为'), 'structured preview heading missing');
  assert(results.agent.jobPreview.item.includes('作业'), 'structured preview item missing');
  assert(results.agent.jobPreview.change.includes('日期：今天') && results.agent.jobPreview.change.includes('时间：全天') && results.agent.jobPreview.change.includes('类型：提醒'), 'job preview fields are incomplete');
  assert(results.agent.jobPreview.modifyVisible, 'modify action is not visible');
  assert(results.agent.dbCount === results.agent.afterJob, 'IndexedDB did not contain the confirmed record');
  assert(results.agent.overviewHasJob && results.agent.calendarDot && results.agent.searchFound, 'confirmed record did not refresh all product views');
  assert(results.agent.milkPreview.item.includes('买牛奶') && results.agent.milkPreview.change.includes('日期：未指定'), `undated memo preview is incorrect: ${JSON.stringify(results.agent.milkPreview)}`);
  assert(results.agent.milkCancelled, 'cancelled memo was persisted');
  assert(results.agent.modifyNoWrite && results.agent.modifyFocused, 'modify action wrote data or did not return focus');
  assert(results.agent.reportPreview.change.includes('15:00'), 'report time was not parsed as 15:00');
  assert(results.agent.monthlyRepeat === 'monthly', 'monthly repeat was damaged');
  assert(results.agent.failureNoWrite && !results.agent.failureText.includes('已帮你记住'), `failed persistence reported success: ${results.agent.failureText}`);
  assert(results.agent.watchParent === 'app' && results.agent.watchVisible, 'Watch Center is not a visible main page');
  assert(results.agent.storage && ['indexeddb','legacy-fallback'].includes(results.agent.storage.mode), 'storage mode is invalid');
  assert(client.runtimeErrors.length === 0, `runtime errors: ${client.runtimeErrors.join(' | ')}`);

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'experience-runtime-result.json'), JSON.stringify(results, null, 2));
  console.log(`Experience runtime CDP acceptance passed: ${VIEWPORTS.length + 24}/${VIEWPORTS.length + 24}`);
  console.log(JSON.stringify(results, null, 2));
  client.close();
}

main().catch((error) => {
  console.error(`Experience runtime CDP acceptance failed: ${error.stack || error.message}`);
  process.exit(1);
});
