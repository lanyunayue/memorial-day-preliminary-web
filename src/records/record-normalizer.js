export function normalizeRecordShape(record={}){
  return {...record,title:String(record.title||'').trim(),note:String(record.note||''),repeat:record.repeat||'none'};
}
