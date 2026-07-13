(function(global,factory){
  var dependencies={serializer:global.ShikeGraphSerializer,integrity:global.ShikeGraphIntegrity,domain:global.ShikeGraphDomain};
  if(typeof module!=='undefined'&&module.exports){dependencies={serializer:require('../../graph/graph-serializer.js'),integrity:require('../../graph/graph-integrity.js'),domain:require('../../graph/graph-domain.js')};}
  var api=factory(dependencies);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeChronosBackupAdapter=api;
})(typeof window!=='undefined'?window:globalThis,function(modules){
  'use strict';

  var RECORD_SCOPED=new Set(['Commitment','WaitingFor','Task','Goal','Event','Anniversary','Habit','TimelineEntry']);
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function mapId(id,idMap){return idMap&&idMap[id]||id;}
  function remapGraph(raw,idMap){
    var graph=modules.serializer.deserialize(raw);var nodeIds={};
    var nodes=graph.nodes.map(function(node){
      var sourceIds=(node.sourceRecordIds||[]).map(function(id){return mapId(id,idMap);});
      var changed=sourceIds.some(function(id,index){return id!==(node.sourceRecordIds||[])[index];});
      var nextId=node.id;
      if(changed&&RECORD_SCOPED.has(node.type)&&sourceIds.length===1){nextId=modules.domain.id(node.type,sourceIds[0]+(node.type==='TimelineEntry'?'|'+node.label:''));}
      nodeIds[node.id]=nextId;
      return Object.assign({},node,{id:nextId,sourceRecordIds:sourceIds});
    });
    var edges=graph.edges.map(function(edge){
      var sourceRecordId=mapId(edge.sourceRecordId,idMap);
      var to=nodeIds[edge.to]||edge.to;
      if(edge.type==='derived_from'&&sourceRecordId!==edge.sourceRecordId)to=modules.domain.id('Record',sourceRecordId);
      return modules.domain.edge({type:edge.type,from:nodeIds[edge.from]||edge.from,to:to,sourceRecordId:sourceRecordId,status:edge.status,createdAt:edge.createdAt,updatedAt:edge.updatedAt});
    });
    var tombstones=(graph.tombstones||[]).map(function(item){
      var sourceRecordId=mapId(item.sourceRecordId,idMap);
      return Object.assign({},item,{id:'graph:'+sourceRecordId,sourceRecordId:sourceRecordId});
    });
    return modules.serializer.deserialize({schemaVersion:1,nodes:nodes,edges:edges,tombstones:tombstones});
  }
  function mergeGraph(current,incoming){
    var nodes=new Map();
    (current.nodes||[]).concat(incoming.nodes||[]).forEach(function(node){
      var existing=nodes.get(node.id);
      if(existing)existing.sourceRecordIds=[...new Set((existing.sourceRecordIds||[]).concat(node.sourceRecordIds||[]))];
      else nodes.set(node.id,copy(node));
    });
    var edges=new Map();(current.edges||[]).concat(incoming.edges||[]).forEach(function(edge){edges.set(edge.id,copy(edge));});
    var tombstones=new Map();(current.tombstones||[]).concat(incoming.tombstones||[]).forEach(function(item){tombstones.set(item.id,copy(item));});
    return modules.serializer.deserialize({schemaVersion:1,nodes:[...nodes.values()],edges:[...edges.values()],tombstones:[...tombstones.values()]});
  }
  function remapWaiting(items,idMap){
    return (items||[]).map(function(item){
      var recordId=idMap&&idMap[item.recordId];if(!recordId)return null;
      return Object.assign({},item,{id:'waiting:'+recordId,recordId:recordId});
    }).filter(Boolean);
  }
  function create(options){
    options=options||{};var graphRepository=options.graphRepository;var waitingRepository=options.waitingRepository;var adaptationStore=options.adaptationStore||null;
    if(!graphRepository||!waitingRepository)throw new Error('backup_adapter_repositories_required');
    async function augment(payload){
      var graph=modules.serializer.serialize(await graphRepository.snapshot());
      var waiting=await waitingRepository.list();
      var rules=adaptationStore?await adaptationStore.list():[];
      return Object.assign({},payload,{temporalSchemaVersion:1,temporalGraph:graph,temporalWaiting:copy(waiting),temporalAdaptationRules:copy(rules)});
    }
    async function importPrepared(prepared){
      var meta=prepared&&prepared.temporal||{};
      if(!meta.temporalGraph&&!Array.isArray(meta.temporalWaiting)&&!Array.isArray(meta.temporalAdaptationRules))return {imported:false,reason:'legacy_without_temporal_data'};
      var previousGraph=await graphRepository.snapshot();var previousWaiting=await waitingRepository.list();var previousRules=adaptationStore?await adaptationStore.list():[];
      var incoming=meta.temporalGraph?remapGraph(meta.temporalGraph,prepared.idMap||{}):{schemaVersion:1,nodes:[],edges:[],tombstones:[]};
      var nextGraph=mergeGraph(previousGraph,incoming);
      var importedWaiting=remapWaiting(meta.temporalWaiting,prepared.idMap||{});
      var waitingById=new Map(previousWaiting.map(function(item){return [item.id,item];}));
      importedWaiting.forEach(function(item){waitingById.set(item.id,item);});
      try{
        await graphRepository.replaceAll(nextGraph);
        await waitingRepository.replaceAll([...waitingById.values()]);
        if(adaptationStore&&Array.isArray(meta.temporalAdaptationRules))await adaptationStore.importData(meta.temporalAdaptationRules);
      }catch(error){
        await graphRepository.replaceAll(previousGraph).catch(function(){});
        await waitingRepository.replaceAll(previousWaiting).catch(function(){});
        if(adaptationStore)await adaptationStore.importData(previousRules).catch(function(){});
        throw error;
      }
      return {imported:true,nodeCount:incoming.nodes.length,edgeCount:incoming.edges.length,waitingCount:importedWaiting.length,adaptationRuleCount:Array.isArray(meta.temporalAdaptationRules)?meta.temporalAdaptationRules.length:0};
    }
    return Object.freeze({augment:augment,importPrepared:importPrepared,remapGraph:remapGraph});
  }
  return Object.freeze({create:create,remapGraph:remapGraph,mergeGraph:mergeGraph});
});
