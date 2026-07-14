(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGraphDomain=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var SCHEMA_VERSION=1;
  var NODE_TYPES=Object.freeze(['User','Person','Commitment','WaitingFor','Task','Goal','Event','Anniversary','Habit','Topic','Project','TimelineEntry']);
  var EDGE_TYPES=Object.freeze(['promised_to','waiting_on','related_to','scheduled_for','depends_on','blocks','contributes_to','follows','mentioned_with','derived_from','fulfilled_by','postponed_to']);
  function hash(value){
    var result=2166136261;
    String(value||'').split('').forEach(function(character){result^=character.charCodeAt(0);result=Math.imul(result,16777619);});
    return (result>>>0).toString(36);
  }
  function id(type,value){return String(type||'node').toLowerCase()+':'+hash(value);}
  function node(input){
    input=input||{};
    if(!NODE_TYPES.includes(input.type))throw new Error('invalid_graph_node_type');
    if(!input.id)throw new Error('graph_node_id_required');
    return {id:String(input.id),type:input.type,label:String(input.label||''),schemaVersion:SCHEMA_VERSION,sourceRecordIds:[...new Set(input.sourceRecordIds||[])],status:input.status||'active',createdAt:Number(input.createdAt)||Date.now(),updatedAt:Number(input.updatedAt)||Date.now()};
  }
  function edge(input){
    input=input||{};
    if(!EDGE_TYPES.includes(input.type))throw new Error('invalid_graph_edge_type');
    if(!input.from||!input.to||!input.sourceRecordId)throw new Error('graph_edge_reference_required');
    return {id:String(input.id||id('edge',input.sourceRecordId+'|'+input.type+'|'+input.from+'|'+input.to)),type:input.type,from:String(input.from),to:String(input.to),schemaVersion:SCHEMA_VERSION,sourceRecordId:String(input.sourceRecordId),status:input.status||'active',createdAt:Number(input.createdAt)||Date.now(),updatedAt:Number(input.updatedAt)||Date.now()};
  }
  return Object.freeze({SCHEMA_VERSION:SCHEMA_VERSION,NODE_TYPES:NODE_TYPES,EDGE_TYPES:EDGE_TYPES,hash:hash,id:id,node:node,edge:edge});
});
