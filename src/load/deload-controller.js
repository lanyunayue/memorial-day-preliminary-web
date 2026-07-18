(function(global,factory){
  var api=factory(global);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeDeLoad=api;
})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';

  var ACTIONS=Object.freeze(['CANCEL','DEFER','LOWER_STANDARD','RENEGOTIATE','KEEP_ONLY_ONE','SAVE_AND_END_DAY']);
  var CLOSED_STATES=Object.freeze(['completed','cancelled','canceled','archived','deleted','tombstoned']);

  function copy(value){return JSON.parse(JSON.stringify(value));}
  function pad(value){return String(value).padStart(2,'0');}
  function localDate(value){
    var date=new Date(value===undefined?Date.now():value);
    return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());
  }
  function tomorrow(value){var date=new Date(value===undefined?Date.now():value);date.setDate(date.getDate()+1);return localDate(date);}
  function isOpen(record){
    if(!record||record.archived||record.deletedAt)return false;
    return CLOSED_STATES.indexOf(String(record.recordState||record.status||'active').toLowerCase())<0;
  }
  function targetDate(record){return String(record&&record.dateKey||'');}
  function candidates(records,now){
    var today=localDate(now);
    return (records||[]).filter(function(record){return isOpen(record)&&targetDate(record)&&targetDate(record)<=today;}).sort(function(a,b){
      var dateOrder=targetDate(a).localeCompare(targetDate(b));
      if(dateOrder)return dateOrder;
      if(!!a.pinned!==!!b.pinned)return a.pinned?-1:1;
      return Number(a.createdAt||0)-Number(b.createdAt||0);
    });
  }
  function preview(records,now){
    var today=localDate(now);var list=candidates(records,now);var overdue=list.filter(function(record){return targetDate(record)<today;}).length;
    var band=list.length>=6?'HIGH':list.length>=3?'MEDIUM':'LOW';
    return {dateKey:today,count:list.length,overdue:overdue,band:band,candidates:list};
  }
  function uuid(){
    if(global.crypto&&typeof global.crypto.randomUUID==='function')return global.crypto.randomUUID();
    var seed='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return seed.replace(/[xy]/g,function(token){var value=Math.floor(Math.random()*16);return (token==='x'?value:(value&3)|8).toString(16);});
  }
  function portable(type,data,nowIso,state){
    var id=uuid();
    return {type:type,portableId:id,sourcePlatformId:'web:'+id,schemaVersion:1,createdAt:nowIso,updatedAt:nowIso,state:state||'ACTIVE',data:copy(data||{})};
  }
  function entity(record){return {id:record.portableId,canonical:JSON.stringify(record),canonicalRecord:copy(record),type:record.type,state:record.state,updatedAt:record.updatedAt,materializedId:''};}
  function apply(records,action,targetId,now){
    if(ACTIONS.indexOf(action)<0)throw new Error('unsupported_deload_action');
    var nowDate=new Date(now===undefined?Date.now():now);var nowIso=nowDate.toISOString();var model=preview(records,nowDate);var eligible=new Set(model.candidates.map(function(record){return String(record.id);}));
    var next=(records||[]).map(copy);var affected=[];
    if(action!=='SAVE_AND_END_DAY'&&!eligible.has(String(targetId||'')))throw new Error('deload_target_not_eligible');
    next.forEach(function(record){
      var id=String(record.id);
      if(action==='KEEP_ONLY_ONE'&&eligible.has(id)){
        record.tonightFocus=id===String(targetId);record.notTonight=id!==String(targetId);record.updatedAt=nowDate.getTime();affected.push(id);return;
      }
      if(id!==String(targetId))return;
      if(action==='CANCEL')record.recordState='cancelled';
      if(action==='DEFER'){record.recordState='deferred';record.dateKey=tomorrow(nowDate);record.postponeCount=Number(record.postponeCount||0)+1;}
      if(action==='LOWER_STANDARD')record.completionStandard='good_enough';
      if(action==='RENEGOTIATE')record.renegotiationNeeded=true;
      record.updatedAt=nowDate.getTime();affected.push(id);
    });
    var recordsToPersist=next.filter(function(record){return affected.indexOf(String(record.id))>=0;});
    var plan=portable('deload-plan',{action:action,dateKey:model.dateKey,targetRecordId:targetId||null,affectedRecordIds:affected,source:'USER_CONFIRMED'},nowIso);
    var extras=[];
    if(action==='KEEP_ONLY_ONE')extras.push(portable('tonight-focus',{dateKey:model.dateKey,targetRecordId:String(targetId),excludedRecordIds:affected.filter(function(id){return id!==String(targetId);})},nowIso));
    if(action==='SAVE_AND_END_DAY')extras.push(portable('day-end-record',{dateKey:model.dateKey,remainingCount:model.count,completedAll:false},nowIso,'COMPLETED'));
    var operationId=uuid();
    var journal=portable('operation-journal',{operationId:operationId,operationType:'DELOAD',action:action,targetRecordIds:affected,outcome:'COMMITTED'},nowIso,'COMPLETED');
    var portableRecords=[plan].concat(extras,[journal]);
    return {records:next,recordsToPersist:recordsToPersist,portableRecords:portableRecords,portableEntities:portableRecords.map(entity),operationId:operationId,affectedRecordIds:affected,model:model};
  }

  return Object.freeze({ACTIONS:ACTIONS,localDate:localDate,tomorrow:tomorrow,isOpen:isOpen,candidates:candidates,preview:preview,apply:apply});
});
