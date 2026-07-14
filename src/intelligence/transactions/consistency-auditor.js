(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalConsistencyAuditor=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function audit(input){
    input=input||{};var records=input.records||[];var graph=input.graph||{nodes:[],edges:[]};var waiting=input.waiting||[];var operations=input.operations||[];var drafts=input.drafts||[];var findings=[];
    var recordIds=new Set(records.map(function(item){return item.id;}));var graphRecordIds=new Set();(graph.edges||[]).forEach(function(edge){if(edge.sourceRecordId)graphRecordIds.add(edge.sourceRecordId);});(graph.nodes||[]).forEach(function(node){(node.sourceRecordIds||[]).forEach(function(id){graphRecordIds.add(id);});});
    var draftById=new Map(drafts.map(function(item){return [item.id,item];}));var waitingByRecord=new Set(waiting.map(function(item){return item.recordId;}));
    operations.filter(function(item){return item.operationType==='create_record'&&['committed','recovered'].includes(item.status);}).forEach(function(operation){
      if(!recordIds.has(operation.recordId))findings.push({code:'missing_record',recordId:operation.recordId,operationId:operation.operationId,severity:'error',repairable:false});
      else if(!graphRecordIds.has(operation.recordId))findings.push({code:'missing_graph',recordId:operation.recordId,operationId:operation.operationId,severity:'error',repairable:true});
      var draft=draftById.get(operation.draftId);if(draft&&draft.type==='waiting_for'&&recordIds.has(operation.recordId)&&!waitingByRecord.has(operation.recordId))findings.push({code:'missing_waiting',recordId:operation.recordId,operationId:operation.operationId,severity:'error',repairable:true});
    });
    graphRecordIds.forEach(function(id){if(!recordIds.has(id))findings.push({code:'dangling_graph',recordId:id,severity:'error',repairable:true});});
    waiting.forEach(function(item){if(!recordIds.has(item.recordId))findings.push({code:'dangling_waiting',recordId:item.recordId,waitingId:item.id,severity:'error',repairable:true});});
    operations.filter(function(item){return !['committed','recovered','quarantined'].includes(item.status);}).forEach(function(item){findings.push({code:'incomplete_operation',recordId:item.recordId,operationId:item.operationId,severity:'warn',repairable:true});});
    return {schemaVersion:1,auditedAt:new Date().toISOString(),recordCount:records.length,graphRecordCount:graphRecordIds.size,waitingCount:waiting.length,operationCount:operations.length,driftCount:findings.length,valid:findings.length===0,findings:findings,repairableRecordIds:[...new Set(findings.filter(function(item){return item.repairable&&item.recordId;}).map(function(item){return item.recordId;}))]};
  }
  return Object.freeze({audit:audit});
});
