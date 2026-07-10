(function(global,ns){
  var registry=ns.toolRegistry.create();
  ns.createTools().forEach(function(tool){registry.register(tool);});
  var pending=null;
  function pad(n){return n<10?'0'+n:''+n;}
  function todayKey(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  async function remember(role,text,meta){
    try{await ns.conversationRepository.add(role,text,meta);}catch(e){}
    if(ns.sessionContext)ns.sessionContext.addTurn(role,text,meta);
  }
  function buildDraftPreview(draft){
    if(!draft)return '';
    var lines=[];
    lines.push('听起来你要记录一项待办：');
    lines.push('');
    lines.push('事项：'+draft.title);
    var dateLabel=draft.dateKey||'今天';
    if(draft.dateKey===todayKey())dateLabel='今天';
    var timeLabel=draft.timeText||('未指定'+(draft.temporalPhrase?'（'+draft.temporalPhrase+'）':''));
    lines.push('日期：'+dateLabel);
    lines.push('时间：'+timeLabel);
    lines.push('类型：提醒');
    lines.push('');
    lines.push('确认登记吗？你也可以说"取消"或修改时间/标题。');
    return lines.join('\n');
  }
  function resolveReference(text,ctx){
    // Resolve "它", "那个", "刚才那个", "这个" etc.
    var refPatterns=[
      {re:/^把(.+)(置顶|取消置顶|删|删除|删掉|改|编辑)/,extract:function(m){return m[1];}},
      {re:/^(置顶|删|删除|删掉|取消)(.+)/,extract:function(m){return m[2];}}
    ];
    for(var i=0;i<refPatterns.length;i++){
      var m=text.match(refPatterns[i].re);
      if(m){
        var ref=refPatterns[i].extract(m);
        var action=m[2]||m[1];
        if(/^(它|那个|这个|刚才那个|刚才这个|刚那个|刚建|刚记|刚才|那条|这一条|那一条)$/.test(ref)){
          // Reference to last created/referenced record
          var recordId=ctx.lastReferencedRecordId||ctx.lastCreatedRecordId;
          if(recordId)return{recordId:recordId,action:action};
        }
      }
    }
    return null;
  }
  async function handle(input){
    if(ns.sessionContext)ns.sessionContext.expireCheck();
    var safe=ns.safetyPolicy.validateInput(input);
    if(!safe.ok){
      var denied=ns.resultFormatter.error(safe.code);
      await remember('assistant',denied,{code:safe.code});
      return {ok:false,code:safe.code,message:denied};
    }
    var text=safe.text.trim();
    await remember('user',text);
    var ctx=ns.contextBuilder.build();
    // Check for existing pending draft - multi-turn handling
    var state=ns.sessionContext?ns.sessionContext.getState():{};
    var draft=state.pendingDraft;
    if(draft){
      var modification=ns.proactiveTaskDetector.detectModifyDraft(text,draft);
      if(modification){
        if(modification.cancel){
          ns.sessionContext.clearPendingDraft();
          var cancelMsg='已取消，未记录任何内容。';
          await remember('assistant',cancelMsg,{cancelledDraft:true});
          return {ok:true,message:cancelMsg,cancelledDraft:true};
        }
        if(modification.confirm){
          // Execute create_record with draft data
          var createPlan={
            id:'plan_draft_'+Date.now().toString(36),
            intent:'create_record',
            tool:'create_record',
            args:{title:draft.title,text:draft.title,dateKey:draft.dateKey,timeText:draft.timeText,temporalPhrase:draft.temporalPhrase,sourceText:draft.sourceText||draft.title},
            context:ctx,
            confirmation:'none',
            createdAt:Date.now()
          };
          return execute(createPlan,true);
        }
        if(modification.additional){
          // New additional task - first confirm current draft? No, create new draft
          var newDraft={
            title:modification.title,
            dateKey:draft.dateKey,
            timeText:draft.timeText,
            temporalPhrase:draft.temporalPhrase,
            sourceText:text,
            createdAt:Date.now()
          };
          ns.sessionContext.setPendingDraft(newDraft);
          var addMsg=buildDraftPreview(newDraft);
          await remember('assistant',addMsg,{newDraft:true});
          return {ok:true,pending:true,draft:newDraft,message:addMsg};
        }
        if(modification.modified){
          var updated=ns.sessionContext.updatePendingDraft(modification.patch);
          var updateMsg=buildDraftPreview(updated);
          await remember('assistant',updateMsg,{updatedDraft:true});
          return {ok:true,pending:true,draft:updated,message:updateMsg};
        }
      }
    }
    // Resolve anaphora/references before routing
    var route=null;
    var routeText=text;
    var anaphora=resolveReference(text,ctx);
    if(anaphora&&anaphora.recordId){
      // Transform the text to include the record reference
      if(/置顶|取消置顶/.test(anaphora.action)){
        route={intent:'pin_record',args:{recordId:anaphora.recordId}};
      }else if(/删|删除|删掉/.test(anaphora.action)){
        route={intent:'delete_record',args:{recordId:anaphora.recordId}};
      }
    }
    // Normal intent routing
    if(!route){
      route=ns.intentRouter.route(routeText);
    }
    // Check for proactive task detection if route is unknown or create_record
    if(route.intent==='unknown'){
      var detected=ns.proactiveTaskDetector.detect(text,ctx);
      if(detected.isTask&&detected.confidence>=0.7){
        var newDraft={
          title:detected.title,
          dateKey:detected.dateKey||todayKey(),
          timeText:detected.timeText||null,
          temporalPhrase:detected.temporalPhrase||'',
          sourceText:text,
          createdAt:Date.now(),
          confidence:detected.confidence
        };
        ns.sessionContext.setPendingDraft(newDraft);
        var previewMsg=buildDraftPreview(newDraft);
        await remember('assistant',previewMsg,{proactiveDraft:true,draft:newDraft});
        return {ok:true,pending:true,draft:newDraft,message:previewMsg,proactive:true};
      }else if(detected.isTask&&detected.confidence>=0.5&&detected.needClarification){
        var clarifyMsg='你是想记录一项"'+(detected.title||text)+'"的待办吗？';
        await remember('assistant',clarifyMsg,{needClarification:true});
        return {ok:true,message:clarifyMsg,needClarification:true};
      }
    }
    // Handle "作业已经写完了" - acknowledge completion, don't create
    if(/已经(写|做|交|完成|复习|考完|结束|搞定|好了)/.test(text)&&route.intent==='unknown'){
      var doneMsg='明白，'+text.replace(/[。.！!？?]+$/,'')+'了。';
      await remember('assistant',doneMsg,{acknowledged:true});
      return {ok:true,message:doneMsg};
    }
    ctx=ns.contextBuilder.build();
    var plan=ns.planner.plan(route,ctx);
    if(!plan.ok){
      var unknown=ns.resultFormatter.error(plan.code);
      await remember('assistant',unknown,{code:plan.code});
      return Object.assign({},plan,{message:unknown});
    }
    // Clear draft if a real plan is being created
    if(ns.sessionContext&&plan.tool!=='create_record'){
      ns.sessionContext.clearPendingDraft();
    }
    if(plan.confirmation==='none'){
      return execute(plan,true);
    }
    pending=plan;
    return {ok:true,pending:true,plan:plan};
  }
  async function execute(plan,confirmation){
    var target=plan||pending;
    if(!target)throw new Error('no_pending_plan');
    if(target.confirmation!=='none'&&(!pending||pending.id!==target.id)){
      if(target.id&&target.id.startsWith('plan_draft_')){
        // Draft confirmation - allow without pending match
      }else{
        throw new Error('confirmation_required');
      }
    }
    if(target.confirmation==='confirm'&&confirmation!==target.id&&!(target.id&&target.id.startsWith('plan_draft_')&&confirmation===true)){
      throw new Error('confirmation_required');
    }
    if(target.confirmation==='double'&&confirmation!==target.id+':double'){
      throw new Error('double_confirmation_required');
    }
    try{
      var value=await ns.executor.execute(target,registry);
      pending=null;
      if(ns.sessionContext)ns.sessionContext.clearPendingDraft();
      var message=ns.resultFormatter.result(value);
      await remember('assistant',message,{tool:target.tool});
      if(ns.sessionContext)ns.sessionContext.setActionResult({ok:true,message:message});
      return {ok:true,result:value,message:message};
    }catch(error){
      pending=null;
      var msg=ns.resultFormatter.error(error.message||error);
      await remember('assistant',msg,{code:error.message||error});
      if(ns.sessionContext)ns.sessionContext.setActionResult({ok:false,message:msg});
      return {ok:false,code:error.message||error,message:msg};
    }
  }
  function cancel(){
    pending=null;
    if(ns.sessionContext)ns.sessionContext.clearPendingDraft();
    return {ok:true,cancelled:true};
  }
  global.ShikeAgent=Object.freeze({
    handle:handle,execute:execute,cancel:cancel,
    pending:function(){return pending;},
    pendingDraft:function(){return ns.sessionContext?ns.sessionContext.getState().pendingDraft:null;},
    tools:function(){return registry.list().map(function(t){return t.name;});},
    history:ns.conversationRepository.list,
    clearHistory:function(){
      ns.conversationRepository.clear();
      if(ns.sessionContext)ns.sessionContext.clear();
    },
    localRules:true
  });
})(window,window.ShikeAgentModules);
