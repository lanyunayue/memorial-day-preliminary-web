(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeConfidenceModel=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function band(input){
    input=input||{};
    if(input.uncertain||input.type==='thought')return 'low';
    if(input.missingFields&&input.missingFields.length)return 'medium';
    if(input.signal&&input.action)return 'high';
    return 'medium';
  }
  return Object.freeze({band:band});
});
