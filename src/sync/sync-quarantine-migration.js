/**
 * Sync Quarantine Migration Module
 * v2.0.0-rc5.1 Security Quarantine
 */
(function(global){
  'use strict';
  var SK = {
    IDENTITY:'shike_device_identity',QUEUE:'shike_sync_queue',ENDPOINT:'shike_sync_endpoint',
    MODE:'shike_sync_mode',KNOWN_DEVICES:'shike_known_devices',
    MIGRATION_DONE:'shike_sync_quarantine_migrated',MIGRATION_LOG:'shike_sync_quarantine_log'
  };
  function safeGet(k){try{var r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch(e){return null;}}
  function safeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function safeRemove(k){try{localStorage.removeItem(k);}catch(e){}}
  function log(msg){try{var logs=safeGet(SK.MIGRATION_LOG)||[];logs.push({time:new Date().toISOString(),msg:msg});if(logs.length>50)logs=logs.slice(-50);safeSet(SK.MIGRATION_LOG,logs);}catch(e){}}

  function createSafetySnapshot(){
    try{if(global.ShikeSnapshotService&&global.ShikeSnapshotService.createSnapshot){
      var recs=(typeof records!=='undefined')?records:[];
      return global.ShikeSnapshotService.createSnapshot('pre-quarantine-migration',recs);
    }}catch(e){log('snapshot failed');}
    return Promise.resolve(null);
  }

  function validateOperation(op){
    if(!op||typeof op!=='object')return null;
    if(op.type==='create'||op.type==='update'){
      if(!op.record||typeof op.record!=='object'||!op.record.id)return null;
      return{type:op.type,record:{id:String(op.record.id),title:String(op.record.title||op.record.text||''),text:String(op.record.text||op.record.title||''),dateKey:op.record.dateKey||null,time:op.record.time||null,type:op.record.type||'note',createdAt:op.record.createdAt||new Date().toISOString(),updatedAt:op.record.updatedAt||new Date().toISOString()}};
    }
    if(op.type==='delete'){if(!op.recordId)return null;return{type:'delete',recordId:String(op.recordId)};}
    return null;
  }

  function recordExists(id){if(typeof records==='undefined'||!Array.isArray(records))return false;return records.some(function(r){return r.id===id;});}

  function recoverOperations(validOps){
    var recovered=0,skipped=0;
    if(typeof records==='undefined'||!Array.isArray(records))return{recovered:0,skipped:validOps.length,error:'records unavailable'};
    validOps.forEach(function(op){
      try{
        if(op.type==='create'){if(recordExists(op.record.id)){skipped++;return;}records.push(op.record);recovered++;}
        else if(op.type==='update'){var idx=records.findIndex(function(r){return r.id===op.record.id;});
          if(idx>=0){records[idx]=Object.assign({},records[idx],op.record,{updatedAt:new Date().toISOString()});recovered++;}
          else if(!recordExists(op.record.id)){records.push(op.record);recovered++;}else{skipped++;}}
        else if(op.type==='delete'){var di=records.findIndex(function(r){return r.id===op.recordId;});if(di>=0){records.splice(di,1);recovered++;}else{skipped++;}}
      }catch(e){skipped++;log('op error');}
    });
    try{if(typeof saveRecords==='function')saveRecords();}catch(e){log('saveRecords failed');}
    return{recovered:recovered,skipped:skipped};
  }

  function sanitizeIdentity(){
    var identity=safeGet(SK.IDENTITY);if(!identity)return{removed:false};
    var hadPrivate=!!identity.privateKey;delete identity.privateKey;
    identity.quarantined=true;identity.quarantinedAt=new Date().toISOString();
    safeSet(SK.IDENTITY,identity);return{removed:hadPrivate};
  }

  function isDone(){return !!safeGet(SK.MIGRATION_DONE);}

  function migrate(){
    return new Promise(function(resolve){
      if(isDone()){resolve({ok:true,message:'already migrated',migrated:false});return;}
      log('migration started');
      createSafetySnapshot().then(function(){
        var queue=safeGet(SK.QUEUE)||[];var qLen=Array.isArray(queue)?queue.length:0;
        log('queue: '+qLen);
        var recResult={recovered:0,skipped:0};
        if(qLen>0){
          var validOps=[];
          queue.forEach(function(op){var v=validateOperation(op);if(v)validOps.push(v);});
          log('valid ops: '+validOps.length);
          recResult=recoverOperations(validOps);
          log('recovered: '+recResult.recovered+' skipped: '+recResult.skipped);
        }
        var idResult=sanitizeIdentity();log('private key removed: '+idResult.removed);
        safeRemove(SK.ENDPOINT);safeRemove(SK.KNOWN_DEVICES);safeSet(SK.MODE,'disabled');
        if(!recResult.error){safeRemove(SK.QUEUE);log('queue cleared');}else{log('queue preserved');}
        var result={ok:true,migrated:true,message:'同步安全隔离完成：已清除明文私钥，本地操作已恢复，远程同步已禁用。',queueLength:qLen,recovered:recResult.recovered,skipped:recResult.skipped,privateKeyRemoved:idResult.removed,endpointRemoved:true};
        safeSet(SK.MIGRATION_DONE,{at:new Date().toISOString(),result:result});
        log('migration completed');resolve(result);
      }).catch(function(err){log('migration failed');resolve({ok:false,migrated:false,message:'迁移过程中出现问题，同步已禁用。'});});
    });
  }

  function getStatus(){
    return{migrated:isDone(),migrationInfo:safeGet(SK.MIGRATION_DONE),hasQueue:!!safeGet(SK.QUEUE),queueLength:(safeGet(SK.QUEUE)||[]).length,hasIdentity:!!safeGet(SK.IDENTITY),hasPrivateKey:!!(safeGet(SK.IDENTITY)&&safeGet(SK.IDENTITY).privateKey),hasEndpoint:!!safeGet(SK.ENDPOINT),logs:safeGet(SK.MIGRATION_LOG)||[]};
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(migrate,500);});}
  else{setTimeout(migrate,500);}

  global.ShikeSyncQuarantineMigration=Object.freeze({migrate:migrate,getStatus:getStatus,STORAGE_KEYS:SK});
})(typeof window!=='undefined'?window:this);
