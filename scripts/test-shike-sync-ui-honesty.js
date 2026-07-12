// v2.0.0-rc5.2 Sync UI Honesty Test
// Verifies UI doesn't show misleading sync status
(function(){
  var passed=0,failed=0;
  function assert(c,m){if(c){passed++;console.log('[PASS]',m);}else{failed++;console.error('[FAIL]',m);}}
  var fs=require('fs');
  var root=require('path').resolve(__dirname,'..');

  console.log('=== Sync UI Honesty Tests ===\n');

  var html = fs.readFileSync(root+'/index.html','utf8');
  var legacy = fs.readFileSync(root+'/src/legacy-app.js','utf8');
  var status = fs.readFileSync(root+'/src/sync/sync-status.js','utf8');
  var client = fs.readFileSync(root+'/src/sync/sync-client.js','utf8');
  var sw = fs.readFileSync(root+'/sw.js','utf8');
  var version = fs.readFileSync(root+'/src/config/version.js','utf8');

  // 1. No sync page visible
  assert(!html.includes('id="page-sync"'), 'sync page section not in HTML');
  assert(!html.includes('data-page="sync"'), 'no sync nav button in HTML');

  // 2. Version is rc5.1 (quarantine version)
  assert(version.includes("v2.0.0-rc5.2"), 'version shows rc5.1');

  // 3. Cache is rc52
  assert(sw.includes("shike-v200rc52-v62"), 'cache name is rc52');

  // 4. Sync disabled by default
  assert(client.includes("isEnabled = function(){ return false; }") || client.includes("isEnabled=function(){return false}"), 'sync reports disabled');

  // 5. No misleading "sync enabled" claims in status
  var badPhrases = ['端到端加密同步已启用','跨设备已同步','同步成功','cloud ready','production sync','cross-device verified'];
  badPhrases.forEach(function(phrase){
    var inStatus = status.includes(phrase);
    var inClient = client.includes(phrase);
    var inLegacy = legacy.includes(phrase);
    assert(!(inStatus||inClient||inLegacy), 'no misleading phrase: "'+phrase+'"');
  });

  // 6. Quarantine notice text present
  var hasQuarantineMsg = status.includes('syncQuarantine') ||
                         status.includes('安全重构') ||
                         status.includes('仅使用本地模式') ||
                         status.includes('不会上传');
  assert(hasQuarantineMsg, 'honest quarantine message present in sync-status');

  // 7. capabilitySync disabled
  assert(legacy.includes('capabilitySync=false') || legacy.includes('capabilitySync = false'), 'capabilitySync is false');

  // 8. No device revocation UI available (page removed)
  assert(!html.includes('revokeDevice') && !html.includes('device-revoke'), 'no device revoke button visible');

  // 9. Migration module auto-runs on load
  var mig = fs.readFileSync(root+'/src/sync/sync-quarantine-migration.js','utf8');
  assert(mig.includes('setTimeout(migrate') || mig.includes('addEventListener') && mig.includes('migrate'), 'migration auto-runs on page load');

  console.log('\n=== Results: '+passed+' passed, '+failed+' failed ===');
  process.exit(failed>0?1:0);
})();
