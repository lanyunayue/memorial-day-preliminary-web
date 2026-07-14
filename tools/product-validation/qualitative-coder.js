(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeQualitativeCoder=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var CODES=Object.freeze(['copy_confusion','input_discovery','draft_mismatch','edit_cost','waiting_value','next_action_value','trust_loss','comparison_advantage','comparison_disadvantage','return_motivation','return_barrier']);
  function code(input){
    input=input||{};var participantCode=String(input.participantCode||'').trim().toUpperCase();var issueCode=String(input.issueCode||'');var sessionId=String(input.sessionId||'');
    if(!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(participantCode))throw new Error('Valid participant code required.');
    if(!CODES.includes(issueCode))throw new Error('Unknown qualitative code.');if(!/^rs_[a-z0-9_]+$/i.test(sessionId))throw new Error('Valid session reference required.');
    return Object.freeze({participantCode:participantCode,sessionId:sessionId,issueCode:issueCode,severity:['low','medium','high','critical'].includes(input.severity)?input.severity:'medium',humanCoded:true,codedAt:new Date().toISOString()});
  }
  function summarize(items){var counts={};(items||[]).forEach(function(item){if(item&&item.humanCoded&&CODES.includes(item.issueCode))counts[item.issueCode]=(counts[item.issueCode]||0)+1;});return counts;}
  return Object.freeze({CODES:CODES,code:code,summarize:summarize});
});
