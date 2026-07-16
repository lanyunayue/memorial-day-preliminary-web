(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeNegationDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function detect(text){
    text=String(text||'');
    var completed=/(?:昨天|前天|刚才|已经|已于|早就).*(?:完成|交给|提交|联系|回复|处理|做完|寄出)/.test(text)||/(?:已经|已完成|做完了)/.test(text);
    var negated=/(?:^|[，,。；;\s])(?:不用|不要|别|无需|不必|不需要|取消)(?:再)?(?:提醒|记录|添加|安排|创建)?/.test(text);
    var sensitivePreference=/(?:我不喜欢|我讨厌|我的性格|我的人格)/.test(text);
    return {negated:negated,completedFact:completed,sensitivePreference:sensitivePreference,blocked:negated||completed||sensitivePreference};
  }
  return Object.freeze({detect:detect});
});
