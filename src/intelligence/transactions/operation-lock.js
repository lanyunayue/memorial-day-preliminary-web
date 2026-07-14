(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalOperationLock=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var STORE='temporal_locks';
  function copy(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
  function browserDriver(){
    if(!globalThis.ShikeIndexedDb)throw new Error('operation_lock_unavailable');
    return {
      async acquire(id,ownerId,ttl){
        var db=await globalThis.ShikeIndexedDb.open();
        return new Promise(function(resolve,reject){
          var granted=false;var tx=db.transaction(STORE,'readwrite');var store=tx.objectStore(STORE);var request=store.get(id);
          request.onsuccess=function(){var now=Date.now();var current=request.result;if(!current||current.ownerId===ownerId||Number(current.expiresAt||0)<=now){granted=true;store.put({id:id,ownerId:ownerId,acquiredAt:now,expiresAt:now+ttl,schemaVersion:1});}};
          tx.oncomplete=function(){resolve(granted);};tx.onerror=function(){reject(tx.error||new Error('operation_lock_failed'));};tx.onabort=function(){reject(tx.error||new Error('operation_lock_aborted'));};
        });
      },
      async release(id,ownerId){var db=await globalThis.ShikeIndexedDb.open();return new Promise(function(resolve,reject){var released=false;var tx=db.transaction(STORE,'readwrite');var store=tx.objectStore(STORE);var request=store.get(id);request.onsuccess=function(){var current=request.result;if(current&&current.ownerId===ownerId){store.delete(id);released=true;}};tx.oncomplete=function(){resolve(released);};tx.onerror=function(){reject(tx.error||new Error('operation_unlock_failed'));};});}
    };
  }
  function memoryDriver(){var locks=new Map();return {async acquire(id,ownerId,ttl){var now=Date.now();var current=locks.get(id);if(current&&current.ownerId!==ownerId&&current.expiresAt>now)return false;locks.set(id,{id:id,ownerId:ownerId,expiresAt:now+ttl});return true;},async release(id,ownerId){var current=locks.get(id);if(current&&current.ownerId===ownerId){locks.delete(id);return true;}return false;},snapshot:function(){return copy([...locks.values()]);}};}
  function create(driver,options){
    driver=driver||browserDriver();options=options||{};var ownerId=options.ownerId||'tab_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);var ttl=options.ttl||15000;var channel=null;
    if(typeof window!=='undefined'&&typeof globalThis.BroadcastChannel==='function')try{channel=new globalThis.BroadcastChannel('shike_temporal_operations');}catch(error){}
    async function withLock(id,work){var granted=await driver.acquire(id,ownerId,ttl);if(!granted){var error=new Error('temporal_operation_locked');error.code='TEMPORAL_OPERATION_LOCKED';throw error;}if(channel)channel.postMessage({type:'lock_acquired',id:id,ownerId:ownerId});try{return await work();}finally{await driver.release(id,ownerId).catch(function(){});if(channel)channel.postMessage({type:'lock_released',id:id,ownerId:ownerId});}}
    function close(){if(channel){channel.close();channel=null;}}
    return Object.freeze({ownerId:ownerId,withLock:withLock,close:close});
  }
  return Object.freeze({create:create,browserDriver:browserDriver,memoryDriver:memoryDriver,store:STORE});
});
