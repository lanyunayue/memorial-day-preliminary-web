export function uniqueBy(records,keyOf){const seen=new Set();return records.filter((record)=>{const key=keyOf(record);if(seen.has(key))return false;seen.add(key);return true;});}
