'use strict';

const operationApi=require('../src/intelligence/transactions/temporal-operation.js');
const journalApi=require('../src/intelligence/transactions/operation-journal.js');
const lockApi=require('../src/intelligence/transactions/operation-lock.js');
const coordinatorApi=require('../src/intelligence/transactions/operation-coordinator.js');
const recoveryApi=require('../src/intelligence/transactions/operation-recovery.js');
const faultApi=require('../src/intelligence/testing/fault-injection.js');
const intelligence=require('../src/intelligence/intelligence-controller.js');
const temporalRepositoryApi=require('../src/intelligence/temporal-repository.js');
const graphRepositoryApi=require('../src/graph/graph-repository.js');
const waitingRepositoryApi=require('../src/intelligence/waiting-for-repository.js');
const correctionStoreApi=require('../src/intelligence/correction-store.js');
const controllerApi=require('../src/intelligence/temporal-web-controller.js');

const checks=[];
function check(name,condition){if(!condition)throw new Error(name);checks.push(name);}
function temporalMemoryDriver(){
  const stores=new Map();
  function store(name){if(!stores.has(name))stores.set(name,new Map());return stores.get(name);}
  return {
    async get(name,id){const value=store(name).get(id);return value&&JSON.parse(JSON.stringify(value));},
    async getAll(name){return [...store(name).values()].map((value)=>JSON.parse(JSON.stringify(value)));},
    async put(name,value){store(name).set(value.id,JSON.parse(JSON.stringify(value)));return value;},
    async remove(name,id){store(name).delete(id);return true;}
  };
}
function operationPayloadMemoryDriver(){
  const values=new Map();return {async get(id){const value=values.get(id);return value&&JSON.parse(JSON.stringify(value));},async put(item){values.set(item.id,JSON.parse(JSON.stringify(item)));return item;},async remove(id){values.delete(id);return true;}};
}

async function runRecoveryScenario(config){
  const journal=journalApi.create(journalApi.memoryDriver());
  const fault=faultApi.create();
  const coordinator=coordinatorApi.create({journal,lock:lockApi.create(lockApi.memoryDriver()),fault});
  const state={records:new Set(['record_1']),graph:new Set(),waiting:new Set(),trash:new Set(),snapshots:new Set(),runs:0};
  function plan(){
    const steps=config.steps(state).map((step)=>({name:step.name,status:step.status,run:async()=>{state.runs++;return step.run();}}));
    return {operationId:config.id,operationType:config.type,recordId:'record_1',resourceId:config.id,payload:{scenario:config.id,recordId:'record_1'},pendingSteps:steps.map((step)=>step.name),steps};
  }
  fault.arm(config.point,new Error(config.id));
  let failed=false;try{await coordinator.execute(plan());}catch(error){failed=true;}
  check(`${config.id} injects a real interruption`,failed);
  const pendingBefore=await journal.listPending();check(`${config.id} remains recoverable`,pendingBefore.length===1);
  fault.clear();
  const recovery=recoveryApi.create({journal,coordinator,resolvePlan:async()=>plan()});
  const first=await recovery.scan();check(`${config.id} recovers once`,first.recovered===1&&first.quarantined===0);
  const stable=JSON.stringify({records:[...state.records],graph:[...state.graph],waiting:[...state.waiting],trash:[...state.trash],snapshots:[...state.snapshots]});
  const second=await recovery.scan();check(`${config.id} second recovery is a no-op`,second.scanned===0&&JSON.stringify({records:[...state.records],graph:[...state.graph],waiting:[...state.waiting],trash:[...state.trash],snapshots:[...state.snapshots]})===stable);
  check(`${config.id} reaches its expected state`,config.verify(state));
}

function createWebHarness(shared,fault){
  const controller=controllerApi.create({
    temporalRepository:shared.temporalRepository,graphRepository:shared.graphRepository,waitingRepository:shared.waitingRepository,
    correctionStore:shared.correctionStore,operationJournal:shared.journal,operationPayloadStore:shared.operationPayloadStore,operationLock:lockApi.create(lockApi.memoryDriver()),fault
  });
  const api={
    getRecords:()=>shared.records,
    createRecordId:()=>`record_${++shared.sequence}`,
    prepareRecord:(draft,id)=>intelligence.toRecord(draft,()=>id),
    writeRecord:async(record)=>{if(!shared.records.some((item)=>item.id===record.id))shared.records.push(record);return shared.records.find((item)=>item.id===record.id);},
    saveRecord:(draft,id)=>{const record=intelligence.toRecord(draft,()=>id);shared.records.push(record);return record;},
    removeRecord:(id)=>{shared.records=shared.records.filter((item)=>item.id!==id);},
    updateRecord:(id,changes)=>{const record=shared.records.find((item)=>item.id===id);if(!record)return false;Object.assign(record,changes);return true;},
    clearInput:()=>{},openDetail:()=>{},notify:()=>{},refresh:()=>{}
  };
  return {controller,api};
}

