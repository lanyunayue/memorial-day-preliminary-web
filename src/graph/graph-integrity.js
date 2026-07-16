(function(global,factory){
  var domain=global.ShikeGraphDomain;if(typeof module!=='undefined'&&module.exports)domain=require('./graph-domain.js');
  var api=factory(domain);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGraphIntegrity=api;
})(typeof window!=='undefined'?window:globalThis,function(domain){
  'use strict';
  function audit(graph){
    graph=graph||{};var errors=[];var nodeIds=new Set();var edgeIds=new Set();
    (graph.nodes||[]).forEach(function(node){
      if(!node||!node.id||nodeIds.has(node.id))errors.push('invalid_or_duplicate_node');
      else nodeIds.add(node.id);
      if(!domain.NODE_TYPES.includes(node&&node.type)||node.schemaVersion!==domain.SCHEMA_VERSION)errors.push('invalid_node_schema');
    });
    (graph.edges||[]).forEach(function(edge){
      if(!edge||!edge.id||edgeIds.has(edge.id))errors.push('invalid_or_duplicate_edge');
      else edgeIds.add(edge.id);
      if(!domain.EDGE_TYPES.includes(edge&&edge.type)||edge.schemaVersion!==domain.SCHEMA_VERSION)errors.push('invalid_edge_schema');
      if(!nodeIds.has(edge&&edge.from)||(!nodeIds.has(edge&&edge.to)&&edge.type!=='derived_from'))errors.push('orphan_edge');
      if(!edge||!edge.sourceRecordId)errors.push('edge_source_required');
    });
    return {valid:errors.length===0,errors:errors,nodeCount:nodeIds.size,edgeCount:edgeIds.size};
  }
  function quarantine(graph){
    var result=audit(graph);
    return result.valid?{graph:graph,quarantined:[]}:{graph:{schemaVersion:domain.SCHEMA_VERSION,nodes:[],edges:[]},quarantined:[{id:'graph_quarantine_'+Date.now().toString(36),reason:result.errors.join(','),raw:graph,schemaVersion:domain.SCHEMA_VERSION}]};
  }
  return Object.freeze({audit:audit,quarantine:quarantine});
});
