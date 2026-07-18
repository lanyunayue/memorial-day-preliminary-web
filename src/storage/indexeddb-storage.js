(function(global){
  var STORE_NAMES=[
    'records','settings','conversations','subscriptions','feed_items','migrations','audit_log','quarantined_records',
    'portable_records','portable_envelopes',
    'temporal_drafts','temporal_nodes','temporal_edges','temporal_waiting','temporal_corrections','temporal_meta','temporal_tombstones',
    'temporal_operations','temporal_operation_quarantine','temporal_locks','temporal_adaptation_rules'
  ];
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
  function replaceRecords(records,quarantined){
    return withTransaction(['records','quarantined_records','audit_log'],'readwrite',function(tx){
      var recordStore=tx.objectStore('records');
      recordStore.clear();
      records.forEach(function(record){recordStore.put(record);});
      var quarantineStore=tx.objectStore('quarantined_records');
      (quarantined||[]).forEach(function(item){quarantineStore.put(item);});
      tx.objectStore('audit_log').put({
        id:'audit_'+Date.now().toString(36),
        type:'records_replace',
        count:records.length,
        quarantined:(quarantined||[]).length,
        at:new Date().toISOString()
      });
      return {count:records.length,quarantined:(quarantined||[]).length};
    });
  }
  function migrateLegacy(records,quarantined,marker){
    return withTransaction(['records','quarantined_records','migrations','audit_log'],'readwrite',function(tx){
      var recordStore=tx.objectStore('records');
      recordStore.clear();
      records.forEach(function(record){recordStore.put(record);});
      var quarantineStore=tx.objectStore('quarantined_records');
      (quarantined||[]).forEach(function(item){quarantineStore.put(item);});
      tx.objectStore('migrations').put(marker);
      tx.objectStore('audit_log').put({
        id:'audit_'+Date.now().toString(36),
        type:'legacy_migration',
        count:records.length,
        quarantined:(quarantined||[]).length,
        at:new Date().toISOString()
      });
      return {count:records.length,quarantined:(quarantined||[]).length};
    });
  }
  function importPortable(payload,options){
    options=options||{};
    return open().then(function(db){return new Promise(function(resolve,reject){
      var stores=['records','portable_records','portable_envelopes','audit_log'];
      var tx=db.transaction(stores,'readwrite');
      var recordStore=tx.objectStore('records');
      var portableStore=tx.objectStore('portable_records');
      var envelopeStore=tx.objectStore('portable_envelopes');
      var expectedRecords=payload.businessRecords||[];
      var expectedPortable=payload.portableEntities||[];
      var verificationFailed=false;
      function abort(code){
        if(verificationFailed)return;
        verificationFailed=true;
        try{tx.abort();}catch(error){}
        reject(new Error(code));
      }
      try{
        recordStore.clear();
        expectedRecords.forEach(function(record){recordStore.put(record);});
        portableStore.clear();
        expectedPortable.forEach(function(entity){portableStore.put(entity);});
        envelopeStore.put(payload.envelope);
        tx.objectStore('audit_log').put(payload.journal);
        if(options.failAfterWrite)throw new Error('portable_import_fault_injected');

        var recordCount=recordStore.count();
        recordCount.onsuccess=function(){if(recordCount.result!==expectedRecords.length)abort('portable_business_count_mismatch');};
        var portableCount=portableStore.count();
        portableCount.onsuccess=function(){if(portableCount.result!==expectedPortable.length)abort('portable_record_count_mismatch');};
        var envelopeRequest=envelopeStore.get(payload.envelope.id);
        envelopeRequest.onsuccess=function(){
          var storedEnvelope=envelopeRequest.result;
          if(!storedEnvelope||storedEnvelope.checksum!==payload.envelope.checksum)abort('portable_envelope_verification_failed');
        };
        expectedPortable.forEach(function(entity){
          var request=portableStore.get(entity.id);
          request.onsuccess=function(){
            var stored=request.result;
            if(!stored||stored.canonical!==entity.canonical||stored.updatedAt!==entity.updatedAt||stored.state!==entity.state){
              abort('portable_post_write_verification_failed');
            }
          };
        });
      }catch(error){
        try{tx.abort();}catch(abortError){}
        reject(error);
        return;
      }
      tx.oncomplete=function(){
        if(!verificationFailed)resolve({recordCount:expectedRecords.length,portableCount:expectedPortable.length,operationId:payload.journal.operationId});
      };
      tx.onerror=function(){if(!verificationFailed)reject(tx.error||new Error('portable_import_transaction_failed'));};
      tx.onabort=function(){if(!verificationFailed)reject(tx.error||new Error('portable_import_transaction_aborted'));};
    });});
  }
  global.ShikeIndexedDb=Object.freeze({open:open,get:get,getAll:getAll,count:count,put:put,remove:remove,replaceRecords:replaceRecords,migrateLegacy:migrateLegacy,importPortable:importPortable,stores:STORE_NAMES.slice()});
})(window);
