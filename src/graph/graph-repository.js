(function(global,factory){
  var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGraphRepository=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var STORES=['temporal_nodes','temporal_edges','temporal_tombstones'];
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function emptyState(){return {nodes:[],edges:[],tombstones:[]};}
  function browserDriver(){
    if(!globalThis.ShikeIndexedDb)throw new Error('graph_repository_unavailable');
    return {
      async readState(){var values=await Promise.all(STORES.map(function(store){return globalThis.ShikeIndexedDb.getAll(store);}));return {nodes:values[0],edges:values[1],tombstones:values[2]};},
      async writeState(state){
        var db=await globalThis.ShikeIndexedDb.open();
        return new Promise(function(resolve,reject){
          var tx=db.transaction(STORES,'readwrite');
          STORES.forEach(function(store,index){var target=tx.objectStore(store);target.clear();var values=index===0?state.nodes:index===1?state.edges:state.tombstones;(values||[]).forEach(function(value){target.put(value);});});
          tx.oncomplete=function(){resolve(copy(state));};tx.onerror=function(){reject(tx.error||new Error('graph_transaction_failed'));};tx.onabort=function(){reject(tx.error||new Error('graph_transaction_aborted'));};
        });
      }
    };
  }
  function memoryDriver(initial){
    var state=copy(initial||emptyState());
    return {async readState(){return copy(state);},async writeState(next){state=copy(next);return copy(state);}};
  }
  function detach(state,recordId){
    state.edges=state.edges.filter(function(edge){return edge.sourceRecordId!==recordId;});
    state.nodes=state.nodes.map(function(node){node.sourceRecordIds=(node.sourceRecordIds||[]).filter(function(id){return id!==recordId;});return node;}).filter(function(node){return node.sourceRecordIds.length>0;});
  }
  function attach(state,graph){
    var existing=new Map(state.nodes.map(function(node){return [node.id,node];}));
    (graph.nodes||[]).forEach(function(node){var current=existing.get(node.id);if(current){current.sourceRecordIds=[...new Set((current.sourceRecordIds||[]).concat(node.sourceRecordIds||[]))];current.updatedAt=Date.now();}else{state.nodes.push(copy(node));existing.set(node.id,state.nodes[state.nodes.length-1]);}});
    var edgeIds=new Set(state.edges.map(function(edge){return edge.id;}));
    (graph.edges||[]).forEach(function(edge){if(!edgeIds.has(edge.id)){state.edges.push(copy(edge));edgeIds.add(edge.id);}});
  }
  function create(driver){
    driver=driver||browserDriver();var queue=Promise.resolve();
    function mutate(work){var run=queue.then(async function(){var state=await driver.readState();var result=work(state);await driver.writeState(state);return result;});queue=run.catch(function(){});return run;}
    async function snapshot(){await queue;return driver.readState();}
    function replaceForRecord(recordId,graph){return mutate(function(state){detach(state,recordId);attach(state,graph);state.tombstones=state.tombstones.filter(function(item){return item.sourceRecordId!==recordId;});return graph;});}
    function tombstoneRecord(recordId){return mutate(function(state){
      var tombstone={id:'graph:'+recordId,sourceRecordId:recordId,schemaVersion:1,deletedAt:new Date().toISOString(),nodes:state.nodes.filter(function(node){return (node.sourceRecordIds||[]).includes(recordId);}),edges:state.edges.filter(function(edge){return edge.sourceRecordId===recordId;})};
      state.tombstones=state.tombstones.filter(function(item){return item.sourceRecordId!==recordId;});state.tombstones.push(copy(tombstone));detach(state,recordId);return tombstone;
    });}
    function restoreRecord(recordId){return mutate(function(state){var tombstone=state.tombstones.find(function(item){return item.sourceRecordId===recordId;});if(!tombstone)throw new Error('graph_tombstone_not_found');attach(state,tombstone);state.tombstones=state.tombstones.filter(function(item){return item.sourceRecordId!==recordId;});return tombstone;});}
    function purgeRecord(recordId){return mutate(function(state){detach(state,recordId);state.tombstones=state.tombstones.filter(function(item){return item.sourceRecordId!==recordId;});return true;});}
    function replaceAll(next){return mutate(function(state){state.nodes=copy(next.nodes||[]);state.edges=copy(next.edges||[]);state.tombstones=copy(next.tombstones||[]);return copy(state);});}
    return Object.freeze({snapshot:snapshot,replaceForRecord:replaceForRecord,tombstoneRecord:tombstoneRecord,restoreRecord:restoreRecord,purgeRecord:purgeRecord,replaceAll:replaceAll});
  }
  return Object.freeze({create:create,browserDriver:browserDriver,memoryDriver:memoryDriver});
});
