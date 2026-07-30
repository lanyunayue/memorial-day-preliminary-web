'use strict';

const fs = require('fs');
const path = require('path');

const CDP_URL = process.env.SHIKE_CDP_URL || 'http://127.0.0.1:9224';
const APP_URL = process.env.SHIKE_APP_URL || 'http://127.0.0.1:8090/';
const ARTIFACT_DIR = process.env.SHIKE_ARTIFACT_DIR || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.runtimeErrors = [];
    this.networkErrors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
      this.ws.addEventListener('message', event => this.onMessage(event));
    });
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      else pending.resolve(message.result || {});
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const detail = message.params && message.params.exceptionDetails;
      this.runtimeErrors.push(detail && (detail.exception && detail.exception.description || detail.text));
    }
    if (message.method === 'Network.responseReceived') {
      const response = message.params && message.params.response;
      if (response && response.status >= 400) {
        this.networkErrors.push({ status: response.status, url: response.url });
      }
    }
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, 30000).unref();
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
      throw new Error(response.exceptionDetails.text || 'Runtime.evaluate exception');
    }
    return response.result && response.result.value;
  }

  async waitFor(expression, timeout = 30000, label = expression) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      try {
        if (await this.evaluate(expression)) return;
      } catch (error) {
        // Navigation briefly invalidates the execution context.
      }
      await delay(200);
    }
    throw new Error(`Timed out waiting for ${label}`);
  }

  async navigate(url, timeout = /^https:/i.test(url) ? 120000 : 30000) {
    const result = await this.send('Page.navigate', { url });
    if (result.errorText) throw new Error(`Navigation to ${url} failed: ${result.errorText}`);
    // Public hosts may keep optional font/analytics requests open. The product
    // readiness assertions below are stronger than the load event, so wait for
    // DOM readiness here instead of coupling the flow to every optional asset.
    try {
      await this.waitFor(`document.readyState !== 'loading'`, timeout, `navigation to ${url}`);
    } catch (error) {
      const state = await this.evaluate(`({href:location.href,ready:document.readyState,title:document.title})`).catch(() => null);
      throw new Error(`${error.message}: ${JSON.stringify(state)}`);
    }
  }

  async screenshot(filename) {
    if (!ARTIFACT_DIR) return;
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    const result = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(result.data, 'base64'));
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function getPageTarget() {
  // The full release suite deliberately mutates and closes tabs. Reusing the
  // first page returned by /json can therefore attach this test to a stale
  // target after the multi-tab scenario. A fresh target gives this durable
  // round-trip an isolated browsing context without restarting the browser.
  return json(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`, { method: 'PUT' });
}

async function main() {
  const checks = [];
  const target = await getPageTarget();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  function add(name, condition, detail) {
    assert(condition, detail || name);
    checks.push(name);
  }

  await client.navigate(new URL('index.html', APP_URL).href);
  await client.waitFor(
    `!!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready`,
    30000,
    'local-first bootstrap'
  );
  const seeded = await client.evaluate(`(async function(){
    var now=Date.now();
    var record={
      id:'chronos_e2e_real_1',
      title:'完成可实际使用的参赛作品',
      rawText:'完成可实际使用的参赛作品',
      sourceText:'完成可实际使用的参赛作品',
      type:'reminder',
      recordKind:'reminder',
      recordState:'active',
      archived:false,
      pinned:false,
      repeat:'none',
      dateKey:'2026-07-30',
      dateText:'2026-07-30',
      createdAt:now,
      updatedAt:now,
      schemaVersion:2,
      metadata:{source:'chronos-e2e'}
    };
    await ShikeIndexedDb.replaceRecords([record],[]);
    ShikeLegacyStorage.setJson('shike_records_v1',[record]);
    localStorage.setItem('shike_settings_v1',JSON.stringify({
      theme:'paper',language:'zh-CN',calendarMode:'solar',weatherEnabled:false,
      username:'',firstVisitAt:now,openingSeen:true,notifyDeniedUntil:0,
      notifyRequested:false,weatherCache:null,weatherCacheAt:0,locationDeniedUntil:0
    }));
    localStorage.setItem('shike_seen_release_note_version',APP_VERSION);
    ['chronos_game_handoff_v1','chronos_game_return_v1','chronos_game_bridge_state_v1'].forEach(function(key){localStorage.removeItem(key);});
    await new Promise(function(resolve){
      var request=indexedDB.deleteDatabase('chronos-items-db');
      request.onsuccess=request.onerror=request.onblocked=function(){resolve();};
      setTimeout(resolve,1500);
    });
    return true;
  })()`);
  add('a real record can be seeded durably', seeded === true);

  await client.navigate(new URL('index.html', APP_URL).href);
  await client.waitFor(`document.body.innerText.includes('完成可实际使用的参赛作品')`, 30000, 'seeded record render');
  const entry = await client.evaluate(`({
    exists:!!document.getElementById('chronosValleyEntry'),
    href:document.getElementById('chronosValleyEntry')&&document.getElementById('chronosValleyEntry').href
  })`);
  add('the usable product exposes the real valley entry', entry.exists && /\/competition(?:\.html)?\/?$/.test(entry.href), JSON.stringify(entry));

  await client.evaluate(`document.getElementById('chronosValleyEntry').click()`);
  await client.waitFor(`/\\/competition(?:\\.html)?\\/?$/.test(location.pathname) && !!document.getElementById('demoExpBtn')`, 30000, 'competition entry');
  try {
    await client.waitFor(`document.getElementById('preview').innerText.includes('完成可实际使用的参赛作品')`, 30000, 'real record preview');
  } catch (error) {
    const diagnostic = await client.evaluate(`({
      url:location.href,
      body:document.body.innerText.slice(0,2000),
      preview:document.getElementById('preview')&&document.getElementById('preview').innerText,
      stored:localStorage.getItem('shike_records_v1'),
      handoff:localStorage.getItem('chronos_game_handoff_v1')
    })`);
    throw new Error(`${error.message}: ${JSON.stringify(diagnostic)}`);
  }
  const competitionState = await client.evaluate(`({
    demo:new URLSearchParams(location.search).get('demo'),
    label:document.getElementById('modeLabel').textContent,
    cta:document.getElementById('demoExpBtn').textContent
  })`);
  add('competition entry uses real mode instead of demo mode', !competitionState.demo && competitionState.label.includes('真实使用'), JSON.stringify(competitionState));
  await client.screenshot('chronos-real-competition.png');

  await client.evaluate(`document.getElementById('demoExpBtn').click()`);
  await client.waitFor(`location.pathname.endsWith('/valley/') || location.pathname.endsWith('/valley/index.html')`, 30000, 'valley navigation');
  try {
    await client.waitFor(`!!document.getElementById('compIntroStartBtn') || !!document.getElementById('compPanel')`, 90000, '3D valley boot');
  } catch (error) {
    await client.screenshot('chronos-valley-boot-failure.png');
    const diagnostic = await client.evaluate(`({
      url:location.href,
      ready:document.readyState,
      loading:document.getElementById('loadingScreen')&&document.getElementById('loadingScreen').className,
      tip:document.getElementById('loadingTip')&&document.getElementById('loadingTip').textContent,
      progress:document.getElementById('loadingBarFill')&&document.getElementById('loadingBarFill').style.width,
      handoff:localStorage.getItem('chronos_game_handoff_v1'),
      script:Array.from(document.scripts).map(function(item){return item.src;}),
      errors:${JSON.stringify(client.runtimeErrors)}
    })`);
    throw new Error(`${error.message}: ${JSON.stringify(diagnostic)}`);
  }
  await client.evaluate(`var start=document.getElementById('compIntroStartBtn');if(start)start.click()`);
  await client.waitFor(
    `!!document.getElementById('compItemList') && document.getElementById('compItemList').innerText.includes('完成可实际使用的参赛作品')`,
    30000,
    'real record in 3D panel'
  );
  add('the 3D valley imports the real record', true);
  const valleyAssets = await client.evaluate(`performance.getEntriesByType('resource')
    .map(function(entry){return entry.name;})
    .filter(function(url){return /\\/assets\\/processed\\/.*\\.glb(?:$|\\?)/.test(url);})`);
  add(
    'the 3D valley loads its real model assets from the project path',
    valleyAssets.length >= 5 && valleyAssets.every(url => new URL(url).pathname.includes('/valley/assets/processed/')),
    JSON.stringify(valleyAssets)
  );
  await client.screenshot('chronos-real-valley.png');

  await client.evaluate(`document.querySelector('#compItemList > div').click()`);
  await client.waitFor(
    `document.getElementById('deloadItemPanel').style.display === 'flex'
      && getComputedStyle(document.getElementById('deloadItemPanel')).flexDirection === 'column'
      && document.querySelectorAll('.deload-action-btn').length === 4`,
    15000,
    'valley decision panel'
  );
  await client.evaluate(`document.querySelectorAll('.deload-action-btn')[3].click()`);
  await client.waitFor(`document.getElementById('deloadItemPanel').style.display !== 'flex'`, 15000, 'valley decision commit');
  add('a real decision can be committed inside the 3D valley', true);

  await client.evaluate(`document.getElementById('returnToShikeBtn').click()`);
  await client.waitFor(`/\\/competition(?:\\.html)?\\/?$/.test(location.pathname) && document.getElementById('returnCard').classList.contains('show')`, 30000, 'return result card');
  const returnState = await client.evaluate(`({
    text:document.getElementById('returnCard').innerText,
    payload:JSON.parse(localStorage.getItem('chronos_game_return_v1')||'null')
  })`);
  add(
    'the 3D valley returns the chosen action with the source id',
    returnState.payload
      && returnState.payload.actions[0].sourceRecordId === 'chronos_e2e_real_1'
      && returnState.payload.actions[0].action === 'released'
      && returnState.text.includes('1 个结果')
      && !returnState.text.includes('三个结果'),
    JSON.stringify(returnState)
  );

  await client.evaluate(`document.querySelector('#returnCard .btn').click()`);
  await client.waitFor(`(/\\/index(?:\\.html)?\\/?$/.test(location.pathname) || location.pathname.endsWith('/')) && !!window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready`, 30000, 'durable return to app');
  await client.waitFor(
    `(async function(){var list=await ShikeIndexedDb.getAll('records');var item=list.find(function(record){return record.id==='chronos_e2e_real_1';});return !!(item&&item.archived&&item.chronosResult&&item.chronosResult.action==='released');})()`,
    30000,
    'IndexedDB return persistence'
  );
  const persisted = await client.evaluate(`(async function(){
    var dbRecords=await ShikeIndexedDb.getAll('records');
    var cached=JSON.parse(localStorage.getItem('shike_records_v1')||'[]');
    var dbItem=dbRecords.find(function(record){return record.id==='chronos_e2e_real_1';});
    var cacheItem=cached.find(function(record){return record.id==='chronos_e2e_real_1';});
    return {
      dbArchived:!!(dbItem&&dbItem.archived),
      cacheArchived:!!(cacheItem&&cacheItem.archived),
      returnCleared:localStorage.getItem('chronos_game_return_v1')===null,
      action:dbItem&&dbItem.chronosResult&&dbItem.chronosResult.action
    };
  })()`);
  add(
    'the returned action persists in IndexedDB and the local mirror before cleanup',
    persisted.dbArchived && persisted.cacheArchived && persisted.returnCleared && persisted.action === 'released',
    JSON.stringify(persisted)
  );
  const visibleAfterReturn = await client.evaluate(`({
    activeCount:getVisibleRecords().length,
    stillRendered:document.body.innerText.includes('完成可实际使用的参赛作品')
  })`);
  add(
    'a released item leaves active product views without being erased from storage',
    visibleAfterReturn.activeCount === 0 && visibleAfterReturn.stillRendered === false,
    JSON.stringify(visibleAfterReturn)
  );
  await client.screenshot('chronos-real-return-applied.png');

  const relevantErrors = client.runtimeErrors.filter(Boolean).filter(error => !/ResizeObserver loop/i.test(error));
  add('the round trip has no uncaught runtime exception', relevantErrors.length === 0, JSON.stringify(relevantErrors));
  const relevantNetworkErrors = client.networkErrors.filter(error => /^https?:/.test(error.url));
  add('the round trip has no failed product resource', relevantNetworkErrors.length === 0, JSON.stringify(relevantNetworkErrors));
  console.log(`Chronos Valley real round trip passed: ${checks.length}/${checks.length}`);
  client.close();
  await fetch(`${CDP_URL}/json/close/${encodeURIComponent(target.id)}`).catch(() => {});
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
