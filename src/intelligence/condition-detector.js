(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeConditionDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function detect(text){
    text=String(text||'').trim();
    var match=text.match(/^(如果|要是|假如|若是|除非)(.+?)[，,](.+)$/);
    if(!match)return {conditional:false,condition:'',actionText:text};
    return {conditional:true,condition:match[2].trim(),actionText:match[3].trim()};
  }
  return Object.freeze({detect:detect});
});
