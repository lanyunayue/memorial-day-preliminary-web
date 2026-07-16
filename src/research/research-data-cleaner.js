(function(global,factory){var api=factory(global);if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeResearchDataCleaner=api;})(typeof window!=='undefined'?window:globalThis,function(global){
  'use strict';
  function clearResearchData(options){options=options||{};if(global.ShikeResearchEventLog)global.ShikeResearchEventLog.clear();if(global.ShikeResearchSession)global.ShikeResearchSession.clear();if(options.includeConsent&&global.ShikeParticipantConsent)global.ShikeParticipantConsent.clear();return {events:0,sessions:0,consentCleared:!!options.includeConsent};}
  function optOut(){if(global.ShikeParticipantConsent)global.ShikeParticipantConsent.withdraw();if(global.ShikeResearchSession)global.ShikeResearchSession.reset();return global.ShikeParticipantConsent?global.ShikeParticipantConsent.status():{active:false};}
  return Object.freeze({clearResearchData:clearResearchData,optOut:optOut});
});
