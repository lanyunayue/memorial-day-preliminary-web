(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeLifeInboxPreview=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var TYPES=[
    ['commitment','承诺'],['waiting_for','等待'],['task','任务'],['goal','目标'],['event','日程'],
    ['anniversary','纪念'],['habit','习惯'],['note','备忘'],['thought','想法']
  ];
  var REJECTIONS={negated:'否定表达，未创建',completed_fact:'已完成事实，未创建未来提醒',prompt_injection:'越权指令，未执行',chitchat:'闲聊内容，未创建',duplicate:'重复内容，未创建'};
  function esc(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(character){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character];});}
  function typeOptions(current){return TYPES.map(function(item){return '<option value="'+item[0]+'"'+(item[0]===current?' selected':'')+'>'+item[1]+'</option>';}).join('');}
  function segment(draft){return draft.sourceText.slice(draft.sourceSpan.start,draft.sourceSpan.end)||draft.action;}
  function render(container,state,handlers){
    if(!container)return;
    var drafts=state.drafts||[];var rejected=state.rejected||[];
    if(!drafts.length&&!rejected.length){container.innerHTML='';container.classList.add('hidden');return;}
    var html='<section class="temporal-inbox" aria-live="polite"><div class="temporal-inbox-head"><div><strong>生活收件箱</strong><span>'+drafts.length+' 条待确认</span></div>';
    if(drafts.length>1)html+='<button type="button" class="temporal-confirm-all"'+(state.persisting?' disabled':'')+'>全部确认</button>';
    if(!drafts.length&&rejected.length)html+='<button type="button" class="temporal-dismiss">关闭</button>';
    html+='</div>';
    if(state.persisting)html+='<div class="temporal-state-note">正在保存本地草稿...</div>';
    if(state.error)html+='<div class="temporal-state-note is-error">'+esc(state.error)+'</div>';
    drafts.forEach(function(draft){
      var saving=state.saving&&state.saving.has(draft.id);var date=draft.normalizedTime&&draft.normalizedTime.dateKey||'';var time=draft.normalizedTime&&draft.normalizedTime.timeText||'';
      html+='<article class="temporal-draft" data-draft-id="'+esc(draft.id)+'">'+
        '<div class="temporal-draft-source">'+esc(segment(draft))+'</div>'+
        '<div class="temporal-draft-action">'+esc(draft.action||draft.object)+'</div>'+
        '<div class="temporal-draft-fields"><label>类型<select class="temporal-type"'+(saving?' disabled':'')+'>'+typeOptions(draft.type)+'</select></label>'+
        '<label>日期<input class="temporal-date" type="date" value="'+esc(date)+'"'+(saving?' disabled':'')+'></label>'+
        '<label>时间<input class="temporal-time" type="time" value="'+esc(time)+'"'+(saving?' disabled':'')+'></label></div>'+
        '<div class="temporal-draft-meta"><span>'+({high:'高置信度',medium:'中置信度',low:'低置信度'}[draft.confidenceBand]||'低置信度')+'</span><span>'+esc(draft.explanation)+'</span></div>'+
        (draft.condition?'<div class="temporal-condition">条件：'+esc(draft.condition)+'</div>':'')+
        (draft.missingFields&&draft.missingFields.length?'<div class="temporal-missing">待补充：'+esc(draft.missingFields.join('、'))+'</div>':'')+
        '<div class="temporal-draft-buttons"><button type="button" class="temporal-confirm"'+(saving||state.persisting||state.error?' disabled':'')+'>'+(saving?'保存中...':'确认')+'</button><button type="button" class="temporal-cancel"'+(saving?' disabled':'')+'>取消</button></div></article>';
    });
    rejected.forEach(function(item){html+='<div class="temporal-rejected"><span>'+esc(item.sourceText)+'</span><small>'+esc(REJECTIONS[item.reason]||'未创建记录')+'</small></div>';});
    html+='</section>';container.classList.remove('hidden');container.innerHTML=html;
    var all=container.querySelector('.temporal-confirm-all');if(all)all.addEventListener('click',handlers.confirmAll);
    var dismiss=container.querySelector('.temporal-dismiss');if(dismiss)dismiss.addEventListener('click',handlers.dismiss);
    container.querySelectorAll('.temporal-draft').forEach(function(card){
      var id=card.getAttribute('data-draft-id');
      card.querySelector('.temporal-type').addEventListener('change',function(event){handlers.update(id,{type:event.target.value});});
      card.querySelector('.temporal-date').addEventListener('change',function(event){handlers.updateTime(id,'dateKey',event.target.value);});
      card.querySelector('.temporal-time').addEventListener('change',function(event){handlers.updateTime(id,'timeText',event.target.value);});
      card.querySelector('.temporal-confirm').addEventListener('click',function(){handlers.confirm(id);});
      card.querySelector('.temporal-cancel').addEventListener('click',function(){handlers.cancel(id);});
    });
  }
  return Object.freeze({render:render});
});
