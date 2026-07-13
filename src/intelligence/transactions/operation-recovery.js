(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeOperationRecovery=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function create(options){
    options=options||{};var journal=options.journal;var coordinator=options.coordinator;var resolvePlan=options.resolvePlan;var maxRetries=options.maxRetries||3;
    async function scan(){
      var pending=await journal.listPending();var result={scanned:pending.length,recovered:0,quarantined:0,failed:0,operations:[]};
      for(var index=0;index<pending.length;index++){
        var operation=pending[index];if(Number(operation.retryCount||0)>=maxRetries){await journal.quarantine(operation,'retry_limit_exceeded');result.quarantined++;continue;}
        try{var plan=await resolvePlan(operation);if(!plan){await journal.quarantine(operation,'recovery_plan_unavailable');result.quarantined++;continue;}plan.recovery=true;var outcome=await coordinator.execute(plan);result.recovered++;result.operations.push(outcome.operation.operationId);}catch(error){var current=await journal.get(operation.operationId);if(current&&Number(current.retryCount||0)>=maxRetries){await journal.quarantine(current,error);result.quarantined++;}else result.failed++;}
      }
      return result;
    }
    return Object.freeze({scan:scan});
  }
  return Object.freeze({create:create});
});
