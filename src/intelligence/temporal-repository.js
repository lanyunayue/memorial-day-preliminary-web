(function(global,factory){
  var domain=global.ShikeTemporalDomain;
  var validator=global.ShikeTemporalValidator;
  if(typeof module!=='undefined'&&module.exports){
    domain=require('./temporal-domain.js');
    validator=require('./temporal-validator.js');
  }
  var api=factory(domain,validator);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeTemporalRepository=api;
})(typeof window!=='undefined'?window:globalThis,function(domain,validator){
  'use strict';

  var DRAFT_STORE='temporal_drafts';
  var META_STORE='temporal_meta';
  var META_ID='temporal_schema';

  function browserDriver(){
    if(!globalThis.ShikeIndexedDb)throw new Error('temporal_repository_unavailable');
    return globalThis.ShikeIndexedDb;
  }
  function create(driver){
    driver=driver||browserDriver();
    async function initialize(){
      var current=await driver.get(META_STORE,META_ID);
      if(current&&current.schemaVersion===domain.SCHEMA_VERSION)return current;
      var meta={id:META_ID,schemaVersion:domain.SCHEMA_VERSION,updatedAt:new Date().toISOString()};
      await driver.put(META_STORE,meta);
      return meta;
    }
    async function saveDrafts(drafts){
      if(!Array.isArray(drafts))throw new Error('drafts_must_be_array');
      await initialize();
      var clean=drafts.map(function(draft){return validator.requireValidDraft(domain.cloneDraft(draft));});
      await Promise.all(clean.map(function(draft){return driver.put(DRAFT_STORE,draft);}));
      return clean;
    }
    async function listDrafts(){
      await initialize();
      var drafts=await driver.getAll(DRAFT_STORE);
      return (drafts||[]).sort(function(a,b){return a.createdAt-b.createdAt;});
    }
    async function getDraft(id){await initialize();return driver.get(DRAFT_STORE,id);}
    async function removeDraft(id){await driver.remove(DRAFT_STORE,id);return true;}
    async function setStatus(id,status){
      var draft=await driver.get(DRAFT_STORE,id);
      if(!draft)throw new Error('temporal_draft_not_found');
      draft.status=status;
      validator.requireValidDraft(draft);
      await driver.put(DRAFT_STORE,draft);
      return draft;
    }
    return Object.freeze({
      initialize:initialize,
      saveDrafts:saveDrafts,
      listDrafts:listDrafts,
      getDraft:getDraft,
      removeDraft:removeDraft,
      setStatus:setStatus
    });
  }

  return Object.freeze({create:create,stores:Object.freeze({drafts:DRAFT_STORE,meta:META_STORE})});
});
