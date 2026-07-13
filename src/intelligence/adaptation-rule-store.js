(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeAdaptationRuleStore=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  var STORE='temporal_adaptation_rules';
  var PATTERNS=new Set(['source_exact','source_contains','person_alias','action_alias','project_alias']);
  var EFFECTS=new Set(['set_type','set_time','disable_reminder','ignore_suggestion','replace_person']);
  var SECRET=/(?:password|密码|token|api[_-]?key|private[_-]?key|私钥)\s*[:=：]\s*\S+/i;
  var PERSONALITY=/(?:人格|性格|政治倾向|宗教信仰|心理诊断|智商|种族|性取向)/i;
  function copy(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
  function clean(value,limit){return String(value||'').trim().slice(0,limit||200);}
  function validate(rule){
    var errors=[];if(!rule||typeof rule!=='object'||Array.isArray(rule))return {valid:false,errors:['rule_not_object']};
    if(!clean(rule.ruleId))errors.push('rule_id_required');
    if(!Array.isArray(rule.sourceCorrectionIds)||!rule.sourceCorrectionIds.length)errors.push('source_corrections_required');
    if(!rule.pattern||!PATTERNS.has(rule.pattern.kind)||!clean(rule.pattern.value))errors.push('invalid_pattern');
    if(!rule.effect||!EFFECTS.has(rule.effect.kind))errors.push('invalid_effect');
    if(!['low','medium','high'].includes(rule.confidenceBand))errors.push('invalid_confidence_band');
    var serialized=JSON.stringify(rule);if(SECRET.test(serialized))errors.push('secret_material_rejected');if(PERSONALITY.test(serialized))errors.push('sensitive_profile_rejected');
    return {valid:errors.length===0,errors:errors};
  }
  function normalize(rule){
    var result=validate(rule);if(!result.valid){var error=new Error('invalid_adaptation_rule: '+result.errors.join(','));error.code='INVALID_ADAPTATION_RULE';error.details=result.errors;throw error;}
    return {ruleId:clean(rule.ruleId,160),id:clean(rule.ruleId,160),sourceCorrectionIds:[...new Set(rule.sourceCorrectionIds.map(function(id){return clean(id,160);}).filter(Boolean))],pattern:{kind:rule.pattern.kind,value:clean(rule.pattern.value,240)},effect:copy(rule.effect),confidenceBand:rule.confidenceBand,createdAt:rule.createdAt||new Date().toISOString(),lastUsedAt:rule.lastUsedAt||null,usageCount:Math.max(0,Number(rule.usageCount||0)),enabled:rule.enabled!==false,schemaVersion:1};
  }
  function browserDriver(){
    if(!globalThis.ShikeIndexedDb)throw new Error('adaptation_store_unavailable');
    return {list:function(){return globalThis.ShikeIndexedDb.getAll(STORE);},put:function(item){return globalThis.ShikeIndexedDb.put(STORE,item);},remove:function(id){return globalThis.ShikeIndexedDb.remove(STORE,id);},async clear(){var db=await globalThis.ShikeIndexedDb.open();return new Promise(function(resolve,reject){var tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=function(){resolve(true);};tx.onerror=function(){reject(tx.error);};});}};
  }
  function memoryDriver(initial){var items=copy(initial||[]);return {async list(){return copy(items);},async put(item){items=items.filter(function(current){return current.id!==item.id;});items.push(copy(item));return copy(item);},async remove(id){items=items.filter(function(item){return item.id!==id;});return true;},async clear(){items=[];return true;}};}
  function create(driver){
    driver=driver||browserDriver();var queue=Promise.resolve();
    function sequence(work){var run=queue.then(work);queue=run.catch(function(){});return run;}
    function put(rule){var item=normalize(rule);return sequence(function(){return driver.put(item);});}
    async function list(){await queue;var items=await driver.list();return items.map(normalize).sort(function(a,b){return a.createdAt.localeCompare(b.createdAt)||a.ruleId.localeCompare(b.ruleId);});}
    async function setEnabled(ruleId,enabled){var items=await list();var rule=items.find(function(item){return item.ruleId===ruleId;});if(!rule)return false;await put(Object.assign({},rule,{enabled:Boolean(enabled)}));return true;}
    function disable(ruleId){return setEnabled(ruleId,false);}
    async function remove(ruleId){await queue;return driver.remove(ruleId);}
    async function reset(){await queue;return driver.clear();}
    async function exportData(){var items=await list();return {app:'shike',kind:'temporal_adaptation_rules',schemaVersion:1,exportedAt:new Date().toISOString(),count:items.length,items:items};}
    async function importData(payload){
      if(payload===undefined||payload===null)return {imported:0,legacyWithoutRules:true};
      var items=Array.isArray(payload)?payload:payload.items;if(!Array.isArray(items))throw new Error('invalid_adaptation_backup');
      var normalized=items.map(normalize);await reset();for(var index=0;index<normalized.length;index++)await put(normalized[index]);return {imported:normalized.length,legacyWithoutRules:false};
    }
    return Object.freeze({put:put,list:list,setEnabled:setEnabled,disable:disable,remove:remove,reset:reset,exportData:exportData,importData:importData});
  }
  return Object.freeze({create:create,validate:validate,normalize:normalize,browserDriver:browserDriver,memoryDriver:memoryDriver,store:STORE});
});
