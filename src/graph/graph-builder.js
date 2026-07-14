(function(global,factory){
  var domain=global.ShikeGraphDomain;
  if(typeof module!=='undefined'&&module.exports)domain=require('./graph-domain.js');
  var api=factory(domain);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeGraphBuilder=api;
})(typeof window!=='undefined'?window:globalThis,function(domain){
  'use strict';

  var TYPE_MAP={commitment:'Commitment',waiting_for:'WaitingFor',task:'Task',goal:'Goal',event:'Event',anniversary:'Anniversary',habit:'Habit',note:'Topic',thought:'Topic'};
  function build(draft,record){
    if(!draft||!record||!record.id)throw new Error('graph_build_input_required');
    var sourceRecordId=record.id;
    var now=Date.now();
    var nodes=[];
    var edges=[];
    var userId='user:self';
    var temporalId=domain.id(TYPE_MAP[draft.type]||'Topic',sourceRecordId);
    var topicId=domain.id('Topic',draft.object||draft.action||record.title);
    function addNode(id,type,label){nodes.push(domain.node({id:id,type:type,label:label,sourceRecordIds:[sourceRecordId],createdAt:now,updatedAt:now}));}
    function addEdge(from,to,type){edges.push(domain.edge({from:from,to:to,type:type,sourceRecordId:sourceRecordId,createdAt:now,updatedAt:now}));}
    addNode(userId,'User','我');
    addNode(temporalId,TYPE_MAP[draft.type]||'Topic',draft.action||record.title);
    addNode(topicId,'Topic',draft.object||record.title);
    addEdge(temporalId,topicId,'related_to');
    addEdge(temporalId,domain.id('Record',sourceRecordId),'derived_from');
    (draft.personRefs||[]).forEach(function(person){
      var personId=domain.id('Person',person);addNode(personId,'Person',person);
      if(draft.type==='commitment')addEdge(userId,personId,'promised_to');
      else if(draft.type==='waiting_for')addEdge(userId,personId,'waiting_on');
      else addEdge(temporalId,personId,'mentioned_with');
    });
    if(draft.normalizedTime&&(draft.normalizedTime.dateKey||draft.normalizedTime.milestone)){
      var label=draft.normalizedTime.dateKey||draft.normalizedTime.milestone;
      var timeId=domain.id('TimelineEntry',sourceRecordId+'|'+label);
      addNode(timeId,'TimelineEntry',label);
      addEdge(temporalId,timeId,'scheduled_for');
    }
    return {schemaVersion:domain.SCHEMA_VERSION,sourceRecordId:sourceRecordId,nodes:nodes,edges:edges};
  }
  return Object.freeze({build:build});
});
