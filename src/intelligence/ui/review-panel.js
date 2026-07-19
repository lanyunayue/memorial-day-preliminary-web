(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalReviewPanel=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  function esc(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(character){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character];});}
  function text(key,fallback,vars){
    if(global&&typeof global.tf==='function'){var translated=global.tf(key,vars);if(translated!==key)return translated;}
    var value=fallback;if(vars)Object.keys(vars).forEach(function(name){value=value.replace('{'+name+'}',vars[name]);});return value;
  }
  function metric(label,value){return '<div class="temporal-review-metric"><span>'+esc(label)+'</span><strong>'+Number(value||0)+'</strong></div>';}
  function loadLabel(band){var suffix=String(band||'low').replace(/^./,function(value){return value.toUpperCase();});return text('reviewLoad'+suffix,band==='high'?'高负荷':band==='medium'?'中等负荷':'轻负荷');}
  function render(container,model,handlers){
    if(!container)return;model=model||{};handlers=handlers||{};var daily=model.daily||{};var weekly=model.weekly||{};var corrections=model.corrections||[];var next=daily.nextAction||null;
    var range=weekly.range||{};var rangeText=[range.from,range.to].filter(Boolean).join(' - ');
    var html='<div class="temporal-review">'+
      '<div class="temporal-review-head"><div><strong>'+esc(text('reviewToday','今日'))+'</strong><span>'+esc(daily.dateKey||'')+'</span></div><span class="temporal-review-load" data-band="'+esc(daily.load&&daily.load.band||'low')+'">'+esc(loadLabel(daily.load&&daily.load.band))+'</span></div>'+
      '<div class="temporal-review-metrics" role="list">'+
        metric(text('reviewMustHandle','今天处理'),(daily.mustHandle||[]).length)+
        metric(text('reviewOverdue','已经逾期'),(daily.overdue||[]).length)+
        metric(text('reviewWaiting','等待他人'),(daily.waitingOn||[]).length)+
        metric(text('reviewTomorrow','明天'),(daily.tomorrow||[]).length)+
      '</div>';
    if(next){
      html+='<div class="temporal-review-focus" data-record-id="'+esc(next.sourceRecordId||'')+'"><div class="temporal-review-focus-copy"><span>'+esc(text('reviewNextAction','建议下一步'))+'</span><strong>'+esc(next.action)+'</strong><small>'+esc(next.reason)+'</small></div><div class="temporal-review-focus-actions">'+
        '<button type="button" data-review="detail">'+esc(text('reviewOpen','查看'))+'</button><button type="button" data-review="complete">'+esc(text('reviewComplete','完成'))+'</button><button type="button" data-review="later">'+esc(text('reviewLater','稍后'))+'</button></div></div>';
    }else{
      html+='<div class="temporal-review-quiet"><strong>'+esc(text('reviewNoPriority','当前没有紧迫事项'))+'</strong><span>'+esc(text('reviewNoPriorityHint','新的承诺、逾期或等待事项会出现在这里。'))+'</span></div>';
    }
    html+='<details class="temporal-review-details"><summary><span>'+esc(text('reviewWeekly','本周回顾'))+'</span><small>'+esc(rangeText)+'</small></summary><div class="temporal-review-metrics">'+
      metric(text('reviewCompleted','本周完成'),(weekly.completed||[]).length)+
      metric(text('reviewOpenCommitments','未完成承诺'),(weekly.openCommitments||[]).length)+
      metric(text('reviewPostponed','重复延期'),(weekly.repeatedlyPostponed||[]).length)+
      metric(text('reviewNextWeek','下周安排'),(weekly.nextWeek||[]).length)+
      '</div></details>'+
      '<details class="temporal-review-details temporal-review-data"><summary><span>'+esc(text('reviewDataTools','回顾数据'))+'</span><small>'+corrections.length+' '+esc(text('reviewLocalOnly','条本地纠正'))+'</small></summary><div class="temporal-review-buttons">'+
      '<button type="button" data-review="daily">'+esc(text('reviewExportDaily','导出今日简报'))+'</button><button type="button" data-review="weekly">'+esc(text('reviewExportWeekly','导出周回顾'))+'</button><button type="button" data-review="corrections">'+esc(text('reviewExportCorrections','导出纠正记录'))+'</button><button type="button" data-review="clear">'+esc(text('reviewClearCorrections','清除纠正记录'))+'</button></div></details></div>';
    container.innerHTML=html;
    container.querySelectorAll('[data-review]').forEach(function(button){button.addEventListener('click',function(){var focus=button.closest&&button.closest('[data-record-id]');if(typeof handlers.action==='function')handlers.action(button.getAttribute('data-review'),focus&&focus.getAttribute('data-record-id')||'');});});
  }
  return Object.freeze({render:render});
});
