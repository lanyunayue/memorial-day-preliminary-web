(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeSessionAnalyzer=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  var FORBIDDEN_KEY=/(source|raw).*text|full.*text|name|phone|address|identity|password|token|private.*key|clipboard|browser.*history/i;
  function assertExport(payload){
    if(!payload||payload.schema!=='shike-product-validation-export'||payload.schemaVersion!==1)throw new Error('Unsupported Shike research export.');
    if(payload.containsRawUserText!==false)throw new Error('Export does not declare raw-text exclusion.');
    if(!Array.isArray(payload.sessions)||!Array.isArray(payload.events))throw new Error('Export sessions or events are missing.');
    scan(payload.events,'events');return payload;
  }
  function scan(value,path){
    if(Array.isArray(value)){value.forEach(function(item,index){scan(item,path+'['+index+']');});return;}
    if(!value||typeof value!=='object')return;
    Object.keys(value).forEach(function(key){if(FORBIDDEN_KEY.test(key))throw new Error('Forbidden research field at '+path+'.'+key);scan(value[key],path+'.'+key);});
  }
  function dedupe(values,key){var seen=new Set();return values.filter(function(item){var id=item&&item[key];if(!id||seen.has(id))return false;seen.add(id);return true;});}
  function dayKey(value){var time=Date.parse(value);return Number.isFinite(time)?Math.floor(time/86400000):null;}
  function returnCount(sessions,minimumDays){
    var grouped={};sessions.forEach(function(item){if(!item.participantCode)return;(grouped[item.participantCode]||(grouped[item.participantCode]=[])).push(dayKey(item.startedAt));});
    return Object.keys(grouped).filter(function(code){var days=grouped[code].filter(Number.isFinite).sort(function(a,b){return a-b;});return days.length>1&&days.some(function(day){return day-days[0]>=minimumDays;});}).length;
  }
  function combine(exports){
    var sessions=[];var events=[];(exports||[]).forEach(function(payload){payload=assertExport(payload);sessions=sessions.concat(payload.sessions);events=events.concat(payload.events);});
    sessions=dedupe(sessions,'sessionId');events=dedupe(events,'id');return {schema:'shike-product-validation-study-bundle',schemaVersion:1,containsRawUserText:false,sessions:sessions,events:events};
  }
  function analyze(exports){
    var bundle=combine(exports);var metricApi=global.ShikeValidationMetrics;
    if(!metricApi&&typeof require==='function')metricApi=require('../../src/research/validation-metrics.js');
    var metrics=metricApi.summarize(bundle.events,bundle.sessions);return Object.assign({},metrics,{day2ReturnCount:returnCount(bundle.sessions,1),day7ReturnCount:returnCount(bundle.sessions,6),sourceExportCount:(exports||[]).length});
  }
  return Object.freeze({assertExport:assertExport,combine:combine,analyze:analyze,returnCount:returnCount});
});
