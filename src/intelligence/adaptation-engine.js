(function(global,factory){var validator=global.ShikeTemporalValidator;if(typeof module!=='undefined'&&module.exports)validator=require('./temporal-validator.js');var api=factory(validator);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeAdaptationEngine=api;})(typeof window!=='undefined'?window:globalThis,function(validator){
  'use strict';
  var TYPES=new Set(['commitment','waiting_for','task','goal','event','anniversary','habit','note','thought']);
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function normalized(value){return String(value||'').trim().toLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');}
  function hash(value){var result=2166136261;String(value||'').split('').forEach(function(character){result^=character.charCodeAt(0);result=Math.imul(result,16777619);});return (result>>>0).toString(36);}
  function matches(rule,draft){var source=normalized(draft.sourceText);var value=normalized(rule.pattern.value);if(rule.pattern.kind==='source_exact')return source===value;if(rule.pattern.kind==='source_contains')return source.includes(value);return false;}
  function applyDraft(draft,rules){
    var next=copy(draft);var applied=[];var policy={disableReminder:false,ignoreSuggestion:false};
    (rules||[]).filter(function(rule){return rule.enabled!==false&&matches(rule,next);}).forEach(function(rule){
      if(rule.effect.kind==='set_type'&&TYPES.has(rule.effect.value))next.type=rule.effect.value;
      else if(rule.effect.kind==='set_time'&&rule.effect.value&&typeof rule.effect.value==='object')next.normalizedTime=Object.assign({},next.normalizedTime||{},rule.effect.value);
      else if(rule.effect.kind==='disable_reminder')policy.disableReminder=true;
      else if(rule.effect.kind==='ignore_suggestion')policy.ignoreSuggestion=true;
      else return;
      validator.requireValidDraft(next);applied.push(rule.ruleId);
    });
    return {draft:next,appliedRuleIds:applied,policy:policy};
  }
  function deriveFromCorrections(corrections){
    var groups=new Map();(corrections||[]).forEach(function(item){
      if(item.eventType!=='draft_edited'||!item.sourceText||!item.correctedType||item.originalType===item.correctedType||!TYPES.has(item.correctedType))return;
      var source=String(item.sourceText).trim();var key=normalized(source)+'|'+item.correctedType;var group=groups.get(key)||{source:source,type:item.correctedType,ids:[]};group.ids.push(item.id);groups.set(key,group);
    });
    var now=new Date().toISOString();return [...groups.values()].filter(function(group){return group.ids.length>=2;}).map(function(group){return {ruleId:'adapt_type_'+hash(normalized(group.source)+'|'+group.type),sourceCorrectionIds:[...new Set(group.ids)],pattern:{kind:'source_exact',value:group.source},effect:{kind:'set_type',value:group.type},confidenceBand:group.ids.length>=3?'high':'medium',createdAt:now,lastUsedAt:null,usageCount:0,enabled:true,schemaVersion:1};});
  }
  function outcome(actual,expected){return actual===expected;}
  async function evaluateAndGuard(options){
    options=options||{};var cases=options.cases||[];var rules=options.rules||[];var store=options.store;var summary={improved:0,regressed:0,unchanged:0,rules:[]};
    for(var ruleIndex=0;ruleIndex<rules.length;ruleIndex++){
      var rule=rules[ruleIndex];var result={ruleId:rule.ruleId,improved:0,regressed:0,unchanged:0,autoDisabled:false};
      for(var caseIndex=0;caseIndex<cases.length;caseIndex++){
        var testCase=cases[caseIndex];var before=await options.baselineAnalyze(testCase.input);var after=await options.adaptedAnalyze(testCase.input,[rule]);var beforeOk=outcome(before.type,testCase.expectedType);var afterOk=outcome(after.type,testCase.expectedType);
        if(!beforeOk&&afterOk)result.improved++;else if(beforeOk&&!afterOk)result.regressed++;else result.unchanged++;
      }
      if(result.regressed>result.improved&&store){await store.disable(rule.ruleId);result.autoDisabled=true;}
      summary.improved+=result.improved;summary.regressed+=result.regressed;summary.unchanged+=result.unchanged;summary.rules.push(result);
    }
    return summary;
  }
  return Object.freeze({applyDraft:applyDraft,deriveFromCorrections:deriveFromCorrections,evaluateAndGuard:evaluateAndGuard});
});
