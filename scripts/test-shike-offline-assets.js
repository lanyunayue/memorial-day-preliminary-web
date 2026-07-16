const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const listMatch=sw.match(/var PRECACHE_URLS\s*=\s*\[([\s\S]*?)\];/);
const assets=listMatch?[...listMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match)=>match[1]):[];
const missing=assets.filter((asset)=>asset!=='./'&&!fs.existsSync(path.join(root,asset.replace(/^\.\//,''))));
const checks=[
<<<<<<< HEAD
  ['cache version is v1.4.0',sw.includes("shike-v140-v52")],
=======
  ['cache version is v2.2.0-alpha3',sw.includes("shike-v220alpha3-v63")],
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  ['precache list exists',!!listMatch],
  ['root and index are precached',assets.includes('./')&&assets.includes('./index.html')],
  ['manifest is precached',assets.includes('./manifest.json')],
  ['stylesheet is precached',assets.includes('./assets/styles/app.css')],
  ['legacy runtime is precached',assets.includes('./src/legacy-app.js')],
  ['module entry is precached',assets.includes('./src/app.js')],
  ['module dependencies are precached',assets.includes('./src/storage/repository.js')&&assets.includes('./src/parser/parser-adapter.js')],
  ['all precache assets resolve',missing.length===0],
  ['install waits for atomic precache',sw.includes('cache.addAll(PRECACHE_URLS)')&&sw.includes('event.waitUntil')]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failures.length){console.error(`Offline asset regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));if(missing.length)console.error(`missing: ${missing.join(', ')}`);process.exit(1);}
console.log(`Offline asset regression passed: ${checks.length}/${checks.length}`);
