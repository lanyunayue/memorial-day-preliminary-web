(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeAnniversaryDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function detect(text){
    text=String(text||'').trim();
    if(!/(?:生日|纪念日|周年)/.test(text))return null;
    var person=(text.match(/(?:妈妈|爸爸|老师|小[\u4e00-\u9fa5]|老[\u4e00-\u9fa5])/)||[])[0]||'';
    return {type:'anniversary',action:text,subject:person||'纪念日',object:text,personRefs:person?[person]:[],signal:'anniversary'};
  }
  return Object.freeze({detect:detect});
});
