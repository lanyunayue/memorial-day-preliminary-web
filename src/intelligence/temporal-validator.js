(function(global,factory){
  var domain=global.ShikeTemporalDomain;
  if(typeof module!=='undefined'&&module.exports)domain=require('./temporal-domain.js');
  var api=factory(domain);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeTemporalValidator=api;
})(typeof window!=='undefined'?window:globalThis,function(domain){
  'use strict';

  function isPlainObject(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return false;
    var prototype=Object.getPrototypeOf(value);
    return prototype===Object.prototype||prototype===null;
  }
  function validateDraft(draft){
    var errors=[];
    if(!isPlainObject(draft))return {valid:false,errors:['draft_not_object']};
    if(draft.schemaVersion!==domain.SCHEMA_VERSION)errors.push('unsupported_schema_version');
    if(!draft.id||typeof draft.id!=='string')errors.push('id_required');
    if(!domain.TYPES.includes(draft.type))errors.push('invalid_type');
    if(!String(draft.sourceText||'').trim())errors.push('source_text_required');
    if(!draft.sourceSpan||!Number.isInteger(draft.sourceSpan.start)||!Number.isInteger(draft.sourceSpan.end)){
      errors.push('source_span_required');
    }else if(draft.sourceSpan.start<0||draft.sourceSpan.end<draft.sourceSpan.start||draft.sourceSpan.end>draft.sourceText.length){
      errors.push('source_span_invalid');
    }
    if(!domain.CONFIDENCE_BANDS.includes(draft.confidenceBand))errors.push('invalid_confidence_band');
    if(!domain.STATUSES.includes(draft.status))errors.push('invalid_status');
    if(!Array.isArray(draft.personRefs))errors.push('person_refs_must_be_array');
    if(!Array.isArray(draft.missingFields))errors.push('missing_fields_must_be_array');
    if(draft.normalizedTime!==null&&!isPlainObject(draft.normalizedTime))errors.push('normalized_time_invalid');
    return {valid:errors.length===0,errors:errors};
  }
  function requireValidDraft(draft){
    var result=validateDraft(draft);
    if(!result.valid){
      var error=new Error('invalid_temporal_draft: '+result.errors.join(','));
      error.code='INVALID_TEMPORAL_DRAFT';
      error.details=result.errors;
      throw error;
    }
    return draft;
  }
  function sanitizeModelOutput(value){
    if(!isPlainObject(value))throw new Error('model_output_not_object');
    return requireValidDraft(domain.createDraft(value));
  }

  return Object.freeze({
    validateDraft:validateDraft,
    requireValidDraft:requireValidDraft,
    sanitizeModelOutput:sanitizeModelOutput
  });
});
