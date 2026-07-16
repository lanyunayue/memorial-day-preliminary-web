const CDP_URL=process.env.SHIKE_CDP_URL||'http://127.0.0.1:9224';
const APP_URL=process.env.SHIKE_APP_URL||'http://127.0.0.1:8090/index.html';
const EXPECTED_VERSION=process.env.SHIKE_EXPECTED_VERSION;
const delay=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));

async function main(){
  if(!EXPECTED_VERSION)throw new Error('SHIKE_EXPECTED_VERSION is required');
  let page=null;
  try{const response=await fetch(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`,{method:'PUT'});if(response.ok)page=await response.json();}catch(error){}
  if(!page){const targets=await fetch(`${CDP_URL}/json`).then((response)=>response.json());page=targets.find((target)=>target.type==='page');}
  if(!page)throw new Error('no CDP page target');
  const ws=new WebSocket(page.webSocketDebuggerUrl);
  const pending=new Map();let id=0;
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',(event)=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const pair=pending.get(message.id);pending.delete(message.id);message.error?pair.reject(new Error(message.error.message)):pair.resolve(message.result||{});}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}));setTimeout(()=>{if(pending.has(callId)){pending.delete(callId);reject(new Error(`${method} timed out`));}},30000);});
  const evaluate=async(expression)=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value;};

  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Page.navigate',{url:APP_URL});await delay(1500);
  await evaluate(`navigator.serviceWorker.ready.then(()=>true)`);
  await send('Page.reload',{ignoreCache:false});await delay(1200);
  const online=await evaluate(`({version:APP_VERSION,modules:!!window.ShikeModules})`);
  if(online.version!==EXPECTED_VERSION||!online.modules)throw new Error(`online warm-up failed: ${JSON.stringify(online)}`);

  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await send('Page.navigate',{url:APP_URL});await delay(1500);
  for(let index=0;index<100;index++){if(await evaluate(`document.readyState==='complete'`))break;await delay(100);}
  const offline=await evaluate(`({ready:document.readyState,version:window.APP_VERSION,modules:!!window.ShikeModules,body:document.body&&document.body.textContent.length})`);
  await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  ws.close();
  if(offline.ready!=='complete'||offline.version!==EXPECTED_VERSION||!offline.modules||offline.body<20)throw new Error(`offline launch failed: ${JSON.stringify(offline)}`);
  console.log('Offline runtime CDP acceptance passed: 3/3');
}

main().catch((error)=>{console.error(`Offline runtime CDP acceptance failed: ${error.message}`);process.exit(1);});
