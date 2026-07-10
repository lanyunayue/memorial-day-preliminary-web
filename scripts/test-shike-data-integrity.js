const fs=require('fs');const path=require('path');const vm=require('vm');
const source=fs.readFileSync(path.resolve(__dirname,'..','src','storage','data-integrity.js'),'utf8');
const sandbox={window:null,Date,Math,Set};sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);
const api=sandbox.ShikeDataIntegrity;const seen=new Set();
const normalized=api.normalizeRecord({id:'a',title:'  meeting  ',recordKind:'reminder',dateKey:'2026-07-11',time:'15:00',repeat:'daily',note:' note ',pinned:1},0,seen);
const duplicate=api.normalizeRecord({id:'a',title:'second'},1,seen);
const invalidTime=api.normalizeRecord({id:'c',title:'time',time:'99:99',repeat:'bad'},2,seen);
const checks=[
 ['API exists',!!api],['title trimmed',normalized.title==='meeting'],['schema version set',normalized.schemaVersion===2],['fingerprint set',/^[0-9a-f]{8}$/.test(normalized.contentFingerprint)],['date retained',normalized.dateKey==='2026-07-11'],['time retained',normalized.time==='15:00'],['repeat retained',normalized.repeat==='daily'],['pinned normalized',normalized.pinned===true],['metadata normalized',normalized.metadata&&typeof normalized.metadata==='object'],['duplicate id repaired',duplicate.id!=='a'],['invalid time cleared',invalidTime.time===''],['invalid repeat cleared',invalidTime.repeat==='none'],['missing title throws',(()=>{try{api.normalizeRecord({id:'x'},3,new Set());return false;}catch{return true;}})()],['checksum deterministic',api.checksumRecords([normalized])===api.checksumRecords([normalized])],['checksum detects changes',api.checksumRecords([normalized])!==api.checksumRecords([{...normalized,title:'changed'}])],['source text bounded',api.normalizeRecord({title:'x',sourceText:'a'.repeat(6000)},4,new Set()).sourceText.length===5000]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);if(failures.length){console.error(`Data integrity regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));process.exit(1);}console.log(`Data integrity regression passed: ${checks.length}/${checks.length}`);
