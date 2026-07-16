(function(global){
  'use strict';
  var firstInputRecorded=false;
  function byId(id){return global.document&&global.document.getElementById(id);}
  function text(id,value){var element=byId(id);if(element)element.textContent=value;}
  function status(){return global.ShikeParticipantConsent.status();}
  function setMessage(message,tone){var output=byId('researchStatus');if(!output)return;output.textContent=message;output.dataset.tone=tone||'neutral';}
  function refresh(){
    var consent=status();var active=consent.active;text('researchConsentState',active?'研究记录已开启：'+consent.participantCode:'研究记录未开启');
    ['researchViewBtn','researchExportBtn','researchFeedbackBtn','researchWithdrawBtn'].forEach(function(id){var button=byId(id);if(button)button.disabled=!active;});
    var grant=byId('researchGrantBtn');if(grant)grant.disabled=active;
    if(byId('researchDataViewer')&&!byId('researchDataViewer').hidden)global.ShikeResearchDataViewer.render(byId('researchDataViewer'));
  }
  function beginSession(){
    global.ShikeResearchSession.reset();var session=global.ShikeResearchSession.start();
    global.ShikeResearchEventLog.track('session_opened',{revisit:!!session.revisit});
    if(session.revisit)global.ShikeResearchEventLog.track('revisit',{sessionCount:global.ShikeResearchSession.list().length});return session;
  }
  function grant(){
    try{
      global.ShikeParticipantConsent.grant({participantCode:byId('participantCode').value,explicitConsent:byId('researchConsentCheck').checked});beginSession();global.ShikeResearchEventLog.track('consent_granted',{});setMessage('已同意。仅记录本页列出的非敏感行为事件。','success');refresh();
    }catch(error){setMessage(error.message,'error');}
  }
  function recordFirstInput(){
    if(firstInputRecorded)return;var session=global.ShikeResearchSession.current()||global.ShikeResearchSession.start();var started=Date.parse(session.startedAt);var event=global.ShikeResearchEventLog.track('first_input',{elapsedMs:Math.max(0,Date.now()-started)});if(event)firstInputRecorded=true;
  }
  function toggleViewer(){var viewer=byId('researchDataViewer');viewer.hidden=!viewer.hidden;if(!viewer.hidden)global.ShikeResearchDataViewer.render(viewer);}
  function exportData(){var payload=global.ShikeFeedbackExporter.download();setMessage('已导出 '+payload.events.length+' 条非敏感事件。','success');}
  function deleteData(){var button=byId('researchDeleteBtn');if(button.dataset.confirm!=='1'){button.dataset.confirm='1';button.textContent='再次点击确认删除';setMessage('再次点击后将删除本机研究事件与 session，不影响产品记录。','neutral');return;}global.ShikeResearchDataCleaner.clearResearchData({includeConsent:false});button.dataset.confirm='0';button.textContent='删除研究数据';setMessage('本机研究数据已删除。','success');refresh();}
  function withdraw(){global.ShikeResearchEventLog.track('consent_withdrawn',{});global.ShikeResearchDataCleaner.optOut();setMessage('已退出研究。产品仍可正常使用，已有研究数据可单独删除。','success');refresh();}
  function feedback(){
    var score=Number(byId('researchUnderstanding').value);var friction=byId('researchFriction').value;
    try{global.ShikeResearchEventLog.track('feedback_submitted',{understandingScore:score,frictionCode:friction});setMessage('反馈已保存在本机研究日志中。','success');refresh();}catch(error){setMessage(error.message,'error');}
  }
  function createPanel(){
    var panel=document.createElement('section');panel.className='research-panel';panel.id='researchPanel';panel.setAttribute('aria-labelledby','researchPanelTitle');
    panel.innerHTML=[
      '<div class="research-panel-head"><div><strong id="researchPanelTitle">真实使用研究</strong>',
      '<span id="researchConsentState">研究记录未开启</span></div><span class="research-local-badge">仅本机</span></div>',
      '<p class="research-privacy">参与完全自愿。未同意时不记录任何研究事件；同意后也不保存输入原文、姓名、联系方式、剪贴板或浏览历史。</p>',
      '<div class="research-consent-row"><label><span>研究编号</span><input id="participantCode" autocomplete="off" maxlength="32" placeholder="由研究员提供"></label>',
      '<label class="research-check"><input id="researchConsentCheck" type="checkbox"><span>我已阅读并明确同意参与</span></label>',
      '<button type="button" id="researchGrantBtn">同意并开启记录</button></div>',
      '<details class="research-feedback"><summary>提交本次结构化反馈</summary><div class="research-feedback-grid">',
      '<label><span>我能复述产品用途</span><select id="researchUnderstanding"><option value="1">1 完全不能</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5 完全可以</option></select></label>',
      '<label><span>主要阻碍</span><select id="researchFriction"><option value="none">没有明显阻碍</option><option value="copy">不理解文案</option><option value="input">找不到输入</option><option value="draft">草稿难理解</option><option value="edit">修改成本高</option><option value="trust">不信任结果</option><option value="other">其他</option></select></label>',
      '<button type="button" id="researchFeedbackBtn" disabled>保存反馈</button></div></details>',
      '<div class="research-actions"><button type="button" id="researchViewBtn" disabled>查看数据</button><button type="button" id="researchExportBtn" disabled>导出数据</button>',
      '<button type="button" id="researchDeleteBtn">删除研究数据</button><button type="button" id="researchWithdrawBtn" disabled>退出研究</button></div>',
      '<div class="research-status" id="researchStatus" role="status" aria-live="polite"></div><div class="research-data-viewer" id="researchDataViewer" hidden></div>'
    ].join('');
    var block=byId('temporalInboxBlock');block.parentNode.insertBefore(panel,block.nextSibling);
  }
  function bind(){
    byId('researchGrantBtn').addEventListener('click',grant);byId('researchViewBtn').addEventListener('click',toggleViewer);byId('researchExportBtn').addEventListener('click',exportData);byId('researchDeleteBtn').addEventListener('click',deleteData);byId('researchWithdrawBtn').addEventListener('click',withdraw);byId('researchFeedbackBtn').addEventListener('click',feedback);byId('quickInput').addEventListener('input',recordFirstInput);
  }
  function init(){
    if(!global.ShikeResearchSession||!global.ShikeResearchSession.isValidationMode())return false;document.body.classList.add('product-validation-mode');
    var title=document.createElement('div');title.className='validation-intro';title.innerHTML='<h2>把一句混乱的话，变成可追踪的承诺、等待和下一步行动。</h2><p>每一刻沉淀，都是未来伏笔。</p>';var wrap=document.querySelector('.input-wrap');wrap.parentNode.insertBefore(title,wrap);
    text('heroGreeting','');var subtitle=document.querySelector('.hero-subtitle');if(subtitle){subtitle.textContent='每一刻沉淀，都是未来伏笔。';subtitle.removeAttribute('data-i18n');}
    var hint=document.querySelector('.input-hint');if(hint){hint.textContent='例如：我答应周五把实习证明发给老师，还在等学姐回复报名材料，今晚先整理清单。';hint.removeAttribute('data-i18n');}
    var save=byId('saveBtn');save.textContent='整理为草稿';save.removeAttribute('data-i18n');byId('quickInput').placeholder='写下你此刻真正需要处理的一句话';byId('quickInput').removeAttribute('data-i18n-ph');
    createPanel();bind();if(status().active)beginSession();refresh();return true;
  }
  global.ShikeProductValidation=Object.freeze({init:init,refresh:refresh,beginSession:beginSession});
  init();
})(typeof window!=='undefined'?window:globalThis);
