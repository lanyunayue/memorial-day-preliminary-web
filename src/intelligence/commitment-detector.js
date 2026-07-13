(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeCommitmentDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function people(text){
    var matches=String(text).match(/(?:老师|导师|妈妈|爸爸|客户|同事|老板|小[\u4e00-\u9fa5]|老[\u4e00-\u9fa5])/g)||[];
    return [...new Set(matches)];
  }
  function detect(text){
    text=String(text||'').trim();
    var personRefs=people(text);
    var explicit=/(?:答应|承诺|说好|约定)/.test(text);
    var delivery=/(?:交给|提交给|发给|还给|给).*(?:老师|导师|客户|同事|老板)|(?:交给|提交给|发给|还给)(?:老师|导师|客户|同事|老板)/.test(text);
    var deadlineDelivery=/(?:前|之前).*(?:交|提交|发送|完成)/.test(text);
    if(!explicit&&!delivery&&!deadlineDelivery)return null;
    var action=text.replace(/^(?:我)?(?:答应|承诺|说好|约定)/,'').trim();
    return {type:'commitment',action:action||text,subject:'我',object:action||text,personRefs:personRefs,signal:explicit?'explicit_commitment':'delivery_commitment'};
  }
  return Object.freeze({detect:detect,people:people});
});
