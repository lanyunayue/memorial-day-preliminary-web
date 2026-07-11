// v2.0.0-rc5.1 No Plaintext Sync Queue Test
(function(){
  var passed=0,failed=0;
  function assert(c,m){if(c){passed++;console.log('[PASS]',m);}else{failed++;console.error('[FAIL]',m);}}
  var fs=require('fs');
  var root='E:/lifetime-web-v200rc51-security-quarantine';

  console.log('=== No Plaintext Sync Queue Tests ===\n');

  var client = fs.readFileSync(root+'/src/sync/sync-client.js','utf8');
  var migration = fs.readFileSync(root+'/src/sync/sync-quarantine-migration.js','utf8');

  assert(client.match(/push\s*=\s*function\(\)\s*{\s*return Promise\.resolve\(\{status:'sync_security_quarantined'/), 'push blocked - no new plaintext ops added to queue');
  assert(migration.includes('safeRemove(SK.QUEUE)'), 'migration removes queue after recovery');

  // Verify push wrapper returns before original
  var quarIdx = client.indexOf("sync_security_quarantined");
  var origPushIdx = client.indexOf("_orig_push");
  assert(quarIdx > 0 && (origPushIdx === -1 || quarIdx < client.indexOf("_orig_push", quarIdx) || client.indexOf("var _orig_push = push") < quarIdx), 'quarantine defined before originals saved, push wrapper returns quarantine status');

  // Migration preserves queue on failure
  assert(migration.includes("queue preserved"), 'migration preserves queue on recovery failure');

  // pull is also blocked so no new data comes in
  assert(client.match(/pull\s*=\s*function\(\)\s*{\s*return Promise\.resolve\(\{status:'sync_security_quarantined'/), 'pull also blocked');

  console.log('\n=== Results: '+passed+' passed, '+failed+' failed ===');
  process.exit(failed>0?1:0);
})();
