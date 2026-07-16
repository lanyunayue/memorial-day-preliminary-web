(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeOperationCoordinator=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function noFault(){return {hit:function(){return Promise.resolve();}};}
  function create(options){
    options=options||{};var journal=options.journal;var lock=options.lock;var fault=options.fault||noFault();if(!journal||!lock)throw new Error('operation_coordinator_dependencies_required');
    async function execute(input){
      var operation=await journal.prepare(input);if(['committed','recovered'].includes(operation.status))return {operation:operation,duplicate:true};
      await fault.hit('after:prepared',operation);
      return lock.withLock(input.lockName||'operation:'+operation.operationId,async function(){
        operation=await journal.get(operation.operationId);if(['committed','recovered'].includes(operation.status))return {operation:operation,duplicate:true};
        try{
          var steps=input.steps||[];
          for(var index=0;index<steps.length;index++){
            var step=steps[index];if(operation.completedSteps.includes(step.name))continue;
            await fault.hit('before:'+step.name,operation);await step.run(operation);
            operation=await journal.mark(operation.operationId,step.status||operation.status,step.name);await fault.hit('after:'+step.name,operation);
          }
          operation=await journal.mark(operation.operationId,input.recovery?'recovered':'committed','commit');return {operation:operation,duplicate:false};
        }catch(error){await journal.fail(operation.operationId,error);throw error;}
      });
    }
    return Object.freeze({execute:execute});
  }
  return Object.freeze({create:create});
});
