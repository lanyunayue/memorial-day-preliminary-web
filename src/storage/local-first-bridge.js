(function(global){
  var SNAPSHOT_KEY='shike_pre_migration_snapshot_v2';
  var MARKER_ID='localstorage_to_indexeddb_v2';
  var state={mode:'legacy-cache',ready:false,lastError:'',recordCount:0,quarantineCount:0};
  function legacyRecords(){var value=ShikeLegacyStorage.getJson(STORAGE_KEY,[]);return Array.isArray(value)?value:[];}
  function snapshot(raw){if(ShikeLegacyStorage.getRaw(SNAPSHOT_KEY))return true;return ShikeLegacyStorage.setJson(SNAPSHOT_KEY,{id:MARKER_ID,createdAt:new Date().toISOString(),appVersion:APP_VERSION,raw:raw});}
  async function bootstrap(){
    var fallback=legacyRecords();
    try{
      await ShikeIndexedDb.open();
      var marker=await ShikeIndexedDb.get('migrations',MARKER_ID);
      if(!marker){
        var raw=ShikeLegacyStorage.getRaw(STORAGE_KEY)||'[]';if(!snapshot(raw))throw new Error('migration_snapshot_failed');
        var classified=ShikeDataIntegrity.classify(fallback);
        marker={id:MARKER_ID,from:'localStorage',to:'IndexedDB',schemaVersion:2,startedAt:new Date().toISOString(),completedAt:new Date().toISOString(),sourceCount:fallback.length,recordCount:classified.valid.length,quarantineCount:classified.quarantined.length};
        await ShikeIndexedDb.migrateLegacy(classified.valid,classified.quarantined,marker);
      }
      var records=await ShikeIndexedDb.getAll('records');var quarantineCount=await ShikeIndexedDb.count('quarantined_records');
      state={mode:'indexeddb',ready:true,lastError:'',recordCount:records.length,quarantineCount:quarantineCount};
      ShikeLegacyStorage.setJson(STORAGE_KEY,records);return {records:records,status:{...state}};
    }catch(error){state={mode:'legacy-fallback',ready:true,lastError:error&&error.message||String(error),recordCount:fallback.length,quarantineCount:0};return {records:fallback,status:{...state}};}
  }
  async function persist(records){
    if(state.mode!=='indexeddb')return {fallback:true,count:Array.isArray(records)?records.length:0};
    try{var classified=ShikeDataIntegrity.classify(records);var result=await ShikeIndexedDb.replaceRecords(classified.valid,classified.quarantined);state.recordCount=result.count;state.quarantineCount=await ShikeIndexedDb.count('quarantined_records');state.lastError='';return result;}catch(error){state.lastError=error&&error.message||String(error);state.mode='legacy-fallback';throw error;}
  }
  function getStatus(){return {...state};}
  function getQuarantined(){return state.mode==='indexeddb'?ShikeIndexedDb.getAll('quarantined_records'):Promise.resolve([]);}
  async function quarantine(items){if(state.mode!=='indexeddb'||!Array.isArray(items)||!items.length)return 0;await Promise.all(items.map(function(item){return ShikeIndexedDb.put('quarantined_records',item);}));state.quarantineCount=await ShikeIndexedDb.count('quarantined_records');return state.quarantineCount;}
  global.ShikeLocalFirst=Object.freeze({bootstrap:bootstrap,persist:persist,quarantine:quarantine,getStatus:getStatus,getQuarantined:getQuarantined,keys:Object.freeze({snapshot:SNAPSHOT_KEY,marker:MARKER_ID})});
})(window);
