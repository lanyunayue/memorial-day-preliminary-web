(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeStudyExporter=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  function validateCodes(bundle,codes){
    var sessions=new Map(bundle.sessions.map(function(item){return [item.sessionId,item];}));return (codes||[]).map(function(item){var session=sessions.get(item&&item.sessionId);if(!item||item.humanCoded!==true)throw new Error('Qualitative code is not marked as human coded.');if(!session)throw new Error('Qualitative code references an unknown session.');if(session.participantCode!==item.participantCode)throw new Error('Qualitative code participant does not match its session.');return item;});
  }
  function build(exports,codes){var bundle=global.ShikeSessionAnalyzer.combine(exports);return Object.assign(bundle,{exportedAt:new Date().toISOString(),qualitativeCodes:validateCodes(bundle,codes)});}
  function download(payload){if(!global.document)return payload;var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var link=document.createElement('a');link.href=url;link.download='shike-product-validation-study.json';link.click();setTimeout(function(){URL.revokeObjectURL(url);},0);return payload;}
  return Object.freeze({build:build,download:download,validateCodes:validateCodes});
});
