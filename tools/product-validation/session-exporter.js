(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeStudyExporter=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  function build(exports,codes){var bundle=global.ShikeSessionAnalyzer.combine(exports);return Object.assign(bundle,{exportedAt:new Date().toISOString(),qualitativeCodes:(codes||[]).filter(function(item){return item&&item.humanCoded===true;})});}
  function download(payload){if(!global.document)return payload;var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var link=document.createElement('a');link.href=url;link.download='shike-product-validation-study.json';link.click();setTimeout(function(){URL.revokeObjectURL(url);},0);return payload;}
  return Object.freeze({build:build,download:download});
});
