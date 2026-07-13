(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeCorrectionStore=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var STORE='temporal_corrections';var SECRET=/(?:password|密码|token|api[_-]?key|private[_-]?key|私钥)\s*[:=：]\s*\S+/ig;
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function clean(value){return String(value||'').replace(SECRET,function(match){return match.split(/[:=：]/)[0]+':[已移除]';}).slice(0,10000);}
  function browserDriver(){
    if(!globalThis.ShikeIndexedDb)throw new Error('correction_store_unavailable');
    return {list:function(){return globalThis.ShikeIndexedDb.getAll(STORE);},put:function(item){return globalThis.ShikeIndexedDb.put(STORE,item);},async clear(){var db=await globalThis.ShikeIndexedDb.open();return new Promise(function(resolve,reject){var tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=function(){resolve(true);};tx.onerror=function(){reject(tx.error);};});}};
  }
  function memoryDriver(initial){var items=copy(initial||[]);return {async list(){return copy(items);},async put(item){items.push(copy(item));return copy(item);},async clear(){items=[];return true;}};}
  function create(driver){
    driver=driver||browserDriver();var queue=Promise.resolve();
    function record(input){
      input=input||{};var item={id:'correction_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),schemaVersion:1,eventType:clean(input.eventType),recordId:clean(input.recordId),draftId:clean(input.draftId),sourceText:clean(input.sourceText),originalType:clean(input.originalType),correctedType:clean(input.correctedType),modifiedFields:Array.isArray(input.modifiedFields)?input.modifiedFields.map(clean):[],createdAt:new Date().toISOString()};
      var run=queue.then(function(){return driver.put(item);});queue=run.catch(function(){});return run;
    }
    async function list(){await queue;var items=await driver.list();return items.sort(function(a,b){return b.createdAt.localeCompare(a.createdAt);});}
    async function clear(){await queue;return driver.clear();}
    async function exportData(){var items=await list();return {app:'shike',kind:'temporal_corrections',schemaVersion:1,exportedAt:new Date().toISOString(),count:items.length,items:items};}
    return Object.freeze({record:record,list:list,clear:clear,exportData:exportData});
  }
  return Object.freeze({create:create,browserDriver:browserDriver,memoryDriver:memoryDriver,store:STORE});
});