(async function(){
  const scenarios=[
    {id:'record_ok_graph_fail',type:'create_record',point:'before:sidecars',steps:(state)=>[
      {name:'record',status:'record_written',run:()=>state.records.add('record_1')},{name:'sidecars',status:'sidecars_written',run:()=>state.graph.add('record_1')}
    ],verify:(state)=>state.records.has('record_1')&&state.graph.has('record_1')},
    {id:'graph_ok_waiting_fail',type:'create_record',point:'before:waiting',steps:(state)=>[
      {name:'record',status:'record_written',run:()=>state.records.add('record_1')},{name:'graph',status:'sidecars_written',run:()=>state.graph.add('record_1')},{name:'waiting',status:'sidecars_written',run:()=>state.waiting.add('record_1')}
    ],verify:(state)=>state.graph.has('record_1')&&state.waiting.has('record_1')},
    {id:'delete_ok_tombstone_fail',type:'delete_record',point:'before:tombstone',steps:(state)=>[
      {name:'delete',status:'record_written',run:()=>state.records.delete('record_1')},{name:'tombstone',status:'sidecars_written',run:()=>state.trash.add('record_1')}
    ],verify:(state)=>!state.records.has('record_1')&&state.trash.has('record_1')},
    {id:'restore_ok_graph_fail',type:'restore_record',point:'before:graph',steps:(state)=>[
      {name:'restore',status:'record_written',run:()=>state.records.add('record_1')},{name:'graph',status:'sidecars_written',run:()=>state.graph.add('record_1')}
    ],verify:(state)=>state.records.has('record_1')&&state.graph.has('record_1')},
    {id:'snapshot_ok_sidecar_fail',type:'restore_snapshot',point:'before:sidecars',steps:(state)=>[
      {name:'snapshot',status:'record_written',run:()=>state.snapshots.add('record_1')},{name:'sidecars',status:'sidecars_written',run:()=>state.graph.add('record_1')}
    ],verify:(state)=>state.snapshots.has('record_1')&&state.graph.has('record_1')},
    {id:'closed_after_prepared',type:'create_record',point:'after:prepared',steps:(state)=>[
      {name:'record',status:'record_written',run:()=>state.records.add('record_1')},{name:'sidecars',status:'sidecars_written',run:()=>state.graph.add('record_1')}
    ],verify:(state)=>state.records.has('record_1')&&state.graph.has('record_1')},
    {id:'closed_after_sidecars',type:'create_record',point:'after:sidecars',steps:(state)=>[
      {name:'record',status:'record_written',run:()=>state.records.add('record_1')},{name:'sidecars',status:'sidecars_written',run:()=>state.graph.add('record_1')},{name:'finalize',status:'sidecars_written',run:()=>state.waiting.add('record_1')}
    ],verify:(state)=>state.records.has('record_1')&&state.graph.has('record_1')&&state.waiting.has('record_1')}
  ];
  for(const scenario of scenarios)await runRecoveryScenario(scenario);

  const checksumJournal=journalApi.create(journalApi.memoryDriver());
  await checksumJournal.prepare({operationId:'checksum_case',operationType:'create_record',recordId:'record_1',payload:{value:'a'},pendingSteps:[]});
  let checksumRejected=false;try{await checksumJournal.prepare({operationId:'checksum_case',operationType:'create_record',recordId:'record_1',payload:{value:'b'},pendingSteps:[]});}catch(error){checksumRejected=error.message==='operation_checksum_mismatch';}
  check('checksum mismatch is rejected and quarantined',checksumRejected&&(await checksumJournal.diagnostics()).quarantined===1);

  const shared={records:[],sequence:0,temporalRepository:temporalRepositoryApi.create(temporalMemoryDriver()),graphRepository:graphRepositoryApi.create(graphRepositoryApi.memoryDriver()),waitingRepository:waitingRepositoryApi.create(waitingRepositoryApi.memoryDriver()),correctionStore:correctionStoreApi.create(correctionStoreApi.memoryDriver()),journal:journalApi.create(journalApi.memoryDriver()),operationPayloadStore:operationPayloadMemoryDriver()};
  const fault=faultApi.create();const first=createWebHarness(shared,fault);await first.controller.init(first.api);
  const source='周五前把实习材料交给老师，小王说合同明天回复，下个月妈妈生日，毕业后想买车，这周练三次英语口语。';
  first.controller.captureIfNeeded(source);await new Promise((resolve)=>setTimeout(resolve,0));fault.arm('before:sidecars',new Error('third_graph_write_failed'),3);await first.controller.confirmAll();
  check('batch stops with third Record durably present',shared.records.length===3);
  check('batch and third create remain recoverable',(await shared.journal.listPending()).length===2);
  check('batch never duplicates first two Records',new Set(shared.records.map((record)=>record.id)).size===3);
  fault.clear();const second=createWebHarness(shared,fault);await second.controller.init(second.api);const afterRestart=await second.controller.diagnostics();
  check('restart recovers the interrupted third operation',afterRestart.recovery.recovered===1&&afterRestart.consistency.valid);
  await second.controller.confirmAll();const final=await second.controller.diagnostics();
  check('remaining drafts confirm without duplicates',shared.records.length===5&&new Set(shared.records.map((record)=>record.id)).size===5);
  check('final Graph and Waiting For are consistent',final.consistency.valid&&final.waiting.length===1&&final.graph.edges.length>5);
  const thirdRestart=createWebHarness(shared,fault);await thirdRestart.controller.init(thirdRestart.api);check('second browser restart performs no extra recovery',(await thirdRestart.controller.diagnostics()).recovery.recovered===0&&shared.records.length===5);

  console.log(`Chronos fault recovery passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(error);process.exit(1);});
