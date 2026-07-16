(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeFeedbackExporter=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  function build(){var events=global.ShikeResearchEventLog?global.ShikeResearchEventLog.list():[];var sessions=global.ShikeResearchSession?global.ShikeResearchSession.list():[];return {schema:'shike-product-validation-export',schemaVersion:1,exportedAt:new Date().toISOString(),containsRawUserText:false,remoteAnalytics:false,sessions:sessions,events:events,metrics:global.ShikeValidationMetrics?global.ShikeValidationMetrics.summarize(events,sessions):null};}
  function download(){var payload=build();if(!global.document||!global.URL||!global.Blob)return payload;var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var link=document.createElement('a');link.href=url;link.download='shike-research-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(function(){URL.revokeObjectURL(url);},0);return payload;}
  return Object.freeze({build:build,download:download});
});
