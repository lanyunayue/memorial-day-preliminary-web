'use strict';

const lockApi=require('../src/intelligence/transactions/operation-lock.js');
const multiTabApi=require('../src/intelligence/transactions/multi-tab-coordinator.js');

const checks=[];
function check(name,condition){if(!condition)throw new Error(name);checks.push(name);}

(async function(){
  const lockDriver=lockApi.memoryDriver();const versionDriver=multiTabApi.memoryDriver();
  const first=multiTabApi.create({driver:versionDriver,lock:lockApi.create(lockDriver,{ownerId:'tab_a',ttl:50})});
  const second=multiTabApi.create({driver:versionDriver,lock:lockApi.create(lockDriver,{ownerId:'tab_b',ttl:50})});
  const record={id:'record_1',title:'实习材料',state:'active',updatedBy:''};
  const initialA=await first.version(record.id);const initialB=await second.version(record.id);
  check('two tabs read the same optimistic version',initialA===0&&initialB===0);
  let releaseFirst;const gate=new Promise((resolve)=>{releaseFirst=resolve;});
  const deleteRun=first.mutate({resourceId:record.id,operationId:'delete:record_1',expectedVersion:initialA},async()=>{record.state='deleted';record.updatedBy='tab_a';await gate;return true;});
  await new Promise((resolve)=>setTimeout(resolve,0));
  let editLocked=false;try{await second.mutate({resourceId:record.id,operationId:'edit:record_1',expectedVersion:initialB},async()=>{record.title='被覆盖';});}catch(error){editLocked=error.code==='TEMPORAL_OPERATION_LOCKED';}
  check('delete and edit cannot write concurrently',editLocked&&record.title==='实习材料');
  releaseFirst();const deleted=await deleteRun;check('winning delete advances the version',deleted.version===1&&record.state==='deleted');
  let staleConflict=false;try{await second.mutate({resourceId:record.id,operationId:'edit:record_1',expectedVersion:0},async()=>{record.title='被覆盖';});}catch(error){staleConflict=error.code==='TEMPORAL_VERSION_CONFLICT'&&!!error.userMessage;}
  check('stale edit receives an understandable conflict',staleConflict&&record.title==='实习材料');
  const duplicate=await first.mutate({resourceId:record.id,operationId:'delete:record_1',expectedVersion:0},async()=>{throw new Error('duplicate_work_ran');});
  check('operationId retry is idempotent',duplicate.duplicate===true&&duplicate.version===1);

  const sharedVersion=await first.version('global:write');
  const importResult=await first.mutate({resourceId:'global:write',operationId:'import:1',expectedVersion:sharedVersion},async()=>true);
  let createConflict=false;try{await second.mutate({resourceId:'global:write',operationId:'create:2',expectedVersion:sharedVersion},async()=>true);}catch(error){createConflict=error.code==='TEMPORAL_VERSION_CONFLICT';}
  check('backup import and create cannot silently overlap',importResult.version===1&&createConflict);

  const expiringDriver=lockApi.memoryDriver();const abandoned=lockApi.create(expiringDriver,{ownerId:'crashed_tab',ttl:5});const survivor=lockApi.create(expiringDriver,{ownerId:'survivor_tab',ttl:20});
  let releaseAbandoned;const abandonedGate=new Promise((resolve)=>{releaseAbandoned=resolve;});
  const abandonedRun=abandoned.withLock('resource:stale',async()=>abandonedGate);
  await new Promise((resolve)=>setTimeout(resolve,8));let survivorEntered=false;await survivor.withLock('resource:stale',async()=>{survivorEntered=true;});releaseAbandoned();await abandonedRun;
  check('crashed tab lock expires without permanent deadlock',survivorEntered);

  first.close();second.close();abandoned.close();survivor.close();
  console.log(`Chronos multi-tab contract passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(error);process.exit(1);});
