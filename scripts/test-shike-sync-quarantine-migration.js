// v2.0.0-rc5.1 Sync Quarantine Migration Test
(function(){
  var passed=0,failed=0;
  function assert(c,m){if(c){passed++;console.log('[PASS]',m);}else{failed++;console.error('[FAIL]',m);}}
  var fs=require('fs'),vm=require('vm');
  var path='E:/lifetime-web-v200rc51-security-quarantine';

  console.log('=== Quarantine Migration Tests ===\n');

  var migrationSrc = fs.readFileSync(path+'/src/sync/sync-quarantine-migration.js','utf8');

  function makeContext(){
    var fakeStorage={};
    var records=[];
    var ctx = {
      localStorage:{
        getItem:function(k){return fakeStorage[k]?JSON.stringify(fakeStorage[k]):null;},
        setItem:function(k,v){try{fakeStorage[k]=JSON.parse(v);}catch(e){fakeStorage[k]=v;}},
        removeItem:function(k){delete fakeStorage[k];}
      },
      ShikeVersion:{version:'v2.0.0-rc5.1'},
      document:{readyState:'complete',addEventListener:function(){}},
      setTimeout:function(fn,t){/*don't auto-run in test*/},
      clearTimeout:function(){},
      Promise:Promise,Date:Date,JSON:JSON,
      console:console,
      Array:Array,Object:Object,String,String,Number:Number,Boolean:Boolean,Error:Error,
      Math:Math,parseInt:parseInt,parseFloat:parseFloat,isNaN:isNaN,isFinite:isFinite,
      encodeURIComponent:encodeURIComponent,decodeURIComponent:decodeURIComponent
    };
    ctx.records = records;
    ctx.saveRecords = function(){};
    ctx.ShikeSnapshotService = { createSnapshot: function(){ return Promise.resolve(null); } };
    ctx.window = ctx;
    ctx.global = ctx;
    return {ctx:ctx, storage:fakeStorage, records:records};
  }

  function loadMigration(setup){
    var env = makeContext();
    if(setup) setup(env);
    var script = new vm.Script(migrationSrc + ';this.ShikeSyncQuarantineMigration');
    var context = vm.createContext(env.ctx);
    env.mig = script.runInContext(context);
    return env;
  }

  // Test 1: Empty queue removes private key and endpoint
  var e1 = loadMigration(function(env){
    env.storage['shike_device_identity']={deviceId:'d1',privateKey:{d:'secret',kty:'EC'},publicKey:{x:'1',y:'2'}};
    env.storage['shike_sync_queue']=[];
    env.storage['shike_sync_endpoint']='https://evil.example.com/sync';
    env.storage['shike_sync_mode']='auto';
  });
  e1.mig.migrate().then(function(result){
    assert(result.ok===true,'migration ok on empty queue');
    assert(result.migrated===true,'migration ran');
    assert(result.privateKeyRemoved===true,'private key removed');
    assert(result.endpointRemoved===true,'endpoint removed');
    assert(e1.storage['shike_sync_queue']===undefined,'queue cleared when empty');
    assert(e1.storage['shike_sync_endpoint']===undefined,'endpoint cleared');
    assert(e1.storage['shike_sync_mode']==='disabled','mode set to disabled');
    var identity=e1.storage['shike_device_identity'];
    assert(identity&&identity.privateKey===undefined,'no privateKey in identity after migration');
    assert(identity.quarantined===true,'identity marked as quarantined');
    assert(e1.storage['shike_sync_quarantine_migrated']!==undefined,'migration marker set');

    // Test 2: Idempotency
    var beforeLen=e1.records.length;
    return e1.mig.migrate().then(function(r2){
      assert(r2.migrated===false,'second run reports already migrated');
      assert(e1.records.length===beforeLen,'no duplicate records on re-run');

      // Test 3: Non-empty queue recovers creates
      var e3=loadMigration(function(env){
        env.storage['shike_device_identity']={deviceId:'d2',privateKey:{d:'sec'},publicKey:{x:'a',y:'b'}};
        env.storage['shike_sync_queue']=[
          {type:'create',record:{id:'r1',title:'test record',text:'hello'}},
          {type:'create',record:{id:'r2',title:'another',text:'world'}}
        ];
      });
      return e3.mig.migrate().then(function(r3){
        assert(r3.ok===true,'migration with queue ok');
        assert(r3.recovered===2,'2 records recovered, got '+r3.recovered);
        assert(e3.records.length===2,'records array has 2 items');
        assert(e3.records[0].id==='r1'&&e3.records[0].title==='test record','record r1 restored');
        assert(e3.storage['shike_sync_queue']===undefined,'queue cleared after recovery');
        assert(e3.storage['shike_device_identity']&&e3.storage['shike_device_identity'].privateKey===undefined,'private key removed with non-empty queue');

        // Test 4: Invalid ops skipped
        var e4=loadMigration(function(env){
          env.storage['shike_device_identity']={privateKey:{d:'x'}};
          env.storage['shike_sync_queue']=[
            {type:'create'},{type:'create',record:{}},{type:'unknown'},null,
            {type:'create',record:{id:'r3',title:'valid'}}
          ];
        });
        return e4.mig.migrate().then(function(r4){
          assert(r4.ok===true,'migration ok with invalid ops');
          assert(r4.recovered===1,'only valid op recovered, got '+r4.recovered);
          assert(e4.records.length===1&&e4.records[0].id==='r3','only valid record added');

          // Test 5: Idempotent after recovery
          return e4.mig.migrate().then(function(r5){
            assert(r5.migrated===false,'migration idempotent after recovery');
            assert(e4.records.length===1,'no duplicates after second migration run');

            console.log('\n=== Results: '+passed+' passed, '+failed+' failed ===');
            process.exit(failed>0?1:0);
          });
        });
      });
    });
  }).catch(function(err){console.error('FATAL:',err);process.exit(1);});
})();
