(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeWeeklyReview=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function startOfWeek(value){var date=new Date(value||Date.now());date.setHours(0,0,0,0);var day=date.getDay()||7;date.setDate(date.getDate()-day+1);return date;}
  function key(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
  function generate(input){
    input=input||{};var now=new Date(input.now||Date.now());var start=startOfWeek(now);var end=new Date(start);end.setDate(end.getDate()+6);var nextEnd=new Date(end);nextEnd.setDate(nextEnd.getDate()+7);
    var records=input.records||[];var waiting=input.waiting||[];var graph=input.graph||{nodes:[]};var corrections=input.corrections||[];
    var commitments=new Set((graph.nodes||[]).filter(function(node){return node.type==='Commitment';}).flatMap(function(node){return node.sourceRecordIds||[];}));
    var goals=new Set((graph.nodes||[]).filter(function(node){return node.type==='Goal';}).flatMap(function(node){return node.sourceRecordIds||[];}));
    var inWeek=function(value){var date=new Date(value||0);return date>=start&&date<new Date(end.getTime()+86400000);};
    var correctionTypes={};corrections.forEach(function(item){correctionTypes[item.eventType]=(correctionTypes[item.eventType]||0)+1;});
    return {
      schemaVersion:1,generatedAt:now.toISOString(),range:{from:key(start),to:key(end)},
      completed:records.filter(function(record){return record.recordState==='completed'&&inWeek(record.updatedAt||record.createdAt);}),
      openCommitments:records.filter(function(record){return commitments.has(record.id)&&record.recordState!=='completed';}),
      repeatedlyPostponed:records.filter(function(record){return Number(record.postponeCount||0)>1;}),
      resolvedWaiting:waiting.filter(function(item){return item.status==='resolved'&&inWeek(item.lastCheckedAt||item.createdAt);}),
      overdueWaiting:waiting.filter(function(item){return item.status==='overdue';}),
      goalsWithoutAction:records.filter(function(record){return goals.has(record.id)&&!record.dateKey;}),
      nextWeek:records.filter(function(record){if(!record.dateKey)return false;var date=new Date(record.dateKey+'T12:00:00');return date>end&&date<=nextEnd;}),
      suggestionActivity:{accepted:correctionTypes.suggestion_accepted||0,ignored:correctionTypes.suggestion_ignored||0},
      correctionTypes:correctionTypes,backupStatus:input.backupStatus||{lastBackupAt:null}
    };
  }
  function exportJson(review){return JSON.stringify(review,null,2);}
  return Object.freeze({generate:generate,exportJson:exportJson,startOfWeek:startOfWeek});
});
