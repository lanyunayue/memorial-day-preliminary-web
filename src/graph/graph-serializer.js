(function(global,factory){
  var integrity=global.ShikeGraphIntegrity;if(typeof module!=='undefined'&&module.exports)integrity=require('./graph-integrity.js');
  var api=factory(integrity);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGraphSerializer=api;
})(typeof window!=='undefined'?window:globalThis,function(integrity){
  'use strict';
  function serialize(state){
    var graph={schemaVersion:1,nodes:state&&state.nodes||[],edges:state&&state.edges||[],tombstones:state&&state.tombstones||[]};
    var result=integrity.audit(graph);if(!result.valid)throw new Error('graph_serialize_invalid: '+result.errors.join(','));
    return JSON.parse(JSON.stringify(graph));
  }
  function deserialize(payload){
    if(!payload)return {schemaVersion:1,nodes:[],edges:[],tombstones:[]};
    var graph=JSON.parse(JSON.stringify(payload));
    var result=integrity.audit(graph);if(!result.valid)throw new Error('graph_deserialize_invalid: '+result.errors.join(','));
    graph.tombstones=Array.isArray(graph.tombstones)?graph.tombstones:[];return graph;
  }
  return Object.freeze({serialize:serialize,deserialize:deserialize});
});
