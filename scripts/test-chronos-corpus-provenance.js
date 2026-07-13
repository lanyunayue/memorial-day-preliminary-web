'use strict';

const fs=require('fs');
const path=require('path');
const evaluator=require('./evaluate-chronos-human-corpus.js');
const root=path.resolve(__dirname,'..','corpus');const manifest=JSON.parse(fs.readFileSync(path.join(root,'temporal-corpus-manifest.json'),'utf8'));const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
const allowed=new Set(manifest.taxonomy);let total=0;
for(const dataset of manifest.datasets){const fixtures=JSON.parse(fs.readFileSync(path.join(root,dataset.file),'utf8'));check(`${dataset.file} count is declared`,fixtures.length===dataset.fixtures,fixtures.length);check(`${dataset.file} provenance is valid`,allowed.has(dataset.provenance),dataset.provenance);total+=fixtures.length;}
check('manifest covers all 700 fixtures',total===700&&manifest.summary.total===700,total);
check('generated corpus is not relabeled human reviewed',manifest.summary.humanReviewed===0&&manifest.humanCorpusStatus==='not_available');
check('blind set is not falsely reported complete',manifest.blindSetStatus==='protocol_ready_no_reviewed_fixtures');
const syntheticInputs=[{id:'a',text:'x',provenance:'human-reviewed',reviewRounds:2},{id:'b',text:'y',provenance:'human-reviewed',reviewRounds:2}];
const syntheticLabels=[{id:'a',expected:{type:'goal'}},{id:'b',expected:{rejected:'negated'}}];
const predictions={x:{drafts:[{type:'goal',missingFields:[]}],rejected:[]},y:{drafts:[{type:'task',missingFields:[]}],rejected:[]}};
const metrics=evaluator.evaluate(syntheticInputs,syntheticLabels,(text)=>predictions[text]);
check('blind evaluator computes confusion matrix',metrics.typeConfusionMatrix.goal.goal===1&&metrics.typeConfusionMatrix.negated.task===1);
check('blind evaluator exposes specialist false positives',metrics.negationFalsePositive.count===1);
let refused=false;try{evaluator.evaluate([{id:'bad',text:'x',provenance:'generated',reviewRounds:0}],[{id:'bad',expected:{type:'task'}}],()=>predictions.y);}catch(error){refused=true;}
check('evaluator refuses generated data as human reviewed',refused);
console.log(`Chronos corpus provenance passed: ${checks.length}/${checks.length}`);
