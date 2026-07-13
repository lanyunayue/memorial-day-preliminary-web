(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeWaitingForEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function at(time){if(!time)return null;var value=new Date(time);return Number.isNaN(value.getTime())?null:value;}
  function dateFromDraft(draft){
    var normalized=draft&&draft.normalizedTime||{};if(!normalized.dateKey)return null;
    return normalized.dateKey+'T'+(normalized.timeText||'23:59')+':00';
  }
  function status(item,now){
    if(['resolved','cancelled','followed_up'].includes(item.status))return item.status;
    var expected=at(item.expectedAt);if(!expected)return 'waiting';
    now=at(now)||new Date();
    if(expected.getTime()<now.getTime())return 'overdue';
    if(expected.toDateString()===now.toDateString())return 'expected_today';
    return 'waiting';
  }
  function fromDraft(draft,record,now){
    if(!draft||draft.type!=='waiting_for'||!record||!record.id)throw new Error('waiting_for_input_required');
    var created=at(now)||new Date();var item={id:'waiting:'+record.id,recordId:record.id,person:(draft.personRefs||[])[0]||'',subject:draft.object||draft.action,expectedAt:dateFromDraft(draft),followUpAt:dateFromDraft(draft),condition:draft.condition||'',status:'waiting',lastCheckedAt:null,sourceText:draft.sourceText,createdAt:created.toISOString(),schemaVersion:1};item.status=status(item,created);return item;
  }
  function refresh(items,now){return (items||[]).map(function(item){return Object.assign({},item,{status:status(item,now),lastCheckedAt:new Date(now||Date.now()).toISOString()});});}
  function queries(items,now){
    var current=refresh(items,now);var active=current.filter(function(item){return !['resolved','cancelled'].includes(item.status);});
    var signatures=new Map();var duplicates=[];active.forEach(function(item){var key=(item.person+'|'+item.subject).toLowerCase();if(signatures.has(key))duplicates.push(item);else signatures.set(key,item.id);});
    return {all:current,waitingOn:active,overdue:active.filter(function(item){return item.status==='overdue';}),dueToday:active.filter(function(item){return item.status==='expected_today';}),duplicates:duplicates};
  }
  function transition(item,next){if(!['waiting','expected_today','overdue','followed_up','resolved','cancelled'].includes(next))throw new Error('invalid_waiting_status');return Object.assign({},item,{status:next,lastCheckedAt:new Date().toISOString()});}
  return Object.freeze({fromDraft:fromDraft,status:status,refresh:refresh,queries:queries,transition:transition});
});
