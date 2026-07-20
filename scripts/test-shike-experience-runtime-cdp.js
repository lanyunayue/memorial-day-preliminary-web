const fs = require('fs');
const path = require('path');

const CDP_URL = process.env.SHIKE_CDP_URL || 'http://127.0.0.1:9251';
const APP_URL = process.env.SHIKE_APP_URL || 'http://127.0.0.1:8090/';
const EXPECTED_VERSION = process.env.SHIKE_EXPECTED_VERSION || 'v2.3.0-alpha2-webfix';
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
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, timeout).unref();
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); }
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    }, 90000);
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
  const navigationToken = `${Date.now()}-${Math.random()}`;
  try { await client.evaluate(`window.__shikeNavigationToken=${JSON.stringify(navigationToken)}`); } catch (_) {}
  await client.send('Page.navigate', { url: APP_URL });
  const stabilizationGate = LAYOUT_BASELINE
    ? `!!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready && getComputedStyle(document.getElementById('opening')).display==='none'`
    : `!!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready && history.scrollRestoration==='manual' && getComputedStyle(document.getElementById('opening')).display==='none'`;
  await waitFor(
    client,
    `window.__shikeNavigationToken!==${JSON.stringify(navigationToken)} && document.readyState==='complete' && window.APP_VERSION===${JSON.stringify(EXPECTED_VERSION)} && !!document.getElementById('quickInput') && ${stabilizationGate}`,
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
    const storageBefore=ShikeLocalFirst&&ShikeLocalFirst.getStatus();
    try{
      await persistRecordsDurably();
    }catch(error){
      return {setupError:error&&error.message||String(error),storageBefore,storageAfter:ShikeLocalFirst&&ShikeLocalFirst.getStatus()};
    }
    await ShikeAgent.clearHistory();
    ShikeComposerState.reset();
    saveTimeSpriteCollapsed(false);
    document.getElementById('agentWorkbench').open=true;
    const input=document.getElementById('agentInput');
    const send=document.getElementById('agentSendBtn');
    const plan=document.getElementById('agentPlan');
    input.value='';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    await sleep(80);
    const emptyDisabled=send.disabled;
    const initialPlanHidden=plan.hidden&&getComputedStyle(plan).display==='none';
    async function submit(text){
      await sleep(900);
      const currentInput=document.getElementById('agentInput');
      const currentSend=document.getElementById('agentSendBtn');
      currentInput.value=text;
      currentInput.dispatchEvent(new Event('input',{bubbles:true}));
      await sleep(40);
      const before=records.length;
      const enabledBefore=!currentSend.disabled;
      currentSend.click();
      currentSend.click();
      const completed=await wait(()=>records.length===before+1&&ShikeComposerState.getProcessingState()!=='processing',12000);
      await sleep(300);
      const nextInput=document.getElementById('agentInput');
      const nextSend=document.getElementById('agentSendBtn');
      const nextPlan=document.getElementById('agentPlan');
      return {
        before,
        after:records.length,
        completed,
        enabledBefore,
        inputCleared:nextInput.value==='',
        buttonDisabled:nextSend.disabled,
        planHidden:nextPlan.hidden&&getComputedStyle(nextPlan).display==='none',
        result:ShikeComposerState.getLastResult()
      };
    }
    const before=records.length;
    const jobSubmit=await submit('今天还有作业要做，帮我登记');
    const afterJob=records.length;
    const job=records.find((record)=>/作业/.test(record.title));
    let dbRecords=[];
    if(window.ShikeIndexedDb){
      const dbDeadline=Date.now()+5000;
      while(Date.now()<dbDeadline){
        dbRecords=await ShikeIndexedDb.getAll('records');
        if(dbRecords.length===afterJob)break;
        await sleep(100);
      }
    }
    const overview=document.getElementById('todayOverviewBlock').textContent;
    switchPage('calendar');renderCalendar();
    const calendarDot=!!document.querySelector('#page-calendar .cal-dot');
    switchPage('all');
    const search=document.getElementById('allSearchInput');search.value='作业';search.dispatchEvent(new Event('input',{bubbles:true}));await sleep(260);
    const searchFound=/作业/.test(document.getElementById('allList').textContent);
    switchPage('home');
    const milkSubmit=await submit('帮我记一下买牛奶');
    const milk=records.find((record)=>/买牛奶/.test(record.title));
    const reportSubmit=await submit('明天下午三点交报告');
    const report=records.find((record)=>/交报告/.test(record.title));
    const monthlySubmit=await submit('每月15号还信用卡，帮我记着');
    const monthly=records.find((record)=>/信用卡/.test(record.title));
    const watchRemoved = !document.getElementById('page-watch');
    return {
      before,afterJob,job,dbCount:dbRecords.length,
      emptyDisabled,initialPlanHidden,jobSubmit,
      overviewHasJob:/作业/.test(overview),calendarDot,searchFound,
      milkSubmit,milk,reportSubmit,report,monthlySubmit,monthly,
      finalPlanHidden:(()=>{const currentPlan=document.getElementById('agentPlan');return currentPlan.hidden&&getComputedStyle(currentPlan).display==='none';})(),
      watchRemoved,
      storage:ShikeLocalFirst&&ShikeLocalFirst.getStatus(),
      composerState:ShikeComposerState.getProcessingState()
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
  const reloadToken = `${Date.now()}-${Math.random()}`;
  await client.evaluate(`window.__shikeReloadToken=${JSON.stringify(reloadToken)}`);
  await client.send('Page.reload', { ignoreCache: true });
  await waitFor(client, `window.__shikeReloadToken!==${JSON.stringify(reloadToken)} && document.readyState==='complete' && window.APP_VERSION===${JSON.stringify(EXPECTED_VERSION)} && !!window.ShikeAgent && !!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready`, 'reload');
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
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'experience-runtime-result.json'), JSON.stringify(results, null, 2));
  assert(!results.agent.setupError, `Composer setup persistence failed: ${JSON.stringify(results.agent)}`);
  assert(results.agent.emptyDisabled, 'empty Composer input did not disable send');
  assert(results.agent.initialPlanHidden && results.agent.finalPlanHidden, 'hidden Agent action area remained visible');
  assert(results.agent.jobSubmit.enabledBefore && results.agent.jobSubmit.completed, 'unified Composer did not submit the workbench input');
  assert(results.agent.jobSubmit.after === results.agent.jobSubmit.before + 1, 'double click did not save exactly once');
  assert(results.agent.jobSubmit.inputCleared && results.agent.jobSubmit.buttonDisabled, 'Composer did not clear and disable after saving');
  assert(results.agent.afterJob === results.agent.before + 1, 'double confirmation did not save exactly once');
  assert(results.agent.job && /作业/.test(results.agent.job.title), 'job title was not parsed');
  const now = new Date();
  const localToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  assert(results.agent.job.dateKey === localToday, 'job date is not today');
  assert(results.agent.job.recordKind === 'reminder', 'job type is not reminder');
  assert(results.agent.dbCount === results.agent.afterJob, 'IndexedDB did not contain the confirmed record');
  assert(results.agent.overviewHasJob && results.agent.calendarDot && results.agent.searchFound, 'confirmed record did not refresh all product views');
  assert(results.agent.milkSubmit.after === results.agent.milkSubmit.before + 1 && results.agent.milk && !results.agent.milk.dateKey, 'undated memo was not saved correctly');
  assert(results.agent.reportSubmit.after === results.agent.reportSubmit.before + 1 && results.agent.report && results.agent.report.timeText === '15:00', 'report time was not parsed as 15:00');
  assert(results.agent.monthlySubmit.after === results.agent.monthlySubmit.before + 1 && results.agent.monthly && results.agent.monthly.repeat === 'monthly', 'monthly repeat was damaged');
  assert(results.agent.watchRemoved, 'removed Watch Center remained reachable');
  assert(results.agent.storage && ['indexeddb','legacy-fallback'].includes(results.agent.storage.mode), 'storage mode is invalid');
  assert(client.runtimeErrors.length === 0, `runtime errors: ${client.runtimeErrors.join(' | ')}`);

  console.log(`Experience runtime CDP acceptance passed: ${VIEWPORTS.length + 21}/${VIEWPORTS.length + 21}`);
  console.log(JSON.stringify(results, null, 2));
  client.close();
}

main().catch((error) => {
  console.error(`Experience runtime CDP acceptance failed: ${error.stack || error.message}`);
  process.exit(1);
});
