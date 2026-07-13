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
  constructor(url){this.url=url;this.id=0;this.pending=new Map();this.errors=[];}
  async connect(){this.ws=new WebSocket(this.url);await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});this.ws.addEventListener('message',(event)=>this.message(event));}
  message(event){
    const item=JSON.parse(event.data);if(item.id&&this.pending.has(item.id)){const pending=this.pending.get(item.id);this.pending.delete(item.id);clearTimeout(pending.timer);item.error?pending.reject(new Error(item.error.message)):pending.resolve(item.result||{});return;}
    if(item.method==='Runtime.exceptionThrown')this.errors.push(item.params.exceptionDetails&&item.params.exceptionDetails.text||'runtime exception');
    if(item.method==='Runtime.consoleAPICalled'&&item.params.type==='error')this.errors.push('console error');
    if(item.method==='Network.responseReceived'&&item.params.response.status>=400)this.errors.push(`${item.params.response.status} ${item.params.response.url}`);
  }
  send(method,params={},timeout=30000){const id=++this.id;this.ws.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{if(this.pending.has(id)){this.pending.delete(id);reject(new Error(`${method} timed out`));}},timeout);this.pending.set(id,{resolve,reject,timer});});}
  async evaluate(expression,timeout=30000){const result=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true},timeout);if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception&&result.exceptionDetails.exception.description||JSON.stringify(result.exceptionDetails));return result.result&&result.result.value;}
  close(){this.pending.forEach((item)=>clearTimeout(item.timer));this.pending.clear();if(this.ws)this.ws.close();}
}
async function waitFor(client,expression,label,timeout=120000){const started=Date.now();while(Date.now()-started<timeout){try{if(await client.evaluate(expression))return Date.now()-started;}catch(error){}await delay(100);}throw new Error(`${label} timed out`);}
async function main(){
  assert(CDP_URL&&APP_URL,'CDP and app URLs are required');const targets=await json(`${CDP_URL}/json`);let page=targets.find((target)=>target.type==='page');
  if(!page){const response=await fetch(`${CDP_URL}/json/new?${encodeURIComponent(APP_URL)}`,{method:'PUT'});page=await response.json();}
  const client=new Client(page.webSocketDebuggerUrl);await client.connect();await client.send('Page.enable');await client.send('Runtime.enable');await client.send('Network.enable');
  await waitFor(client,"document.readyState==='complete'&&!!window.ShikeIndexedDb&&!!window.ShikeLocalFirst&&ShikeLocalFirst.getStatus().ready",'stress bootstrap');
  const writeResult=await client.evaluate(`(async()=>{
    const stores=['records','temporal_nodes','temporal_edges','temporal_corrections','temporal_operations'];
    const db=await ShikeIndexedDb.open();const metrics={records1000:[],records10000:[],nodes:[],edges:[],corrections:[],operations:[]};
    const estimateBefore=navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():{};
    function transaction(names,mode,work){return new Promise((resolve,reject)=>{const tx=db.transaction(names,mode);try{work(tx);}catch(error){tx.abort();reject(error);return;}tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('transaction_aborted'));});}
    async function clear(){await transaction(stores,'readwrite',(tx)=>stores.forEach((name)=>tx.objectStore(name).clear()));}
    async function write(store,start,count,bucket,factory){for(let offset=0;offset<count;offset+=1000){const size=Math.min(1000,count-offset);const began=performance.now();await transaction([store],'readwrite',(tx)=>{const target=tx.objectStore(store);for(let index=0;index<size;index++)target.put(factory(start+offset+index));});bucket.push(performance.now()-began);}}
    localStorage.removeItem('shike_records_v1');await clear();
    await write('records',0,1000,metrics.records1000,(index)=>({id:'stress_record_'+index,title:'压力记录 '+index,rawText:'实习材料阶段 '+(index%100),dateKey:index%3===0?'2026-07-13':'2026-07-14',timeText:String(index%24).padStart(2,'0')+':00',recordKind:'reminder',recordState:'active',createdAt:index+1,updatedAt:index+1,archived:false,notifyMode:'none'}));
    const recordsAt1000=await ShikeIndexedDb.count('records');
    await write('records',1000,9000,metrics.records10000,(index)=>({id:'stress_record_'+index,title:'压力记录 '+index,rawText:'实习材料阶段 '+(index%100),dateKey:index%3===0?'2026-07-13':'2026-07-14',timeText:String(index%24).padStart(2,'0')+':00',recordKind:'reminder',recordState:'active',createdAt:index+1,updatedAt:index+1,archived:false,notifyMode:'none'}));
    await write('temporal_nodes',0,50000,metrics.nodes,(index)=>({id:'stress_node_'+index,type:index%5===0?'Commitment':'Task',label:'压力节点 '+index,sourceRecordIds:['stress_record_'+(index%10000)],status:'active',schemaVersion:1,createdAt:index+1,updatedAt:index+1}));
    await write('temporal_edges',0,100000,metrics.edges,(index)=>({id:'stress_edge_'+index,type:'related_to',from:'stress_node_'+(index%50000),to:'stress_node_'+((index+1)%50000),sourceRecordId:'stress_record_'+(index%10000),status:'active',schemaVersion:1,createdAt:index+1,updatedAt:index+1}));
    await write('temporal_corrections',0,10000,metrics.corrections,(index)=>({id:'stress_correction_'+index,eventType:'suggestion_ignored',recordId:'stress_record_'+(index%10000),sourceText:'',originalType:'',correctedType:'',modifiedFields:[],schemaVersion:1,createdAt:new Date(index+1).toISOString()}));
    await write('temporal_operations',0,5000,metrics.operations,(index)=>({id:'stress_operation_'+index,operationId:'stress_operation_'+index,operationType:'create_record',recordId:'stress_record_'+(index%10000),startedAt:new Date(index+1).toISOString(),updatedAt:new Date(index+1).toISOString(),completedSteps:['record','sidecars'],pendingSteps:[],payloadChecksum:'stress-checksum-'+index,status:'committed',retryCount:0,lastError:'',schemaVersion:1}));
    const counts={};for(const store of stores)counts[store]=await ShikeIndexedDb.count(store);const estimateAfter=navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():{};
    return {recordsAt1000,counts,writeMetrics:metrics,estimateBefore,estimateAfter};
  })()`,240000);
  assert(writeResult.recordsAt1000===1000,'1,000 record stage was not persisted');
  assert(writeResult.counts.records===10000&&writeResult.counts.temporal_nodes===50000&&writeResult.counts.temporal_edges===100000,'record or graph stress counts are wrong');
  assert(writeResult.counts.temporal_corrections===10000&&writeResult.counts.temporal_operations===5000,'correction or operation stress counts are wrong');
  const startupStarted=Date.now();await client.send('Page.reload',{ignoreCache:true});
  await waitFor(client,"document.readyState==='complete'&&!!window.ShikeLocalFirst&&ShikeLocalFirst.getStatus().ready",'10k record startup');const startupMs=Date.now()-startupStarted;
  let workload;try{workload=await client.evaluate(`(async()=>{
    const storeNames=['records','temporal_nodes','temporal_edges','temporal_corrections','temporal_operations'];
    const db=await ShikeIndexedDb.open();const metrics={pointRead:[],graphRebuild:[],nextAction:[],weeklyReview:[],backupExport:[],backupRestore:[]};
    function request(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
    function read(store){return request(db.transaction(store,'readonly').objectStore(store).getAll());}
    function get(store,id){return request(db.transaction(store,'readonly').objectStore(store).get(id));}
    function transaction(names,mode,work,acceptAbort){return new Promise((resolve,reject)=>{const tx=db.transaction(names,mode);try{work(tx);}catch(error){tx.abort();reject(error);return;}tx.oncomplete=()=>resolve(true);tx.onerror=()=>acceptAbort?resolve(false):reject(tx.error||new Error('transaction_failed'));tx.onabort=()=>acceptAbort?resolve(false):reject(tx.error||new Error('transaction_aborted'));});}
    window.__chronosStressStage='point reads';for(let index=0;index<50;index++){const began=performance.now();await get('records','stress_record_'+((index*197)%10000));metrics.pointRead.push(performance.now()-began);}
    window.__chronosStressStage='graph rebuild';
    let graphSummary=null;for(let run=0;run<3;run++){const began=performance.now();const [nodes,edges]=await Promise.all([read('temporal_nodes'),read('temporal_edges')]);const nodeIds=new Set(nodes.map((node)=>node.id));let validEdges=0;for(const edge of edges)if(nodeIds.has(edge.from)&&nodeIds.has(edge.to))validEdges++;graphSummary={nodes:nodeIds.size,edges:validEdges};metrics.graphRebuild.push(performance.now()-began);}
    window.__chronosStressStage='next action';const [records,nodes]=await Promise.all([read('records'),read('temporal_nodes')]);const graph={nodes,edges:[]};let actionCount=0;for(let run=0;run<5;run++){const began=performance.now();actionCount=ShikeNextActionEngine.compute({records,graph,waiting:[],now:'2026-07-13T10:00:00+08:00'}).length;metrics.nextAction.push(performance.now()-began);}
    window.__chronosStressStage='weekly review';let weeklyCount=0;for(let run=0;run<5;run++){const began=performance.now();weeklyCount=ShikeWeeklyReview.generate({records,graph,waiting:[],corrections:[],now:'2026-07-13T10:00:00+08:00'}).openCommitments.length;metrics.weeklyReview.push(performance.now()-began);}
    window.__chronosStressStage='backup export';let backup=null;for(let run=0;run<3;run++){const began=performance.now();const values=await Promise.all(storeNames.map(read));const json=JSON.stringify({schemaVersion:1,stores:Object.fromEntries(storeNames.map((name,index)=>[name,values[index]]))});metrics.backupExport.push(performance.now()-began);if(run===2)backup=JSON.parse(json);}
    window.__chronosStressStage='backup clear';
    await transaction(storeNames,'readwrite',(tx)=>storeNames.forEach((name)=>tx.objectStore(name).clear()));
    window.__chronosStressStage='backup restore';for(const name of storeNames){const values=backup.stores[name];for(let offset=0;offset<values.length;offset+=1000){const began=performance.now();await transaction([name],'readwrite',(tx)=>{const target=tx.objectStore(name);values.slice(offset,offset+1000).forEach((item)=>target.put(item));});metrics.backupRestore.push(performance.now()-began);}}
    window.__chronosStressStage='abort atomicity';await transaction(['records'],'readwrite',(tx)=>{tx.objectStore('records').put({id:'stress_aborted_marker'});tx.abort();},true);const abortWasAtomic=!(await get('records','stress_aborted_marker'));
    const counts={};for(const name of storeNames)counts[name]=await request(db.transaction(name,'readonly').objectStore(name).count());const storageEstimate=navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():{};
    return {metrics,graphSummary,actionCount,weeklyCount,abortWasAtomic,counts,storageEstimate,memory:performance.memory?{usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize,jsHeapSizeLimit:performance.memory.jsHeapSizeLimit}:null};
  })()`,300000);}catch(error){const detail=await client.evaluate(`({stage:window.__chronosStressStage||'unknown'})`).catch(()=>({stage:'diagnostic unavailable'}));throw new Error(`stress workload failed at ${detail.stage}: ${error.message}`);}
  assert(workload.graphSummary.nodes===50000&&workload.graphSummary.edges===100000,'graph rebuild lost nodes or edges');
  assert(workload.actionCount===10000&&workload.weeklyCount===2000,'action or weekly review did not process the full dataset');
  assert(workload.abortWasAtomic,'aborted IndexedDB transaction left a partial record');
  assert(workload.counts.records===10000&&workload.counts.temporal_edges===100000,'backup restore counts are wrong');
  const percentile=(values,p)=>{const sorted=values.slice().sort((a,b)=>a-b);return Number(sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*p)-1)].toFixed(3));};
  const summarize=(values)=>({samples:values.length,p50Ms:percentile(values,0.5),p95Ms:percentile(values,0.95),p99Ms:percentile(values,0.99)});
  const metrics={};for(const [name,values] of Object.entries(writeResult.writeMetrics))metrics['write_'+name]=summarize(values);for(const [name,values] of Object.entries(workload.metrics))metrics[name]=summarize(values);metrics.pageStartup={samples:1,p50Ms:startupMs,p95Ms:startupMs,p99Ms:startupMs};
  const result={classification:'PASS',generatedAt:new Date().toISOString(),provenance:'synthetic_stress_fixture',counts:workload.counts,recordsAt1000:writeResult.recordsAt1000,metrics,storage:{before:writeResult.estimateBefore,afterWrite:writeResult.estimateAfter,afterRestore:workload.storageEstimate},memory:workload.memory,atomicAbort:workload.abortWasAtomic,consoleNetworkErrors:client.errors};
  if(ARTIFACT_DIR){fs.mkdirSync(ARTIFACT_DIR,{recursive:true});fs.writeFileSync(path.join(ARTIFACT_DIR,'chronos-indexeddb-stress.json'),JSON.stringify(result,null,2));}
  await client.evaluate(`(async()=>{const db=await ShikeIndexedDb.open();const names=['records','temporal_nodes','temporal_edges','temporal_corrections','temporal_operations'];await new Promise((resolve,reject)=>{const tx=db.transaction(names,'readwrite');names.forEach((name)=>tx.objectStore(name).clear());tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});localStorage.removeItem('shike_records_v1');return true;})()`,120000);
  assert(client.errors.length===0,`console/network errors: ${client.errors.join(' | ')}`);client.close();console.log('Chronos IndexedDB stress passed: '+JSON.stringify({counts:result.counts,metrics:result.metrics,storage:result.storage,memory:result.memory}));
}
main().catch((error)=>{console.error(error.stack||error);process.exit(1);});
