(function(global){
  'use strict';

  var RETURN_KEY='chronos_game_return_v1';
  var BRIDGE_STATE_KEY='chronos_game_bridge_state_v1';
  var MAX_ACTIONS=20;
  var MAX_CHILDREN=5;

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function text(value,max){return String(value==null?'':value).trim().slice(0,max);}
  function readJson(key,fallback){
    try{
      var raw=global.localStorage&&global.localStorage.getItem(key);
      return raw?JSON.parse(raw):fallback;
    }catch(error){return fallback;}
  }
  function writeJson(key,value){
    try{global.localStorage.setItem(key,JSON.stringify(value));return true;}catch(error){return false;}
  }
  function readPayload(){
    var payload=readJson(RETURN_KEY,null);
    if(!payload||payload.version!==1||!text(payload.transferId,160)||!Array.isArray(payload.actions))return null;
    return payload;
  }
  function hasApplied(transferId){
    var state=readJson(BRIDGE_STATE_KEY,{appliedReturns:[]});
    return Array.isArray(state.appliedReturns)&&state.appliedReturns.indexOf(transferId)!==-1;
  }
  function markApplied(transferId){
    var state=readJson(BRIDGE_STATE_KEY,{appliedReturns:[]});
    if(!Array.isArray(state.appliedReturns))state.appliedReturns=[];
    if(state.appliedReturns.indexOf(transferId)===-1)state.appliedReturns.push(transferId);
    state.appliedReturns=state.appliedReturns.slice(-50);
    state.lastAppliedAt=new Date().toISOString();
    return writeJson(BRIDGE_STATE_KEY,state);
  }
  function normalizeAction(value){
    var action=text(value,40).toLowerCase();
    if(['complete','done','finish','resolve','completed'].indexOf(action)!==-1)return 'completed';
    if(['drop','let_go','release','released','abandon'].indexOf(action)!==-1)return 'released';
    if(['extend','postpone','delay','defer','deferred'].indexOf(action)!==-1)return 'deferred';
    if(['droptoday','drop_today'].indexOf(action)!==-1)return 'dropToday';
    if(['break_down','split'].indexOf(action)!==-1)return 'split';
    return action||'acknowledged';
  }
  function nextDateKey(dateKey){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey||'')))return '';
    var date=new Date(String(dateKey)+'T12:00:00');
    if(Number.isNaN(date.getTime()))return '';
    date.setDate(date.getDate()+1);
    return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
  }
  function appendNote(record,note){
    var next=text(note,1000);
    if(!next)return;
    record.note=[text(record.note,4000),next].filter(Boolean).join('\n').slice(0,5000);
  }
  function buildChild(parent,title,transferId,now,index){
    var value=text(title,200);
    if(!value)return null;
    return {
      id:'chronos_child_'+now.toString(36)+'_'+index.toString(36)+'_'+Math.random().toString(36).slice(2,7),
      title:value,
      rawText:value,
      sourceText:value,
      type:parent.type||parent.recordKind||'reminder',
      recordKind:parent.recordKind||parent.type||'reminder',
      recordState:'active',
      archived:false,
      pinned:false,
      repeat:'none',
      note:'从“'+text(parent.title,120)+'”在归时谷拆分',
      parentRecordId:parent.id,
      chronosTransferId:transferId,
      createdAt:now+index,
      updatedAt:now+index,
      ts:now+index,
      schemaVersion:2,
      metadata:{source:'chronos-valley',parentRecordId:parent.id,transferId:transferId}
    };
  }
  function apply(records,payload){
    var next=(Array.isArray(records)?records:[]).map(clone);
    var byId={};
    next.forEach(function(record,index){if(record&&record.id!=null)byId[String(record.id)]=index;});
    var additions=[];
    var changedIds=[];
    var now=Date.now();

    payload.actions.slice(0,MAX_ACTIONS).forEach(function(rawAction,actionIndex){
      if(!rawAction||typeof rawAction!=='object')return;
      var sourceId=text(rawAction.sourceRecordId,160);
      if(!sourceId||byId[sourceId]===undefined)return;
      var record=next[byId[sourceId]];
      var action=normalizeAction(rawAction.action||rawAction.outcome);
      var summary=text(rawAction.summary,1000);
      var children=Array.isArray(rawAction.children)?rawAction.children.slice(0,MAX_CHILDREN):[];
      record.chronosResult={
        action:action,
        summary:summary,
        children:children.map(function(child){return text(child,200);}).filter(Boolean),
        transferId:payload.transferId,
        appliedAt:now
      };
      record.updatedAt=now+actionIndex;

      if(action==='completed'||action==='released'){
        record.recordState='completed';
        record.archived=true;
      }else if(action==='deferred'){
        record.recordState='active';
        var tomorrow=nextDateKey(record.dateKey);
        if(tomorrow){record.dateKey=tomorrow;record.dateText=tomorrow;}
        record.postponeCount=Number(record.postponeCount||0)+1;
        appendNote(record,summary||'已在归时谷延期一天');
      }else if(action==='dropToday'){
        record.recordState='active';
        appendNote(record,summary||'今天不处理，保留到稍后');
      }else if(action==='split'){
        appendNote(record,'归时谷拆分：'+children.map(function(child){return text(child,200);}).filter(Boolean).join('；'));
        children.forEach(function(title,childIndex){
          var child=buildChild(record,title,payload.transferId,now,additions.length+childIndex);
          if(child)additions.push(child);
        });
      }else{
        appendNote(record,summary);
      }
      changedIds.push(sourceId);
    });

    return {records:additions.concat(next),changedIds:changedIds,createdCount:additions.length};
  }
  async function consume(records){
    var payload=readPayload();
    if(!payload)return {records:records,applied:false,reason:'no_payload'};
    if(hasApplied(payload.transferId)){
      try{global.localStorage.removeItem(RETURN_KEY);}catch(error){}
      return {records:records,applied:false,reason:'already_applied',transferId:payload.transferId};
    }
    var result=apply(records,payload);
    if(!result.changedIds.length&&payload.actions.length){
      return {records:records,applied:false,reason:'records_not_found',transferId:payload.transferId};
    }
    if(global.ShikeLocalFirst){
      var persisted=await global.ShikeLocalFirst.persist(result.records);
      if(persisted&&persisted.fallback)throw new Error('chronos_indexeddb_write_unavailable');
    }
    if(global.ShikeLegacyStorage){
      if(!global.ShikeLegacyStorage.setJson('shike_records_v1',result.records))throw new Error('chronos_cache_write_failed');
    }else if(!writeJson('shike_records_v1',result.records)){
      throw new Error('chronos_cache_write_failed');
    }
    if(!markApplied(payload.transferId))throw new Error('chronos_bridge_state_write_failed');
    try{global.localStorage.removeItem(RETURN_KEY);}catch(error){}
    return {
      records:result.records,
      applied:true,
      transferId:payload.transferId,
      changedCount:result.changedIds.length,
      createdCount:result.createdCount
    };
  }

  global.ShikeChronosReturn=Object.freeze({
    apply:apply,
    consume:consume,
    readPayload:readPayload,
    normalizeAction:normalizeAction
  });
})(window);
