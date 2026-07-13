'use strict';

const fs=require('fs');
const path=require('path');
const intelligence=require('../src/intelligence/intelligence-controller.js');
function parseArgs(argv){const result={};for(let index=0;index<argv.length;index++)if(argv[index].startsWith('--'))result[argv[index].slice(2)]=argv[index+1]&&!argv[index+1].startsWith('--')?argv[++index]:true;return result;}
function readJsonl(file){return fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map((line,index)=>{try{return JSON.parse(line);}catch(error){throw new Error(`${path.basename(file)} line ${index+1} is invalid JSON`);}});}
function ratio(value,total){return total?Number((value/total).toFixed(6)):null;}
function evaluate(inputs,labels,analyze){
  const labelById=new Map(labels.map((item)=>[item.id,item.expected]));const confusion={};let tp=0,fp=0,fn=0,negationTotal=0,negationFalsePositive=0,completedTotal=0,completedFalsePositive=0,goalTotal=0,goalToTask=0,waitingPredicted=0,waitingCorrect=0,multiTotal=0,multiExact=0,missingExpected=0,missingHonest=0;
  for(const item of inputs){
    if(item.provenance!=='human-reviewed'||Number(item.reviewRounds||0)<2)throw new Error(`fixture ${item.id} is not eligible for human-reviewed evaluation`);
    const expected=labelById.get(item.id);if(!expected)throw new Error(`fixture ${item.id} has no blind label`);const result=analyze(item.text);const predicted=result.drafts.map((draft)=>draft.type);const expectedTypes=expected.types||expected.type?[].concat(expected.types||expected.type):[];const expectedClass=expected.rejected||expectedTypes.join('+')||'none';const predictedClass=result.rejected[0]&&result.rejected[0].reason||predicted.join('+')||'none';
    confusion[expectedClass]=confusion[expectedClass]||{};confusion[expectedClass][predictedClass]=(confusion[expectedClass][predictedClass]||0)+1;
    const exact=JSON.stringify(predicted.slice().sort())===JSON.stringify(expectedTypes.slice().sort())&&(!expected.rejected||result.rejected.some((entry)=>entry.reason===expected.rejected));if(exact)tp++;else{if(predicted.length)fp+=predicted.length;fn+=Math.max(1,expectedTypes.length);}
    if(expected.rejected==='negated'){negationTotal++;if(result.drafts.length)negationFalsePositive++;}if(expected.rejected==='completed_fact'){completedTotal++;if(result.drafts.length)completedFalsePositive++;}
    if(expectedTypes.includes('goal')){goalTotal++;if(predicted.includes('task'))goalToTask++;}if(predicted.includes('waiting_for')){waitingPredicted++;if(expectedTypes.includes('waiting_for'))waitingCorrect++;}
    if(expectedTypes.length>1){multiTotal++;if(exact)multiExact++;}
    const expectedMissing=expected.missingFields||[];if(expectedMissing.length){missingExpected+=expectedMissing.length;const actual=new Set(result.drafts.flatMap((draft)=>draft.missingFields||[]));expectedMissing.forEach((field)=>{if(actual.has(field))missingHonest++;});}
  }
  const precision=ratio(tp,tp+fp);const recall=ratio(tp,tp+fn);const f1=precision===null||recall===null||precision+recall===0?null:Number((2*precision*recall/(precision+recall)).toFixed(6));
  return {classification:'HUMAN_REVIEWED_BLIND_EVALUATION',fixtures:inputs.length,precision,recall,f1,typeConfusionMatrix:confusion,negationFalsePositive:{count:negationFalsePositive,total:negationTotal,rate:ratio(negationFalsePositive,negationTotal)},completedFactFalsePositive:{count:completedFalsePositive,total:completedTotal,rate:ratio(completedFalsePositive,completedTotal)},goalToTaskError:{count:goalToTask,total:goalTotal,rate:ratio(goalToTask,goalTotal)},waitingForPrecision:ratio(waitingCorrect,waitingPredicted),multiIntentExactMatch:ratio(multiExact,multiTotal),missingFieldHonesty:ratio(missingHonest,missingExpected)};
}
function main(){
  const args=parseArgs(process.argv.slice(2));if(!args.input||!args.labels){console.log(JSON.stringify({classification:'NOT_AVAILABLE',reason:'no frozen human-reviewed blind input and labels were supplied',humanReviewedFixtures:0},null,2));return;}
  const inputs=readJsonl(path.resolve(args.input));const labels=readJsonl(path.resolve(args.labels));const result=evaluate(inputs,labels,(text)=>intelligence.analyze(text,{referenceDate:new Date(args.referenceDate||'2026-07-13T10:00:00+08:00')}));
  const output=JSON.stringify(result,null,2)+'\n';if(args.output)fs.writeFileSync(path.resolve(args.output),output,'utf8');process.stdout.write(output);
}
if(require.main===module)try{main();}catch(error){console.error(error.message);process.exit(1);}
module.exports=Object.freeze({evaluate,readJsonl,parseArgs});
