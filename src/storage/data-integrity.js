(function(global){
  var VALID_REPEATS={none:true,daily:true,weekly:true,monthly:true,yearly:true};
  function text(value,max){return String(value==null?'':value).trim().slice(0,max);}
  function hash(value){var source=String(value);var result=2166136261;for(var i=0;i<source.length;i++){result^=source.charCodeAt(i);result=Math.imul(result,16777619);}return ('00000000'+(result>>>0).toString(16)).slice(-8);}
  function fingerprint(record){return hash([record.title,record.recordKind||record.type||'',record.dateKey||'',record.time||record.timeText||'',record.repeat||'none',record.note||''].join('|'));}
  function makeId(index){return 'r_migrated_'+Date.now().toString(36)+'_'+index.toString(36)+'_'+Math.random().toString(36).slice(2,6);}
  function normalizeRecord(raw,index,seen){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('record_not_object');
    var title=text(raw.title||raw.name,500);if(!title)throw new Error('record_title_missing');
    var id=text(raw.id,160)||makeId(index);while(seen.has(id))id=makeId(index);seen.add(id);
    var dateKey=/^\d{4}-\d{2}-\d{2}$/.test(String(raw.dateKey||''))?String(raw.dateKey):'';
    var timeValue=text(raw.time||raw.timeText,16);if(timeValue&&!/^([01]?\d|2[0-3]):[0-5]\d$/.test(timeValue))timeValue='';
    var repeat=VALID_REPEATS[raw.repeat]?raw.repeat:'none';
    var record={...raw,id:id,title:title,type:text(raw.type||raw.recordKind||'note',40),recordKind:text(raw.recordKind||raw.type||'note',40),dateKey:dateKey,time:timeValue,timeText:timeValue,repeat:repeat,note:text(raw.note,5000),sourceText:text(raw.sourceText||raw.rawText,5000),rawText:text(raw.rawText||raw.sourceText,5000),pinned:!!raw.pinned,createdAt:Number(raw.createdAt)||Date.now(),updatedAt:Number(raw.updatedAt)||Number(raw.createdAt)||Date.now(),schemaVersion:2,deletedAt:raw.deletedAt||null,metadata:raw.metadata&&typeof raw.metadata==='object'&&!Array.isArray(raw.metadata)?raw.metadata:{}};
    record.contentFingerprint=fingerprint(record);return record;
  }
  function classify(records){
    var valid=[];var quarantined=[];var seen=new Set();
    (Array.isArray(records)?records:[]).forEach(function(raw,index){try{valid.push(normalizeRecord(raw,index,seen));}catch(error){quarantined.push({id:'q_'+Date.now().toString(36)+'_'+index,reason:error.message,raw:raw,quarantinedAt:new Date().toISOString(),schemaVersion:2});}});
    return {valid:valid,quarantined:quarantined,total:Array.isArray(records)?records.length:0};
  }
  function checksumRecords(records){return hash(JSON.stringify(Array.isArray(records)?records:[]));}
  global.ShikeDataIntegrity=Object.freeze({normalizeRecord:normalizeRecord,classify:classify,fingerprint:fingerprint,checksumRecords:checksumRecords});
})(window);
