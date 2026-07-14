'use strict';

const CDP_URL=process.env.SHIKE_CDP_URL;
const APP_URL=process.env.SHIKE_APP_URL;
let stage='startup';
const watchdog=setTimeout(()=>{console.error(`Chronos multi-tab browser watchdog: ${stage}`);process.exit(2);},90000);
function assert(condition,message){if(!condition)throw new Error(message);}
function delay(ms){return new Promise((resolve)=>setTimeout(resolve,ms));}
async function openPage(){const response=await fetch(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`,{method:'PUT'});if(!response.ok)throw new Error('could not create CDP page');return response.json();}
class Client{
  constructor(page){this.page=page;this.id=0;this.pending=new Map();this.errors=[];}
  async connect(){this.ws=new WebSocket(this.page.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});this.ws.addEventListener('message',(event)=>this.message(event));}
  message(event){const item=JSON.parse(event.data);if(item.id&&this.pending.has(item.id)){const pending=this.pending.get(item.id);this.pending.delete(item.id);item.error?pending.reject(new Error(item.error.message)):pending.resolve(item.result||{});return;}if(item.method==='Runtime.exceptionThrown')this.errors.push(item.params.exceptionDetails&&item.params.exceptionDetails.text||'runtime exception');if(item.method==='Runtime.consoleAPICalled'&&item.params.type==='error')this.errors.push('console error');if(item.method==='Network.responseReceived'&&item.params.response.status>=400)this.errors.push(`${item.params.response.status} ${item.params.response.url}`);}
  send(method,params={}){const id=++this.id;this.ws.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});setTimeout(()=>{if(this.pending.has(id)){this.pending.delete(id);reject(new Error(`${method} timed out`));}},30000);});}
  async evaluate(expression){const result=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception&&result.exceptionDetails.exception.description||result.exceptionDetails.text);return result.result&&result.result.value;}
  close(){this.ws.close();}
}
async function ready(client){for(let index=0;index<200;index++){try{if(await client.evaluate("document.readyState==='complete'&&!!window.ShikeChronosWeb&&!!window.ShikeLocalFirst&&window.ShikeLocalFirst.getStatus().ready"))return;}catch(error){}await delay(100);}const state=await client.evaluate(`({url:location.href,ready:document.readyState,chronos:!!window.ShikeChronosWeb,localFirst:!!window.ShikeLocalFirst,status:window.ShikeLocalFirst&&window.ShikeLocalFirst.getStatus(),errors:document.body&&document.body.innerText.slice(0,200)})`).catch((error)=>({evaluationError:error.message}));throw new Error('page bootstrap timed out: '+JSON.stringify(state));}

(async function(){
  assert(CDP_URL&&APP_URL,'CDP and app URLs are required');const checks=[];const check=(name,value)=>{assert(value,name);checks.push(name);};stage='open pages';
  const pages=await Promise.all([openPage(),openPage()]);const clients=pages.map((page)=>new Client(page));await Promise.all(clients.map((client)=>client.connect()));
  await Promise.all(clients.flatMap((client)=>[client.send('Page.enable'),client.send('Runtime.enable'),client.send('Network.enable')]));stage='initial bootstrap';await Promise.all(clients.map(ready));stage='clear stores';
  await clients[0].evaluate(`(async()=>{localStorage.setItem('shike_settings_v1',JSON.stringify({theme:'paper',language:'zh-CN',calendarMode:'solar',weatherEnabled:false,username:'',firstVisitAt:Date.now(),openingSeen:true,notifyDeniedUntil:0,notifyRequested:false}));records=[];saveRecords();await ShikeLocalFirst.persist([]);const db=await ShikeIndexedDb.open();const names=['temporal_drafts','temporal_nodes','temporal_edges','temporal_waiting','temporal_corrections','temporal_meta','temporal_tombstones','temporal_operations','temporal_operation_quarantine','temporal_locks'];await new Promise((resolve,reject)=>{const tx=db.transaction(names,'readwrite');names.forEach((name)=>tx.objectStore(name).clear());tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});hideOpening();closeReleaseNotes();renderHome();return true;})()`);
  await clients[1].send('Page.reload',{ignoreCache:true});stage='second bootstrap after clear';await ready(clients[1]);
  const source='周五前把实习材料交给老师';stage='capture shared draft';await clients[0].evaluate(`window.ShikeChronosWeb.captureIfNeeded(${JSON.stringify(source)})`);await delay(300);
  await clients[1].send('Page.reload',{ignoreCache:true});stage='second bootstrap with draft';await ready(clients[1]);stage='read draft ids';
  let draftIds=[];for(let attempt=0;attempt<100;attempt++){draftIds=await Promise.all(clients.map((client)=>client.evaluate(`window.ShikeChronosWeb.diagnostics().then((item)=>{const cards=[...document.querySelectorAll('.temporal-draft')];return {pending:item.pendingDrafts,id:cards[0]&&cards[0].getAttribute('data-draft-id')};})`)));if(draftIds.every((item)=>item.pending===1&&item.id&&item.id===draftIds[0].id))break;await delay(100);}
  check('both tabs load one shared draft',draftIds.every((item)=>item.pending===1&&item.id===draftIds[0].id));
  stage='concurrent confirm';const confirmResults=await Promise.all(clients.map((client)=>client.evaluate(`window.ShikeChronosWeb.confirmDraft(${JSON.stringify(draftIds[0].id)})`)));await delay(500);stage='inspect durable state';
  check('only one tab commits the shared draft',confirmResults.filter(Boolean).length===1);
  const durable=await clients[0].evaluate(`Promise.all([window.ShikeIndexedDb.getAll('records'),window.ShikeIndexedDb.getAll('temporal_operations'),window.ShikeIndexedDb.getAll('temporal_edges'),window.ShikeIndexedDb.getAll('temporal_drafts')]).then(([r,o,e,d])=>({records:r.map((x)=>x.id),operations:o.map((x)=>({id:x.id,status:x.status})),edgeRecords:[...new Set(e.map((x)=>x.sourceRecordId))],draftStatus:d[0]&&d[0].status}))`);
  check('IndexedDB contains one unique Record',durable.records.length===1&&new Set(durable.records).size===1);
  check('journal and Graph commit once',durable.operations.length===1&&['committed','recovered'].includes(durable.operations[0].status)&&durable.edgeRecords.length===1);
  check('shared draft is confirmed',durable.draftStatus==='confirmed');
  stage='resync both tabs';const reloadCounts=await Promise.all(clients.map((client)=>client.evaluate(`window.ShikeLocalFirst.bootstrap().then((result)=>{records=result.records.slice();return records.length;})`)));stage='check convergence';
  check('both tabs converge after durable resync',reloadCounts.every((count)=>count===1));

  const resource=`contract_${Date.now()}`;stage='create browser coordinators';await Promise.all(clients.map((client,index)=>client.evaluate(`window.__chronosMultiTab=window.ShikeTemporalMultiTab.create({lock:window.ShikeTemporalOperationLock.create(undefined,{ownerId:'browser_tab_${index}',ttl:5000})});true`)));
  const versions=await Promise.all(clients.map((client)=>client.evaluate(`window.__chronosMultiTab.version(${JSON.stringify(resource)})`)));check('browser tabs share version zero',versions[0]===0&&versions[1]===0);
  stage='real resource race';const firstMutation=clients[0].evaluate(`window.__chronosMultiTab.mutate({resourceId:${JSON.stringify(resource)},operationId:'browser_a',expectedVersion:0},async()=>{await new Promise((resolve)=>setTimeout(resolve,250));return 'a';}).then((x)=>({ok:true,version:x.version})).catch((e)=>({ok:false,code:e.code}))`);
  await delay(30);const locked=await clients[1].evaluate(`window.__chronosMultiTab.mutate({resourceId:${JSON.stringify(resource)},operationId:'browser_b',expectedVersion:0},async()=>true).then((x)=>({ok:true,version:x.version})).catch((e)=>({ok:false,code:e.code,userMessage:e.userMessage}))`);const winner=await firstMutation;
  check('real IndexedDB resource lock has one winner',winner.ok&&winner.version===1&&!locked.ok&&locked.code==='TEMPORAL_OPERATION_LOCKED');
  const stale=await clients[1].evaluate(`window.__chronosMultiTab.mutate({resourceId:${JSON.stringify(resource)},operationId:'browser_b',expectedVersion:0},async()=>true).then((x)=>({ok:true})).catch((e)=>({ok:false,code:e.code,userMessage:e.userMessage}))`);
  check('stale browser write returns a user-facing conflict',!stale.ok&&stale.code==='TEMPORAL_VERSION_CONFLICT'&&!!stale.userMessage);
  stage='close coordinators';await Promise.all(clients.map((client)=>client.evaluate(`window.__chronosMultiTab.close();true`)));check('multi-tab runtime has no console or network errors',clients.every((client)=>client.errors.length===0));clients.forEach((client)=>client.close());clearTimeout(watchdog);
  console.log(`Chronos multi-tab browser passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(`Chronos multi-tab browser failed: ${error.message}`);process.exit(1);});
