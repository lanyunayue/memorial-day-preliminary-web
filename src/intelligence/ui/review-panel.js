(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalReviewPanel=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function render(container,model,handlers){
    if(!container)return;model=model||{};var daily=model.daily||{};var weekly=model.weekly||{};var corrections=model.corrections||[];
    container.innerHTML='<div class="temporal-review-grid">'+
      '<div><strong>今日</strong><span>处理 '+(daily.mustHandle||[]).length+'</span><span>逾期 '+(daily.overdue||[]).length+'</span><span>等待 '+(daily.waitingOn||[]).length+'</span></div>'+
      '<div><strong>本周</strong><span>完成 '+(weekly.completed||[]).length+'</span><span>未完成承诺 '+(weekly.openCommitments||[]).length+'</span><span>重复延期 '+(weekly.repeatedlyPostponed||[]).length+'</span></div>'+
      '<div><strong>纠正记录</strong><span>'+corrections.length+' 条，仅保存在本地</span></div></div>'+
      '<div class="temporal-review-buttons"><button type="button" data-review="daily">导出今日简报</button><button type="button" data-review="weekly">导出周回顾</button><button type="button" data-review="corrections">导出纠正记录</button><button type="button" data-review="clear">清除纠正记录</button></div>';
    container.querySelectorAll('[data-review]').forEach(function(button){button.addEventListener('click',function(){handlers.action(button.getAttribute('data-review'));});});
  }
  return Object.freeze({render:render});
});
