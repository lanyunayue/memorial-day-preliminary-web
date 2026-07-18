(function(global){
  'use strict';

  var FORMAT='shike-portable-export';
  var VERSION=1;
  var MAX_INPUT_BYTES=10*1024*1024;
  var MAX_RECORDS=10000;
  var RECORD_TYPES=['task','commitment','waiting-for','daily-check-in','sleep-log','load-item','load-snapshot','deload-plan','recovery-suggestion','suggestion-feedback','intervention-preference','safety-route','operation-journal','tonight-focus','day-end-record'];
  var STATES=['ACTIVE','IN_PROGRESS','COMPLETED','CANCELLED','DEFERRED','PARKED','ARCHIVED','DELETED'];
  var PLATFORMS=['web','android','harmonyos'];
  var MATERIALIZABLE_TYPES=['task','commitment','waiting-for'];
  var KNOWN_TOP_LEVEL=['format','portableExportVersion','sourcePlatform','sourceSchemaVersion','sourceAppVersion','exportedAt','timezone','recordCount','records','settings','checksum'];
  var UUID_PATTERN=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  var CHECKSUM_PATTERN=/^sha256:[0-9a-f]{64}$/;

  function copy(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
  function canonicalize(value){
    if(value===null||typeof value!=='object')return JSON.stringify(value);
    if(Array.isArray(value))return '['+value.map(canonicalize).join(',')+']';
    return '{'+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+canonicalize(value[key]);}).join(',')+'}';
  }
  function utf8(value){return new global.TextEncoder().encode(value);}
  async function sha256(value){
    if(!global.crypto||!global.crypto.subtle)throw new Error('secure_digest_unavailable');
    var digest=await global.crypto.subtle.digest('SHA-256',utf8(value));
    return Array.from(new Uint8Array(digest)).map(function(byte){return byte.toString(16).padStart(2,'0');}).join('');
  }
  async function checksum(bundle){
    var unsigned=copy(bundle)||{};
    delete unsigned.checksum;
    return 'sha256:'+await sha256(canonicalize(unsigned));
  }
  async function finalizeBundle(bundle){
    var completed=Object.assign({},bundle,{recordCount:Array.isArray(bundle.records)?bundle.records.length:0});
    completed.checksum=await checksum(completed);
    return completed;
  }
  function validDateTime(value){return typeof value==='string'&&Number.isFinite(Date.parse(value));}
  function validateRecord(record,index,ids){
    var errors=[];
    var prefix='record_'+index+'_';
    if(!record||typeof record!=='object'||Array.isArray(record))return [prefix+'object'];
    if(RECORD_TYPES.indexOf(record.type)<0)errors.push(prefix+'type');
    if(typeof record.portableId!=='string'||!UUID_PATTERN.test(record.portableId))errors.push(prefix+'portable_id');
    else if(ids.has(record.portableId))errors.push(prefix+'duplicate_id');
    else ids.add(record.portableId);
    if(typeof record.sourcePlatformId!=='string'||!record.sourcePlatformId.length||record.sourcePlatformId.length>256)errors.push(prefix+'source_id');
    if(!Number.isInteger(record.schemaVersion)||record.schemaVersion<1)errors.push(prefix+'schema_version');
    if(!validDateTime(record.createdAt))errors.push(prefix+'created_at');
    if(!validDateTime(record.updatedAt))errors.push(prefix+'updated_at');
    if(record.state!==undefined&&STATES.indexOf(record.state)<0)errors.push(prefix+'state');
    if(!record.data||typeof record.data!=='object'||Array.isArray(record.data))errors.push(prefix+'data');
    return errors;
  }
  async function validateBundle(bundle){
    var errors=[];
    if(!bundle||typeof bundle!=='object'||Array.isArray(bundle))return ['top_level_not_object'];
    if(bundle.format!==FORMAT)errors.push('format');
    if(bundle.portableExportVersion!==VERSION)errors.push('portable_export_version');
    if(PLATFORMS.indexOf(bundle.sourcePlatform)<0)errors.push('source_platform');
    if(!Number.isInteger(bundle.sourceSchemaVersion)||bundle.sourceSchemaVersion<1)errors.push('source_schema_version');
    if(typeof bundle.sourceAppVersion!=='string'||!bundle.sourceAppVersion.length||bundle.sourceAppVersion.length>64)errors.push('source_app_version');
    if(!validDateTime(bundle.exportedAt))errors.push('exported_at');
    if(typeof bundle.timezone!=='string'||!bundle.timezone.length||bundle.timezone.length>128)errors.push('timezone');
    if(!bundle.settings||typeof bundle.settings!=='object'||Array.isArray(bundle.settings))errors.push('settings');
    if(!Array.isArray(bundle.records))errors.push('records');
    else{
      if(bundle.records.length>MAX_RECORDS)errors.push('record_limit');
      if(bundle.recordCount!==bundle.records.length)errors.push('record_count');
      var ids=new Set();
      bundle.records.slice(0,MAX_RECORDS).forEach(function(record,index){errors=errors.concat(validateRecord(record,index,ids));});
    }
    if(typeof bundle.checksum!=='string'||!CHECKSUM_PATTERN.test(bundle.checksum))errors.push('checksum_format');
    else if(bundle.checksum!==await checksum(bundle))errors.push('checksum_mismatch');
    return errors;
  }
  async function deterministicPortableId(sourceId){
    var digest=await sha256('shike:web:portable-id:'+String(sourceId));
    var bytes=[];
    for(var i=0;i<32;i+=2)bytes.push(parseInt(digest.slice(i,i+2),16));
    bytes[6]=(bytes[6]&15)|80;
    bytes[8]=(bytes[8]&63)|128;
    var hex=bytes.map(function(byte){return byte.toString(16).padStart(2,'0');}).join('');
    return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20,32);
  }
  function iso(value,fallback){
    var parsed=value instanceof Date?value.getTime():(typeof value==='number'?value:Date.parse(value));
    return Number.isFinite(parsed)?new Date(parsed).toISOString():fallback;
  }
  function portableState(record){
    if(record.deletedAt||record.recordState==='tombstoned')return 'DELETED';
    if(record.archived||record.recordState==='archived')return 'ARCHIVED';
    var state=String(record.recordState||record.status||'active').toLowerCase();
    if(state==='completed'||state==='done'||state==='resolved'||state==='fulfilled')return 'COMPLETED';
    if(state==='cancelled'||state==='canceled')return 'CANCELLED';
    if(state==='deferred'||state==='snoozed')return 'DEFERRED';
    if(state==='parked')return 'PARKED';
    if(state==='in_progress'||state==='in-progress')return 'IN_PROGRESS';
    return 'ACTIVE';
  }
  function portableType(record){
    if(RECORD_TYPES.indexOf(record.portableType)>=0)return record.portableType;
    if(record.temporalType==='commitment')return 'commitment';
    if(record.temporalType==='waiting-for')return 'waiting-for';
    return 'task';
  }
  function sanitizeTombstone(record){
    if(record.state!=='DELETED')return copy(record);
    return {
      type:record.type,
      portableId:record.portableId,
      sourcePlatformId:record.sourcePlatformId,
      schemaVersion:record.schemaVersion,
      createdAt:record.createdAt,
      updatedAt:record.updatedAt,
      state:'DELETED',
      data:{}
    };
  }
  async function recordFromLegacy(record,base,nowIso){
    var sourceId=String(record.id||record.sourcePlatformId||'record');
    var portableId=UUID_PATTERN.test(String(record.portableId||''))?record.portableId:await deterministicPortableId(sourceId);
    var output=base?copy(base):{};
    var data=output.data&&typeof output.data==='object'&&!Array.isArray(output.data)?copy(output.data):{};
    var values={
      title:String(record.title||record.rawText||record.note||'').trim()||'未命名记录',
      note:String(record.note||''),
      rawText:String(record.rawText||record.sourceText||''),
      dateText:String(record.dateText||''),
      localDate:String(record.dateKey||''),
      localTime:String(record.timeText||record.time||''),
      recordKind:String(record.recordKind||record.type||'note'),
      repeat:String(record.repeat||'none')
    };
    if(base){
      Object.keys(values).forEach(function(key){if(Object.prototype.hasOwnProperty.call(data,key))data[key]=values[key];});
      if(data.legacyRecord&&typeof data.legacyRecord==='object'&&!Array.isArray(data.legacyRecord)){
        Object.keys(data.legacyRecord).forEach(function(key){if(record[key]!==undefined)data.legacyRecord[key]=copy(record[key]);});
      }
    }else data=Object.assign({},data,values,{legacyRecord:copy(record)});
    output=Object.assign({},output,{
      type:portableType(record),
      portableId:portableId,
      sourcePlatformId:String(output.sourcePlatformId||sourceId),
      schemaVersion:Number.isInteger(output.schemaVersion)&&output.schemaVersion>0?output.schemaVersion:1,
      createdAt:iso(record.createdAt,output.createdAt||nowIso),
      updatedAt:iso(record.updatedAt,output.updatedAt||nowIso),
      state:portableState(record),
      data:data
    });
    return sanitizeTombstone(output);
  }
  function recordFromEntity(entity){
    if(!entity)return null;
    if(entity.canonicalRecord&&typeof entity.canonicalRecord==='object')return copy(entity.canonicalRecord);
    if(typeof entity.canonical==='string'){
      try{return JSON.parse(entity.canonical);}catch(error){return null;}
    }
    return null;
  }
  function entityFromRecord(record,materializedId){
    var clean=sanitizeTombstone(record);
    return {
      id:clean.portableId,
      canonical:canonicalize(clean),
      canonicalRecord:clean,
      type:clean.type,
      state:clean.state||'ACTIVE',
      updatedAt:clean.updatedAt,
      materializedId:materializedId||''
    };
  }
  function timezone(){
    try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(error){return 'UTC';}
  }
  async function buildBundle(input){
    input=input||{};
    var nowIso=iso(input.exportedAt,new Date().toISOString());
    var stored=new Map();
    (input.portableEntities||[]).forEach(function(entity){var record=recordFromEntity(entity);if(record&&UUID_PATTERN.test(String(record.portableId||'')))stored.set(record.portableId,{record:record,entity:entity});});
    var output=new Map();
    var localPortableIds=new Set();
    var localRecords=Array.isArray(input.records)?input.records:[];
    for(var i=0;i<localRecords.length;i++){
      var local=localRecords[i]||{};
      var knownId=UUID_PATTERN.test(String(local.portableId||''))?local.portableId:await deterministicPortableId(String(local.id||i));
      var existing=stored.get(knownId);
      var converted=await recordFromLegacy(local,existing&&existing.record,nowIso);
      output.set(converted.portableId,converted);
      localPortableIds.add(converted.portableId);
    }
    stored.forEach(function(value,id){if(!localPortableIds.has(id))output.set(id,sanitizeTombstone(value.record));});
    var envelope=input.envelope&&typeof input.envelope==='object'?input.envelope:{};
    var extras=envelope.extras&&typeof envelope.extras==='object'?copy(envelope.extras):{};
    var preservedSettings=envelope.settings&&typeof envelope.settings==='object'?copy(envelope.settings):{};
    var localSettings=input.settings||{};
    var bundle=Object.assign({},extras,{
      format:FORMAT,
      portableExportVersion:VERSION,
      sourcePlatform:'web',
      sourceSchemaVersion:5,
      sourceAppVersion:String(input.appVersion||'unknown'),
      exportedAt:nowIso,
      timezone:input.timezone||timezone(),
      records:Array.from(output.values()).sort(function(a,b){return a.portableId.localeCompare(b.portableId);}),
      settings:Object.assign({},preservedSettings,{
        theme:String(localSettings.theme||preservedSettings.theme||'system'),
        locale:String(localSettings.language||localSettings.locale||preservedSettings.locale||'zh-CN'),
        reducedMotion:typeof localSettings.reducedMotion==='boolean'?localSettings.reducedMotion:!!preservedSettings.reducedMotion,
        highContrast:typeof localSettings.highContrast==='boolean'?localSettings.highContrast:!!preservedSettings.highContrast
      })
    });
    return finalizeBundle(bundle);
  }
  function isMaterializable(record){
    if(MATERIALIZABLE_TYPES.indexOf(record.type)<0||record.schemaVersion>1)return false;
    if(record.state==='DELETED')return true;
    var data=record.data||{};
    return !!String(data.title||(data.legacyRecord&&data.legacyRecord.title)||'').trim();
  }
  function extrasFromBundle(bundle){
    var extras={};
    Object.keys(bundle).forEach(function(key){if(KNOWN_TOP_LEVEL.indexOf(key)<0)extras[key]=copy(bundle[key]);});
    return extras;
  }
  async function prepareImport(raw,existingEntities){
    var size=utf8(String(raw||'')).byteLength;
    if(size>MAX_INPUT_BYTES)return {preview:{create:0,update:0,unchanged:0,conflict:0,unsupported:0,invalid:1,total:0,errors:['input_too_large'],canImport:false}};
    var bundle;
    try{bundle=JSON.parse(raw);}catch(error){return {preview:{create:0,update:0,unchanged:0,conflict:0,unsupported:0,invalid:1,total:0,errors:['invalid_json'],canImport:false}};}
    var errors=await validateBundle(bundle);
    var total=Array.isArray(bundle.records)?bundle.records.length:0;
    if(errors.length)return {bundle:bundle,preview:{create:0,update:0,unchanged:0,conflict:0,unsupported:0,invalid:errors.length,total:total,errors:errors,canImport:false}};
    var existing=new Map();
    (existingEntities||[]).forEach(function(entity){var record=recordFromEntity(entity);if(record)existing.set(record.portableId,{entity:entity,record:record,canonical:canonicalize(record)});});
    var prepared=[];
    var counts={create:0,update:0,unchanged:0,conflict:0,unsupported:0,invalid:0,total:total,errors:[]};
    bundle.records.forEach(function(rawRecord){
      var record=sanitizeTombstone(rawRecord);
      var incomingCanonical=canonicalize(record);
      var current=existing.get(record.portableId);
      var decision;
      if(!current)decision='create';
      else if(current.canonical===incomingCanonical)decision='unchanged';
      else if(Date.parse(record.updatedAt)>Date.parse(current.record.updatedAt))decision='update';
      else decision='conflict';
      counts[decision]++;
      var materializable=isMaterializable(record);
      if(!materializable)counts.unsupported++;
      prepared.push({record:record,decision:decision,materializable:materializable,existingMaterializedId:current&&current.entity.materializedId||''});
    });
    counts.canImport=counts.conflict===0&&counts.invalid===0;
    return {
      bundle:bundle,
      records:prepared,
      extras:extrasFromBundle(bundle),
      settings:copy(bundle.settings),
      preview:counts,
      operationId:'portable_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)
    };
  }
  function stateToLegacy(state){
    return ({COMPLETED:'completed',CANCELLED:'cancelled',DEFERRED:'deferred',PARKED:'parked',ARCHIVED:'archived',IN_PROGRESS:'in_progress'}[state]||'active');
  }
  function materializeRecord(item,currentRecords){
    var portable=item.record;
    var data=portable.data||{};
    var legacy=data.legacyRecord&&typeof data.legacyRecord==='object'&&!Array.isArray(data.legacyRecord)?copy(data.legacyRecord):{};
    var candidateIds=[item.existingMaterializedId,legacy.id,portable.sourcePlatformId];
    var existing=null;
    currentRecords.some(function(record){
      if(record&&record.portableId===portable.portableId){existing=record;return true;}
      if(record&&candidateIds.indexOf(record.id)>=0){existing=record;return true;}
      return false;
    });
    var id=existing&&existing.id||legacy.id||'portable_'+portable.portableId.replace(/-/g,'');
    var record=Object.assign({},existing||{},legacy,{
      id:id,
      portableId:portable.portableId,
      portableType:portable.type,
      title:String(data.title||legacy.title||portable.type),
      note:String(data.note||legacy.note||''),
      rawText:String(data.rawText||legacy.rawText||data.title||legacy.title||''),
      dateText:String(data.dateText||legacy.dateText||data.localDate||''),
      dateKey:String(data.localDate||legacy.dateKey||''),
      timeText:String(data.localTime||legacy.timeText||''),
      recordKind:String(data.recordKind||legacy.recordKind||'reminder'),
      repeat:String(data.repeat||legacy.repeat||'none'),
      recordState:stateToLegacy(portable.state),
      archived:portable.state==='ARCHIVED',
      createdAt:Date.parse(portable.createdAt),
      updatedAt:Date.parse(portable.updatedAt)
    });
    return record;
  }
  function buildImportPlan(prepared,currentRecords,existingEntities){
    if(!prepared||!prepared.preview||!prepared.preview.canImport)throw new Error('portable_import_not_confirmable');
    var business=(currentRecords||[]).map(copy);
    var entities=new Map();
    (existingEntities||[]).forEach(function(entity){if(entity&&entity.id)entities.set(entity.id,copy(entity));});
    prepared.records.forEach(function(item){
      var record=item.record;
      if(item.decision==='conflict')return;
      if(record.state==='DELETED'){
        business=business.filter(function(local){return local.portableId!==record.portableId&&local.id!==item.existingMaterializedId;});
      }else if(item.materializable&&item.decision!=='unchanged'){
        var materialized=materializeRecord(item,business);
        business=business.filter(function(local){return local.id!==materialized.id&&local.portableId!==record.portableId;});
        business.push(materialized);
      }
      var materializedRecord=business.find(function(local){return local.portableId===record.portableId;});
      entities.set(record.portableId,entityFromRecord(record,materializedRecord&&materializedRecord.id||item.existingMaterializedId));
    });
    var ids=new Set();
    business.forEach(function(record,index){
      var base=String(record.id||'portable_record_'+index);
      var id=base;
      var suffix=1;
      while(ids.has(id)){id=base+'_'+suffix;suffix++;}
      record.id=id;
      ids.add(id);
    });
    var envelope={id:'portable-envelope-current',extras:copy(prepared.extras||{}),settings:copy(prepared.settings||{}),sourcePlatform:prepared.bundle.sourcePlatform,importedAt:new Date().toISOString(),checksum:prepared.bundle.checksum};
    var journal={
      id:'audit_'+prepared.operationId,
      type:'portable_import_v1',
      operationId:prepared.operationId,
      imported:prepared.preview.create+prepared.preview.update,
      unchanged:prepared.preview.unchanged,
      preservedOnly:prepared.preview.unsupported,
      recordCount:prepared.preview.total,
      checksum:prepared.bundle.checksum,
      at:new Date().toISOString()
    };
    return {businessRecords:business,portableEntities:Array.from(entities.values()),envelope:envelope,journal:journal};
  }

  global.ShikePortableExportV1=Object.freeze({
    FORMAT:FORMAT,
    VERSION:VERSION,
    MAX_INPUT_BYTES:MAX_INPUT_BYTES,
    MAX_RECORDS:MAX_RECORDS,
    RECORD_TYPES:RECORD_TYPES.slice(),
    STATES:STATES.slice(),
    canonicalize:canonicalize,
    checksum:checksum,
    finalizeBundle:finalizeBundle,
    validateBundle:validateBundle,
    deterministicPortableId:deterministicPortableId,
    buildBundle:buildBundle,
    prepareImport:prepareImport,
    buildImportPlan:buildImportPlan,
    entityFromRecord:entityFromRecord
  });
})(window);
