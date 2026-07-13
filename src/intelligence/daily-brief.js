(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeDailyBrief=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function dateKey(value){var date=new Date(value||Date.now());return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
  function tomorrow(value){var date=new Date(value||Date.now());date.setDate(date.getDate()+1);return dateKey(date);}
  function active(record){return record&&record.recordState!=='completed'&&!record.archived;}
  function generate(input){
    input=input||{};var records=(input.records||[]).filter(active);var now=input.now||Date.now();var today=dateKey(now);var nextDay=tomorrow(now);var waiting=input.waiting||[];var graph=input.graph||{nodes:[]};
    var commitments=new Set((graph.nodes||[]).filter(function(node){return node.type==='Commitment';}).flatMap(function(node){return node.sourceRecordIds||[];}));
    var todayItems=records.filter(function(record){return record.dateKey===today;});
    var overdue=records.filter(function(record){return record.dateKey&&record.dateKey<today;});
    var tomorrowItems=records.filter(function(record){return record.dateKey===nextDay;});
    var activeWaiting=waiting.filter(function(item){return !['resolved','cancelled'].includes(item.status);});
    var load=todayItems.length>=6?'high':todayItems.length>=3?'medium':'low';
    return {
      schemaVersion:1,generatedAt:new Date(now).toISOString(),dateKey:today,
      mustHandle:todayItems.filter(function(record){return commitments.has(record.id)||record.recordKind==='reminder';}),
      overdue:overdue,waitingOn:activeWaiting,expectedToday:activeWaiting.filter(function(item){return item.status==='expected_today';}),
      tomorrow:tomorrowItems,nextAction:(input.suggestions||[])[0]||null,
      load:{band:load,count:todayItems.length,explanation:'今天共有 '+todayItems.length+' 项已安排记录。'},
      openCommitments:records.filter(function(record){return commitments.has(record.id);})
    };
  }
  function exportText(brief){
    var lines=['每日简报 '+brief.dateKey,'今天处理：'+brief.mustHandle.length,'已逾期：'+brief.overdue.length,'等待他人：'+brief.waitingOn.length,'明天事项：'+brief.tomorrow.length,'时间负载：'+brief.load.band];
    if(brief.nextAction)lines.push('下一步：'+brief.nextAction.action+'；'+brief.nextAction.reason);return lines.join('\n');
  }
  return Object.freeze({generate:generate,exportText:exportText});
});
