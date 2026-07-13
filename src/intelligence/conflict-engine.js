(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeConflictEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var ACTIONS=Object.freeze(['keep','adjust','later','ignore_once']);
  function clean(value){return String(value||'').trim().toLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');}
  function minutes(value){if(!value||!(/^(\d{1,2}):(\d{2})$/).test(value))return null;var pair=value.split(':').map(Number);return pair[0]<24&&pair[1]<60?pair[0]*60+pair[1]:null;}
  function active(record){return record&&!record.archived&&!record.deletedAt&&!['completed','cancelled','tombstoned'].includes(record.recordState||record.status);}
  function completed(record){return record&&['completed','done','resolved','fulfilled'].includes(record.recordState||record.status);}
  function timestamp(record,kind){
    var absolute=kind==='start'?(record.startAt||record.scheduledAt):(record.deadlineAt||record.endAt);
    if(absolute){var parsed=new Date(absolute).getTime();if(Number.isFinite(parsed))return parsed;}
    var dateKey=kind==='start'?(record.startDateKey||record.dateKey):(record.deadlineDateKey||record.endDateKey);
    var timeText=kind==='start'?(record.startTimeText||record.timeText):(record.deadlineTimeText||record.endTimeText||'23:59');
    if(!dateKey)return null;var value=new Date(dateKey+'T'+(minutes(timeText)===null?'00:00':timeText)+':00').getTime();return Number.isFinite(value)?value:null;
  }
  function graphRecordIds(graph,type){
    var ids=new Set();(graph&&graph.nodes||[]).forEach(function(node){if(node.type===type)(node.sourceRecordIds||[]).forEach(function(id){ids.add(id);});});return ids;
  }
  function add(conflicts,type,recordIds,explanation,details){
    var ids=[...new Set((recordIds||[]).filter(Boolean))];var key=type+'|'+ids.slice().sort().join('|');
    if(conflicts.some(function(item){return item._key===key;}))return;
    conflicts.push(Object.assign({_key:key,type:type,recordIds:ids,explanation:explanation,actions:ACTIONS.slice()},details||{}));
  }
  function findRecordIdByNode(graph,nodeId){var node=(graph&&graph.nodes||[]).find(function(item){return item.id===nodeId;});return node&&(node.sourceRecordIds||[])[0]||'';}
  function commitmentSignature(record){
    var people=(record.personRefs||record.people||[]).concat(record.person||record.assignee||[]).map(clean).filter(Boolean).sort().join('|');
    var subject=clean(record.commitmentSubject||record.object||record.action||record.title||record.rawText);return people+'|'+subject;
  }
  function detect(input){
    input=input||{};var records=input.records||[];var conflicts=[];var graph=input.graph||{nodes:[],edges:[]};var byId=new Map(records.map(function(record){return [record.id,record];}));
    var commitmentIds=new Set(input.commitmentRecordIds||[]);graphRecordIds(graph,'Commitment').forEach(function(id){commitmentIds.add(id);});
    var goalIds=new Set(input.goalRecordIds||[]);graphRecordIds(graph,'Goal').forEach(function(id){goalIds.add(id);});
    var byDate=new Map();records.filter(active).forEach(function(record){if(record.dateKey){var list=byDate.get(record.dateKey)||[];list.push(record);byDate.set(record.dateKey,list);}});

    byDate.forEach(function(list,dateKey){
      var timed=list.filter(function(record){return minutes(record.timeText)!==null;}).sort(function(a,b){return minutes(a.timeText)-minutes(b.timeText);});
      for(var left=0;left<timed.length;left++)for(var right=left+1;right<timed.length;right++){
        var leftStart=minutes(timed[left].timeText);var leftEnd=minutes(timed[left].endTimeText);var rightStart=minutes(timed[right].timeText);var rightEnd=minutes(timed[right].endTimeText);
        var overlaps=leftEnd===null&&rightEnd===null?leftStart===rightStart:rightStart<(leftEnd===null?leftStart+1:leftEnd)&&leftStart<(rightEnd===null?rightStart+1:rightEnd);
        if(overlaps)add(conflicts,'time_overlap',[timed[left].id,timed[right].id],dateKey+' '+timed[right].timeText+' 有重叠安排。');
      }
      if(list.length>=Number(input.highLoadThreshold||4)){var commitments=list.filter(function(record){return commitmentIds.has(record.id);}).length;add(conflicts,'high_load',list.map(function(record){return record.id;}),dateKey+' 已有 '+list.length+' 项安排，其中 '+commitments+' 项为对他人的承诺。');}
    });

    records.forEach(function(record){
      var start=timestamp(record,'start');var deadline=timestamp(record,'deadline');
      if(start!==null&&deadline!==null&&deadline<start)add(conflicts,'deadline_before_start',[record.id],'截止时间早于开始时间，请核对时间设置。');
      var hasReminder=record.notificationEnabled===true||Boolean(record.reminderAt)||Boolean(record.notifyAt)||(record.notifyMode&&record.notifyMode!=='none');
      if(completed(record)&&hasReminder)add(conflicts,'completed_still_reminding',[record.id],'事项已经完成，但仍保留有效提醒。');
      if(commitmentIds.has(record.id)&&Number(record.postponeCount||0)>=2)add(conflicts,'repeated_commitment_postponement',[record.id],'同一承诺已延期 '+Number(record.postponeCount)+' 次。');
    });

    var commitmentSeen=new Map();records.filter(function(record){return active(record)&&commitmentIds.has(record.id);}).forEach(function(record){var key=commitmentSignature(record);if(!key||key==='|')return;if(commitmentSeen.has(key))add(conflicts,'duplicate_commitment',[commitmentSeen.get(key),record.id],'发现面向同一对象的重复承诺。');else commitmentSeen.set(key,record.id);});
    var waitingSeen=new Map();(input.waiting||[]).filter(function(item){return !['resolved','cancelled'].includes(item.status);}).forEach(function(item){var key=clean(item.person)+'|'+clean(item.subject);if(waitingSeen.has(key))add(conflicts,'duplicate_waiting',[waitingSeen.get(key),item.recordId],'同一人物存在重复等待跟进。');else waitingSeen.set(key,item.recordId);});

    var goalActionIds=new Set(input.nextActionRecordIds||[]);var linkedGoalIds=new Set();
    (graph.edges||[]).filter(function(edge){return ['contributes_to','depends_on','fulfilled_by'].includes(edge.type)&&edge.status!=='deleted';}).forEach(function(edge){
      var from=findRecordIdByNode(graph,edge.from);var to=findRecordIdByNode(graph,edge.to);
      if(goalIds.has(to)&&from&&active(byId.get(from)))linkedGoalIds.add(to);
      if(goalIds.has(from)&&to&&active(byId.get(to)))linkedGoalIds.add(from);
    });
    (input.goalNextActions||[]).forEach(function(link){if(link&&link.goalRecordId&&link.nextActionRecordId&&active(byId.get(link.nextActionRecordId)))linkedGoalIds.add(link.goalRecordId);});
    goalIds.forEach(function(id){if(active(byId.get(id))&&!linkedGoalIds.has(id)&&!goalActionIds.has(id))add(conflicts,'goal_without_next_action',[id],'目标尚未关联可执行的下一步行动。');});

    var dependencies=(input.dependencies||[]).slice();(graph.edges||[]).filter(function(edge){return edge.type==='depends_on'&&edge.status!=='deleted';}).forEach(function(edge){dependencies.push({recordId:findRecordIdByNode(graph,edge.from),dependsOnRecordId:findRecordIdByNode(graph,edge.to)});});
    dependencies.forEach(function(link){var dependent=byId.get(link.recordId);var prerequisite=byId.get(link.dependsOnRecordId);if(active(dependent)&&prerequisite&&!completed(prerequisite))add(conflicts,'incomplete_dependency',[link.recordId,link.dependsOnRecordId],'前置事项尚未完成，当前行动可能被阻塞。');});

    (input.habitProgress||[]).forEach(function(progress){
      var required=Number(progress.requiredCount||progress.targetCount||0);var completedCount=Number(progress.completedCount||0);var remainingDays=Number(progress.remainingDays||0);var maxPerDay=Math.max(1,Number(progress.maxPerDay||1));
      if(required>completedCount&&(required-completedCount)>remainingDays*maxPerDay)add(conflicts,'habit_time_insufficient',[progress.recordId],'周期习惯剩余 '+(required-completedCount)+' 次，但只剩 '+remainingDays+' 天。');
    });
    return conflicts.map(function(item){var result=Object.assign({},item);delete result._key;return result;});
  }
  return Object.freeze({detect:detect});
});
