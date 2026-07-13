(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeNextActionEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function daysUntil(dateKey,now){if(!dateKey)return null;var target=new Date(dateKey+'T23:59:00');return Math.ceil((target-new Date(now||Date.now()))/86400000);}
  function compute(input){
    input=input||{};var candidates=[];var now=input.now||Date.now();var ignored=new Set(input.neverSuggestRecordIds||[]);
    (input.records||[]).forEach(function(record){
      if(!record||ignored.has(record.id)||record.recordState==='completed'||record.archived)return;
      var node=(input.graph&&input.graph.nodes||[]).find(function(item){return (item.sourceRecordIds||[]).includes(record.id)&&['Commitment','Goal','Task'].includes(item.type);});
      var due=daysUntil(record.dateKey,now);var rank=0;var reasons=[];
      if(due!==null&&due<0){rank+=100;reasons.push('已经逾期');}
      else if(due!==null&&due<=2){rank+=70-due*10;reasons.push(due===0?'今天到期':'将在'+due+'天后到期');}
      if(node&&node.type==='Commitment'){rank+=35;reasons.push('这是对他人的承诺');}
      if(node&&node.type==='Goal'){rank+=10;reasons.push('这个长期目标需要下一步行动');}
      if(Number(record.postponeCount||0)>1){rank+=record.postponeCount*5;reasons.push('已经多次延期');}
      if(rank>0)candidates.push({_rank:rank,id:'next:'+record.id,sourceRecordId:record.id,action:record.title,reason:'建议'+record.title+'，因为'+reasons.join('，')+'。',kind:node&&node.type==='Commitment'?'commitment':'record'});
    });
    (input.waiting||[]).forEach(function(item){
      if(ignored.has(item.recordId)||!['overdue','expected_today'].includes(item.status))return;
      var rank=item.status==='overdue'?120:75;var person=item.person||'对方';
      candidates.push({_rank:rank,id:'next:'+item.id,sourceRecordId:item.recordId,action:'联系'+person+'跟进'+item.subject,reason:'建议联系'+person+'，因为约定回复时间'+(item.status==='overdue'?'已经超过':'将在今天到期')+'。',kind:'waiting_for'});
    });
    candidates.sort(function(a,b){return b._rank-a._rank||a.id.localeCompare(b.id);});
    return candidates.map(function(item){var result=Object.assign({},item);delete result._rank;return result;});
  }
  return Object.freeze({compute:compute});
});
