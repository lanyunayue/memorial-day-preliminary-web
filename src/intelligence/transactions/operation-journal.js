(function(global,factory){
  var operation=global.ShikeTemporalOperation;if(typeof module!=='undefined'&&module.exports)operation=require('./temporal-operation.js');
  var api=factory(operation);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeOperationJournal=api;
})(typeof window!=='undefined'?window:globalThis,function(operation){
  'use strict';
  var STORE='temporal_operations';var QUARANTINE='temporal_operation_quarantine';
  function copy(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
  function browserDriver(){if(!globalThis.ShikeIndexedDb)throw new Error('operation_journal_unavailable');return {get:function(id){return globalThis.ShikeIndexedDb.get(STORE,id);},list:function(){return globalThis.ShikeIndexedDb.getAll(STORE);},put:function(value){return globalThis.ShikeIndexedDb.put(STORE,value);},putQuarantine:function(value){return globalThis.ShikeIndexedDb.put(QUARANTINE,value);},remove:function(id){return globalThis.ShikeIndexedDb.remove(STORE,id);}};}
  function memoryDriver(initial){
    var values=new Map((initial||[]).map(function(item){return [item.id,copy(item)];}));var quarantined=new Map();
    return {
      async get(id){return copy(values.get(id));},async list(){return [...values.values()].map(copy);},
      async put(value){values.set(value.id,copy(value));return copy(value);},
      async putQuarantine(value){quarantined.set(value.id,copy(value));return copy(value);},
      async remove(id){values.delete(id);return true;},async quarantined(){return [...quarantined.values()].map(copy);}
    };
  }
  function create(driver){
    driver=driver||browserDriver();var queue=Promise.resolve();
    function serial(work){var run=queue.then(work);queue=run.catch(function(){});return run;}
    async function quarantineNow(current,reason){var next=operation.transition(current,'quarantined',null,reason);var item={id:'quarantine:'+next.operationId,operationId:next.operationId,operationType:next.operationType,recordId:next.recordId,draftId:next.draftId,payloadChecksum:next.payloadChecksum,reason:operation.cleanError(reason),retryCount:next.retryCount,quarantinedAt:new Date().toISOString(),schemaVersion:1};await driver.putQuarantine(item);await driver.put(next);return next;}
    async function prepare(input){
      var payloadChecksum=input.payloadChecksum||await operation.checksum(input.payload||{});
      return serial(async function(){var current=await driver.get(input.operationId);if(current){if(current.payloadChecksum!==payloadChecksum){await quarantineNow(current,'payload_checksum_mismatch');throw new Error('operation_checksum_mismatch');}return current;}var next=operation.create(Object.assign({},input,{payloadChecksum:payloadChecksum}));await driver.put(next);return next;});
    }
    async function get(id){await queue;return driver.get(id);}
    function mark(id,status,step,error){return serial(async function(){var current=await driver.get(id);if(!current)throw new Error('operation_not_found');var next=operation.transition(current,status,step,error);await driver.put(next);return next;});}
    function fail(id,error){return serial(async function(){var current=await driver.get(id);if(!current)throw new Error('operation_not_found');current.retryCount=Number(current.retryCount||0)+1;current.lastError=operation.cleanError(error);current.updatedAt=new Date().toISOString();await driver.put(current);return current;});}
    function quarantine(current,reason){return serial(async function(){if(typeof current==='string')current=await driver.get(current);if(!current)return null;return quarantineNow(current,reason);});}
    async function list(){await queue;return driver.list();}
    async function listPending(){var values=await list();return values.filter(function(item){return !['committed','recovered','quarantined'].includes(item.status);}).sort(function(a,b){return a.startedAt.localeCompare(b.startedAt);});}
    async function diagnostics(){var values=await list();return {total:values.length,pending:values.filter(function(item){return !['committed','recovered','quarantined'].includes(item.status);}).length,quarantined:values.filter(function(item){return item.status==='quarantined';}).length,operations:values};}
    return Object.freeze({prepare:prepare,get:get,mark:mark,fail:fail,quarantine:quarantine,list:list,listPending:listPending,diagnostics:diagnostics});
  }
  return Object.freeze({create:create,browserDriver:browserDriver,memoryDriver:memoryDriver,stores:Object.freeze({journal:STORE,quarantine:QUARANTINE})});
});
