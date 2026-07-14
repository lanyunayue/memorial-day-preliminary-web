(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGraphMigration=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function fromBackup(payload){
    if(!payload||!payload.temporalGraph)return {schemaVersion:1,nodes:[],edges:[],tombstones:[],migration:'legacy_without_graph'};
    return Object.assign({schemaVersion:1,nodes:[],edges:[],tombstones:[],migration:'graph_v1'},payload.temporalGraph);
  }
  return Object.freeze({fromBackup:fromBackup});
});
