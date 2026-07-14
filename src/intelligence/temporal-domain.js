(function(global,factory){
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeTemporalDomain=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var SCHEMA_VERSION=1;
  var TYPES=Object.freeze([
    'commitment','waiting_for','task','goal','event','anniversary','habit','note','thought'
  ]);
  var CONFIDENCE_BANDS=Object.freeze(['high','medium','low']);
  var STATUSES=Object.freeze(['draft','confirmed','cancelled','saved','tombstoned']);

  function cleanText(value){return String(value||'').trim();}
  function copy(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
  function makeId(prefix,now){
    return (prefix||'temporal')+'_'+Number(now||Date.now()).toString(36)+'_'+Math.random().toString(36).slice(2,9);
  }
  function normalizeSpan(span,sourceText){
    var start=Number(span&&span.start);
    var end=Number(span&&span.end);
    if(!Number.isInteger(start)||start<0)start=0;
    if(!Number.isInteger(end)||end<start||end>sourceText.length)end=sourceText.length;
    return {start:start,end:end};
  }
  function createDraft(input){
    input=input||{};
    var sourceText=cleanText(input.sourceText);
    var now=Number(input.createdAt)||Date.now();
    return {
      id:cleanText(input.id)||makeId('draft',now),
      schemaVersion:SCHEMA_VERSION,
      type:TYPES.includes(input.type)?input.type:'note',
      sourceText:sourceText,
      sourceSpan:normalizeSpan(input.sourceSpan,sourceText),
      action:cleanText(input.action),
      subject:cleanText(input.subject),
      object:cleanText(input.object),
      personRefs:Array.isArray(input.personRefs)?input.personRefs.map(cleanText).filter(Boolean):[],
      timeExpression:cleanText(input.timeExpression),
      normalizedTime:copy(input.normalizedTime)||null,
      recurrence:copy(input.recurrence)||null,
      confidenceBand:CONFIDENCE_BANDS.includes(input.confidenceBand)?input.confidenceBand:'low',
      explanation:cleanText(input.explanation),
      missingFields:Array.isArray(input.missingFields)?input.missingFields.map(cleanText).filter(Boolean):[],
      condition:cleanText(input.condition),
      status:STATUSES.includes(input.status)?input.status:'draft',
      createdAt:now
    };
  }
  function cloneDraft(draft){return createDraft(copy(draft));}

  return Object.freeze({
    SCHEMA_VERSION:SCHEMA_VERSION,
    TYPES:TYPES,
    CONFIDENCE_BANDS:CONFIDENCE_BANDS,
    STATUSES:STATUSES,
    createDraft:createDraft,
    cloneDraft:cloneDraft,
    makeId:makeId
  });
});
