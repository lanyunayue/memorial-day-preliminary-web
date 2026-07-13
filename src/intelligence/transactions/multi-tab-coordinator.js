(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalMultiTab=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var STORE='temporal_meta';var PREFIX='resource_version:';
  function browserDriver(){if(!globalThis.ShikeIndexedDb)throw new Error('multi_tab_driver_unavailable');return {get:function(id){return globalThis.ShikeIndexedDb.get(STORE,PREFIX+id);},put:function(value){return globalThis.ShikeIndexedDb.put(STORE,value);}};}
  function memoryDriver(){var values=new Map();return {async get(id){var value=values.get(PREFIX+id);return value&&JSON.parse(JSON.stringify(value));},async put(value){values.set(value.id,JSON.parse(JSON.stringify(value)));return value;}};}
  function conflict(resourceId,expected,current){var error=new Error('temporal_resource_version_conflict');error.code='TEMPORAL_VERSION_CONFLICT';error.resourceId=resourceId;error.expectedVersion=expected;error.currentVersion=current;error.userMessage='这条记录已在另一个标签页更新，请刷新后重试。';return error;}
  function create(options){
    options=options||{};var driver=options.driver||browserDriver();var lock=options.lock;if(!lock)throw new Error('multi_tab_lock_required');var listeners=new Set();var channel=null;
    if(typeof window!=='undefined'&&typeof globalThis.BroadcastChannel==='function')try{channel=new globalThis.BroadcastChannel('shike_temporal_changes');channel.onmessage=function(event){listeners.forEach(function(listener){listener(event.data);});};}catch(error){}
    async function version(resourceId){var value=await driver.get(resourceId);return value&&Number(value.version)||0;}
    async function mutate(input,work){
      input=input||{};if(!input.resourceId||!input.operationId)throw new Error('multi_tab_mutation_identity_required');
      return lock.withLock('resource:'+input.resourceId,async function(){
        var current=await driver.get(input.resourceId);var currentVersion=current&&Number(current.version)||0;
        if(current&&current.lastOperationId===input.operationId)return {duplicate:true,version:currentVersion};
        if(input.expectedVersion!==undefined&&Number(input.expectedVersion)!==currentVersion)throw conflict(input.resourceId,Number(input.expectedVersion),currentVersion);
        var result=await work(currentVersion);var next={id:PREFIX+input.resourceId,resourceId:input.resourceId,version:currentVersion+1,lastOperationId:input.operationId,updatedAt:new Date().toISOString(),schemaVersion:1};await driver.put(next);
        var event={type:'resource_changed',resourceId:input.resourceId,version:next.version,operationId:input.operationId};if(channel)channel.postMessage(event);listeners.forEach(function(listener){listener(event);});return {duplicate:false,version:next.version,result:result};
      });
    }
    function subscribe(listener){listeners.add(listener);return function(){listeners.delete(listener);};}
    function close(){listeners.clear();if(channel){channel.close();channel=null;}if(lock.close)lock.close();}
    return Object.freeze({version:version,mutate:mutate,subscribe:subscribe,close:close});
  }
  return Object.freeze({create:create,browserDriver:browserDriver,memoryDriver:memoryDriver,prefix:PREFIX});
});
