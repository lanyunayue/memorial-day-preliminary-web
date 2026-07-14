(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeConflictEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function minutes(value){if(!value||!/^(\d{1,2}):(\d{2})$/.test(value))return null;var pair=value.split(':').map(Number);return pair[0]*60+pair[1];}
  function detect(input){
    input=input||{};var records=input.records||[];var conflicts=[];var byDate=new Map();
    records.forEach(function(record){if(record.dateKey){var list=byDate.get(record.dateKey)||[];list.push(record);byDate.set(record.dateKey,list);}});
    byDate.forEach(function(list,dateKey){
      var timed=list.filter(function(record){return minutes(record.timeText)!==null;}).sort(function(a,b){return minutes(a.timeText)-minutes(b.timeText);});
      for(var index=1;index<timed.length;index++)if(minutes(timed[index].timeText)===minutes(timed[index-1].timeText))conflicts.push({type:'time_overlap',recordIds:[timed[index-1].id,timed[index].id],explanation:dateKey+' '+timed[index].timeText+' 有重叠安排。',actions:['keep','adjust','later','ignore_once']});
      if(list.length>=4){var commitments=list.filter(function(record){return (input.commitmentRecordIds||[]).includes(record.id);}).length;conflicts.push({type:'high_load',recordIds:list.map(function(record){return record.id;}),explanation:dateKey+' 已有 '+list.length+' 项安排，其中 '+commitments+' 项为对他人的承诺。',actions:['keep','adjust','later','ignore_once']});}
    });
    var waiting=input.waiting||[];var seen=new Map();waiting.forEach(function(item){var key=(item.person+'|'+item.subject).toLowerCase();if(seen.has(key))conflicts.push({type:'duplicate_waiting',recordIds:[seen.get(key),item.recordId],explanation:'同一人物存在重复等待跟进。',actions:['keep','adjust','later','ignore_once']});else seen.set(key,item.recordId);});
    return conflicts;
  }
  return Object.freeze({detect:detect});
});
