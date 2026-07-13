(function(global,factory){
  var intelligence=global.ShikeTemporalIntelligence;if(typeof module!=='undefined'&&module.exports)intelligence=require('../intelligence-controller.js');
  var api=factory(intelligence);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeLegacyRecordAdapter=api;
})(typeof window!=='undefined'?window:globalThis,function(intelligence){
  'use strict';
  function signature(record){return [String(record.title||'').trim().toLowerCase(),record.dateKey||'',record.timeText||''].join('|');}
  function candidate(draft){return intelligence.toRecord(draft,function(){return 'candidate';});}
  function isDuplicate(draft,records){var key=signature(candidate(draft));return (records||[]).some(function(record){return signature(record)===key;});}
  return Object.freeze({signature:signature,isDuplicate:isDuplicate,candidate:candidate});
});
