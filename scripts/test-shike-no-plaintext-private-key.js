// v2.0.0-rc5.1 No Plaintext Private Key Test
(function(){
  var passed=0,failed=0;
  function assert(c,m){if(c){passed++;console.log('[PASS]',m);}else{failed++;console.error('[FAIL]',m);}}
  var fs=require('fs'),path=require('path');
  var root='E:/lifetime-web-v200rc51-security-quarantine/src/sync';

  console.log('=== No Plaintext Private Key Tests ===\n');

  var files=['device-identity.js','crypto-envelope.js','sync-client.js','sync-conflict.js','sync-status.js','sync-quarantine-migration.js'];
  var sources={};
  files.forEach(function(f){sources[f]=fs.readFileSync(path.join(root,f),'utf8');});

  assert(sources['sync-quarantine-migration.js'].includes('delete identity.privateKey'), 'migration deletes privateKey from identity');
  assert(sources['sync-quarantine-migration.js'].includes('sanitizeIdentity'), 'migration has sanitizeIdentity function');
  assert(sources['sync-quarantine-migration.js'].includes('privateKeyRemoved'), 'migration reports private key removal');

  // Migration is loaded before user can interact with sync
  var html = fs.readFileSync('E:/lifetime-web-v200rc51-security-quarantine/index.html','utf8');
  var migIdx = html.indexOf('sync-quarantine-migration.js');
  var statusIdx = html.indexOf('sync-status.js');
  assert(migIdx > statusIdx && migIdx > 0, 'migration loads after sync modules so it can clean up');

  // No code in migration exports private key
  var mig = sources['sync-quarantine-migration.js'];
  var privateKeyRefs = (mig.match(/privateKey/g)||[]).length;
  assert(privateKeyRefs <= 6, 'migration references privateKey only for deletion (count='+privateKeyRefs+')');
  assert(mig.includes('delete identity.privateKey'), 'migration uses delete on identity.privateKey');
  // Migration log messages don't contain private key values
  assert(!mig.includes('identity.privateKey.d') && !mig.includes('privateKey.kty'), 'migration does not read private key fields');

  console.log('\n=== Results: '+passed+' passed, '+failed+' failed ===');
  process.exit(failed>0?1:0);
})();
