(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalMemory=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var DAY=86400000;var COMPLETED=new Set(['completed','done','resolved','fulfilled']);
  function clean(value){return String(value||'').trim().toLowerCase();}
  function timestamp(record){if(record.dateKey){var date=new Date(record.dateKey+'T'+(record.timeText||'12:00')+':00').getTime();if(Number.isFinite(date))return date;}return Number(record.updatedAt||record.createdAt||0);}
  function tokenize(value){
    var text=clean(value).replace(/[^\p{L}\p{N}]+/gu,' ');var tokens=new Set();
    (text.match(/[a-z0-9]+|[\p{Script=Han}]+/gu)||[]).forEach(function(part){
      if((/^[a-z0-9]+$/).test(part)){if(part.length>1)tokens.add(part);return;}
      if(part.length<=8&&part.length>1)tokens.add(part);
      for(var index=0;index<part.length-1;index++)tokens.add(part.slice(index,index+2));
    });
    return [...tokens];
  }
  function addPosting(index,token,recordId,field,weight){
    if(!index.has(token))index.set(token,new Map());var postings=index.get(token);var entry=postings.get(recordId)||{weight:0,fields:new Set()};entry.weight+=weight;entry.fields.add(field);postings.set(recordId,entry);
  }
  function addRelation(collection,label,recordId){if(!label||!recordId)return;if(!collection.has(label))collection.set(label,new Set());collection.get(label).add(recordId);}
  function buildIndex(records,graph,options){
    records=records||[];graph=graph||{nodes:[],edges:[]};options=options||{};var byId=new Map(records.map(function(record){return [record.id,record];}));
    var person=new Map();var topic=new Map();var types=new Map();var token=new Map();var commitments=new Set();var waitingByRecord=new Map();
    var fields=[['title',4],['rawText',2],['note',1.5],['dateText',0.5],['timeText',0.5]];
    records.forEach(function(record){fields.forEach(function(field){tokenize(record[field[0]]).forEach(function(term){addPosting(token,term,record.id,field[0],field[1]);});});});
    (graph.nodes||[]).forEach(function(node){
      var target=node.type==='Person'?person:node.type==='Topic'?topic:types;var label=node.label||node.type;
      (node.sourceRecordIds||[]).forEach(function(id){if(!byId.has(id))return;addRelation(target,label,id);tokenize(label).forEach(function(term){addPosting(token,term,id,node.type.toLowerCase(),3);});if(node.type==='Commitment')commitments.add(id);});
    });
    (options.waiting||[]).forEach(function(item){if(!item||!item.recordId)return;waitingByRecord.set(item.recordId,item);tokenize([item.person,item.subject].filter(Boolean).join(' ')).forEach(function(term){addPosting(token,term,item.recordId,'waiting_for',3);});});
    return {schemaVersion:2,records:records.slice().sort(function(a,b){return timestamp(b)-timestamp(a);}),byId:byId,person:person,topic:topic,types:types,token:token,commitments:commitments,waitingByRecord:waitingByRecord,builtAt:Date.now()};
  }
  function timeOf(record){var value=timestamp(record);return {dateKey:record.dateKey||'',timeText:record.timeText||'',occurredAt:value?new Date(value).toISOString():null};}
  function source(record,match,index){
    var time=timeOf(record);var confidence=match.score>=9?'high':match.score>=4?'medium':'low';var uncertainty=confidence==='high'?0.15:confidence==='medium'?0.35:0.6;
    var commitment=index.commitments.has(record.id)?[{recordId:record.id,title:record.title,relation:'commitment'}]:[];var waiting=index.waitingByRecord.get(record.id)||null;
    return {recordId:record.id,title:record.title,dateKey:time.dateKey,timeText:time.timeText,occurredAt:time.occurredAt,updatedAt:record.updatedAt||record.createdAt||0,
      source:{kind:'local_record',recordId:record.id,action:{type:'open_record',recordId:record.id},href:'#record/'+encodeURIComponent(record.id)},
      reason:match.reasons.join('；'),matchedFields:[...match.fields],relatedCommitments:commitment,waitingFor:waiting?{id:waiting.id,person:waiting.person,subject:waiting.subject,status:waiting.status}:null,
      confidenceBand:confidence,uncertainty:uncertainty,uncertaintyExplanation:confidence==='high'?'多项本地证据一致。':confidence==='medium'?'存在相关本地证据，但匹配并非唯一。':'仅有较弱的本地文本证据。'};
  }
  function query(index,question,options){
    question=String(question||'').trim();options=options||{};var matches=new Map();var now=new Date(options.now||Date.now()).getTime();
    function hit(id,score,reason,field){var item=matches.get(id)||{score:0,reasons:[],fields:new Set()};item.score+=score;if(reason&&!item.reasons.includes(reason))item.reasons.push(reason);if(field)item.fields.add(field);matches.set(id,item);}
    tokenize(question).forEach(function(term){var postings=index.token.get(term);if(!postings)return;postings.forEach(function(posting,id){hit(id,posting.weight,'文本 token 匹配：'+term,[...posting.fields][0]);posting.fields.forEach(function(field){matches.get(id).fields.add(field);});});});
    function include(collection,prefix,weight){collection.forEach(function(ids,label){if(label&&question.includes(label))ids.forEach(function(id){hit(id,weight,prefix+label,prefix);});});}
    include(index.person,'关联人物：',7);include(index.topic,'关联主题：',6);
    if(/答应|承诺|约好/.test(question))index.commitments.forEach(function(id){hit(id,5,'关联承诺','commitment');});
    if(/等|回复|跟进|问过|问了/.test(question))index.waitingByRecord.forEach(function(item,id){hit(id,4,'关联 Waiting For：'+(item.person||item.subject||''),'waiting_for');});
    var ranked=[...matches].map(function(pair){
      var record=index.byId.get(pair[0]);var match=pair[1];if(!record)return null;
      if(!options.includeCompleted&&COMPLETED.has(record.recordState||record.status))return null;
      if(record.archived&&!options.includeArchived)return null;if(options.from&&record.dateKey&&record.dateKey<options.from)return null;if(options.to&&record.dateKey&&record.dateKey>options.to)return null;
      var ageDays=Math.max(0,(now-timestamp(record))/DAY);var decay=1/(1+ageDays/180);match.score=match.score*(0.65+0.35*decay);return {record:record,match:match};
    }).filter(Boolean).filter(function(item){return item.match.score>=Number(options.minimumScore||2);});
    ranked.sort(function(a,b){return b.match.score-a.match.score||timestamp(b.record)-timestamp(a.record)||a.record.id.localeCompare(b.record.id);});
    var sources=ranked.slice(0,options.limit||8).map(function(item){return source(item.record,item.match,index);});
    return {query:question,answer:sources.length?'找到 '+sources.length+' 条可追溯本地记录。':'没有找到可验证的相关记录。',sources:sources,uncertainty:sources.length?sources[0].uncertainty:1};
  }
  return Object.freeze({buildIndex:buildIndex,query:query,tokenize:tokenize});
});
