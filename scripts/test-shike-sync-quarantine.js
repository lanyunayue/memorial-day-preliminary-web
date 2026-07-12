// v2.0.0-rc5.1 Sync Quarantine Test
(function(){
  var passed=0,failed=0;
  function assert(c,m){if(c){passed++;console.log('[PASS]',m);}else{failed++;console.error('[FAIL]',m);}}
  var fs=require('fs');
  var path='E:/lifetime-web-v200rc51-security-quarantine';

  var clientSrc=fs.readFileSync(path+'/src/sync/sync-client.js','utf8');
  var statusSrc=fs.readFileSync(path+'/src/sync/sync-status.js','utf8');
  var legacySrc=fs.readFileSync(path+'/src/legacy-app.js','utf8');
  var versionSrc=fs.readFileSync(path+'/src/config/version.js','utf8');
  var swSrc=fs.readFileSync(path+'/sw.js','utf8');
  var htmlSrc=fs.readFileSync(path+'/index.html','utf8');
  var migSrc=fs.readFileSync(path+'/src/sync/sync-quarantine-migration.js','utf8');

  console.log('=== Sync Quarantine Tests ===\n');

  assert(clientSrc.includes("isEnabled = function(){ return false; }") || clientSrc.includes("isEnabled=function(){return false}"), 'isEnabled() returns false');
  assert(clientSrc.includes('sync_security_quarantined'),'push/pull return sync_security_quarantined');
  assert(clientSrc.match(/push\s*=\s*function\(\)\s*{\s*return Promise\.resolve\(\{status:'sync_security_quarantined'/),'push overridden to quarantine');
  assert(clientSrc.match(/pull\s*=\s*function\(\)\s*{\s*return Promise\.resolve\(\{status:'sync_security_quarantined'/),'pull overridden to quarantine');
  assert(clientSrc.match(/setEndpoint\s*=\s*function\(\)\s*{\s*return false;?\s*}/),'setEndpoint returns false');
  assert(clientSrc.match(/enable\s*=\s*function\(\)\s*{\s*return false;?\s*}/),'enable returns false');
  assert(!htmlSrc.includes('id="page-sync"'),'page-sync section removed from HTML');
  assert(!htmlSrc.includes('syncContainer'),'syncContainer div removed from HTML');
  assert(versionSrc.includes("v2.0.0-rc5.1"),'APP_VERSION is v2.0.0-rc5.1');
  assert(swSrc.includes("shike-v200rc51-v61"),'CACHE_NAME is shike-v200rc51-v61');

  // sync-status must show quarantine
  var quarantineMsg = statusSrc.includes('syncQuarantine') ||
                      statusSrc.includes('安全重构') ||
                      statusSrc.includes('仅使用本地模式') ||
                      statusSrc.includes("'disabled'") ||
                      statusSrc.includes('quarantined');
  assert(quarantineMsg,'sync-status shows quarantine/disabled state');

  assert(fs.existsSync(path+'/src/sync/sync-quarantine-migration.js'),'sync-quarantine-migration.js exists');
  assert(htmlSrc.includes('sync-quarantine-migration.js'),'migration script loaded in index.html');
  assert(swSrc.includes('sync-quarantine-migration.js'),'migration script in SW precache');
  assert(legacySrc.includes('capabilitySync=false')||legacySrc.includes('capabilitySync = false'),'capabilitySync set to false');
  assert(!htmlSrc.includes('data-page="sync"'),'no sync nav button');

  console.log('\n=== Results: '+passed+' passed, '+failed+' failed ===');
  process.exit(failed>0?1:0);
})();
