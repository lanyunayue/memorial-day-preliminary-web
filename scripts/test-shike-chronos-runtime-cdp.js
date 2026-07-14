'use strict';

const fs=require('fs');
const path=require('path');
const CDP_URL=process.env.SHIKE_CDP_URL;
const APP_URL=process.env.SHIKE_APP_URL;
const ARTIFACT_DIR=process.env.SHIKE_ARTIFACT_DIR||'';
function assert(condition,message){if(!condition)throw new Error(message);}
function delay(ms){return new Promise((resolve)=>setTimeout(resolve,ms));}
async function json(url){const response=await fetch(url);if(!response.ok)throw new Error(`${url} returned ${response.status}`);return response.json();}
class Client{
  constructor(url){this.url=url;this.id=0;this.pending=new Map();this.consoleErrors=[];this.runtimeErrors=[];this.networkErrors=[];}
  async connect(){this.ws=new WebSocket(this.url);await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});this.ws.addEventListener('message',(event)=>this.message(event));}
  message(event){
    const item=JSON.parse(event.data);
    if(item.id&&this.pending.has(item.id)){const pending=this.pending.get(item.id);this.pending.delete(item.id);item.error?pending.reject(new Error(item.error.message)):pending.resolve(item.result||{});return;}
    if(item.method==='Runtime.consoleAPICalled'&&item.params.type==='error')this.consoleErrors.push((item.params.args||[]).map((arg)=>arg.value||arg.description||'').join(' '));
    if(item.method==='Runtime.exceptionThrown')this.runtimeErrors.push(item.params.exceptionDetails&&item.params.exceptionDetails.text||'runtime exception');
    if(item.method==='Network.loadingFailed'&&!item.params.canceled)this.networkErrors.push(item.params.errorText||'network failure');
    if(item.method==='Network.responseReceived'&&item.params.response.status>=400)this.networkErrors.push(`${item.params.response.status}: ${item.params.response.url}`);
  }
  send(method,params={}){const id=++this.id;this.ws.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});setTimeout(()=>{if(this.pending.has(id)){this.pending.delete(id);reject(new Error(`${method} timed out`));}},30000);});}
  async evaluate(expression){const result=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception&&result.exceptionDetails.exception.description||result.exceptionDetails.text);return result.result&&result.result.value;}
  close(){if(this.ws)this.ws.close();}
}
async function waitFor(client,expression,label,timeout=20000){const start=Date.now();while(Date.now()-start<timeout){try{if(await client.evaluate(expression))return;}catch(error){}await delay(100);}throw new Error(`${label} timed out`);}
async function main(){
  assert(CDP_URL&&APP_URL,'CDP and app URLs are required');
  let page=null;
  try{const response=await fetch(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`,{method:'PUT'});if(response.ok)page=await response.json();}catch(error){}
  if(!page){const targets=await json(`${CDP_URL}/json`);page=targets.find((target)=>target.type==='page');}
  assert(page,'page target missing');
  const client=new Client(page.webSocketDebuggerUrl);await client.connect();await client.send('Page.enable');await client.send('Runtime.enable');await client.send('Network.enable');
  await waitFor(client,"document.readyState==='complete'&&!!window.ShikeChronosWeb&&!!window.ShikeLocalFirst&&ShikeLocalFirst.getStatus().ready",'Chronos bootstrap');
  await client.evaluate(`(async()=>{
    localStorage.setItem('shike_settings_v1',JSON.stringify({theme:'paper',language:'zh-CN',calendarMode:'solar',weatherEnabled:false,username:'',firstVisitAt:Date.now(),openingSeen:true,notifyDeniedUntil:0,notifyRequested:false}));
    localStorage.setItem('shike_seen_release_note_version',APP_VERSION);records=[];saveRecords();await ShikeLocalFirst.persist([]);
    const db=await ShikeIndexedDb.open();await new Promise((resolve,reject)=>{const names=['temporal_drafts','temporal_nodes','temporal_edges','temporal_waiting','temporal_tombstones'];const tx=db.transaction(names,'readwrite');names.forEach((name)=>tx.objectStore(name).clear());tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
    if(window.ShikeTrashRepository)await ShikeTrashRepository.clearAll();hideOpening();closeReleaseNotes();saveTimeSpriteCollapsed(true);renderHome();
  })()`);
  await waitFor(client,"getComputedStyle(document.getElementById('opening')).display==='none'&&records.length===0",'clean app state');
  const source='周五前把实习材料交给老师，小王说合同明天回复，下个月妈妈生日，毕业后想买车，这周练三次英语口语。';
  const browserAnalysis=await client.evaluate(`(()=>{const source=${JSON.stringify(source)};const result=ShikeTemporalIntelligence.analyze(source);return {segments:ShikeMultiIntentSegmenter.segment(source).map((item)=>item.text),drafts:result.drafts.map((draft)=>draft.type),rejected:result.rejected};})()`);
  console.log('Chronos browser analysis: '+JSON.stringify(browserAnalysis));
  assert(browserAnalysis.drafts.length===5,'browser temporal analysis did not produce five drafts');
  await client.evaluate(`(()=>{const input=document.getElementById('quickInput');input.value=${JSON.stringify(source)};input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('saveBtn').click();})()`);
  await delay(800);
  const captureState=await client.evaluate(`(async()=>{const d=await ShikeChronosWeb.diagnostics();return {pending:d.pendingDrafts,records:records.length,input:document.getElementById('quickInput').value,inbox:document.getElementById('temporalInboxBlock').textContent,toasts:document.getElementById('toastContainer').textContent};})()`);
  console.log('Chronos capture state: '+JSON.stringify(captureState));
  await waitFor(client,"document.querySelectorAll('#temporalInboxBlock .temporal-draft').length===5",'five Life Inbox drafts');
  const before=await client.evaluate(`({records:records.length,drafts:document.querySelectorAll('.temporal-draft').length,types:[...document.querySelectorAll('.temporal-type')].map((item)=>item.value)})`);
  assert(before.records===0,'draft preview saved records before confirmation');assert(before.drafts===5,'expected five draft cards');assert(before.types.includes('waiting_for')&&before.types.includes('commitment'),'expected commitment and waiting drafts');
  await client.evaluate(`(()=>{const anniversary=[...document.querySelectorAll('.temporal-draft')].find((card)=>card.querySelector('.temporal-type').value==='anniversary');const date=anniversary.querySelector('.temporal-date');date.value='2026-08-12';date.dispatchEvent(new Event('change',{bubbles:true}));const all=document.querySelector('.temporal-confirm-all');all.click();all.click();})()`);
  await waitFor(client,"records.length===5&&document.querySelectorAll('.temporal-draft').length===0",'confirmed records');
  const confirmed=await client.evaluate(`(async()=>{const d=await ShikeChronosWeb.diagnostics();const memory=await ShikeChronosWeb.queryMemory('我之前答应老师什么');return {records:records.length,ids:[...new Set(records.map((record)=>record.id))].length,nodes:d.graph.nodes.length,edges:d.graph.edges.length,waiting:d.waiting.length,suggestions:d.model.suggestions.length,reason:d.model.suggestions[0]&&d.model.suggestions[0].reason,actionVisible:!!document.querySelector('#temporalActionBlock .temporal-action'),daily:!!d.model.dailyBrief,corrections:d.corrections.length,memorySources:memory.sources.length};})()`);
  assert(confirmed.records===5&&confirmed.ids===5,'duplicate confirmation created duplicate records');assert(confirmed.nodes>5&&confirmed.edges>5,'browser graph was not built');assert(confirmed.waiting===1,'browser Waiting For was not persisted');assert(confirmed.suggestions>0&&confirmed.reason.includes('因为')&&confirmed.actionVisible,'next action is missing or not explainable');
  assert(confirmed.daily&&confirmed.corrections>=6,'daily brief or correction loop was not persisted');assert(confirmed.memorySources>0,'temporal memory returned no source records');
  if(ARTIFACT_DIR){await client.evaluate(`document.getElementById('temporalActionBlock').scrollIntoView({block:'start'})`);await delay(250);fs.mkdirSync(ARTIFACT_DIR,{recursive:true});const shot=await client.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(ARTIFACT_DIR,'chronos-vertical.png'),Buffer.from(shot.data,'base64'));}
  await client.evaluate(`(()=>{const waiting=records.find((record)=>/小王/.test(record.title));window.__chronosWaitingId=waiting.id;deleteRecord(waiting.id);document.getElementById('confirmOkBtn').click();})()`);
  await waitFor(client,"records.length===4",'soft delete');
  const deleted=await client.evaluate(`(async()=>{const d=await ShikeChronosWeb.diagnostics();const trash=await ShikeTrashRepository.getAll();return {waiting:d.waiting.length,active:d.graph.nodes.some((node)=>(node.sourceRecordIds||[]).includes(window.__chronosWaitingId)),trash:trash.length};})()`);
  assert(deleted.waiting===0&&!deleted.active&&deleted.trash===1,'soft delete did not tombstone temporal data');
  await client.evaluate(`switchPage('my');renderMy();renderTrashList();`);
  await waitFor(client,"!!document.querySelector('#trashList .btn-restore')",'trash restore button');
  await client.evaluate(`document.querySelector('#trashList .btn-restore').click()`);
  await waitFor(client,"records.length===5",'record restore');
  await waitFor(client,"ShikeChronosWeb.diagnostics().then((d)=>d.waiting.length===1&&d.graph.nodes.some((node)=>(node.sourceRecordIds||[]).includes(window.__chronosWaitingId)))",'temporal restore');
  await client.evaluate(`(async()=>{window.__chronosBackup=await ShikeChronosWeb.augmentBackup(buildBackupPayload());records=[];saveRecords();await ShikeLocalFirst.persist([]);const db=await ShikeIndexedDb.open();await new Promise((resolve,reject)=>{const names=['temporal_nodes','temporal_edges','temporal_waiting','temporal_tombstones'];const tx=db.transaction(names,'readwrite');names.forEach((name)=>tx.objectStore(name).clear());tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});const parsed=parseBackupPayload(JSON.stringify(window.__chronosBackup));mergePreparedImport(prepareBackupImport(parsed));})()`);
  await waitFor(client,"records.length===5",'backup record import');
  await waitFor(client,"ShikeChronosWeb.diagnostics().then((d)=>d.graph.nodes.length>5&&d.waiting.length===1)",'backup temporal import');
  const restored=await client.evaluate(`(async()=>{const d=await ShikeChronosWeb.diagnostics();return {records:records.length,nodes:d.graph.nodes.length,waiting:d.waiting.length,horizontalOverflow:document.documentElement.scrollWidth-window.innerWidth};})()`);
  assert(restored.records===5&&restored.nodes>5&&restored.waiting===1,'backup round trip did not restore vertical data');assert(restored.horizontalOverflow<=1,'Chronos UI causes horizontal overflow');
  assert(client.consoleErrors.length===0,`console errors: ${client.consoleErrors.join(' | ')}`);assert(client.runtimeErrors.length===0,`runtime errors: ${client.runtimeErrors.join(' | ')}`);assert(client.networkErrors.length===0,`network errors: ${client.networkErrors.join(' | ')}`);
  client.close();
  console.log('Chronos browser vertical passed: 21/21');
}
main().catch((error)=>{console.error(error.stack||error);process.exit(1);});
