(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeHabitDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var CN={'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7};
  function detect(text){
    text=String(text||'').trim();
    var count=text.match(/(?:本周|这周|每周).*?([一二两三四五六七\d]+)次/);
    var recurring=/(?:每天|每日|每周|每月|养成|坚持)/.test(text);
    if(!count&&!recurring)return null;
    var target=count?(/^\d+$/.test(count[1])?Number(count[1]):CN[count[1]]||null):null;
    return {type:'habit',action:text,subject:'我',object:text,personRefs:[],signal:'recurring_habit',recurrence:{frequency:/每天|每日/.test(text)?'daily':'weekly',targetCount:target}};
  }
  return Object.freeze({detect:detect});
});
