const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src','storage','indexeddb-storage.js'),'utf8');
const constants=fs.readFileSync(path.join(root,'src','config','constants.js'),'utf8');
const requiredStores=['records','settings','conversations','subscriptions','feed_items','migrations','audit_log','quarantined_records'];
const checks=[
 ['database name is stable',constants.includes("LOCAL_DB_NAME='shike_local_db'")],
 ['schema version is 2',constants.includes('LOCAL_DB_VERSION=2')],
 ['all eight stores declared',requiredStores.every((store)=>source.includes(`'${store}'`))],
 ['stores use keyPath id',source.includes("{keyPath:'id'}")],
 ['upgrade creates missing stores',source.includes('onupgradeneeded')&&source.includes('createObjectStore')],
 ['open handles blocked state',source.includes('onblocked')],
 ['version change closes database',source.includes('onversionchange')&&source.includes('db.close()')],
 ['read methods exist',source.includes('function get(')&&source.includes('function getAll(')&&source.includes('function count(')],
 ['write methods exist',source.includes('function put(')&&source.includes('function remove(')],
 ['record replacement is transactional',source.includes("withTransaction(['records','quarantined_records','audit_log'],'readwrite'")],
 ['legacy migration is cross-store transaction',source.includes("withTransaction(['records','quarantined_records','migrations','audit_log'],'readwrite'")],
 ['transaction abort rejects',source.includes('transaction_aborted')&&source.includes('tx.abort()')]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);if(failures.length){console.error(`IndexedDB repository regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));process.exit(1);}console.log(`IndexedDB repository regression passed: ${checks.length}/${checks.length}`);
