'use strict';

const temporal=require('../src/intelligence/intelligence-controller.js');
const graphDomain=require('../src/graph/graph-domain.js');
const graphBuilder=require('../src/graph/graph-builder.js');
const waitingEngine=require('../src/intelligence/waiting-for-engine.js');
const conflict=require('../src/intelligence/conflict-engine.js');

const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
function record(text,id,extra){
  const draft=temporal.analyze(text,{referenceDate:new Date('2026-07-13T10:00:00+08:00')}).drafts[0];
  return {draft,record:Object.assign(temporal.toRecord(draft,()=>id),extra||{})};
}

const first=record('周五下午三点开会','event_a',{dateKey:'2026-07-17',timeText:'15:00',endTimeText:'16:00'});
const second=record('周五下午三点半见老师','event_b',{dateKey:'2026-07-17',timeText:'15:30',endTimeText:'16:30'});
const loadA=record('周五上午九点交材料','load_a',{dateKey:'2026-07-17',timeText:'09:00'});
const loadB=record('周五晚上七点取快递','load_b',{dateKey:'2026-07-17',timeText:'19:00'});
const deadline=record('准备实习答辩','deadline',{startAt:'2026-07-20T09:00:00+08:00',deadlineAt:'2026-07-19T18:00:00+08:00'});
const promiseA=record('我答应老师周五交实习材料','promise_a',{personRefs:['老师'],commitmentSubject:'交实习材料',postponeCount:3});
const promiseB=record('答应老师把实习材料交了','promise_b',{personRefs:['老师'],commitmentSubject:'交实习材料'});
const goal=record('这个月完成实习报告','goal_record');
const blocked=record('提交实习申请','blocked_record');
const prerequisite=record('请老师签字','prerequisite_record');
const completedReminder=record('明天提醒我交报名费','completed_reminder',{recordState:'completed',notifyMode:'browser',reminderAt:'2026-07-14T09:00:00+08:00'});
const habit=record('这个月每周跑步三次','habit_record');
const waitingDraft=temporal.analyze('等老师明天回复实习材料',{referenceDate:new Date('2026-07-13T10:00:00+08:00')}).drafts[0];
const waitingRecord=temporal.toRecord(waitingDraft,()=> 'waiting_a');
const waitingA=waitingEngine.fromDraft(waitingDraft,waitingRecord,'2026-07-13T10:00:00+08:00');
const waitingB=Object.assign({},waitingA,{id:'waiting:waiting_b',recordId:'waiting_b'});

const goalGraph=graphBuilder.build(goal.draft,goal.record);
const goalNode=graphDomain.node({id:'goal:internship-report',type:'Goal',label:'完成实习报告',sourceRecordIds:['goal_record']});
const blockedNode=graphDomain.node({id:'task:blocked',type:'Task',label:'提交实习申请',sourceRecordIds:['blocked_record']});
const prerequisiteNode=graphDomain.node({id:'task:prerequisite',type:'Task',label:'请老师签字',sourceRecordIds:['prerequisite_record']});
const dependencyEdge=graphDomain.edge({from:blockedNode.id,to:prerequisiteNode.id,type:'depends_on',sourceRecordId:'blocked_record'});
const graph={nodes:goalGraph.nodes.concat([goalNode,blockedNode,prerequisiteNode]),edges:goalGraph.edges.concat([dependencyEdge])};
const records=[first.record,second.record,loadA.record,loadB.record,deadline.record,promiseA.record,promiseB.record,goal.record,blocked.record,prerequisite.record,completedReminder.record,habit.record,waitingRecord];
const input={records,graph,commitmentRecordIds:['promise_a','promise_b','load_a'],waiting:[waitingA,waitingB],habitProgress:[{recordId:'habit_record',requiredCount:12,completedCount:7,remainingDays:3,maxPerDay:1}]};
const before=JSON.stringify(input);
const conflicts=conflict.detect(input);
const expected=['time_overlap','deadline_before_start','high_load','duplicate_commitment','duplicate_waiting','goal_without_next_action','incomplete_dependency','completed_still_reminding','repeated_commitment_postponement','habit_time_insufficient'];

expected.forEach((type)=>check(`detects ${type}`,conflicts.some((item)=>item.type===type),JSON.stringify(conflicts)));
check('all required conflict types are unique',expected.every((type)=>conflicts.filter((item)=>item.type===type).length===1));
check('domain references are retained',conflicts.every((item)=>item.recordIds.length>0&&item.recordIds.every((id)=>records.some((record)=>record.id===id)||id==='waiting_b')));
check('every conflict is explainable',conflicts.every((item)=>typeof item.explanation==='string'&&item.explanation.length>=8));
check('every conflict requires user choice',conflicts.every((item)=>item.actions.includes('keep')&&item.actions.includes('adjust')&&item.actions.includes('ignore_once')));
check('detection never mutates domain objects',JSON.stringify(input)===before);
check('completed dependency clears blocker',!conflict.detect({...input,records:records.map((item)=>item.id==='prerequisite_record'?{...item,recordState:'completed'}:item)}).some((item)=>item.type==='incomplete_dependency'));
check('goal with next action clears goal conflict',!conflict.detect({...input,goalNextActions:[{goalRecordId:'goal_record',nextActionRecordId:'blocked_record'}]}).some((item)=>item.type==='goal_without_next_action'));

console.log(`Chronos conflict engine passed: ${checks.length}/${checks.length}`);
