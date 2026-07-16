'use strict';

const graphDomain=require('../src/graph/graph-domain.js');
const memory=require('../src/intelligence/temporal-memory.js');

const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
const records=[
  {id:'recent_question',title:'问老师实习材料',rawText:'我上周问老师实习材料准备好了吗',dateKey:'2026-07-10',timeText:'14:30',recordState:'active',createdAt:Date.parse('2026-07-10T06:30:00Z'),updatedAt:Date.parse('2026-07-10T06:30:00Z')},
  {id:'older_question',title:'实习材料准备',rawText:'五月问过老师需要哪些实习材料',dateKey:'2026-05-20',timeText:'10:00',recordState:'active',createdAt:Date.parse('2026-05-20T02:00:00Z'),updatedAt:Date.parse('2026-05-20T02:00:00Z')},
  {id:'completed_question',title:'问老师实习材料',rawText:'昨天问完老师实习材料',dateKey:'2026-07-12',timeText:'09:00',recordState:'completed',createdAt:Date.parse('2026-07-12T01:00:00Z'),updatedAt:Date.parse('2026-07-12T01:00:00Z')},
  {id:'title_weighted',title:'奖学金截止日期',rawText:'记录',dateKey:'2026-05-01',recordState:'active',createdAt:Date.parse('2026-05-01T00:00:00Z')},
  {id:'raw_weighted',title:'学校通知',rawText:'奖学金截止日期',dateKey:'2026-07-12',recordState:'active',createdAt:Date.parse('2026-07-12T00:00:00Z')},
];
const graph={nodes:[
  graphDomain.node({id:'person:teacher',type:'Person',label:'老师',sourceRecordIds:['recent_question','older_question','completed_question']}),
  graphDomain.node({id:'topic:internship',type:'Topic',label:'实习材料',sourceRecordIds:['recent_question','older_question','completed_question']}),
  graphDomain.node({id:'commitment:recent',type:'Commitment',label:'跟进实习材料',sourceRecordIds:['recent_question']}),
],edges:[]};
const waiting=[{id:'waiting:recent',recordId:'recent_question',person:'老师',subject:'实习材料回复',status:'waiting'}];
const index=memory.buildIndex(records,graph,{waiting});
const answer=memory.query(index,'我上次什么时候问过老师实习材料？',{now:'2026-07-13T10:00:00+08:00'});

check('Chinese bigram index retrieves the question',answer.sources.length>=2,JSON.stringify(answer));
check('time decay ranks the latest active evidence first',answer.sources[0].recordId==='recent_question',JSON.stringify(answer.sources.map((item)=>item.recordId)));
check('completed records are filtered by default',!answer.sources.some((item)=>item.recordId==='completed_question'));
check('result contains the matched record',answer.sources[0].title==='问老师实习材料');
check('result contains event time',answer.sources[0].dateKey==='2026-07-10'&&answer.sources[0].timeText==='14:30'&&answer.sources[0].occurredAt);
check('result cites a local source',answer.sources[0].source.kind==='local_record'&&answer.sources[0].source.recordId==='recent_question');
check('result provides an open-record action',answer.sources[0].source.action.type==='open_record'&&answer.sources[0].source.href.includes('recent_question'));
check('result explains why it matched',answer.sources[0].reason.includes('老师')||answer.sources[0].reason.includes('实习材料'));
check('result exposes related commitment',answer.sources[0].relatedCommitments.some((item)=>item.recordId==='recent_question'));
check('result exposes Waiting For relation',answer.sources[0].waitingFor&&answer.sources[0].waitingFor.person==='老师');
check('result exposes calibrated uncertainty',answer.sources[0].uncertainty>0&&answer.sources[0].uncertainty<1&&answer.sources[0].uncertaintyExplanation.length>0);
check('record title has stronger weight than raw text',memory.query(index,'奖学金截止日期',{now:'2026-07-13T10:00:00+08:00'}).sources[0].recordId==='title_weighted');
check('completed evidence can be explicitly included',memory.query(index,'问老师实习材料',{includeCompleted:true,now:'2026-07-13T10:00:00+08:00'}).sources.some((item)=>item.recordId==='completed_question'));
check('date filtering is respected',!memory.query(index,'老师实习材料',{from:'2026-07-01',now:'2026-07-13T10:00:00+08:00'}).sources.some((item)=>item.recordId==='older_question'));
const unknown=memory.query(index,'火星基地氧气税率',{now:'2026-07-13T10:00:00+08:00'});
check('memory never answers without a source',unknown.sources.length===0&&unknown.uncertainty===1&&unknown.answer.includes('没有找到'));
check('index is deterministically reverse chronological',index.records[0].id==='raw_weighted'&&index.records[1].id==='completed_question');

console.log(`Chronos cited temporal memory passed: ${checks.length}/${checks.length}`);
