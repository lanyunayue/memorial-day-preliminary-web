'use strict';

const fs=require('fs');
const path=require('path');
const intelligence=require('../src/intelligence/intelligence-controller.js');
const normalizer=require('../src/intelligence/temporal-normalizer.js');
const corpusRoot=path.resolve(__dirname,'..','corpus');
const load=(name)=>JSON.parse(fs.readFileSync(path.join(corpusRoot,name),'utf8'));
const core=load('temporal-cn-core.json');
const multi=load('temporal-cn-multi-intent.json');
const hard=load('temporal-cn-hardcases.json');
const time=load('temporal-cn-time-boundaries.json');
const adversarial=load('temporal-cn-adversarial.json');
const referenceDate=new Date('2026-07-13T10:00:00+08:00');
let passed=0;const failures=[];
function check(name,condition,detail){if(condition)passed++;else failures.push(`${name}: ${detail||'failed'}`);}
check('core count',core.length===300,core.length);
check('multi-intent count',multi.length===100,multi.length);
check('hardcase count',hard.length===100,hard.length);
check('time-boundary count',time.length===100,time.length);
check('adversarial count',adversarial.length===100,adversarial.length);
const all=[...core,...multi,...hard,...time,...adversarial];
check('all corpus text is unique',new Set(all.map((item)=>item.text)).size===700,new Set(all.map((item)=>item.text)).size);
core.forEach((fixture)=>{
  const result=intelligence.analyze(fixture.text,{referenceDate});
  if(fixture.expected.type)check(fixture.id,result.drafts.length===1&&result.drafts[0].type===fixture.expected.type,JSON.stringify({drafts:result.drafts.map((item)=>item.type),rejected:result.rejected}));
  else check(fixture.id,result.drafts.length===0&&result.rejected[0]&&result.rejected[0].reason===fixture.expected.rejected,JSON.stringify(result));
});
multi.forEach((fixture)=>{
  const result=intelligence.analyze(fixture.text,{referenceDate});const types=result.drafts.map((item)=>item.type);
  check(fixture.id,result.drafts.length===fixture.expected.draftCount&&fixture.expected.types.every((type)=>types.includes(type)),JSON.stringify(types));
});
hard.forEach((fixture)=>{
  const result=intelligence.analyze(fixture.text,{referenceDate});
  if(fixture.expected.rejected)check(fixture.id,result.drafts.length===0&&result.rejected[0]&&result.rejected[0].reason===fixture.expected.rejected,JSON.stringify(result));
  else check(fixture.id,result.drafts.length===1&&result.drafts[0].type===fixture.expected.type&&!!result.drafts[0].condition===fixture.expected.conditional,JSON.stringify(result));
});
time.forEach((fixture)=>{
  const result=normalizer.normalizeTime(fixture.text,{referenceDate});const expected=fixture.expected;
  check(fixture.id,result.dateKey===expected.dateKey&&result.timeText===expected.timeText&&result.precision===expected.precision,JSON.stringify(result));
});
adversarial.forEach((fixture)=>{
  const result=intelligence.analyze(fixture.text,{referenceDate});
  check(fixture.id,result.drafts.length===0&&result.rejected.length===1&&result.rejected[0].reason==='prompt_injection',JSON.stringify(result));
});
if(failures.length){console.error(`Temporal corpus failed: ${failures.length}/${passed+failures.length}`);failures.slice(0,30).forEach((failure)=>console.error('- '+failure));process.exit(1);}
console.log(`Temporal corpus passed: ${passed}/${passed}; fixtures=700; unique=700`);
