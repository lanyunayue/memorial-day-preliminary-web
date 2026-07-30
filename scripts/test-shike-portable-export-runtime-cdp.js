'use strict';

const fs = require('fs');
const path = require('path');
const CDP_URL = process.env.SHIKE_CDP_URL;
const APP_URL = process.env.SHIKE_APP_URL;
const root = path.resolve(__dirname, '..');
const fixture = fs.readFileSync(path.join(root, 'test', 'fixtures', 'portable-export-v1', 'golden-004.json'), 'utf8');

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
  const start = Date.now();
  while (Date.now() - start < timeout) {
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
  await waitFor(client, "document.readyState==='complete'&&!!window.ShikePortableExportV1&&!!window.ShikeLocalFirst&&ShikeLocalFirst.getStatus().ready", 'Portable Export bootstrap');

  const result = await client.evaluate(`(async()=>{
    const db=await ShikeIndexedDb.open();
    await new Promise((resolve,reject)=>{
      const names=['records','portable_records','portable_envelopes','audit_log'];
      const tx=db.transaction(names,'readwrite');
      names.forEach((name)=>tx.objectStore(name).clear());
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    records=[{id:'runtime-legacy-1',title:'Portable private runtime title',recordKind:'reminder',dateKey:'2026-07-20',timeText:'15:00',recordState:'active',createdAt:1784516400000,updatedAt:1784516400000}];
    await ShikeLocalFirst.persist(records);
    const context=await portableStorageContext();
    const initialErrors=await ShikePortableExportV1.validateBundle(context.currentBundle);
    const sourceRecord=context.currentBundle.records[0];
    const changed=JSON.parse(JSON.stringify(context.currentBundle));
    changed.records[0].data.title='Portable updated runtime title';
    changed.records[0].data.legacyRecord.title='Portable updated runtime title';
    changed.records[0].updatedAt='2026-07-22T01:00:00.000Z';
    changed.records[0].data.legacyRecord.updatedAt=Date.parse(changed.records[0].updatedAt);
    const incoming=await ShikePortableExportV1.finalizeBundle(changed);
    const prepared=await ShikePortableExportV1.prepareImport(JSON.stringify(incoming),context.currentEntities);
    renderPortableImportPreview({prepared,context});
    const previewText=document.getElementById('portableImportPreviewCard').textContent;
    const plan=ShikePortableExportV1.buildImportPlan(prepared,records,context.currentEntities);
    plan.businessRecords.forEach(migrateRecord);
    await ShikeIndexedDb.importPortable(plan);
    records=plan.businessRecords;
    const committed={
      business:await ShikeIndexedDb.getAll('records'),
      portable:await ShikeIndexedDb.getAll('portable_records'),
      journals:(await ShikeIndexedDb.getAll('audit_log')).filter((item)=>item.type==='portable_import_v1')
    };
    const beforeFault=JSON.stringify({business:committed.business,portable:committed.portable});
    const faultBundle=JSON.parse(JSON.stringify(incoming));
    faultBundle.records[0].data.title='must roll back';
    faultBundle.records[0].updatedAt='2026-07-23T01:00:00.000Z';
    const finalizedFault=await ShikePortableExportV1.finalizeBundle(faultBundle);
    const faultContext=await portableStorageContext();
    const faultPrepared=await ShikePortableExportV1.prepareImport(JSON.stringify(finalizedFault),faultContext.currentEntities);
    const faultPlan=ShikePortableExportV1.buildImportPlan(faultPrepared,records,faultContext.currentEntities);
    let faultRejected=false;
    try{await ShikeIndexedDb.importPortable(faultPlan,{failAfterWrite:true});}catch(error){faultRejected=true;}
    const afterFault=JSON.stringify({business:await ShikeIndexedDb.getAll('records'),portable:await ShikeIndexedDb.getAll('portable_records')});

    const unsupportedBundle=JSON.parse(${JSON.stringify(fixture)});
    const unsupportedContext=await portableStorageContext();
    const unsupportedPrepared=await ShikePortableExportV1.prepareImport(JSON.stringify(unsupportedBundle),unsupportedContext.currentEntities);
    const unsupportedPlan=ShikePortableExportV1.buildImportPlan(unsupportedPrepared,records,unsupportedContext.currentEntities);
    await ShikeIndexedDb.importPortable(unsupportedPlan);
    records=unsupportedPlan.businessRecords;
    const finalContext=await portableStorageContext();
    const preserved=finalContext.currentBundle.records.find((item)=>item.portableId===unsupportedBundle.records[0].portableId);
    return {
      initialErrors,
      sourceRecord,
      preview:prepared.preview,
      previewText,
      buttonVisible:!!document.getElementById('exportPortableBtn')&&!!document.getElementById('portableFileInput'),
      committedTitle:committed.business[0]&&committed.business[0].title,
      portableCount:committed.portable.length,
      journalCount:committed.journals.length,
      journalLeaksPrivate:JSON.stringify(committed.journals).includes('Portable updated runtime title'),
      faultRejected,
      rollbackExact:beforeFault===afterFault,
      unsupportedCount:unsupportedPrepared.preview.unsupported,
      businessCountAfterUnsupported:records.length,
      futureRecordField:preserved&&preserved.futureRecordField,
      futureTopLevel:finalContext.currentBundle.fixtureMetadata&&finalContext.currentBundle.fixtureMetadata.sequence,
      futureSetting:finalContext.currentBundle.settings.futureSetting
    };
  })()`);

  const checks = [
    ['controls visible', result.buttonVisible],
    ['initial export validates', result.initialErrors.length === 0],
    ['legacy source preserved', result.sourceRecord.data.legacyRecord.id === 'runtime-legacy-1'],
    ['preview update', result.preview.update === 1 && result.preview.canImport],
    ['preview rendered', result.previewText.includes('更新') && result.previewText.includes('确认导入')],
    ['business record committed', result.committedTitle === 'Portable updated runtime title'],
    ['canonical record committed', result.portableCount === 1],
    ['privacy-safe journal', result.journalCount === 1 && !result.journalLeaksPrivate],
    ['fault rejected', result.faultRejected],
    ['fault rolled back exactly', result.rollbackExact],
    ['unsupported preserved only', result.unsupportedCount === 1 && result.businessCountAfterUnsupported === 1],
    ['unknown fields re-exported', result.futureRecordField === 'preserve-4' && result.futureTopLevel === 4 && result.futureSetting === 'preserve-4']
  ];
  const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
  assert(failures.length === 0, `${failures.join(', ')} ${JSON.stringify(result)}`);
  assert(client.consoleErrors.length === 0, `console errors: ${client.consoleErrors.join(' | ')}`);
  assert(client.runtimeErrors.length === 0, `runtime errors: ${client.runtimeErrors.join(' | ')}`);
  client.close();
  console.log(`Portable Export browser acceptance passed: ${checks.length}/${checks.length}`);
}

main().catch((error) => { console.error(error.stack || error); process.exit(1); });
