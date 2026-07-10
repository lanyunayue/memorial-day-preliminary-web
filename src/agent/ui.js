(function(global,ns){
  function node(id){return document.getElementById(id);}
  var currentPlan=null;
  var currentDraft=null;
  var doubleArmed=false;
  var executing=false;
  function pad2(value){return value<10?'0'+value:String(value);}
  function todayKey(){var date=new Date();return date.getFullYear()+'-'+pad2(date.getMonth()+1)+'-'+pad2(date.getDate());}
  function kindLabel(kind){return {reminder:'提醒',anniversary:'纪念',habit:'习惯',note:'备忘'}[kind]||'提醒';}
  function previewLabels(preview){
    var dateKey=preview&&preview.dateKey||'';
    var dateLabel=dateKey===todayKey()?'今天':(preview&&preview.dateText||dateKey||'未指定');
    var timeLabel=preview&&preview.timeText||(dateKey?'全天':'未指定');
    return {date:dateLabel,time:timeLabel,type:kindLabel(preview&&preview.recordKind)};
  }
  function setBusy(value){
    executing=!!value;
    ['agentExecuteBtn','agentModifyBtn','agentCancelBtn','agentSendBtn'].forEach(function(id){var button=node(id);if(button)button.disabled=executing;});
  }
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
    var modify=node('agentModifyBtn');if(modify)modify.hidden=true;
    var executeButton=node('agentExecuteBtn');if(executeButton)executeButton.textContent='执行';
  }
  function renderPlan(plan){
    currentPlan=plan;currentDraft=null;doubleArmed=false;
    var section=node('agentPlan');if(!section)return;
    section.hidden=false;
    var intentEl=node('agentPlanIntent');
    var toolEl=node('agentPlanTool');
    var changeEl=node('agentPlanChange');
    var btn=node('agentExecuteBtn');
    var modify=node('agentModifyBtn');
    var preview=null;
    if(plan&&plan.tool==='create_record'&&global.ShikeSpriteCreateIntent){
      preview=global.ShikeSpriteCreateIntent.extract(plan.args&&(plan.args.sourceText||plan.args.text)||'');
    }
    if(preview){
      var labels=previewLabels(preview);
      if(intentEl)intentEl.textContent='我理解为：';
      if(toolEl)toolEl.textContent='事项：'+(preview.title||plan.args.text||'');
      if(changeEl)changeEl.textContent='日期：'+labels.date+' · 时间：'+labels.time+' · 类型：'+labels.type;
      if(btn)btn.textContent='确认登记';
      if(modify)modify.hidden=false;
      return;
    }
    if(intentEl)intentEl.textContent='意图：'+(plan.intent||'');
    if(toolEl)toolEl.textContent='工具：'+(plan.tool||'');
    if(changeEl)changeEl.textContent='确认：'+(plan.confirmation||'');
    if(btn)btn.textContent=plan.confirmation==='double'?'确认删除':'执行';
    if(modify)modify.hidden=true;
  }
  function renderDraft(draft){
    currentDraft=draft;currentPlan=null;doubleArmed=false;
    var section=node('agentPlan');if(!section)return;
    section.hidden=false;
    var intentEl=node('agentPlanIntent');
    var toolEl=node('agentPlanTool');
    var changeEl=node('agentPlanChange');
    var btn=node('agentExecuteBtn');
    var modify=node('agentModifyBtn');
    var labels=previewLabels(draft);
    if(intentEl)intentEl.textContent='我理解为：';
    if(toolEl)toolEl.textContent='事项：'+(draft.title||'');
    if(changeEl)changeEl.textContent='日期：'+labels.date+' · 时间：'+labels.time+' · 类型：'+kindLabel(draft.recordKind||'reminder');
    if(btn)btn.textContent='确认登记';
    if(modify)modify.hidden=false;
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
    if(executing)return;
    setBusy(true);
    try{
    if(currentDraft){
      var response=await global.ShikeAgent.handle('确认');
      if(response&&response.ok)hidePlan();
      addMessage('assistant',response.message||(response&&response.ok?'已登记。':'登记失败，请重试。'));
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
    if(response&&response.ok)hidePlan();
    addMessage('assistant',response.message);
    }catch(error){
      addMessage('assistant','操作失败，请稍后重试。');
    }finally{
      setBusy(false);
    }
  }
  function modify(){
    if(executing)return;
    var input=node('agentInput');
    if(currentPlan){global.ShikeAgent.cancel();hidePlan();}
    addMessage('assistant','请告诉我要改成什么，例如“改成明天晚上八点”。');
    if(input){input.placeholder='例如：改成明天晚上八点';input.focus();}
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
    if(node('agentModifyBtn'))node('agentModifyBtn').addEventListener('click',modify);
    if(node('agentCancelBtn'))node('agentCancelBtn').addEventListener('click',cancel);
    if(node('agentClearBtn'))node('agentClearBtn').addEventListener('click',clear);
    if(node('agentExportBtn'))node('agentExportBtn').addEventListener('click',exportHistory);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})(window,window.ShikeAgentModules);
