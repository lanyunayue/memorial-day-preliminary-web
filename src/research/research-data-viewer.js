(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeResearchDataViewer=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  function esc(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];});}
  function render(container){
    if(!container)return;var events=global.ShikeResearchEventLog?global.ShikeResearchEventLog.list():[];var sessions=global.ShikeResearchSession?global.ShikeResearchSession.list():[];var metrics=global.ShikeValidationMetrics?global.ShikeValidationMetrics.summarize(events,sessions):{};
    var rows=events.slice().reverse().map(function(event){return '<tr><td>'+esc(event.timestamp)+'</td><td>'+esc(event.eventType)+'</td><td>'+esc(JSON.stringify(event.properties||{}))+'</td></tr>';}).join('');
    container.innerHTML='<div class="research-data-summary">参与者代码 '+esc(metrics.participantCount||0)+' · Session '+esc(metrics.sessionCount||0)+' · 事件 '+esc(metrics.eventCount||0)+'</div>'+
      '<div class="research-data-table-wrap"><table><thead><tr><th>时间</th><th>事件</th><th>非敏感属性</th></tr></thead><tbody>'+(rows||'<tr><td colspan="3">暂无研究事件</td></tr>')+'</tbody></table></div>';
  }
  return Object.freeze({render:render});
});
