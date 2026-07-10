export function describeBackup(payload){
  return Object.freeze({
    app:payload&&payload.app||'',
    schemaVersion:Number(payload&&payload.schemaVersion)||1,
    recordCount:Array.isArray(payload&&payload.records)?payload.records.length:0
  });
}
