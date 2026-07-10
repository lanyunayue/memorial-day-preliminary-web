const fs=require('fs');const path=require('path');const vm=require('vm');
const source=fs.readFileSync(path.resolve(__dirname,'..','src','storage','data-integrity.js'),'utf8');
const sandbox={window:null,Date,Math,Set};sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);
const input=[{id:'same',title:'valid'},{id:'same',title:'duplicate'},null,{id:'bad'},'text',{title:'another',dateKey:'invalid'}];
const result=sandbox.ShikeDataIntegrity.classify(input);
const checks=[
 ['total preserved',result.total===6],['three records valid',result.valid.length===3],['three records quarantined',result.quarantined.length===3],['duplicate id repaired',result.valid[0].id!==result.valid[1].id],['invalid date normalized',result.valid[2].dateKey===''],['quarantine has reason',result.quarantined.every((item)=>item.reason)],['quarantine retains raw value',result.quarantined.some((item)=>item.raw===null)],['quarantine has timestamp',result.quarantined.every((item)=>item.quarantinedAt)],['quarantine uses schema 2',result.quarantined.every((item)=>item.schemaVersion===2)],['input is not deleted',input.length===6]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);if(failures.length){console.error(`Corruption quarantine regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));process.exit(1);}console.log(`Corruption quarantine regression passed: ${checks.length}/${checks.length}`);
