(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeResearchSession=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  var SESSIONS_KEY='shike_research_sessions_v1';
  var PARTICIPANT_KEY='shike_research_participant_v1';
  var current=null;
  function storage(){return global.localStorage||null;}
  function parse(key,fallback){try{var raw=storage()&&storage().getItem(key);return raw?JSON.parse(raw):fallback;}catch(error){return fallback;}}
  function write(key,value){if(storage())storage().setItem(key,JSON.stringify(value));}
  function validationMode(){try{return new URLSearchParams(global.location&&global.location.search||'').get('validation')==='1';}catch(error){return false;}}
  function id(){return 'rs_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);}
  function start(){
    if(current)return current;var consent=global.ShikeParticipantConsent&&global.ShikeParticipantConsent.status();var now=new Date().toISOString();
    if(!consent||!consent.active){current=Object.freeze({sessionId:id(),participantCode:null,startedAt:now,persisted:false,validationMode:validationMode()});return current;}
    var participant=parse(PARTICIPANT_KEY,null);var isRevisit=!!(participant&&participant.participantCode===consent.participantCode);
    participant={participantCode:consent.participantCode,firstSeenAt:isRevisit?participant.firstSeenAt:now,lastSeenAt:now,sessionCount:isRevisit?Number(participant.sessionCount||0)+1:1};write(PARTICIPANT_KEY,participant);
    current=Object.freeze({sessionId:id(),participantCode:consent.participantCode,startedAt:now,persisted:true,validationMode:validationMode(),revisit:isRevisit});
    var sessions=parse(SESSIONS_KEY,[]);if(!Array.isArray(sessions))sessions=[];sessions.push(current);write(SESSIONS_KEY,sessions.slice(-1000));return current;
  }
  function reset(){current=null;}
  function list(){var sessions=parse(SESSIONS_KEY,[]);return Array.isArray(sessions)?sessions:[];}
  function clear(){current=null;if(storage()){storage().removeItem(SESSIONS_KEY);storage().removeItem(PARTICIPANT_KEY);}}
  return Object.freeze({SESSIONS_KEY:SESSIONS_KEY,PARTICIPANT_KEY:PARTICIPANT_KEY,isValidationMode:validationMode,start:start,current:function(){return current;},reset:reset,list:list,clear:clear});
});
