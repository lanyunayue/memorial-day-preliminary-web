'use strict';

const domain=require('../src/graph/graph-domain.js');
const builder=require('../src/graph/graph-builder.js');
const integrity=require('../src/graph/graph-integrity.js');
const serializer=require('../src/graph/graph-serializer.js');
const migration=require('../src/graph/graph-migration.js');
const repositoryModule=require('../src/graph/graph-repository.js');
const temporal=require('../src/intelligence/intelligence-controller.js');

const checks=[];function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
const analyzed=temporal.analyze('我答应老师周五交实习材料',{referenceDate:new Date('2026-07-13T08:00:00+08:00')});
const draft=analyzed.drafts[0];const record=temporal.toRecord(draft,()=> 'record_commitment');const graph=builder.build(draft,record);
check('commitment node exists',graph.nodes.some((node)=>node.type==='Commitment'));
check('person node exists',graph.nodes.some((node)=>node.type==='Person'&&node.label==='老师'));
check('user promised_to person edge exists',graph.edges.some((edge)=>edge.type==='promised_to'));
check('commitment related_to topic edge exists',graph.edges.some((edge)=>edge.type==='related_to'));
check('commitment scheduled_for timeline edge exists',graph.edges.some((edge)=>edge.type==='scheduled_for'));
check('all edges trace to source record',graph.edges.every((edge)=>edge.sourceRecordId===record.id));
check('graph integrity passes',integrity.audit(graph).valid,JSON.stringify(integrity.audit(graph)));
const serialized=serializer.serialize(graph);
check('graph backup round trip passes',serializer.deserialize(serialized).edges.length===graph.edges.length);
check('legacy backup migrates to empty graph',migration.fromBackup({records:[record]}).migration==='legacy_without_graph');
const corrupt={schemaVersion:1,nodes:graph.nodes,edges:[{...graph.edges[0],to:'missing'}]};
check('corrupt graph is rejected',!integrity.audit(corrupt).valid);
check('corrupt graph is quarantined',integrity.quarantine(corrupt).quarantined.length===1);

(async()=>{
  const repository=repositoryModule.create(repositoryModule.memoryDriver());
  await repository.replaceForRecord(record.id,graph);
  check('graph persists transactionally',(await repository.snapshot()).edges.length===graph.edges.length);
  await repository.tombstoneRecord(record.id);
  let state=await repository.snapshot();
  check('delete removes active graph',state.edges.length===0&&state.nodes.length===0);
  check('delete creates graph tombstone',state.tombstones.length===1);
  await repository.restoreRecord(record.id);state=await repository.snapshot();
  check('restore restores graph',state.edges.length===graph.edges.length&&state.tombstones.length===0);
  await repository.tombstoneRecord(record.id);await repository.purgeRecord(record.id);state=await repository.snapshot();
  check('permanent delete removes tombstone',state.tombstones.length===0);
  await repository.replaceAll(serialized);state=await repository.snapshot();
  check('graph import restores state',state.nodes.length===graph.nodes.length);
  check('shared ids are deterministic',domain.id('Person','老师')===domain.id('Person','老师'));
  console.log(`Temporal graph regression passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(error.stack||error.message);process.exit(1);});
