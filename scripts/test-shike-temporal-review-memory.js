'use strict';

const daily=require('../src/intelligence/daily-brief.js');
const weekly=require('../src/intelligence/weekly-review.js');
const correctionApi=require('../src/intelligence/correction-store.js');
const memory=require('../src/intelligence/temporal-memory.js');
const checks=[];function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}

(async function(){
  const records=[
    {id:'commitment',title:'交实习材料',dateKey:'2026-07-13',recordKind:'reminder',recordState:'active',createdAt:1,updatedAt:1},
    {id:'overdue',title:'归还图书',dateKey:'2026-07-12',recordKind:'reminder',recordState:'active',createdAt:2,updatedAt:2,postponeCount:2},
    {id:'tomorrow',title:'准备演示',dateKey:'2026-07-14',recordKind:'reminder',recordState:'active',createdAt:3,updatedAt:3},
    {id:'goal',title:'毕业后买车',dateKey:'',recordKind:'note',recordState:'active',createdAt:4,updatedAt:4},
    {id:'completed',title:'完成周报',dateKey:'2026-07-13',recordKind:'reminder',recordState:'completed',createdAt:Date.parse('2026-07-13'),updatedAt:Date.parse('2026-07-13T09:00:00Z')}
  ];
  const graph={nodes:[
    {id:'c',type:'Commitment',label:'交材料',sourceRecordIds:['commitment']},
    {id:'g',type:'Goal',label:'买车',sourceRecordIds:['goal']},
    {id:'p',type:'Person',label:'老师',sourceRecordIds:['commitment']},
    {id:'t',type:'Topic',label:'实习材料',sourceRecordIds:['commitment']}
  ],edges:[]};
  const waiting=[{id:'w1',recordId:'wait',person:'小王',subject:'合同',status:'expected_today',createdAt:'2026-07-12T00:00:00Z'},{id:'w2',recordId:'wait2',person:'客户',subject:'确认',status:'overdue',createdAt:'2026-07-10T00:00:00Z'}];
  const brief=daily.generate({records,graph,waiting,suggestions:[{action:'交实习材料',reason:'因为今天到期'}],now:'2026-07-13T10:00:00+08:00'});
  check('daily brief finds must-handle commitment',brief.mustHandle.some((item)=>item.id==='commitment'));
  check('daily brief finds overdue record',brief.overdue.some((item)=>item.id==='overdue'));
  check('daily brief keeps active waiting',brief.waitingOn.length===2);
  check('daily brief finds expected-today reply',brief.expectedToday.length===1);
  check('daily brief finds tomorrow items',brief.tomorrow.length===1);
  check('daily brief exposes explainable next action',brief.nextAction.reason.includes('因为'));
  check('daily load is factual',brief.load.count===1&&brief.load.explanation.includes('1'));
  check('daily brief exports locally',daily.exportText(brief).includes('下一步：交实习材料'));

  const correctionStore=correctionApi.create(correctionApi.memoryDriver());
  await correctionStore.record({eventType:'draft_edited',draftId:'d1',sourceText:'token: abc123',originalType:'goal',correctedType:'task',modifiedFields:['type']});
  await correctionStore.record({eventType:'suggestion_ignored',recordId:'overdue'});
  const corrections=await correctionStore.list();
  check('corrections persist locally',corrections.length===2);
  check('corrections redact token values',corrections.some((item)=>item.sourceText.includes('[已移除]')));
  check('corrections preserve changed fields',corrections.some((item)=>item.modifiedFields.includes('type')));
  const correctionExport=await correctionStore.exportData();
  check('corrections are exportable',correctionExport.count===2&&correctionExport.kind==='temporal_corrections');

  const review=weekly.generate({records,graph,waiting:[...waiting,{id:'w3',recordId:'done',status:'resolved',createdAt:'2026-07-10T00:00:00Z',lastCheckedAt:'2026-07-13T02:00:00Z'}],corrections,now:'2026-07-13T10:00:00+08:00',backupStatus:{lastBackupAt:'2026-07-12T10:00:00Z'}});
  check('weekly review uses Monday-Sunday range',review.range.from==='2026-07-13'&&review.range.to==='2026-07-19');
  check('weekly review finds completed work',review.completed.length===1);
  check('weekly review finds open commitments',review.openCommitments.length===1);
  check('weekly review finds repeated postponement',review.repeatedlyPostponed.length===1);
  check('weekly review finds resolved Waiting For',review.resolvedWaiting.length===1);
  check('weekly review finds overdue Waiting For',review.overdueWaiting.length===1);
  check('weekly review finds goal without action',review.goalsWithoutAction.length===1);
  check('weekly review exports JSON',JSON.parse(weekly.exportJson(review)).schemaVersion===1);

  const index=memory.buildIndex(records,graph);
  const answer=memory.query(index,'我之前答应老师什么');
  check('temporal memory retrieves commitment',answer.sources.some((item)=>item.recordId==='commitment'));
  check('temporal memory includes source reason',answer.sources.every((item)=>item.reason.length>0));
  const unknown=memory.query(index,'完全不存在的火星行程');
  check('temporal memory does not fabricate',unknown.sources.length===0&&unknown.answer.includes('没有找到'));
  await correctionStore.clear();
  check('correction history can be cleared',(await correctionStore.list()).length===0);
  console.log(`Temporal review and memory regression passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(error);process.exit(1);});
