(function(global,ns){
  function node(id){return document.getElementById(id);}
  var currentPlan=null;
  var currentDraft=null;
  var doubleArmed=false;
  function escHtml(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function addMessage(role,text){
    var box=node('agentConversation');if(!box)return;
    var item=document.createElement('div');
    item.className='agent-message '+role;
    item.style.whiteSpace='pre-wrap';
    item.textContent=text;
    box.appendChild(item);
    box.scrollTop=box.scrollHeight;
  }
  function hidePlan(){
    currentPlan=null;currentDraft=null;doubleArmed=false;
    var section=node('agentPlan');if(section)section.hidden=true;
  }
  function renderPlan(plan){
    currentPlan=plan;currentDraft=null;doubleArmed=false;
    var section=node('agentPlan');if(!section)return;
    section.hidden=false;
    var intentEl=node('agentPlanIntent');
    var toolEl=node('agentPlanTool');
    var changeEl=node('agentPlanChange');
    var btn=node('agentExecuteBtn');
    if(intentEl)intentEl.textContent='意图：'+(plan.intent||'');
    if(toolEl)toolEl.textContent='工具：'+(plan.tool||'');
    if(changeEl)changeEl.textContent='确认：'+(plan.confirmation||'');
    if(btn)btn.textContent=plan.confirmation==='double'?'确认删除':'执行';
  }
  function renderDraft(draft){
    currentDraft=draft;currentPlan=null;doubleArmed=false;
    var section=node('agentPlan');if(!section)return;
    section.hidden=false;
    var intentEl=node('agentPlanIntent');
    var toolEl=node('agentPlanTool');
    var changeEl=node('agentPlanChange');
    var btn=node('agentExecuteBtn');
    if(intentEl)intentEl.textContent='待确认待办';
    if(toolEl)toolEl.textContent='事项：'+escHtml(draft.title||'');
    var dateLabel=draft.dateKey||'今天';
    var timeLabel=draft.timeText||('未指定'+(draft.temporalPhrase?'（'+draft.temporalPhrase+'）':''));
    if(changeEl)changeEl.textContent=dateLabel+' '+timeLabel;
    if(btn)btn.textContent='确认登记';
  }
  async function send(){
    var input=node('agentInput');var text=String(input.value||'').trim();if(!text)return;
    addMessage('user',text);input.value='';
    var response=await global.ShikeAgent.handle(text);
    if(response.cancelledDraft||response.cancelled){
      hidePlan();
      addMessage('assistant',response.message||'已取消。');
      return;
    }
    if(response.draft){
      renderDraft(response.draft);
      addMessage('assistant',response.message);
      return;
    }
    if(response.pending&&response.plan){
      renderPlan(response.plan);
      if(response.message)addMessage('assistant',response.message);
    }else{
      hidePlan();
      addMessage('assistant',response.message||'操作已完成。');
    }
  }
  async function execute(){
    if(currentDraft){
      // Confirm draft
      var response=await global.ShikeAgent.handle('确认');
      hidePlan();
      addMessage('assistant',response.message||'已登记。');
      return;
    }
    if(!currentPlan)return;
    if(currentPlan.confirmation==='double'&&!doubleArmed){
      doubleArmed=true;
      var btn=node('agentExecuteBtn');if(btn)btn.textContent='再次确认删除';
      return;
    }
    var token=currentPlan.confirmation==='double'?currentPlan.id+':double':currentPlan.id;
    var response=await global.ShikeAgent.execute(currentPlan,token);
    hidePlan();
    addMessage('assistant',response.message);
  }
  function cancel(){
    if(currentDraft){
      global.ShikeAgent.handle('取消').then(function(r){
        hidePlan();
        addMessage('assistant',r.message||'已取消。');
      });
      return;
    }
    global.ShikeAgent.cancel();
    hidePlan();
    addMessage('assistant','已取消。');
  }
  async function clear(){
    await global.ShikeAgent.clearHistory();
    var box=node('agentConversation');if(box)box.textContent='';
    hidePlan();
  }
  async function exportHistory(){
    var items=await global.ShikeAgent.history();
    downloadTextFile('shike-agent-conversation.json',JSON.stringify({app:'shike',exportedAt:new Date().toISOString(),messages:items},null,2),'application/json;charset=utf-8');
  }
  function init(){
    if(node('agentSendBtn'))node('agentSendBtn').addEventListener('click',send);
    if(node('agentInput'))node('agentInput').addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();send();}});
    if(node('agentExecuteBtn'))node('agentExecuteBtn').addEventListener('click',execute);
    if(node('agentCancelBtn'))node('agentCancelBtn').addEventListener('click',cancel);
    if(node('agentClearBtn'))node('agentClearBtn').addEventListener('click',clear);
    if(node('agentExportBtn'))node('agentExportBtn').addEventListener('click',exportHistory);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})(window,window.ShikeAgentModules);
