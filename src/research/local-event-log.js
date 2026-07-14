(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeResearchEventLog=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  var STORAGE_KEY='shike_research_event_log_v1';
  var MAX_EVENTS=5000;
  var RULES={
    session_opened:['revisit'],first_input:['elapsedMs'],draft_generated:['draftCount','rejectedCount'],draft_edited:['field'],
    draft_cancelled:['draftType'],draft_confirmed:['draftType'],type_corrected:['fromType','toType'],time_corrected:['field'],
    waiting_for_created:[],next_action_viewed:['suggestionCount'],next_action_accepted:[],next_action_ignored:[],
    trash_restored:[],backup_exported:[],revisit:['sessionCount'],error:['category','code'],
    feedback_submitted:['understandingScore','frictionCode'],comparison_recorded:['preferredTool','completionMs','clickCount'],
    consent_granted:[],consent_withdrawn:[]
  };
  var SAFE_TEXT=/^[a-z0-9_:-]{1,48}$/i;
  function storage(){return global.localStorage||null;}
  function read(){try{var value=JSON.parse(storage()&&storage().getItem(STORAGE_KEY)||'[]');return Array.isArray(value)?value:[];}catch(error){return [];}}
  function write(events){if(storage())storage().setItem(STORAGE_KEY,JSON.stringify(events.slice(-MAX_EVENTS)));}
  function sanitize(eventType,properties){
    if(!Object.prototype.hasOwnProperty.call(RULES,eventType))throw new Error('Research event is not allowlisted: '+eventType);
    var allowed=RULES[eventType];var input=properties||{};var output={};
    Object.keys(input).forEach(function(key){
      if(!allowed.includes(key))throw new Error('Research property is not allowlisted: '+key);
      var value=input[key];if(typeof value==='number'&&Number.isFinite(value))output[key]=Math.max(0,Math.round(value));
      else if(typeof value==='boolean')output[key]=value;
      else if(typeof value==='string'&&SAFE_TEXT.test(value))output[key]=value;
      else throw new Error('Research property has an unsafe value: '+key);
    });return output;
  }
  function track(eventType,properties){
    var consent=global.ShikeParticipantConsent&&global.ShikeParticipantConsent.status();if(!consent||!consent.active)return null;
    var session=global.ShikeResearchSession&&(global.ShikeResearchSession.current()||global.ShikeResearchSession.start());if(!session||!session.persisted)return null;
    var event={id:'re_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),eventType:eventType,properties:sanitize(eventType,properties),sessionId:session.sessionId,participantCode:consent.participantCode,timestamp:new Date().toISOString()};
    var events=read();events.push(event);write(events);return Object.freeze(event);
  }
  function clear(){if(storage())storage().removeItem(STORAGE_KEY);}
  return Object.freeze({STORAGE_KEY:STORAGE_KEY,MAX_EVENTS:MAX_EVENTS,EVENT_TYPES:Object.freeze(Object.keys(RULES)),track:track,list:read,clear:clear,sanitize:sanitize});
});
