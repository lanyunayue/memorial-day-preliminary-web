(function(global,factory){
  var modules={
    intelligence:global.ShikeTemporalIntelligence,temporalRepository:global.ShikeTemporalRepository,
    graphBuilder:global.ShikeGraphBuilder,graphRepository:global.ShikeGraphRepository,graphIntegrity:global.ShikeGraphIntegrity,graphSerializer:global.ShikeGraphSerializer,
    waitingEngine:global.ShikeWaitingForEngine,waitingRepository:global.ShikeWaitingForRepository,nextAction:global.ShikeNextActionEngine,
    daily:global.ShikeDailyBrief,weekly:global.ShikeWeeklyReview,correctionStore:global.ShikeCorrectionStore,adaptationStore:global.ShikeAdaptationRuleStore,adaptationEngine:global.ShikeAdaptationEngine,memory:global.ShikeTemporalMemory,
    operation:global.ShikeTemporalOperation,operationJournal:global.ShikeOperationJournal,operationLock:global.ShikeTemporalOperationLock,
    operationCoordinator:global.ShikeOperationCoordinator,operationRecovery:global.ShikeOperationRecovery,consistencyAuditor:global.ShikeTemporalConsistencyAuditor,
    backupAdapter:global.ShikeChronosBackupAdapter,inboxView:global.ShikeLifeInboxPreview,actionView:global.ShikeNextActionCard,reviewView:global.ShikeTemporalReviewPanel,legacyAdapter:global.ShikeLegacyRecordAdapter
  };
  if(typeof module!=='undefined'&&module.exports){modules={
    intelligence:require('./intelligence-controller.js'),temporalRepository:require('./temporal-repository.js'),
    graphBuilder:require('../graph/graph-builder.js'),graphRepository:require('../graph/graph-repository.js'),graphIntegrity:require('../graph/graph-integrity.js'),graphSerializer:require('../graph/graph-serializer.js'),
    waitingEngine:require('./waiting-for-engine.js'),waitingRepository:require('./waiting-for-repository.js'),nextAction:require('./next-action-engine.js'),
    daily:require('./daily-brief.js'),weekly:require('./weekly-review.js'),correctionStore:require('./correction-store.js'),adaptationStore:require('./adaptation-rule-store.js'),adaptationEngine:require('./adaptation-engine.js'),memory:require('./temporal-memory.js'),
    operation:require('./transactions/temporal-operation.js'),operationJournal:require('./transactions/operation-journal.js'),operationLock:require('./transactions/operation-lock.js'),
    operationCoordinator:require('./transactions/operation-coordinator.js'),operationRecovery:require('./transactions/operation-recovery.js'),consistencyAuditor:require('./transactions/consistency-auditor.js'),
    backupAdapter:require('./adapters/backup-adapter.js'),inboxView:require('./ui/life-inbox-preview.js'),actionView:require('./ui/next-action-card.js'),reviewView:require('./ui/review-panel.js'),legacyAdapter:require('./adapters/legacy-record-adapter.js')
  };}
  var api=factory(modules,global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeChronosWeb=api;
})(typeof window!=='undefined'?window:globalThis,function(modules,global){
  'use strict';

  var NEVER_KEY='shike_temporal_never_suggest_v1';
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function readNever(){try{var value=JSON.parse(global.localStorage.getItem(NEVER_KEY)||'[]');return new Set(Array.isArray(value)?value:[]);}catch(error){return new Set();}}
  function writeNever(values){try{global.localStorage.setItem(NEVER_KEY,JSON.stringify([...values]));}catch(error){}}
  function defaultApi(){return {
    getRecords:function(){return[];},createRecordId:function(){return 'record_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);},
    prepareRecord:function(draft,id){return modules.intelligence.toRecord(draft,function(){return id;});},
    saveRecord:function(){return null;},writeRecord:function(record,draft){return Promise.resolve(this.saveRecord(draft,record.id));},
    removeRecord:function(){},removeRecordDurably:function(id){this.removeRecord(id);return Promise.resolve(true);},
    updateRecord:function(){return false;},updateRecordDurably:function(id,changes){return Promise.resolve(this.updateRecord(id,changes));},
    clearInput:function(){},onCaptureStart:function(){},openDetail:function(){},notify:function(){},refresh:function(){},download:function(){}
  };}
  function create(options){
    options=options||{};var api=defaultApi();var temporalRepository=null;var graphRepository=null;var waitingRepository=null;var correctionStore=null;var adaptationStore=null;var operationJournal=null;var operationLock=null;var operationCoordinator=null;var operationRecovery=null;var backupAdapter=null;var initialized=false;var renderToken=0;
    var waitingTombstones=new Map();
    var state={sourceText:'',drafts:[],rejected:[],persisting:false,error:'',saving:new Set(),ignored:new Set(),never:readNever(),lastModel:null,lastReview:null,memoryIndex:null,adaptationRules:[],lastRecovery:null,lastConsistency:null};
    function notify(message,type){api.notify(message,type||'warn');}
    function previewContainer(){return global.document&&global.document.getElementById('temporalInboxBlock');}
    function actionContainer(){return global.document&&global.document.getElementById('temporalActionBlock');}
    function reviewContainer(){return global.document&&global.document.getElementById('temporalReviewBlock');}
    async function refreshAdaptationRules(){
      if(!adaptationStore||!correctionStore)return[];var existing=await adaptationStore.list();var byId=new Map(existing.map(function(rule){return [rule.ruleId,rule];}));var derived=modules.adaptationEngine.deriveFromCorrections(await correctionStore.list());
      for(var index=0;index<derived.length;index++){var previous=byId.get(derived[index].ruleId);if(!previous)await adaptationStore.put(derived[index]);else await adaptationStore.put(Object.assign({},derived[index],previous,{sourceCorrectionIds:[...new Set(previous.sourceCorrectionIds.concat(derived[index].sourceCorrectionIds))]}));}
      state.adaptationRules=await adaptationStore.list();return copy(state.adaptationRules);
    }
    function logCorrection(input){if(correctionStore)correctionStore.record(input).then(refreshAdaptationRules).catch(function(){});}
    function renderPreview(){modules.inboxView.render(previewContainer(),state,{confirm:confirmDraft,confirmAll:confirmAll,update:updateDraft,updateTime:updateDraftTime,cancel:cancelDraft,dismiss:dismiss});}
    function removeDraftFromState(id){state.drafts=state.drafts.filter(function(draft){return draft.id!==id;});if(!state.drafts.length){state.rejected=[];api.clearInput(state.sourceText);state.sourceText='';}renderPreview();}
    function dismiss(){state.drafts=[];state.rejected=[];state.error='';api.clearInput(state.sourceText);state.sourceText='';renderPreview();}
    function shouldCapture(result){return result.rejected.length>0||result.drafts.length>1||result.drafts.some(function(draft){return ['commitment','waiting_for','goal','anniversary','habit','thought'].includes(draft.type);});}
    function captureIfNeeded(text){
      text=String(text||'').trim();if(!text)return false;
      var result=modules.intelligence.analyze(text,{referenceDate:new Date()});result.drafts=result.drafts.map(function(draft){return modules.adaptationEngine.applyDraft(draft,state.adaptationRules).draft;});if(!shouldCapture(result))return false;
      if(state.sourceText===text&&(state.drafts.length||state.rejected.length)){renderPreview();return true;}
      api.onCaptureStart(text);
      state.sourceText=text;state.drafts=result.drafts;state.rejected=result.rejected;state.error='';state.persisting=state.drafts.length>0;renderPreview();
      if(!state.drafts.length)return true;
      temporalRepository.saveDrafts(state.drafts).then(function(){state.persisting=false;renderPreview();}).catch(function(){state.persisting=false;state.error='草稿未能写入本地存储，暂不能确认。';renderPreview();notify(state.error,'error');});
      return true;
    }
    function updateDraft(id,changes){
      var index=state.drafts.findIndex(function(draft){return draft.id===id;});if(index<0||state.saving.has(id))return;
      try{
        var previous=state.drafts[index];var next=modules.intelligence.updateDraft(previous,changes);state.drafts[index]=next;state.error='';renderPreview();
        temporalRepository.saveDrafts([next]).then(function(){logCorrection({eventType:'draft_edited',draftId:id,sourceText:previous.sourceText,originalType:previous.type,correctedType:next.type,modifiedFields:Object.keys(changes)});}).catch(function(){state.error='修改未能保存，请重试。';renderPreview();});
      }catch(error){notify('草稿修改无效','error');}
    }
    function updateDraftTime(id,key,value){
      var draft=state.drafts.find(function(item){return item.id===id;});if(!draft)return;
      var normalized=Object.assign({},draft.normalizedTime||{},{dateKey:draft.normalizedTime&&draft.normalizedTime.dateKey||'',timeText:draft.normalizedTime&&draft.normalizedTime.timeText||''});normalized[key]=value;
      updateDraft(id,{normalizedTime:normalized,timeExpression:[normalized.dateKey,normalized.timeText].filter(Boolean).join(' ')});
    }
    function cancelDraft(id){
      if(state.saving.has(id))return;state.saving.add(id);renderPreview();
      var draft=state.drafts.find(function(item){return item.id===id;});
      temporalRepository.setStatus(id,'cancelled').catch(function(){return temporalRepository.removeDraft(id);}).then(function(){logCorrection({eventType:'draft_cancelled',draftId:id,sourceText:draft&&draft.sourceText,originalType:draft&&draft.type});removeDraftFromState(id);}).catch(function(){state.saving.delete(id);state.error='取消操作未能保存。';renderPreview();});
    }
    function createPayload(draft,recordId){
      return {operationType:'create_record',recordId:recordId,draftId:draft.id,type:draft.type,sourceSpan:draft.sourceSpan,personRefs:draft.personRefs||[],normalizedTime:draft.normalizedTime||null,recurrence:draft.recurrence||null,action:draft.action||'',object:draft.object||''};
    }
    function createPlan(draft,recordId){
      var operationId='create:'+draft.id;var payload=createPayload(draft,recordId);var record=null;
      async function currentRecord(){record=api.getRecords().find(function(item){return item.id===recordId;})||record;if(record)return record;record=api.prepareRecord(draft,recordId);if(!record||record.id!==recordId)throw new Error('prepared_record_id_mismatch');return record;}
      return {operationId:operationId,operationType:'create_record',recordId:recordId,draftId:draft.id,payload:payload,pendingSteps:['record','sidecars','draft','correction'],steps:[
        {name:'record',status:'record_written',run:async function(){var existing=api.getRecords().find(function(item){return item.id===recordId;});if(existing){record=existing;return existing;}var next=await currentRecord();var written=await api.writeRecord(next,draft);if(!written||written.id!==recordId)throw new Error('record_write_failed');record=written;return written;}},
        {name:'sidecars',status:'sidecars_written',run:async function(){var next=await currentRecord();var graph=modules.graphBuilder.build(draft,next);await graphRepository.replaceForRecord(recordId,graph);if(draft.type==='waiting_for'){var waiting=modules.waitingEngine.fromDraft(draft,next,new Date());await waitingRepository.upsert(waiting);}return true;}},
        {name:'draft',status:'sidecars_written',run:function(){return temporalRepository.setStatus(draft.id,'confirmed');}},
        {name:'correction',status:'sidecars_written',run:function(){return correctionStore.record({id:'correction:'+operationId,eventType:'draft_confirmed',recordId:recordId,draftId:draft.id,sourceText:draft.sourceText,originalType:draft.type,correctedType:draft.type,createdAt:new Date().toISOString()});}}
      ]};
    }
    async function resolveRecoveryPlan(operation){
      if(operation.operationType!=='create_record')return null;var draft=await temporalRepository.getDraft(operation.draftId);if(!draft)return null;return createPlan(draft,operation.recordId);
    }
    async function runConsistencyAudit(){
      if(!initialized)return null;var values=await Promise.all([graphRepository.snapshot(),waitingRepository.list(),operationJournal.list(),temporalRepository.listDrafts()]);
      state.lastConsistency=modules.consistencyAuditor.audit({records:api.getRecords(),graph:values[0],waiting:values[1],operations:values[2],drafts:values[3]});return copy(state.lastConsistency);
    }
    async function rebuildConsistency(){
      var report=await runConsistencyAudit();var operations=await operationJournal.list();var drafts=await temporalRepository.listDrafts();var draftById=new Map(drafts.map(function(item){return [item.id,item];}));
      for(var index=0;index<report.findings.length;index++){
        var finding=report.findings[index];
        if(finding.code==='dangling_graph')await graphRepository.purgeRecord(finding.recordId);
        else if(finding.code==='dangling_waiting'){var waiting=await waitingRepository.list();var dangling=waiting.find(function(item){return item.id===finding.waitingId;});if(dangling)await waitingRepository.remove(dangling.id);}
        else if(['missing_graph','missing_waiting'].includes(finding.code)){
          var operation=operations.find(function(item){return item.operationType==='create_record'&&item.recordId===finding.recordId;});var draft=operation&&draftById.get(operation.draftId);var record=api.getRecords().find(function(item){return item.id===finding.recordId;});
          if(draft&&record){if(finding.code==='missing_graph')await graphRepository.replaceForRecord(record.id,modules.graphBuilder.build(draft,record));if(finding.code==='missing_waiting'&&draft.type==='waiting_for')await waitingRepository.upsert(modules.waitingEngine.fromDraft(draft,record,new Date()));}
        }
      }
      state.lastConsistency=await runConsistencyAudit();await renderInsights(api.getRecords());return copy(state.lastConsistency);
    }
    async function confirmDraft(id){
      var draft=state.drafts.find(function(item){return item.id===id;});if(!draft||state.persisting||state.error||state.saving.has(id))return false;
      var operationId='create:'+draft.id;var existingOperation=await operationJournal.get(operationId);if(!existingOperation&&modules.legacyAdapter.isDuplicate(draft,api.getRecords())){notify('这条记录已存在，未重复保存。','warn');return false;}
      state.saving.add(id);renderPreview();var recordId=existingOperation&&existingOperation.recordId||api.createRecordId();
      try{
        await operationCoordinator.execute(createPlan(draft,recordId));state.saving.delete(id);state.error='';removeDraftFromState(id);api.refresh();await renderInsights(api.getRecords());await runConsistencyAudit();return true;
      }catch(error){
        state.saving.delete(id);state.error='记录写入被中断，恢复日志已保留；重新打开页面会安全恢复。';renderPreview();notify(state.error,'error');return false;
      }
    }
    async function confirmAll(){var ids=state.drafts.map(function(draft){return draft.id;});for(var i=0;i<ids.length;i++){var completed=await confirmDraft(ids[i]);if(!completed)break;}}
    async function auditGraph(){
      var graph=await graphRepository.snapshot();var result=modules.graphIntegrity.audit(graph);if(result.valid)return graph;
      if(global.ShikeIndexedDb)await global.ShikeIndexedDb.put('temporal_meta',{id:'graph_recovery:'+Date.now(),schemaVersion:1,reason:result.errors.join(','),graph:copy(graph),createdAt:new Date().toISOString()});
      var isolated=modules.graphIntegrity.quarantine(graph).graph;await graphRepository.replaceAll(isolated);notify('时间图谱损坏内容已隔离，记录数据未受影响。','warn');return isolated;
    }
    async function renderInsights(records){
      if(!initialized)return;var token=++renderToken;
      try{
        var graph=await auditGraph();var waiting=await waitingRepository.list();var refreshed=modules.waitingEngine.refresh(waiting,new Date());
        if(JSON.stringify(waiting)!==JSON.stringify(refreshed))await waitingRepository.replaceAll(refreshed);
        var hidden=[...state.never,...state.ignored];var suggestions=modules.nextAction.compute({records:records||api.getRecords(),graph:graph,waiting:refreshed,neverSuggestRecordIds:hidden,now:new Date()});
        var waitingQueries=modules.waitingEngine.queries(refreshed,new Date());var dailyBrief=modules.daily.generate({records:records||api.getRecords(),graph:graph,waiting:refreshed,suggestions:suggestions,now:new Date()});if(token!==renderToken)return;
        state.memoryIndex=modules.memory.buildIndex(records||api.getRecords(),graph);
        state.lastModel={suggestions:suggestions,waiting:waitingQueries,dailyBrief:dailyBrief,graph:{nodeCount:graph.nodes.length,edgeCount:graph.edges.length}};
        modules.actionView.render(actionContainer(),state.lastModel,{action:handleSuggestionAction});
        if(reviewContainer())await renderReviews();
      }catch(error){if(token===renderToken){var container=actionContainer();if(container)container.innerHTML='';notify('时间建议暂时不可用，记录功能仍可使用。','warn');}}
    }
    async function handleSuggestionAction(action,recordId){
      if(action==='detail'){api.openDetail(recordId);return;}
      if(action==='ignore'){state.ignored.add(recordId);logCorrection({eventType:'suggestion_ignored',recordId:recordId});await renderInsights(api.getRecords());return;}
      if(action==='never'){state.never.add(recordId);writeNever(state.never);logCorrection({eventType:'suggestion_never',recordId:recordId});await renderInsights(api.getRecords());return;}
      if(action==='later'){api.updateRecord(recordId,{postpone:true});logCorrection({eventType:'suggestion_later',recordId:recordId});notify('已按你的选择稍后处理。','success');api.refresh();await renderInsights(api.getRecords());return;}
      if(action==='complete'){
        api.updateRecord(recordId,{recordState:'completed'});var waiting=await waitingRepository.list();var item=waiting.find(function(entry){return entry.recordId===recordId;});if(item)await waitingRepository.upsert(modules.waitingEngine.transition(item,'resolved'));logCorrection({eventType:'suggestion_accepted',recordId:recordId});notify('已标记完成。','success');api.refresh();await renderInsights(api.getRecords());
      }
    }
    async function renderReviews(){
      if(!initialized||!reviewContainer())return;var graph=await auditGraph();var waiting=await waitingRepository.list();var corrections=await correctionStore.list();var dailyBrief=state.lastModel&&state.lastModel.dailyBrief||modules.daily.generate({records:api.getRecords(),graph:graph,waiting:waiting,now:new Date()});
      var review=modules.weekly.generate({records:api.getRecords(),graph:graph,waiting:waiting,corrections:corrections,now:new Date()});state.lastReview={daily:dailyBrief,weekly:review,corrections:corrections};modules.reviewView.render(reviewContainer(),state.lastReview,{action:handleReviewAction});
    }
    async function handleReviewAction(action){
      if(action==='daily'){api.download('shike-daily-brief.txt',modules.daily.exportText(state.lastReview.daily),'text/plain;charset=utf-8');return;}
      if(action==='weekly'){api.download('shike-weekly-review.json',modules.weekly.exportJson(state.lastReview.weekly),'application/json;charset=utf-8');return;}
      if(action==='corrections'){api.download('shike-corrections.json',JSON.stringify(await correctionStore.exportData(),null,2),'application/json;charset=utf-8');return;}
      if(action==='clear'&&(!global.confirm||global.confirm('清除全部本地纠正记录？'))){await correctionStore.clear();await renderReviews();notify('纠正记录已清除。','success');}
    }
    async function init(nextApi){
      api=Object.assign(defaultApi(),nextApi||{});
      temporalRepository=options.temporalRepository||modules.temporalRepository.create();
      graphRepository=options.graphRepository||modules.graphRepository.create();
      waitingRepository=options.waitingRepository||modules.waitingRepository.create();
      correctionStore=options.correctionStore||modules.correctionStore.create(global.ShikeIndexedDb?undefined:modules.correctionStore.memoryDriver());
      adaptationStore=options.adaptationStore||modules.adaptationStore.create(global.ShikeIndexedDb?undefined:modules.adaptationStore.memoryDriver());
      operationJournal=options.operationJournal||modules.operationJournal.create(global.ShikeIndexedDb?undefined:modules.operationJournal.memoryDriver());
      operationLock=options.operationLock||modules.operationLock.create(global.ShikeIndexedDb?undefined:modules.operationLock.memoryDriver(),options.lockOptions);
      operationCoordinator=options.operationCoordinator||modules.operationCoordinator.create({journal:operationJournal,lock:operationLock,fault:options.fault});
      operationRecovery=options.operationRecovery||modules.operationRecovery.create({journal:operationJournal,coordinator:operationCoordinator,resolvePlan:resolveRecoveryPlan,maxRetries:3});
      backupAdapter=options.backupAdapter||modules.backupAdapter.create({graphRepository:graphRepository,waitingRepository:waitingRepository,adaptationStore:adaptationStore});initialized=true;
      try{
        state.adaptationRules=await adaptationStore.list();
        var drafts=await temporalRepository.listDrafts();
        state.drafts=drafts.filter(function(draft){return draft.status==='draft';});
        if(state.drafts.length)state.sourceText=state.drafts[0].sourceText;
        state.lastRecovery=await operationRecovery.scan();
        drafts=await temporalRepository.listDrafts();
        state.drafts=drafts.filter(function(draft){return draft.status==='draft';});
        renderPreview();await renderInsights(api.getRecords());await runConsistencyAudit();
        if(state.lastRecovery.recovered)notify('已安全恢复 '+state.lastRecovery.recovered+' 个中断操作。','success');
        if(state.lastRecovery.quarantined)notify('有时间操作无法自动恢复，已隔离。','warn');
      }catch(error){notify('时间智能存储初始化失败，基础记录仍可使用。','warn');}
      return true;
    }
    async function tombstoneRecord(recordId){
      if(!initialized)return false;await graphRepository.tombstoneRecord(recordId);var waiting=await waitingRepository.list();var item=waiting.find(function(entry){return entry.recordId===recordId;});
      if(item){waitingTombstones.set(recordId,copy(item));if(global.ShikeIndexedDb)await global.ShikeIndexedDb.put('temporal_meta',{id:'waiting_tombstone:'+recordId,schemaVersion:1,waiting:copy(item),deletedAt:new Date().toISOString()});await waitingRepository.remove(item.id);}return true;
    }
    async function restoreRecord(recordId){
      if(!initialized)return false;var restored=false;try{await graphRepository.restoreRecord(recordId);restored=true;}catch(error){if(error.message!=='graph_tombstone_not_found')throw error;}
      var waiting=waitingTombstones.get(recordId);if(!waiting&&global.ShikeIndexedDb){var stored=await global.ShikeIndexedDb.get('temporal_meta','waiting_tombstone:'+recordId);waiting=stored&&stored.waiting;}
      if(waiting){await waitingRepository.upsert(waiting);waitingTombstones.delete(recordId);if(global.ShikeIndexedDb)await global.ShikeIndexedDb.remove('temporal_meta','waiting_tombstone:'+recordId);restored=true;}
      await renderInsights(api.getRecords());return restored;
    }
    async function purgeRecord(recordId){
      if(!initialized)return false;await graphRepository.purgeRecord(recordId);var waiting=await waitingRepository.list();var item=waiting.find(function(entry){return entry.recordId===recordId;});if(item)await waitingRepository.remove(item.id);waitingTombstones.delete(recordId);if(global.ShikeIndexedDb)await global.ShikeIndexedDb.remove('temporal_meta','waiting_tombstone:'+recordId);return true;
    }
    function augmentBackup(payload){return initialized?backupAdapter.augment(payload):Promise.resolve(payload);}
    async function importBackupSidecars(prepared){
      if(!initialized)return {imported:false,reason:'not_initialized'};
      var result=await backupAdapter.importPrepared(prepared);state.adaptationRules=await adaptationStore.list();await renderInsights(api.getRecords());return result;
    }
    async function saveSnapshotSidecar(snapshotId){
      if(!initialized||!global.ShikeIndexedDb)return false;var payload=await backupAdapter.augment({});
      await global.ShikeIndexedDb.put('temporal_meta',{id:'snapshot:'+snapshotId,schemaVersion:1,createdAt:new Date().toISOString(),temporalGraph:payload.temporalGraph,temporalWaiting:payload.temporalWaiting,temporalAdaptationRules:payload.temporalAdaptationRules});return true;
    }
    async function restoreSnapshotSidecar(snapshotId){
      if(!initialized||!global.ShikeIndexedDb)return false;var payload=await global.ShikeIndexedDb.get('temporal_meta','snapshot:'+snapshotId);if(!payload)return false;
      var graph=modules.graphSerializer.deserialize(payload.temporalGraph);var previousGraph=await graphRepository.snapshot();var previousWaiting=await waitingRepository.list();var previousRules=await adaptationStore.list();
      try{
        await graphRepository.replaceAll(graph);await waitingRepository.replaceAll(payload.temporalWaiting||[]);
        if(Array.isArray(payload.temporalAdaptationRules))await adaptationStore.importData(payload.temporalAdaptationRules);
      }catch(error){
        await graphRepository.replaceAll(previousGraph).catch(function(){});await waitingRepository.replaceAll(previousWaiting).catch(function(){});
        await adaptationStore.importData(previousRules).catch(function(){});throw error;
      }
      state.adaptationRules=await adaptationStore.list();await renderInsights(api.getRecords());return true;
    }
    function hasPendingDrafts(){return state.drafts.length>0||state.persisting||state.saving.size>0;}
    async function queryMemory(question,options){if(!initialized)return {query:question,answer:'时间记忆尚未初始化。',sources:[]};var graph=await auditGraph();state.memoryIndex=modules.memory.buildIndex(api.getRecords(),graph);return modules.memory.query(state.memoryIndex,question,options);}
    async function listAdaptationRules(){return initialized?adaptationStore.list():[];}
    async function disableAdaptationRule(ruleId){if(!initialized)return false;var result=await adaptationStore.disable(ruleId);state.adaptationRules=await adaptationStore.list();return result;}
    async function removeAdaptationRule(ruleId){if(!initialized)return false;await adaptationStore.remove(ruleId);state.adaptationRules=await adaptationStore.list();return true;}
    async function resetAdaptationRules(){if(!initialized)return false;await adaptationStore.reset();state.adaptationRules=[];return true;}
    async function exportAdaptationRules(){return initialized?adaptationStore.exportData():null;}
    async function diagnostics(){
      return {initialized:initialized,pendingDrafts:state.drafts.length,graph:initialized?await graphRepository.snapshot():null,
        waiting:initialized?await waitingRepository.list():[],corrections:initialized?await correctionStore.list():[],adaptationRules:initialized?await adaptationStore.list():[],
        operations:initialized?await operationJournal.diagnostics():null,recovery:copy(state.lastRecovery),consistency:initialized?await runConsistencyAudit():null,model:copy(state.lastModel),review:copy(state.lastReview)};
    }
    return Object.freeze({
      init:init,captureIfNeeded:captureIfNeeded,confirmDraft:confirmDraft,confirmAll:confirmAll,
      cancelDraft:cancelDraft,render:renderInsights,renderReviews:renderReviews,queryMemory:queryMemory,runConsistencyAudit:runConsistencyAudit,rebuildConsistency:rebuildConsistency,
      tombstoneRecord:tombstoneRecord,restoreRecord:restoreRecord,purgeRecord:purgeRecord,
      augmentBackup:augmentBackup,importBackupSidecars:importBackupSidecars,
      saveSnapshotSidecar:saveSnapshotSidecar,restoreSnapshotSidecar:restoreSnapshotSidecar,
      listAdaptationRules:listAdaptationRules,disableAdaptationRule:disableAdaptationRule,removeAdaptationRule:removeAdaptationRule,resetAdaptationRules:resetAdaptationRules,exportAdaptationRules:exportAdaptationRules,
      hasPendingDrafts:hasPendingDrafts,diagnostics:diagnostics
    });
  }
  var singleton=create();
  return Object.freeze({
    create:create,init:singleton.init,captureIfNeeded:singleton.captureIfNeeded,
    confirmDraft:singleton.confirmDraft,confirmAll:singleton.confirmAll,cancelDraft:singleton.cancelDraft,
    render:singleton.render,tombstoneRecord:singleton.tombstoneRecord,restoreRecord:singleton.restoreRecord,
    purgeRecord:singleton.purgeRecord,augmentBackup:singleton.augmentBackup,
    importBackupSidecars:singleton.importBackupSidecars,saveSnapshotSidecar:singleton.saveSnapshotSidecar,
    restoreSnapshotSidecar:singleton.restoreSnapshotSidecar,hasPendingDrafts:singleton.hasPendingDrafts,
    listAdaptationRules:singleton.listAdaptationRules,disableAdaptationRule:singleton.disableAdaptationRule,removeAdaptationRule:singleton.removeAdaptationRule,resetAdaptationRules:singleton.resetAdaptationRules,exportAdaptationRules:singleton.exportAdaptationRules,
    renderReviews:singleton.renderReviews,queryMemory:singleton.queryMemory,runConsistencyAudit:singleton.runConsistencyAudit,rebuildConsistency:singleton.rebuildConsistency,
    diagnostics:singleton.diagnostics
  });
});
