(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeNextActionCard=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function esc(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(character){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character];});}
  function render(container,model,handlers){
    if(!container)return;model=model||{};var suggestions=model.suggestions||[];var waiting=model.waiting||{};
    var brief=model.dailyBrief||{};
    if(!suggestions.length&&!(waiting.waitingOn||[]).length){container.innerHTML='';return;}
    var html='<section class="temporal-actions"><div class="card-section-head"><div><div class="card-section-title">下一步建议</div><div class="temporal-action-summary">今日 '+(brief.mustHandle||[]).length+' · 逾期 '+(brief.overdue||[]).length+' · 等待 '+(waiting.waitingOn||[]).length+' · 今日跟进 '+(waiting.dueToday||[]).length+'</div></div></div>';
    if(!suggestions.length)html+='<div class="timeline-empty">当前没有需要立即处理的建议。</div>';
    suggestions.slice(0,3).forEach(function(item){
      html+='<article class="temporal-action" data-record-id="'+esc(item.sourceRecordId)+'">'+
        '<div class="temporal-action-kind">'+(item.kind==='waiting_for'?'等待跟进':item.kind==='commitment'?'承诺':'记录')+'</div>'+
        '<div class="temporal-action-title">'+esc(item.action)+'</div>'+
        '<div class="temporal-action-reason">'+esc(item.reason)+'</div>'+
        '<div class="temporal-action-buttons"><button type="button" data-action="detail">查看</button>'+
        '<button type="button" data-action="complete">完成</button><button type="button" data-action="later">稍后</button>'+
        '<button type="button" data-action="ignore">忽略</button><button type="button" data-action="never">不再建议</button></div></article>';
    });
    html+='</section>';container.innerHTML=html;
    container.querySelectorAll('.temporal-action').forEach(function(card){
      var id=card.getAttribute('data-record-id');card.querySelectorAll('[data-action]').forEach(function(button){button.addEventListener('click',function(){handlers.action(button.getAttribute('data-action'),id);});});
    });
  }
  return Object.freeze({render:render});
});
