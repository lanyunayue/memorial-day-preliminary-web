(function(global,ns){
  function node(id){return document.getElementById(id);}
  var currentPlan=null;
  var currentDraft=null;
  var doubleArmed=false;
  var executing=false;
  var currentQuery='';
  var lastAnswer='';
  function bear(state,meta){if(global.ShikeBearState)global.ShikeBearState.transition(state,meta||{});}
  function mode(label,online){var badge=node('agentModeBadge');if(badge){badge.textContent=label;badge.classList.toggle('online',!!online);}}
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
    while(box.children.length>60)box.removeChild(box.firstElementChild);
    box.scrollTop=box.scrollHeight;
  }
  function setRetrievalProgress(show,text){var section=node('agentRetrievalProgress');if(section)section.hidden=!show;var status=node('agentRetrievalStatus');if(status&&text)status.textContent=text;}
  function renderAnswer(response){
    var section=node('agentAnswer');if(!section)return;
    var answer=response&&String(response.answer||response.message||'').trim();
    var sources=response&&Array.isArray(response.sources)?response.sources:[];
    section.hidden=!answer;if(!answer)return;
    lastAnswer=answer;currentQuery=response.query||currentQuery;
    var text=node('agentAnswerText');if(text)text.textContent=answer;
    var updated=node('agentAnswerUpdated');if(updated)updated.textContent=response.fetchedAt?new Date(response.fetchedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'';
    var list=node('agentSourceList');if(list){
      list.textContent='';sources.slice(0,6).forEach(function(source){
        var link=document.createElement('a');link.className='agent-source-card';link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';
        var title=document.createElement('strong');title.textContent=source.title||source.source||'公开来源';
        var meta=document.createElement('span');meta.textContent=(source.source||'公开来源')+(source.confidence?' · 相关度 '+Math.round(source.confidence*100)+'%':'');
        link.appendChild(title);link.appendChild(meta);list.appendChild(link);
      });
    }
    if(global.ShikeSpriteCustomization&&global.ShikeSpriteCustomization.get().speech&&global.ShikeSpriteAudio)global.ShikeSpriteAudio.speak(answer);
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
    currentQuery=text;mode('正在理解',false);setRetrievalProgress(false);bear('listening',{reason:'input'});
    addMessage('user',text);input.value='';
    bear('thinking',{reason:'route'});
    var response;
    try{response=await global.ShikeAgent.handle(text);}catch(error){response={ok:false,message:'操作没有完成，请稍后重试。'};}
    setRetrievalProgress(false);
    if(response.cancelledDraft||response.cancelled){
      hidePlan();
      addMessage('assistant',response.message||'已取消。');
      mode('本地操作',false);bear('idle',{reason:'cancelled'});
      return;
    }
    if(response.draft){
      renderDraft(response.draft);
      addMessage('assistant',response.message);
      mode('等待确认',false);bear('waiting-confirmation',{reason:'draft'});
      return;
    }
    if(response.pending&&response.plan){
      renderPlan(response.plan);
      if(response.message)addMessage('assistant',response.message);
      mode('等待确认',false);bear('waiting-confirmation',{reason:'plan'});
    }else if(response.retrieval){
      hidePlan();renderAnswer(response);addMessage('assistant',response.answer||response.message||'暂时没有找到足够可靠的公开资料。');
      mode(response.sources&&response.sources.length?'公开资料':'资料不足',true);bear(response.sources&&response.sources.length?'success':'warning',{reason:'retrieval'});
    }else{
      hidePlan();
      addMessage('assistant',response.message||'操作已完成。');
      mode('本地操作',false);bear(response.ok===false?'error':'success',{reason:'local-result'});
    }
    renderOverview();
  }
  async function execute(){
    if(executing)return;
    setBusy(true);
    mode('正在执行',false);bear('working',{reason:'execute'});
    try{
    if(currentDraft){
      var response=await global.ShikeAgent.handle('确认');
      if(response&&response.ok)hidePlan();
      addMessage('assistant',response.message||(response&&response.ok?'已登记。':'登记失败，请重试。'));
      mode('本地操作',false);bear(response&&response.ok?'success':'error',{reason:'draft-result'});renderOverview();
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
    mode('本地操作',false);bear(response&&response.ok?'success':'error',{reason:'tool-result'});renderOverview();
    }catch(error){
      addMessage('assistant','操作失败，请稍后重试。');
      mode('操作失败',false);bear('error',{reason:'tool-error'});
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
    var answer=node('agentAnswer');if(answer)answer.hidden=true;
  }
  function clearContext(){if(global.ShikeAgent&&global.ShikeAgent.clearContext)global.ShikeAgent.clearContext();hidePlan();addMessage('assistant','当前上下文已清空，已有记录不会改变。');bear('success',{reason:'context-cleared'});}
  async function exportHistory(){
    var items=await global.ShikeAgent.history();
    downloadTextFile('shike-agent-conversation.json',JSON.stringify({app:'shike',exportedAt:new Date().toISOString(),messages:items},null,2),'application/json;charset=utf-8');
  }
  function setTab(name){
    document.querySelectorAll('[data-agent-tab]').forEach(function(button){var active=button.getAttribute('data-agent-tab')===name;button.classList.toggle('active',active);button.setAttribute('aria-selected',active?'true':'false');});
    document.querySelectorAll('[data-agent-panel]').forEach(function(panel){var active=panel.getAttribute('data-agent-panel')===name;panel.classList.toggle('active',active);panel.hidden=!active;});
    if(name==='overview')renderOverview();if(name==='settings')renderSettings();
  }
  function renderOverview(){
    var records=Array.isArray(global.records)?global.records:[];var today=todayKey();var todayRecords=records.filter(function(record){return record.dateKey===today;});
    if(node('agentTodayCount'))node('agentTodayCount').textContent=String(todayRecords.length);
    if(node('agentTodayHint'))node('agentTodayHint').textContent=todayRecords[0]?todayRecords[0].title:'暂无安排';
    if(node('agentRecordCount'))node('agentRecordCount').textContent=String(records.length);
    var recent=node('agentRecentRecords');if(recent){recent.textContent='';records.slice().sort(function(a,b){return(b.createdAt||0)-(a.createdAt||0);}).slice(0,5).forEach(function(record){var item=document.createElement('div');item.className='agent-recent-item';item.textContent=record.title||'未命名记录';if(typeof recent.appendChild==='function')recent.appendChild(item);});if(!recent.children||!recent.children.length)recent.textContent='还没有记录';}
  }
  var settingBindings={
    spriteNameInput:['name','value'],spritePrimaryInput:['primary','value'],spriteSecondaryInput:['secondary','value'],spriteEyesSelect:['eyes','value'],spriteExpressionSelect:['expression','value'],
    spriteEarsSelect:['ears','value'],spriteHatSelect:['hat','value'],spriteGlassesSelect:['glasses','value'],spriteScarfSelect:['scarf','value'],spriteBadgeSelect:['badge','value'],
    spriteAuraSelect:['aura','value'],spriteAnimationSelect:['animationIntensity','value'],sprite3dToggle:['renderer','checked'],spriteSoundToggle:['sounds','checked'],spriteSpeechToggle:['speech','checked'],
    spriteVoiceSelect:['voiceURI','value'],spriteRateInput:['rate','value'],spriteVolumeInput:['volume','value']
  };
  function renderSettings(){
    if(!global.ShikeSpriteCustomization)return;var prefs=global.ShikeSpriteCustomization.get();
    Object.keys(settingBindings).forEach(function(id){var el=node(id);if(!el)return;var binding=settingBindings[id],value=prefs[binding[0]];if(id==='sprite3dToggle')value=value==='3d';el[binding[1]]=value;});
    if(node('spriteRateValue'))node('spriteRateValue').textContent=Number(prefs.rate).toFixed(1);if(node('spriteVolumeValue'))node('spriteVolumeValue').textContent=Math.round(prefs.volume*100)+'%';
    var voice=node('spriteVoiceSelect');if(voice&&voice.options&&global.ShikeSpriteAudio){var selected=prefs.voiceURI;while(voice.options.length>1)voice.remove(1);global.ShikeSpriteAudio.voices().forEach(function(item){var option=document.createElement('option');option.value=item.voiceURI;option.textContent=item.name+' · '+item.lang;voice.appendChild(option);});voice.value=selected;}
    var hint=node('sprite3dHint');if(hint&&global.ShikeSpriteRenderer3D&&!global.ShikeSpriteRenderer3D.supported())hint.textContent='当前浏览器不支持 WebGL，将保持 2.5D';
  }
  function bindSettings(){
    if(!global.ShikeSpriteCustomization)return;
    Object.keys(settingBindings).forEach(function(id){var el=node(id);if(!el)return;var binding=settingBindings[id];el.addEventListener(id.indexOf('Input')>=0&&el.type!=='color'&&el.type!=='range'?'change':'input',function(){var value=el[binding[1]];if(id==='sprite3dToggle')value=value?'3d':'2d';if(id==='spriteRateInput'||id==='spriteVolumeInput')value=Number(value);var patch={};patch[binding[0]]=value;global.ShikeSpriteCustomization.update(patch);renderSettings();});});
    if(node('spriteResetPrefsBtn'))node('spriteResetPrefsBtn').addEventListener('click',function(){global.ShikeSpriteCustomization.reset();renderSettings();bear('success',{reason:'preferences-reset'});});
    if(node('spritePreviewSoundBtn'))node('spritePreviewSoundBtn').addEventListener('click',function(){if(global.ShikeSpriteAudio){global.ShikeSpriteAudio.unlock();global.ShikeSpriteAudio.play('confirmation');}});
  }
  function openWebSearch(){var query=encodeURIComponent(currentQuery||'');if(query)global.open('https://www.bing.com/search?q='+query,'_blank','noopener');}
  function replaySearch(){if(!currentQuery)return;var input=node('agentInput');if(input){input.value=currentQuery;send();}}
  function onRetrievalProgress(event){
    var detail=event.detail||{};
    if(detail.stage==='start'){mode('联网问答',true);setRetrievalProgress(true,'正在查询 '+(detail.providers||[]).join('、'));bear('searching',{reason:'retrieval-start'});}
    else if(detail.stage==='provider-start')setRetrievalProgress(true,'正在查询 '+detail.provider);
    else if(detail.stage==='provider-done')setRetrievalProgress(true,detail.provider+' 返回 '+(detail.count||0)+' 条资料');
    else if(detail.stage==='provider-failed')setRetrievalProgress(true,detail.provider+' 暂时不可用，继续查询其他来源');
    else if(detail.stage==='complete')setRetrievalProgress(false);
  }
  function init(){
    if(node('agentSendBtn'))node('agentSendBtn').addEventListener('click',send);
    if(node('agentInput'))node('agentInput').addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();send();}});
    if(node('agentExecuteBtn'))node('agentExecuteBtn').addEventListener('click',execute);
    if(node('agentModifyBtn'))node('agentModifyBtn').addEventListener('click',modify);
    if(node('agentCancelBtn'))node('agentCancelBtn').addEventListener('click',cancel);
    if(node('agentClearBtn'))node('agentClearBtn').addEventListener('click',clear);
    if(node('agentClearContextBtn'))node('agentClearContextBtn').addEventListener('click',clearContext);
    if(node('agentExportBtn'))node('agentExportBtn').addEventListener('click',exportHistory);
    document.querySelectorAll('[data-agent-tab]').forEach(function(button){button.addEventListener('click',function(){setTab(button.getAttribute('data-agent-tab'));});});
    document.querySelectorAll('[data-agent-page]').forEach(function(button){button.addEventListener('click',function(){if(global.switchPage)global.switchPage(button.getAttribute('data-agent-page'));});});
    if(node('agentOpenSearchBtn'))node('agentOpenSearchBtn').addEventListener('click',openWebSearch);
    if(node('agentReplaySearchBtn'))node('agentReplaySearchBtn').addEventListener('click',replaySearch);
    if(node('agentSpeakBtn'))node('agentSpeakBtn').addEventListener('click',function(){if(global.ShikeSpriteAudio)global.ShikeSpriteAudio.speak(lastAnswer,true);});
    if(node('agentStopSpeakBtn'))node('agentStopSpeakBtn').addEventListener('click',function(){if(global.ShikeSpriteAudio)global.ShikeSpriteAudio.stop();});
    global.addEventListener('shike:retrieval-progress',onRetrievalProgress);
    bindSettings();renderSettings();renderOverview();mode('本地操作',false);if(global.ShikeBrowserAI)global.ShikeBrowserAI.bindControls(node('agentAiToggle'),node('agentAiHint'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})(window,window.ShikeAgentModules);
