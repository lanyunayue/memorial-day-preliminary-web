'use strict';

const {performance}=require('perf_hooks');
const intelligence=require('../src/intelligence/intelligence-controller.js');
const nextAction=require('../src/intelligence/next-action-engine.js');
const memory=require('../src/intelligence/temporal-memory.js');
function percentile(values,p){const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))];}
function measure(work,iterations){const values=[];for(let index=0;index<iterations;index++){const start=performance.now();work();values.push(performance.now()-start);}return {iterations,medianMs:Number(percentile(values,0.5).toFixed(3)),p95Ms:Number(percentile(values,0.95).toFixed(3)),maxMs:Number(Math.max(...values).toFixed(3))};}
const referenceDate=new Date('2026-07-13T10:00:00+08:00');
for(let index=0;index<100;index++)intelligence.analyze('明天下午三点开会',{referenceDate});
const single=measure(()=>intelligence.analyze('明天下午三点提交报告',{referenceDate}),1000);
const multi=measure(()=>intelligence.analyze('周五前把材料交给老师，小王说明天回复合同，下个月妈妈生日，毕业后想买车，这周练三次英语口语。',{referenceDate}),500);
const records=Array.from({length:1000},(_,index)=>({id:`record_${index}`,title:`处理事项${index}`,dateKey:index%3===0?'2026-07-12':index%3===1?'2026-07-13':'2026-07-15',recordState:'active',postponeCount:index%5}));
const graph={nodes:records.map((record,index)=>({id:`node_${index}`,type:index%2?'Commitment':'Task',sourceRecordIds:[record.id]})),edges:[]};
const action=measure(()=>nextAction.compute({records,graph,waiting:[],now:'2026-07-13T10:00:00+08:00'}),200);
const largeRecords=Array.from({length:10000},(_,index)=>({id:`large_${index}`,title:`项目${index}阶段记录`,rawText:`第${index}次项目进度`,updatedAt:index,createdAt:index}));
const largeGraph={nodes:largeRecords.map((record,index)=>({id:`topic_${index}`,type:'Topic',label:`项目${index}`,sourceRecordIds:[record.id]})),edges:[]};
const index=memory.buildIndex(largeRecords,largeGraph);
const graphQuery=measure(()=>memory.query(index,'项目9999经历了什么',{limit:8}),200);
const result={generatedAt:new Date().toISOString(),runtime:process.version,singleSentence:single,multiIntent:multi,nextAction1000:action,graphQuery10000:graphQuery,targetsMs:{singleSentence:50,multiIntent:150,nextAction1000:100,graphQuery10000:200}};
console.log(JSON.stringify(result,null,2));
if(single.p95Ms>=50||multi.p95Ms>=150||action.p95Ms>=100||graphQuery.p95Ms>=200)process.exit(1);
