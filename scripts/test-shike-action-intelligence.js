'use strict';

const temporal=require('../src/intelligence/intelligence-controller.js');
const graphBuilder=require('../src/graph/graph-builder.js');
const waitingEngine=require('../src/intelligence/waiting-for-engine.js');
const nextAction=require('../src/intelligence/next-action-engine.js');
const conflict=require('../src/intelligence/conflict-engine.js');
const checks=[];function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
const now='2026-07-13T10:00:00+08:00';
const waitingDraft=temporal.analyze('等小王明天回复合同',{referenceDate:new Date(now)}).drafts[0];
const waitingRecord=temporal.toRecord(waitingDraft,()=> 'waiting_record');
const waiting=waitingEngine.fromDraft(waitingDraft,waitingRecord,now);
check('waiting item links to record',waiting.recordId===waitingRecord.id);
check('waiting person is retained',waiting.person==='小王');
check('waiting expected date is retained',waiting.expectedAt.startsWith('2026-07-14'));
check('waiting starts active',waiting.status==='waiting');
const overdue=waitingEngine.refresh([waiting],'2026-07-15T10:00:00+08:00')[0];
check('waiting becomes overdue deterministically',overdue.status==='overdue');
const queries=waitingEngine.queries([overdue,{...overdue,id:'waiting:duplicate',recordId:'duplicate'}],'2026-07-15T10:00:00+08:00');
check('overdue query works',queries.overdue.length===2);
check('duplicate waiting query works',queries.duplicates.length===1);
check('waiting can resolve explicitly',waitingEngine.transition(overdue,'resolved').status==='resolved');

const commitmentDraft=temporal.analyze('我答应老师周五交实习材料',{referenceDate:new Date(now)}).drafts[0];
const commitmentRecord=temporal.toRecord(commitmentDraft,()=> 'commitment_record');
const graph=graphBuilder.build(commitmentDraft,commitmentRecord);
const suggestions=nextAction.compute({records:[commitmentRecord],graph:graph,waiting:[overdue],now:'2026-07-15T10:00:00+08:00'});
check('next action includes overdue waiting',suggestions.some((item)=>item.kind==='waiting_for'));
check('next action includes commitment',suggestions.some((item)=>item.kind==='commitment'));
check('overdue waiting ranks first',suggestions[0].kind==='waiting_for');
check('suggestion exposes reason',suggestions.every((item)=>item.reason.includes('因为')));
check('suggestion hides internal score',suggestions.every((item)=>!Object.keys(item).some((key)=>/score|rank/i.test(key))));
const again=nextAction.compute({records:[commitmentRecord],graph:graph,waiting:[overdue],now:'2026-07-15T10:00:00+08:00'});
check('next action ordering is deterministic',JSON.stringify(suggestions)===JSON.stringify(again));
const ignored=nextAction.compute({records:[commitmentRecord],graph:graph,waiting:[overdue],neverSuggestRecordIds:['waiting_record'],now:'2026-07-15T10:00:00+08:00'});
check('never suggest preference is respected',ignored.every((item)=>item.sourceRecordId!=='waiting_record'));

const conflicts=conflict.detect({records:[{id:'a',dateKey:'2026-07-18',timeText:'15:00'},{id:'b',dateKey:'2026-07-18',timeText:'15:00'},{id:'c',dateKey:'2026-07-18',timeText:'17:00'},{id:'d',dateKey:'2026-07-18',timeText:''}],commitmentRecordIds:['a','b'],waiting:[overdue,{...overdue,id:'other',recordId:'duplicate'}]});
check('time overlap is detected',conflicts.some((item)=>item.type==='time_overlap'));
check('high load is detected',conflicts.some((item)=>item.type==='high_load'));
check('duplicate waiting is detected',conflicts.some((item)=>item.type==='duplicate_waiting'));
check('conflicts are explainable',conflicts.every((item)=>item.explanation.length>0));
check('conflicts never auto-adjust',conflicts.every((item)=>item.actions.includes('adjust')&&item.actions.includes('keep')));

console.log(`Action intelligence regression passed: ${checks.length}/${checks.length}`);
