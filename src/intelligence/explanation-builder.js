(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeExplanationBuilder=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var REASONS={
    commitment:'检测到面向他人的交付或承诺表达。',
    waiting_for:'检测到等待他人回复、结果或确认的表达。',
    goal:'检测到长期愿望或里程碑后的计划，没有生成短期截止日期。',
    anniversary:'检测到生日、纪念日或周年表达。',
    habit:'检测到重复频率或周期目标。',
    task:'检测到具有行动和时间线索的事项。',
    thought:'表达包含不确定性，保留为低置信度想法。',
    note:'未检测到确定时间行动，保留为备忘草稿。'
  };
  function build(type,context){
    var text=REASONS[type]||REASONS.note;
    if(context&&context.conditional)text+=' 该事项仅在条件成立时执行。';
    if(context&&context.missingFields&&context.missingFields.length)text+=' 仍需确认：'+context.missingFields.join('、')+'。';
    return text;
  }
  return Object.freeze({build:build});
});
