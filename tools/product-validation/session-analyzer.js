(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeSessionAnalyzer=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  var PARTICIPANT_PATTERN=/^[A-Z0-9][A-Z0-9_-]{2,31}$/;
  var SESSION_PATTERN=/^rs_[a-z0-9_]+$/i;
  var EVENT_PATTERN=/^re_[a-z0-9_]+$/i;
  var ROOT_FIELDS=['schema','schemaVersion','exportedAt','containsRawUserText','remoteAnalytics','sessions','events','metrics'];
  var SESSION_FIELDS=['sessionId','participantCode','startedAt','persisted','validationMode','revisit'];
  var EVENT_FIELDS=['id','eventType','properties','sessionId','participantCode','timestamp'];
  function eventApi(){
    if(global.ShikeResearchEventLog)return global.ShikeResearchEventLog;
    if(typeof require==='function')return require('../../src/research/local-event-log.js');
    throw new Error('Research event schema is unavailable.');
  }
  function validTime(value){return typeof value==='string'&&Number.isFinite(Date.parse(value));}
  function plain(value){return !!value&&typeof value==='object'&&!Array.isArray(value);}
  function assertFields(value,allowed,path){
    if(!plain(value))throw new Error('Expected an object at '+path+'.');var unknown=Object.keys(value).filter(function(key){return !allowed.includes(key);});
    if(unknown.length)throw new Error('Unknown research field at '+path+'.'+unknown[0]);
  }
  function metricApi(){
    if(global.ShikeValidationMetrics)return global.ShikeValidationMetrics;
    if(typeof require==='function')return require('../../src/research/validation-metrics.js');
    throw new Error('Research metrics schema is unavailable.');
  }
  function assertExport(payload){
    assertFields(payload,ROOT_FIELDS,'export');
    if(!payload||payload.schema!=='shike-product-validation-export'||payload.schemaVersion!==1)throw new Error('Unsupported Shike research export.');
    if(payload.containsRawUserText!==false)throw new Error('Export does not declare raw-text exclusion.');
    if(payload.remoteAnalytics!==false)throw new Error('Export does not declare remote analytics disabled.');
    if(!Array.isArray(payload.sessions)||!Array.isArray(payload.events))throw new Error('Export sessions or events are missing.');
    if(!validTime(payload.exportedAt))throw new Error('Export time is missing or invalid.');
    validateRelations(payload.sessions,payload.events,Date.parse(payload.exportedAt));
    var expected=metricApi().summarize(payload.events,payload.sessions);if(stable(payload.metrics)!==stable(expected))throw new Error('Export metrics do not match canonical event metrics.');return payload;
  }
  function validateRelations(sessions,events,exportedAt){
    var bySession=new Map();sessions.forEach(function(session,index){
      assertFields(session,SESSION_FIELDS,'sessions['+index+']');
      if(!session||!SESSION_PATTERN.test(session.sessionId||''))throw new Error('Invalid session ID at sessions['+index+'].');
      if(!PARTICIPANT_PATTERN.test(session.participantCode||''))throw new Error('Invalid participant code at sessions['+index+'].');
      if(!validTime(session.startedAt))throw new Error('Invalid session time at sessions['+index+'].');
      if(Date.parse(session.startedAt)>exportedAt)throw new Error('Session starts after its export at sessions['+index+'].');
      if(session.persisted!==true||session.validationMode!==true||typeof session.revisit!=='boolean')throw new Error('Invalid session provenance at sessions['+index+'].');
      if(bySession.has(session.sessionId))throw new Error('Duplicate session ID inside one export: '+session.sessionId);bySession.set(session.sessionId,session);
    });
    var eventIds=new Set();events.forEach(function(event,index){
      assertFields(event,EVENT_FIELDS,'events['+index+']');
      if(!event||!EVENT_PATTERN.test(event.id||''))throw new Error('Invalid event ID at events['+index+'].');
      if(eventIds.has(event.id))throw new Error('Duplicate event ID inside one export: '+event.id);eventIds.add(event.id);
      if(!validTime(event.timestamp))throw new Error('Invalid event time at events['+index+'].');
      var session=bySession.get(event.sessionId);if(!session)throw new Error('Event references an unknown session: '+event.sessionId);
      if(event.participantCode!==session.participantCode)throw new Error('Event participant does not match its session: '+event.id);
      if(Date.parse(event.timestamp)<Date.parse(session.startedAt)||Date.parse(event.timestamp)>exportedAt)throw new Error('Event time falls outside its session export window: '+event.id);
      if(!plain(event.properties))throw new Error('Event properties must be an object: '+event.id);
      var sanitized=eventApi().sanitize(event.eventType,event.properties||{});if(stable(sanitized)!==stable(event.properties||{}))throw new Error('Event properties are not canonical: '+event.id);
    });
  }
  function stable(value){
    if(Array.isArray(value))return '['+value.map(stable).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+stable(value[key]);}).join(',')+'}';return JSON.stringify(value);
  }
  function dedupe(values,key){
    var seen=new Map();return values.filter(function(item){var id=item&&item[key];var fingerprint=stable(item);if(!seen.has(id)){seen.set(id,fingerprint);return true;}if(seen.get(id)!==fingerprint)throw new Error('Conflicting duplicate '+key+': '+id);return false;});
  }
  function returnCount(sessions,minimumDays){
    var grouped={};sessions.forEach(function(item){if(!item.participantCode)return;(grouped[item.participantCode]||(grouped[item.participantCode]=[])).push(Date.parse(item.startedAt));});
    return Object.keys(grouped).filter(function(code){var times=grouped[code].filter(Number.isFinite).sort(function(a,b){return a-b;});return times.length>1&&times.some(function(time){return time-times[0]>=minimumDays*86400000;});}).length;
  }
  function combine(exports){
    var sessions=[];var events=[];(exports||[]).forEach(function(payload){payload=assertExport(payload);sessions=sessions.concat(payload.sessions);events=events.concat(payload.events);});
    sessions=dedupe(sessions,'sessionId');events=dedupe(events,'id');return {schema:'shike-product-validation-study-bundle',schemaVersion:1,containsRawUserText:false,sessions:sessions,events:events};
  }
  function analyze(exports){
    var bundle=combine(exports);var metrics=metricApi().summarize(bundle.events,bundle.sessions);return Object.assign({},metrics,{day2ReturnCount:returnCount(bundle.sessions,1),day7ReturnCount:returnCount(bundle.sessions,6),sourceExportCount:(exports||[]).length});
  }
  return Object.freeze({assertExport:assertExport,combine:combine,analyze:analyze,returnCount:returnCount});
});
