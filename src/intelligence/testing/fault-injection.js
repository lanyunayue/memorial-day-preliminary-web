(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeTemporalFaultInjection=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function create(){
    var points=new Map();
    function arm(point,error,count){points.set(point,{error:error||new Error('fault_injected:'+point),remaining:count||1});}
    async function hit(point){
      var entry=points.get(point);if(!entry)return;entry.remaining--;if(entry.remaining>0)return;points.delete(point);
      var error=entry.error instanceof Error?entry.error:new Error(String(entry.error));error.code=error.code||'TEMPORAL_FAULT_INJECTED';throw error;
    }
    function clear(){points.clear();}
    return Object.freeze({arm:arm,hit:hit,clear:clear});
  }
  return Object.freeze({create:create});
});
