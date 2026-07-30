const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const listMatch=sw.match(/var PRECACHE_URLS\s*=\s*\[([\s\S]*?)\];/);
const assets=listMatch?[...listMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match)=>match[1]):[];
const missing=assets.filter((asset)=>asset!=='./'&&!fs.existsSync(path.join(root,asset.replace(/^\.\//,''))));
const checks=[
  ['cache version is v2.2.0-alpha4',sw.includes("shike-v220alpha4-v67")],
  ['precache list exists',!!listMatch],
  ['root and index are precached',assets.includes('./')&&assets.includes('./index.html')],
  ['manifest is precached',assets.includes('./manifest.json')],
  ['stylesheet is precached',assets.includes('./assets/styles/app.css')],
  ['legacy runtime is precached',assets.includes('./src/legacy-app.js')],
  ['Portable Export runtime is precached',assets.includes('./src/storage/portable-export-v1.js')],
  ['DeLoad runtime is precached',assets.includes('./src/load/deload-controller.js')],
  ['PWA icons are precached',assets.includes('./assets/icons/shike-192.png')&&assets.includes('./assets/icons/shike-512.png')],
  ['module entry is precached',assets.includes('./src/app.js')],
  ['module dependencies are precached',assets.includes('./src/storage/repository.js')&&assets.includes('./src/parser/parser-adapter.js')],
  ['all precache assets resolve',missing.length===0],
  ['install waits for atomic precache',sw.includes('cache.addAll(PRECACHE_URLS)')&&sw.includes('event.waitUntil')],
  ['manifest uses scoped identity',manifest.id==='./'&&manifest.scope==='./'&&manifest.start_url==='./'],
  ['manifest uses real icon files',manifest.icons.length===2&&manifest.icons.every((icon)=>!icon.src.startsWith('data:')&&fs.existsSync(path.join(root,icon.src.replace(/^\.\//,''))))],
  ['manifest includes maskable icon',manifest.icons.some((icon)=>String(icon.purpose).includes('maskable'))],
  ['PWA icon dimensions are exact',pngSize('assets/icons/shike-192.png').join('x')==='192x192'&&pngSize('assets/icons/shike-512.png').join('x')==='512x512']
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failures.length){console.error(`Offline asset regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));if(missing.length)console.error(`missing: ${missing.join(', ')}`);process.exit(1);}
console.log(`Offline asset regression passed: ${checks.length}/${checks.length}`);

function pngSize(relativePath){
  const data=fs.readFileSync(path.join(root,relativePath));
  return [data.readUInt32BE(16),data.readUInt32BE(20)];
}
