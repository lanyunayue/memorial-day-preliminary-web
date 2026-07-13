'use strict';

const temporal=require('../src/intelligence/intelligence-controller.js');
const storeModule=require('../src/intelligence/adaptation-rule-store.js');
const adaptation=require('../src/intelligence/adaptation-engine.js');
const backupAdapter=require('../src/intelligence/adapters/backup-adapter.js');

const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}
function analyze(text){return temporal.analyze(text,{referenceDate:new Date('2026-07-13T10:00:00+08:00')}).drafts[0];}

(async()=>{
  const store=storeModule.create(storeModule.memoryDriver());
  const corrections=[
    {id:'correction_a',eventType:'draft_edited',sourceText:'周五整理实习材料',originalType:'task',correctedType:'goal'},
    {id:'correction_b',eventType:'draft_edited',sourceText:'周五整理实习材料',originalType:'task',correctedType:'goal'},
  ];
  const derived=adaptation.deriveFromCorrections(corrections);
  check('two corrections derive one narrow rule',derived.length===1);
  check('rule retains correction provenance',derived[0].sourceCorrectionIds.length===2);
  check('rule uses exact source pattern',derived[0].pattern.kind==='source_exact');
  await store.put(derived[0]);
  const before=analyze('周五整理实习材料');
  const snapshot=JSON.stringify(before);
  const applied=adaptation.applyDraft(before,await store.list());
  check('future draft type is adapted',before.type==='task'&&applied.draft.type==='goal');
  check('adaptation validates and reports source rule',applied.appliedRuleIds[0]===derived[0].ruleId);
  check('historical draft is never mutated',JSON.stringify(before)===snapshot);
  check('different wording is not broadly changed',adaptation.applyDraft(analyze('明天交报名表'),await store.list()).appliedRuleIds.length===0);
  await store.disable(derived[0].ruleId);
  check('disabled rule no longer applies',adaptation.applyDraft(before,await store.list()).appliedRuleIds.length===0);
  await store.setEnabled(derived[0].ruleId,true);
  const exported=await store.exportData();
  check('rules are exportable',exported.count===1&&exported.items[0].sourceCorrectionIds.length===2);
  let rejected=false;
  try{await store.put({...derived[0],ruleId:'unsafe',pattern:{kind:'source_exact',value:'api_key=secret-value'}});}catch(error){rejected=error.code==='INVALID_ADAPTATION_RULE';}
  check('secret-bearing rule is rejected',rejected);
  rejected=false;
  try{await store.put({...derived[0],ruleId:'profile',pattern:{kind:'source_exact',value:'性格内向'}});}catch(error){rejected=error.code==='INVALID_ADAPTATION_RULE';}
  check('personality profiling rule is rejected',rejected);

  const badRule={...derived[0],ruleId:'adapt_bad',sourceCorrectionIds:['correction_bad'],pattern:{kind:'source_exact',value:'明天交报名表'},effect:{kind:'set_type',value:'goal'}};
  await store.put(badRule);
  const evaluation=await adaptation.evaluateAndGuard({
    cases:[{input:'周五整理实习材料',expectedType:'goal'},{input:'明天交报名表',expectedType:'task'}],
    rules:[derived[0],badRule],store,
    baselineAnalyze:async(text)=>analyze(text),
    adaptedAnalyze:async(text,rules)=>adaptation.applyDraft(analyze(text),rules).draft,
  });
  check('offline evaluation counts improvements',evaluation.improved===1);
  check('offline evaluation counts regressions',evaluation.regressed===1);
  check('offline evaluation counts unchanged cases',evaluation.unchanged===2);
  check('regressing rule is automatically disabled',evaluation.rules.find((item)=>item.ruleId==='adapt_bad').autoDisabled&&(await store.list()).find((item)=>item.ruleId==='adapt_bad').enabled===false);

  const graphRepository={snapshot:async()=>({schemaVersion:1,nodes:[],edges:[],tombstones:[]}),replaceAll:async()=>true};
  const waitingRepository={list:async()=>[],replaceAll:async()=>true};
  const adapter=backupAdapter.create({graphRepository,waitingRepository,adaptationStore:store});
  const payload=await adapter.augment({records:[]});
  check('backup contains adaptation rules',payload.temporalAdaptationRules.length===2);
  await store.reset();
  await adapter.importPrepared({idMap:{},temporal:{temporalGraph:payload.temporalGraph,temporalWaiting:[],temporalAdaptationRules:payload.temporalAdaptationRules}});
  check('backup restores adaptation rules',await store.list().then((items)=>items.length===2));
  const countBeforeLegacy=(await store.list()).length;
  await adapter.importPrepared({idMap:{},temporal:{temporalGraph:payload.temporalGraph,temporalWaiting:[]}});
  check('legacy backup without rules preserves current rules',(await store.list()).length===countBeforeLegacy);
  await store.remove('adapt_bad');
  check('individual rule can be deleted',(await store.list()).length===1);
  await store.reset();
  check('all rules can be reset',(await store.list()).length===0);

  console.log(`Chronos reversible adaptation passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(error);process.exit(1);});
