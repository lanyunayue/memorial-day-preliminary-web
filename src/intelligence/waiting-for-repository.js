(function(global,factory){
  var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeWaitingForRepository=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var STORE='temporal_waiting';
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function browserDriver(){
    if(!globalThis.ShikeIndexedDb)throw new Error('waiting_repository_unavailable');
    return {
      getAll:function(){return globalThis.ShikeIndexedDb.getAll(STORE);},
      put:function(value){return globalThis.ShikeIndexedDb.put(STORE,value);},
      remove:function(id){return globalThis.ShikeIndexedDb.remove(STORE,id);},
      async replaceAll(values){
        var db=await globalThis.ShikeIndexedDb.open();
        return new Promise(function(resolve,reject){
          var tx=db.transaction(STORE,'readwrite');
          var store=tx.objectStore(STORE);store.clear();
          (values||[]).forEach(function(value){store.put(value);});
          tx.oncomplete=function(){resolve(copy(values||[]));};
          tx.onerror=function(){reject(tx.error||new Error('waiting_transaction_failed'));};
          tx.onabort=function(){reject(tx.error||new Error('waiting_transaction_aborted'));};
        });
      }
    };
  }
  function memoryDriver(initial){
    var values=copy(initial||[]);
    return {
      async getAll(){return copy(values);},
      async put(value){values=values.filter(function(item){return item.id!==value.id;});values.push(copy(value));return copy(value);},
      async remove(id){values=values.filter(function(item){return item.id!==id;});return true;},
      async replaceAll(next){values=copy(next||[]);return copy(values);}
    };
  }
  function create(driver){
    driver=driver||browserDriver();var queue=Promise.resolve();
    function mutate(work){var run=queue.then(work);queue=run.catch(function(){});return run;}
    async function list(){await queue;return driver.getAll();}
    function upsert(item){if(!item||!item.id||!item.recordId)throw new Error('waiting_item_required');return mutate(function(){return driver.put(copy(item));});}
    function remove(id){return mutate(function(){return driver.remove(id);});}
    function replaceAll(items){return mutate(function(){return driver.replaceAll(copy(items||[]));});}
    return Object.freeze({list:list,upsert:upsert,remove:remove,replaceAll:replaceAll});
  }
  return Object.freeze({create:create,browserDriver:browserDriver,memoryDriver:memoryDriver,store:STORE});
});
