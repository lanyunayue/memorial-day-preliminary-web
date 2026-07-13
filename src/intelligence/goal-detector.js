(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGoalDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function detect(text){
    text=String(text||'').trim();
    if(!/(?:目标|想要|想|希望|打算|计划).*(?:以后|未来|毕业|长期|有一天)|(?:毕业后|以后|未来).*(?:想|打算|计划|可能)/.test(text))return null;
    return {type:'goal',action:text,subject:'我',object:text,personRefs:[],signal:/(?:可能|也许|看情况)/.test(text)?'uncertain_goal':'long_term_goal'};
  }
  return Object.freeze({detect:detect});
});
