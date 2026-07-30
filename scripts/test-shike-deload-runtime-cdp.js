'use strict';

const CDP_URL = process.env.SHIKE_CDP_URL;
const APP_URL = process.env.SHIKE_APP_URL;

function assert(condition, message) { if (!condition) throw new Error(message); }
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function json(url) { const response = await fetch(url); if (!response.ok) throw new Error(`${url} returned ${response.status}`); return response.json(); }

class Client {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); this.consoleErrors = []; this.runtimeErrors = []; }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => this.message(event));
  }
  message(event) {
    const item = JSON.parse(event.data);
    if (item.id && this.pending.has(item.id)) {
      const pending = this.pending.get(item.id);
      this.pending.delete(item.id);
      item.error ? pending.reject(new Error(item.error.message)) : pending.resolve(item.result || {});
      return;
    }
    if (item.method === 'Runtime.consoleAPICalled' && item.params.type === 'error') {
      this.consoleErrors.push((item.params.args || []).map((arg) => arg.value || arg.description || '').join(' '));
    }
    if (item.method === 'Runtime.exceptionThrown') this.runtimeErrors.push(item.params.exceptionDetails && item.params.exceptionDetails.text || 'runtime exception');
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`${method} timed out`)); }
      }, 30000);
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception && result.exceptionDetails.exception.description || result.exceptionDetails.text);
    return result.result && result.result.value;
  }
  close() { if (this.ws) this.ws.close(); }
}

async function waitFor(client, expression, label, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { if (await client.evaluate(expression)) return; } catch (error) {}
    await delay(100);
  }
  throw new Error(`${label} timed out`);
}

async function main() {
  assert(CDP_URL && APP_URL, 'CDP and app URLs are required');
  let page = null;
  try {
    const response = await fetch(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`, { method: 'PUT' });
    if (response.ok) page = await response.json();
  } catch (error) {}
  if (!page) {
    const targets = await json(`${CDP_URL}/json`);
    page = targets.find((target) => target.type === 'page');
  }
  assert(page, 'page target missing');
  const client = new Client(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await waitFor(client, "document.readyState==='complete'&&!!window.ShikeDeLoad&&!!window.ShikeLocalFirst&&ShikeLocalFirst.getStatus().ready&&typeof records!=='undefined'&&typeof renderCurrent==='function'", 'DeLoad bootstrap');

  const initial = await client.evaluate(`(async()=>{
    const db=await ShikeIndexedDb.open();
    await new Promise((resolve,reject)=>{
      const names=['records','portable_records','audit_log'];
      const tx=db.transaction(names,'readwrite');
      names.forEach((name)=>tx.objectStore(name).clear());
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    const now=new Date();
    const yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1);
    const today=ShikeDeLoad.localDate(now);
    const prior=ShikeDeLoad.localDate(yesterday);
    records=[
      {id:'deload-private-overdue',title:'private browser deload title',recordKind:'reminder',dateKey:prior,dateText:prior,recordState:'active',createdAt:1,updatedAt:1},
      {id:'deload-today',title:'today browser record',recordKind:'reminder',dateKey:today,dateText:today,recordState:'active',createdAt:2,updatedAt:2}
    ];
    await ShikeLocalFirst.persist(records);
    ShikeLegacyStorage.setJson(STORAGE_KEY,records);
    renderCurrent();
    document.getElementById('deLoadEntryBtn').click();
    const action=document.querySelector('[data-deload-action="DEFER"][data-record-id="deload-private-overdue"]');
    if(!action)throw new Error('defer action missing');
    action.click();
    return {
      drawer:document.getElementById('drawerMask').classList.contains('show'),
      confirm:document.getElementById('confirmMask').classList.contains('show'),
      copy:document.getElementById('confirmMsg').textContent
    };
  })()`);
  assert(initial.drawer && initial.confirm, 'DeLoad drawer and confirmation must open');
  assert(initial.copy.includes('延期到明天') && initial.copy.includes('明确选择'), 'defer confirmation must be explicit');

  await client.evaluate(`document.getElementById('confirmOkBtn').click()`);
  await waitFor(client, `(async()=>{const row=await ShikeIndexedDb.get('records','deload-private-overdue');return row&&row.recordState==='deferred';})()`, 'DeLoad commit');
  const committed = await client.evaluate(`(async()=>{
    const business=await ShikeIndexedDb.get('records','deload-private-overdue');
    const portable=await ShikeIndexedDb.getAll('portable_records');
    const audits=(await ShikeIndexedDb.getAll('audit_log')).filter((item)=>item.type==='deload_commit');
    return {
      business,
      portableCount:portable.length,
      hasPlan:portable.some((item)=>item.type==='deload-plan'),
      hasJournal:portable.some((item)=>item.type==='operation-journal'),
      leaksTitle:JSON.stringify(portable).includes('private browser deload title'),
      auditCount:audits.length,
      cache:JSON.parse(localStorage.getItem(STORAGE_KEY)).find((item)=>item.id==='deload-private-overdue')
    };
  })()`);

  await client.send('Page.reload', { ignoreCache: true });
  await waitFor(client, "document.readyState==='complete'&&!!window.ShikeLocalFirst&&ShikeLocalFirst.getStatus().ready&&Array.isArray(records)", 'DeLoad reload');
  const reloaded = await client.evaluate(`({
    record:records.find((item)=>item.id==='deload-private-overdue'),
    candidateIds:ShikeDeLoad.preview(records,new Date()).candidates.map((item)=>item.id)
  })`);
  client.close();

  const checks = [
    ['business state deferred', committed.business.recordState === 'deferred'],
    ['business date moved to tomorrow', committed.business.dateKey === ShikeDate(committed.business.updatedAt + 86400000)],
    ['compatibility cache updated after commit', committed.cache && committed.cache.recordState === 'deferred'],
    ['portable plan persisted', committed.portableCount === 2 && committed.hasPlan],
    ['operation journal persisted', committed.hasJournal],
    ['portable sidecars omit private title', !committed.leaksTitle],
    ['audit entry persisted', committed.auditCount === 1],
    ['reload retains deferred state', reloaded.record && reloaded.record.recordState === 'deferred'],
    ['deferred record leaves due candidates', !reloaded.candidateIds.includes('deload-private-overdue')],
    ['no console errors', client.consoleErrors.length === 0],
    ['no runtime errors', client.runtimeErrors.length === 0]
  ];
  const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
  if (failures.length) throw new Error(`${failures.join(', ')} ${JSON.stringify({ committed, reloaded, consoleErrors: client.consoleErrors, runtimeErrors: client.runtimeErrors })}`);
  console.log(`DeLoad runtime CDP acceptance passed: ${checks.length}/${checks.length}`);
}

function ShikeDate(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

main().catch((error)=>{console.error(`DeLoad runtime CDP acceptance failed: ${error.message}`);process.exit(1);});
