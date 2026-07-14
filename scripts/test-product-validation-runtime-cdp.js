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

async function waitFor(client,expression,label,timeout=20000){const started=Date.now();while(Date.now()-started<timeout){try{if(await client.evaluate(expression))return;}catch(error){}await delay(100);}throw new Error(`${label} timed out`);}

async function main(){
  assert(CDP_URL&&APP_URL,'CDP and app URLs are required');
  const validationUrl=new URL(APP_URL);validationUrl.searchParams.set('validation','1');
  let page=null;try{const response=await fetch(`${CDP_URL}/json/new?${encodeURIComponent(validationUrl.href)}`,{method:'PUT'});if(response.ok)page=await response.json();}catch(error){}
  if(!page){const targets=await json(`${CDP_URL}/json`);page=targets.find((target)=>target.type==='page');}
  assert(page,'page target missing');const client=new Client(page.webSocketDebuggerUrl);await client.connect();
  await client.send('Page.enable');await client.send('Runtime.enable');await client.send('Network.enable');
  await waitFor(client,"document.readyState==='complete'&&!!window.ShikeProductValidation&&!!document.getElementById('researchPanel')&&!!window.ShikeChronosWeb",'validation mode bootstrap');
  await client.evaluate(`(async()=>{ShikeResearchDataCleaner.clearResearchData({includeConsent:true});ShikeResearchSession.reset();records=[];saveRecords();await ShikeLocalFirst.persist([]);renderHome();})()`);
  const firstUse=await client.evaluate(`(()=>({mode:document.body.classList.contains('product-validation-mode'),title:document.querySelector('.validation-intro h2').textContent,brand:document.querySelector('.hero-subtitle').textContent,example:document.querySelector('.input-hint').textContent,inputTop:document.getElementById('quickInput').getBoundingClientRect().top,viewport:innerHeight,opening:getComputedStyle(document.getElementById('opening')).display}))()`);
  assert(firstUse.mode&&firstUse.title.includes('可追踪的承诺、等待和下一步行动'),'product explanation is not visible');
  assert(firstUse.brand==='每一刻沉淀，都是未来伏笔。'&&firstUse.example.includes('实习证明'),'first-use copy is incomplete');
  assert(firstUse.inputTop>=0&&firstUse.inputTop<firstUse.viewport&&firstUse.opening==='none','first input is not immediately available');
  await client.send('Emulation.setDeviceMetricsOverride',{width:375,height:760,deviceScaleFactor:1,mobile:true});await delay(120);
  if(ARTIFACT_DIR){fs.mkdirSync(ARTIFACT_DIR,{recursive:true});const shot=await client.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(ARTIFACT_DIR,'product-validation-first-use-375.png'),Buffer.from(shot.data,'base64'));}
  await client.evaluate(`(()=>{const input=document.getElementById('quickInput');input.value='未同意自动化隐私检查';input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  assert(await client.evaluate('ShikeResearchEventLog.list().length')===0,'no-consent interaction was logged');
  await client.evaluate(`(()=>{document.getElementById('participantCode').value='TEST-AUTOMATION';document.getElementById('researchConsentCheck').checked=true;document.getElementById('researchGrantBtn').click();})()`);
  await waitFor(client,'ShikeParticipantConsent.status().active&&ShikeResearchEventLog.list().length>=2','explicit consent');
  const source='周五前把实习材料交给老师，小王说合同明天回复，下个月妈妈生日，毕业后想买车，这周练三次英语口语。';
  await client.evaluate(`(()=>{const input=document.getElementById('quickInput');input.value=${JSON.stringify(source)};input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('saveBtn').click();})()`);
  await waitFor(client,"document.querySelectorAll('#temporalInboxBlock .temporal-draft').length===5",'real Chronos draft preview');
  await client.evaluate(`(()=>{const first=document.querySelector('.temporal-type');first.value='note';first.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await waitFor(client,"ShikeResearchEventLog.list().some((event)=>event.eventType==='type_corrected')",'user correction event');
  await client.evaluate(`(()=>{const all=document.querySelector('.temporal-confirm-all');all.click();all.click();})()`);
  await waitFor(client,"records.length===5&&document.querySelectorAll('.temporal-draft').length===0",'duplicate-safe confirmation');
  const captured=await client.evaluate(`(()=>{const events=ShikeResearchEventLog.list();const raw=localStorage.getItem(ShikeResearchEventLog.STORAGE_KEY)||'';const payload=ShikeFeedbackExporter.build();return {records:records.length,unique:new Set(records.map((record)=>record.id)).size,firstInput:events.filter((event)=>event.eventType==='first_input').length,confirmed:events.filter((event)=>event.eventType==='draft_confirmed').length,waiting:events.filter((event)=>event.eventType==='waiting_for_created').length,hasRaw:raw.includes(${JSON.stringify(source)}),schema:payload.schema,containsRawUserText:payload.containsRawUserText};})()`);
  console.log('Product validation captured state: '+JSON.stringify(captured));
  assert(captured.records===5&&captured.unique===5,'duplicate submit created duplicate records');
  assert(captured.firstInput===1&&captured.confirmed===5&&captured.waiting===1,'research event counts do not match completed actions');
  assert(!captured.hasRaw&&captured.schema==='shike-product-validation-export'&&!captured.containsRawUserText,'research export contains raw text or has invalid schema');
  await client.evaluate("document.getElementById('researchViewBtn').click()");
  await waitFor(client,"!document.getElementById('researchDataViewer').hidden&&document.querySelectorAll('#researchDataViewer tbody tr').length>0",'research data viewer');
  for(const width of [320,375,414]){
    await client.send('Emulation.setDeviceMetricsOverride',{width,height:760,deviceScaleFactor:1,mobile:true});await delay(120);
    const mobile=await client.evaluate(`(()=>{const input=document.getElementById('quickInput').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,inputVisible:input.top>=0&&input.top<innerHeight,inputWidth:input.width,viewport:innerWidth};})()`);
    assert(mobile.overflow<=1&&mobile.inputVisible&&mobile.inputWidth<=mobile.viewport,`mobile first-input layout failed at ${width}px`);
  }
  await client.evaluate(`(()=>{const button=document.getElementById('researchDeleteBtn');button.click();button.click();})()`);
  assert(await client.evaluate('ShikeResearchEventLog.list().length===0&&ShikeResearchSession.list().length===0'),'research delete did not clear local data');
  await client.evaluate("document.getElementById('researchWithdrawBtn').click();ShikeResearchEventLog.clear();document.getElementById('quickInput').dispatchEvent(new Event('input',{bubbles:true}))");
  assert(await client.evaluate('!ShikeParticipantConsent.status().active&&ShikeResearchEventLog.list().length===0'),'opt-out did not stop research logging');
  const managerUrl=new URL('tools/product-validation/participant-manager.html',APP_URL).href;await client.send('Page.navigate',{url:managerUrl});
  await waitFor(client,"document.readyState==='complete'&&!!window.ShikeSessionAnalyzer&&!!window.ShikeStudyExporter&&!!document.getElementById('metrics')",'participant manager bootstrap');
  const manager=await client.evaluate(`(()=>{var privacyRejected=false;var orphanRejected=false;try{ShikeSessionAnalyzer.assertExport({schema:'shike-product-validation-export',schemaVersion:1,containsRawUserText:false,remoteAnalytics:false,sessions:[{sessionId:'rs_test_browser',participantCode:'TEST-BROWSER',startedAt:new Date().toISOString(),phone:'TEST_VALUE'}],events:[]});}catch(error){privacyRejected=true;}try{ShikeStudyExporter.validateCodes({sessions:[]},[{participantCode:'TEST-BROWSER',sessionId:'rs_missing',issueCode:'copy_confusion',humanCoded:true}]);}catch(error){orphanRejected=true;}return {privacyRejected:privacyRejected,orphanRejected:orphanRejected,emptyReport:document.getElementById('metrics').textContent.includes('HUMAN PARTICIPANTS REQUIRED'),exportDisabled:document.getElementById('exportStudy').disabled};})()`);
  assert(manager.privacyRejected&&manager.orphanRejected,'participant manager accepted invalid evidence');assert(manager.emptyReport&&manager.exportDisabled,'participant manager empty state is dishonest');
  assert(client.consoleErrors.length===0,`console errors: ${client.consoleErrors.join(' | ')}`);assert(client.runtimeErrors.length===0,`runtime errors: ${client.runtimeErrors.join(' | ')}`);assert(client.networkErrors.length===0,`network errors: ${client.networkErrors.join(' | ')}`);
  client.close();console.log('Product validation browser E2E passed: 22/22');
}

main().catch((error)=>{console.error(error.stack||error);process.exit(1);});
