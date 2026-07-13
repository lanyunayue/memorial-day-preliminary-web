'use strict';

const intelligence=require('../src/intelligence/intelligence-controller.js');
const temporalRepositoryApi=require('../src/intelligence/temporal-repository.js');
const graphRepositoryApi=require('../src/graph/graph-repository.js');
const waitingRepositoryApi=require('../src/intelligence/waiting-for-repository.js');
const correctionStoreApi=require('../src/intelligence/correction-store.js');
const adaptationStoreApi=require('../src/intelligence/adaptation-rule-store.js');
const journalApi=require('../src/intelligence/transactions/operation-journal.js');
const lockApi=require('../src/intelligence/transactions/operation-lock.js');
const controllerApi=require('../src/intelligence/temporal-web-controller.js');

const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
function temporalDriver(){const stores=new Map();const store=(name)=>{if(!stores.has(name))stores.set(name,new Map());return stores.get(name);};return {async get(name,id){const value=store(name).get(id);return value&&JSON.parse(JSON.stringify(value));},async getAll(name){return [...store(name).values()].map((item)=>JSON.parse(JSON.stringify(item)));},async put(name,item){store(name).set(item.id,JSON.parse(JSON.stringify(item)));return item;},async remove(name,id){store(name).delete(id);return true;}};}
function payloadDriver(){const values=new Map();return {values,async get(id){const value=values.get(id);return value&&JSON.parse(JSON.stringify(value));},async put(item){values.set(item.id,JSON.parse(JSON.stringify(item)));return item;},async remove(id){values.delete(id);return true;}};}

(async()=>{
  const previousIndexedDb=global.ShikeIndexedDb;const meta=new Map();global.ShikeIndexedDb={async get(store,id){return store==='temporal_meta'?meta.get(id):undefined;},async put(store,item){if(store==='temporal_meta')meta.set(item.id,JSON.parse(JSON.stringify(item)));return item;},async remove(store,id){if(store==='temporal_meta')meta.delete(id);return true;}};
  try{
    const records=[];const journal=journalApi.create(journalApi.memoryDriver());const payloads=payloadDriver();
    const controller=controllerApi.create({
      temporalRepository:temporalRepositoryApi.create(temporalDriver()),graphRepository:graphRepositoryApi.create(graphRepositoryApi.memoryDriver()),waitingRepository:waitingRepositoryApi.create(waitingRepositoryApi.memoryDriver()),
      correctionStore:correctionStoreApi.create(correctionStoreApi.memoryDriver()),adaptationStore:adaptationStoreApi.create(adaptationStoreApi.memoryDriver()),operationJournal:journal,operationPayloadStore:payloads,operationLock:lockApi.create(lockApi.memoryDriver()),
    });
    const api={getRecords:()=>records,createRecordId:()=> 'coverage_record',prepareRecord:(draft,id)=>intelligence.toRecord(draft,()=>id),writeRecord:async(record)=>{if(!records.some((item)=>item.id===record.id))records.push(record);return record;},updateRecordDurably:async(id,changes)=>{const record=records.find((item)=>item.id===id);if(!record)return false;Object.assign(record,changes);return true;},clearInput:()=>{},openDetail:()=>{},notify:()=>{},refresh:()=>{}};
    await controller.init(api);controller.captureIfNeeded('我答应老师周五交实习材料');await new Promise((resolve)=>setTimeout(resolve,0));check('coverage draft is captured',(await controller.diagnostics()).pendingDrafts===1);
    check('batch confirmation succeeds',await controller.confirmAll());
    await controller.updateRecord('coverage_record',{note:'已联系老师'});await controller.completeRecord('coverage_record');
    const backup=await controller.augmentBackup({records:records.slice()});await controller.saveSnapshotSidecar('coverage');
    await controller.tombstoneRecord('coverage_record');await controller.restoreRecord('coverage_record');await controller.purgeRecord('coverage_record');await controller.rebuildConsistency();
    await controller.importBackupSidecars({idMap:{},temporal:{temporalGraph:backup.temporalGraph,temporalWaiting:backup.temporalWaiting,temporalAdaptationRules:backup.temporalAdaptationRules}});await controller.restoreSnapshotSidecar('coverage');
    const operations=await journal.list();const types=new Set(operations.map((item)=>item.operationType));const expected=['create_record','update_record','complete_record','delete_record','restore_record','purge_record','rebuild_graph','import_backup','restore_snapshot','confirm_batch'];
    check('all ten operation types are journaled',expected.every((type)=>types.has(type)),JSON.stringify([...types]));
    check('all covered operations commit',operations.every((item)=>['committed','recovered'].includes(item.status)));
    check('journal stores checksums instead of payloads',operations.every((item)=>item.payloadChecksum&&!Object.prototype.hasOwnProperty.call(item,'payload')));
    check('temporary operation payloads are removed',payloads.values.size===0,[...payloads.values.keys()].join(','));
    check('record update and completion are durable',records[0].note==='已联系老师'&&records[0].recordState==='completed');
    check('graph remains consistent after destructive loop',(await controller.runConsistencyAudit()).valid);
    check('snapshot remains local and restorable',meta.has('snapshot:coverage'));
    console.log(`Chronos operation coverage passed: ${checks.length}/${checks.length}`);
  }finally{if(previousIndexedDb===undefined)delete global.ShikeIndexedDb;else global.ShikeIndexedDb=previousIndexedDb;}
})().catch((error)=>{console.error(error);process.exit(1);});
