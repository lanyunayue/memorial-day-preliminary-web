(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalMemory=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function text(record){return [record.title,record.rawText,record.note,record.dateText].filter(Boolean).join(' ');}
  function buildIndex(records,graph){
    records=records||[];graph=graph||{nodes:[]};var byId=new Map(records.map(function(record){return [record.id,record];}));var person=new Map();var topic=new Map();var types=new Map();
    (graph.nodes||[]).forEach(function(node){
      var target=node.type==='Person'?person:node.type==='Topic'?topic:types;if(!target.has(node.label||node.type))target.set(node.label||node.type,new Set());
      (node.sourceRecordIds||[]).forEach(function(id){if(byId.has(id))target.get(node.label||node.type).add(id);});
    });
    return {schemaVersion:1,records:records.slice().sort(function(a,b){return (b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0);}),byId:byId,person:person,topic:topic,types:types};
  }
  function source(record,reason){return {recordId:record.id,title:record.title,dateKey:record.dateKey||'',updatedAt:record.updatedAt||record.createdAt||0,reason:reason};}
  function query(index,question,options){
    question=String(question||'').trim();options=options||{};var ids=new Set();var reasons=new Map();
    function include(collection,label,reason){collection.forEach(function(values,key){if(label(key)){values.forEach(function(id){ids.add(id);reasons.set(id,reason+key);});}});}
    include(index.person,function(key){return question.includes(key);},'关联人物：');include(index.topic,function(key){return key&&question.includes(key);},'关联主题：');
    if(/答应|承诺/.test(question))include(index.types,function(key){return key==='Commitment';},'承诺：');
    if(/目标|计划/.test(question))include(index.types,function(key){return key==='Goal';},'目标：');
    index.records.forEach(function(record){if(text(record).split(/\s+/).some(function(part){return part.length>1&&question.includes(part);})||(/延期|推迟/.test(question)&&Number(record.postponeCount||0)>0)){ids.add(record.id);if(!reasons.has(record.id))reasons.set(record.id,'文本或状态匹配：');}});
    var records=[...ids].map(function(id){return index.byId.get(id);}).filter(Boolean).filter(function(record){if(options.from&&record.dateKey&&record.dateKey<options.from)return false;if(options.to&&record.dateKey&&record.dateKey>options.to)return false;return true;});
    records.sort(function(a,b){return (b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0);});var sources=records.slice(0,options.limit||8).map(function(record){return source(record,reasons.get(record.id)||'匹配：');});
    return {query:question,answer:sources.length?'找到 '+sources.length+' 条可追溯记录。':'没有找到可验证的相关记录。',sources:sources};
  }
  return Object.freeze({buildIndex:buildIndex,query:query});
});
