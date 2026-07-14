(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeValidationMetrics=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function unique(values){return Array.from(new Set(values.filter(Boolean)));}
  function median(values){if(!values.length)return null;var sorted=values.slice().sort(function(a,b){return a-b;});var middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:Math.round((sorted[middle-1]+sorted[middle])/2);}
  function ratio(a,b){return b?Math.round(a*1000/b)/1000:null;}
  function summarize(events,sessions){
    events=Array.isArray(events)?events:[];sessions=Array.isArray(sessions)?sessions:[];var participants=unique(sessions.map(function(item){return item.participantCode;}));
    var count=function(type){return events.filter(function(item){return item.eventType===type;}).length;};var firstInputs=events.filter(function(item){return item.eventType==='first_input';}).map(function(item){return item.properties&&item.properties.elapsedMs;}).filter(Number.isFinite);
    var understood=events.filter(function(item){return item.eventType==='feedback_submitted'&&item.properties&&item.properties.understandingScore>=4;}).length;var feedback=count('feedback_submitted');
    return Object.freeze({
      participantCount:participants.length,sessionCount:sessions.length,eventCount:events.length,firstInputCount:firstInputs.length,
      medianFirstInputMs:median(firstInputs),
      draftCount:events.filter(function(item){return item.eventType==='draft_generated';}).reduce(function(sum,item){return sum+Number(item.properties&&item.properties.draftCount||0);},0),
      confirmedDraftCount:count('draft_confirmed'),cancelledDraftCount:count('draft_cancelled'),
      typeCorrectionCount:count('type_corrected'),timeCorrectionCount:count('time_corrected'),
      waitingForParticipantCount:unique(events.filter(function(item){return item.eventType==='waiting_for_created';}).map(function(item){return item.participantCode;})).length,
      nextActionViewerCount:unique(events.filter(function(item){return item.eventType==='next_action_viewed';}).map(function(item){return item.participantCode;})).length,
      firstUnderstandingRate:ratio(understood,feedback),usableDraftRate:null,day2ReturnCount:null,day7ReturnCount:null,humanReviewedCount:0
    });
  }
  return Object.freeze({summarize:summarize});
});
