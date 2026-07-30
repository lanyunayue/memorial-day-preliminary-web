// v2.2.0-alpha4 Sync Quarantine Test
(async function(){
  var passed=0,failed=0;
  function assert(c,m){if(c){passed++;console.log('[PASS]',m);}else{failed++;console.error('[FAIL]',m);}}
  var fs=require('fs');
  var vm=require('vm');
  var path=require('path').resolve(__dirname,'..');

  var clientSrc=fs.readFileSync(path+'/src/sync/sync-client.js','utf8');
  var statusSrc=fs.readFileSync(path+'/src/sync/sync-status.js','utf8');
  var legacySrc=fs.readFileSync(path+'/src/legacy-app.js','utf8');
  var versionSrc=fs.readFileSync(path+'/src/config/version.js','utf8');
  var swSrc=fs.readFileSync(path+'/sw.js','utf8');
  var htmlSrc=fs.readFileSync(path+'/index.html','utf8');

  console.log('=== Sync Quarantine Tests ===\n');

  assert(clientSrc.includes("isEnabled = function(){ return false; }"),'isEnabled() returns false');
  assert(clientSrc.includes('sync_security_quarantined'),'push/pull return sync_security_quarantined');
  assert(clientSrc.match(/push\s*=\s*function\(\)\s*{\s*return Promise\.resolve\(\{status:'sync_security_quarantined'/),'push overridden to quarantine');
  assert(clientSrc.match(/pull\s*=\s*function\(\)\s*{\s*return Promise\.resolve\(\{status:'sync_security_quarantined'/),'pull overridden to quarantine');
  assert(clientSrc.match(/setEndpoint\s*=\s*function\(\)[\s\S]*?return false;\s*}/),'setEndpoint clears persisted endpoint and returns false');
  assert(clientSrc.match(/enable\s*=\s*function\(\)\s*{\s*return false;?\s*}/),'enable returns false');
  assert(!htmlSrc.includes('id="page-sync"'),'page-sync section removed from HTML');
  assert(!htmlSrc.includes('syncContainer'),'syncContainer div removed from HTML');
  assert(versionSrc.includes("v2.2.0-alpha4"),'APP_VERSION is v2.2.0-alpha4');
  assert(swSrc.includes("shike-v220alpha4-v65"),'CACHE_NAME is shike-v220alpha4-v65');

  var quarantineMsg=statusSrc.includes('安全重构')||statusSrc.includes('仅使用本地模式')||statusSrc.includes("'disabled'")||statusSrc.includes('quarantined');
  assert(quarantineMsg,'sync-status shows quarantine/disabled state');
  assert(fs.existsSync(path+'/src/sync/sync-quarantine-migration.js'),'sync-quarantine-migration.js exists');
  assert(htmlSrc.includes('sync-quarantine-migration.js'),'migration script loaded in index.html');
  assert(swSrc.includes('sync-quarantine-migration.js'),'migration script in SW precache');
  assert(legacySrc.includes('capabilitySync=false')||legacySrc.includes('capabilitySync = false'),'capabilitySync set to false');
  assert(!htmlSrc.includes('data-page="sync"'),'no sync nav button');

  var storage={shike_sync_endpoint:'https://untrusted.example',shike_sync_queue:'[{"private":"must-not-send"}]'};
  var fetchCalls=0;
  var sandbox={window:null,Promise:Promise,Date:Date,JSON:JSON,navigator:{onLine:true},fetch:function(){fetchCalls++;throw new Error('fetch must not run');},localStorage:{
    getItem:function(key){return Object.prototype.hasOwnProperty.call(storage,key)?storage[key]:null;},
    setItem:function(key,value){storage[key]=String(value);},
    removeItem:function(key){delete storage[key];}
  }};
  sandbox.window=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(clientSrc,sandbox,{filename:'sync-client.js'});
  var api=sandbox.ShikeSyncClient;
  var pushed=await api.push([{private:'must-not-send'}]);
  var pulled=await api.pull();
  assert(pushed.status==='sync_security_quarantined'&&pulled.status==='sync_security_quarantined','global push and pull exports are quarantined at runtime');
  assert(api.enable()===false&&api.isEnabled()===false,'global enable export cannot activate sync');
  assert(api.setEndpoint('https://untrusted.example')===false&&!storage.shike_sync_endpoint,'global endpoint export clears persisted endpoint');
  var runtimeStatus=api.getStatus();
  assert(runtimeStatus.status==='security-quarantined'&&runtimeStatus.enabled===false&&runtimeStatus.endpoint==='','global status truthfully reports quarantine');
  assert(fetchCalls===0,'quarantined global API never reaches fetch');

  console.log('\n=== Results: '+passed+' passed, '+failed+' failed ===');
  process.exit(failed>0?1:0);
})().catch(function(error){console.error(error);process.exit(1);});
