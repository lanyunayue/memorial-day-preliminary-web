(function(global,factory){
  var nodeCrypto=null;if(typeof module!=='undefined'&&module.exports)nodeCrypto=require('crypto');
  var api=factory(nodeCrypto);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalOperation=api;
})(typeof window!=='undefined'?window:globalThis,function(nodeCrypto){
  'use strict';
  var SCHEMA_VERSION=1;
  var STATUSES=['prepared','record_written','sidecars_written','committed','compensating','recovered','quarantined'];
  var TYPES=['create_record','update_record','complete_record','delete_record','restore_record','purge_record','rebuild_graph','import_backup','restore_snapshot','confirm_batch'];
  var SECRET=/(?:password|密码|token|api[_-]?key|private[_-]?key|私钥)\s*[:=：]\s*\S+/ig;
  function stable(value){
    if(value===null||typeof value!=='object')return JSON.stringify(value);
    if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
    return '{'+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+stable(value[key]);}).join(',')+'}';
  }
  async function checksum(value){
    var source=stable(value);
    if(nodeCrypto)return nodeCrypto.createHash('sha256').update(source,'utf8').digest('hex');
    if(!globalThis.crypto||!globalThis.crypto.subtle)throw new Error('checksum_unavailable');
    var bytes=new TextEncoder().encode(source);var digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(function(item){return item.toString(16).padStart(2,'0');}).join('');
  }
  function cleanError(error){return String(error&&error.message||error||'').replace(SECRET,function(match){return match.split(/[:=：]/)[0]+':[redacted]';}).slice(0,500);}
  function requireStatus(status){if(!STATUSES.includes(status))throw new Error('invalid_operation_status');return status;}
  function create(input){
    input=input||{};if(!input.operationId||!TYPES.includes(input.operationType)||!input.payloadChecksum)throw new Error('invalid_temporal_operation');
    var now=input.startedAt||new Date().toISOString();
    return {id:input.operationId,operationId:input.operationId,operationType:input.operationType,recordId:input.recordId||'',draftId:input.draftId||'',resourceId:input.resourceId||'',startedAt:now,updatedAt:now,completedSteps:[],pendingSteps:(input.pendingSteps||[]).slice(),payloadChecksum:input.payloadChecksum,status:'prepared',retryCount:0,lastError:'',schemaVersion:SCHEMA_VERSION};
  }
  function transition(operation,status,step,error){
    var next=JSON.parse(JSON.stringify(operation));next.status=requireStatus(status);next.updatedAt=new Date().toISOString();
    if(step&&!next.completedSteps.includes(step))next.completedSteps.push(step);
    if(step)next.pendingSteps=next.pendingSteps.filter(function(item){return item!==step;});
    if(error)next.lastError=cleanError(error);return next;
  }
  return Object.freeze({SCHEMA_VERSION:SCHEMA_VERSION,STATUSES:Object.freeze(STATUSES.slice()),TYPES:Object.freeze(TYPES.slice()),stable:stable,checksum:checksum,cleanError:cleanError,create:create,transition:transition});
});
