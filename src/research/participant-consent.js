(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeParticipantConsent=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  var STORAGE_KEY='shike_research_consent_v1';
  var CONSENT_VERSION='product-truth-1';
  var CODE_PATTERN=/^[A-Z0-9][A-Z0-9_-]{2,31}$/;
  function storage(){return global.localStorage||null;}
  function read(){
    try{var raw=storage()&&storage().getItem(STORAGE_KEY);var value=raw&&JSON.parse(raw);return value&&typeof value==='object'?value:null;}catch(error){return null;}
  }
  function status(){
    var value=read();var active=!!(value&&value.status==='granted'&&value.consentVersion===CONSENT_VERSION&&CODE_PATTERN.test(value.participantCode||''));
    return Object.freeze({active:active,status:value&&value.status||'not_granted',participantCode:active?value.participantCode:null,consentVersion:CONSENT_VERSION,grantedAt:value&&value.grantedAt||null,withdrawnAt:value&&value.withdrawnAt||null});
  }
  function grant(input){
    input=input||{};var code=String(input.participantCode||'').trim().toUpperCase();
    if(input.explicitConsent!==true)throw new Error('Explicit research consent is required.');
    if(!CODE_PATTERN.test(code))throw new Error('Participant code must be 3-32 letters, numbers, hyphens, or underscores.');
    var value={status:'granted',participantCode:code,consentVersion:CONSENT_VERSION,grantedAt:new Date().toISOString(),withdrawnAt:null};
    if(!storage())throw new Error('Local storage is unavailable.');storage().setItem(STORAGE_KEY,JSON.stringify(value));return status();
  }
  function withdraw(){
    var value=read()||{};value.status='withdrawn';value.consentVersion=CONSENT_VERSION;value.withdrawnAt=new Date().toISOString();
    if(storage())storage().setItem(STORAGE_KEY,JSON.stringify(value));return status();
  }
  function clear(){if(storage())storage().removeItem(STORAGE_KEY);return status();}
  return Object.freeze({STORAGE_KEY:STORAGE_KEY,CONSENT_VERSION:CONSENT_VERSION,status:status,grant:grant,withdraw:withdraw,clear:clear,isValidParticipantCode:function(code){return CODE_PATTERN.test(String(code||'').trim().toUpperCase());}});
});
