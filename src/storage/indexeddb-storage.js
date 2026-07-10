(function(global){
  var STORE_NAMES=['records','settings','conversations','subscriptions','feed_items','migrations','audit_log','quarantined_records'];
  var dbPromise=null;
  function requestResult(request){return new Promise(function(resolve,reject){request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error||new Error('indexeddb_request_failed'));};});}
  function open(){
    if(dbPromise)return dbPromise;
    if(!global.indexedDB)return Promise.reject(new Error('indexeddb_unavailable'));
    dbPromise=new Promise(function(resolve,reject){
      var request=global.indexedDB.open(LOCAL_DB_NAME,LOCAL_DB_VERSION);
      request.onupgradeneeded=function(){var db=request.result;STORE_NAMES.forEach(function(name){if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:'id'});});};
      request.onsuccess=function(){var db=request.result;db.onversionchange=function(){db.close();dbPromise=null;};resolve(db);};
      request.onerror=function(){dbPromise=null;reject(request.error||new Error('indexeddb_open_failed'));};
      request.onblocked=function(){dbPromise=null;reject(new Error('indexeddb_open_blocked'));};
    });
    return dbPromise;
  }
  function withTransaction(storeNames,mode,work){return open().then(function(db){return new Promise(function(resolve,reject){var tx=db.transaction(storeNames,mode);var result;try{result=work(tx);}catch(error){tx.abort();reject(error);return;}tx.oncomplete=function(){resolve(result);};tx.onerror=function(){reject(tx.error||new Error('indexeddb_transaction_failed'));};tx.onabort=function(){reject(tx.error||new Error('indexeddb_transaction_aborted'));};});});}
  function get(store,id){return open().then(function(db){return requestResult(db.transaction(store,'readonly').objectStore(store).get(id));});}
  function getAll(store){return open().then(function(db){return requestResult(db.transaction(store,'readonly').objectStore(store).getAll());});}
  function count(store){return open().then(function(db){return requestResult(db.transaction(store,'readonly').objectStore(store).count());});}
  function put(store,value){return withTransaction([store],'readwrite',function(tx){tx.objectStore(store).put(value);return value;});}
  function remove(store,id){return withTransaction([store],'readwrite',function(tx){tx.objectStore(store).delete(id);return true;});}
  function replaceRecords(records,quarantined){return withTransaction(['records','quarantined_records','audit_log'],'readwrite',function(tx){var recordStore=tx.objectStore('records');recordStore.clear();records.forEach(function(record){recordStore.put(record);});var quarantineStore=tx.objectStore('quarantined_records');(quarantined||[]).forEach(function(item){quarantineStore.put(item);});tx.objectStore('audit_log').put({id:'audit_'+Date.now().toString(36),type:'records_replace',count:records.length,quarantined:(quarantined||[]).length,at:new Date().toISOString()});return {count:records.length,quarantined:(quarantined||[]).length};});}
  function migrateLegacy(records,quarantined,marker){return withTransaction(['records','quarantined_records','migrations','audit_log'],'readwrite',function(tx){var recordStore=tx.objectStore('records');recordStore.clear();records.forEach(function(record){recordStore.put(record);});var quarantineStore=tx.objectStore('quarantined_records');(quarantined||[]).forEach(function(item){quarantineStore.put(item);});tx.objectStore('migrations').put(marker);tx.objectStore('audit_log').put({id:'audit_'+Date.now().toString(36),type:'legacy_migration',count:records.length,quarantined:(quarantined||[]).length,at:new Date().toISOString()});return {count:records.length,quarantined:(quarantined||[]).length};});}
  global.ShikeIndexedDb=Object.freeze({open:open,get:get,getAll:getAll,count:count,put:put,remove:remove,replaceRecords:replaceRecords,migrateLegacy:migrateLegacy,stores:STORE_NAMES.slice()});
})(window);
