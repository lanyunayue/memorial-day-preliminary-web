(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeMetricsReport=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function value(input,suffix){return input==null?'NOT AVAILABLE':String(input)+(suffix||'');}
  function percentage(input){return input==null?'HUMAN PARTICIPANTS REQUIRED':Math.round(input*1000)/10+'%';}
  function markdown(metrics){
    metrics=metrics||{};return ['# Shike Product Validation Metrics','',
      '- Real participants: '+value(metrics.participantCount),'- Real sessions: '+value(metrics.sessionCount),
      '- Real non-sensitive events: '+value(metrics.eventCount),'- Median first input: '+value(metrics.medianFirstInputMs,' ms'),
      '- Confirmed drafts: '+value(metrics.confirmedDraftCount),'- Type corrections: '+value(metrics.typeCorrectionCount),
      '- Time corrections: '+value(metrics.timeCorrectionCount),'- First understanding rate: '+percentage(metrics.firstUnderstandingRate),
      '- Usable draft rate: '+percentage(metrics.usableDraftRate),'- Day 2 return: '+value(metrics.day2ReturnCount),
      '- Day 7 return: '+value(metrics.day7ReturnCount),'- Waiting For participants: '+value(metrics.waitingForParticipantCount),
      '- Next Best Action viewers: '+value(metrics.nextActionViewerCount),'','Unmeasured outcomes remain HUMAN PARTICIPANTS REQUIRED.'].join('\n');
  }
  return Object.freeze({markdown:markdown});
});
