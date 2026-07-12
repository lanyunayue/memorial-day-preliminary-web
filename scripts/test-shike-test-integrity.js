'use strict';
// test-shike-test-integrity.js - Scans test files and blocks fake patterns
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const scriptsDir = __dirname;
let passed = 0, failed = 0;
function assert(cond, msg) {
  if(cond){passed++;console.log('  PASS:',msg);}else{failed++;console.error('  FAIL:',msg);}
}
console.log('=== Test Integrity Scan ===\n');
const testFiles = fs.readdirSync(scriptsDir).filter(f=>f.startsWith('test-shike-')&&f.endsWith('.js'));
console.log('Scanning '+testFiles.length+' test files...\n');
const fakePatterns = [
  {name:'assert(true,...)',re:/assert\(\s*true\s*,/g},
  {name:'assert(true) bare',re:/assert\(\s*true\s*\)/g},
  {name:'|| true bypass',re:/\|\|\s*true\s*[,;)]/g},
  {name:'? true : ternary',re:/\?\s*true\s*:/g},
  {name:'process.exit(0) skip',re:/process\.exit\(\s*0\s*\)/g},
  {name:'skip/removed comment',re:/(PASS intentionally|always pass|skip removed|placeholder pass|removed page container)/gi},
  {name:'true;// fake assert',re:/^\s*true\s*;\s*\/\//gm},
];
const allowed = new Set(['test-shike-test-integrity.js','test-shike-test-quality.js','test-shike-a11y-static.js']);
testFiles.forEach(f=>{
  if(allowed.has(f))return;
  const c = fs.readFileSync(path.join(scriptsDir,f),'utf8');
  fakePatterns.forEach(({name,re})=>{
    const lines=c.split('\n'), bad=[];
    lines.forEach((l,i)=>{if(re.test(l)){bad.push(i+1);re.lastIndex=0;}});
    if(bad.length>0) assert(false,f+': '+name+' at line(s) '+bad.join(','));
    else assert(true,f+': no '+name);
  });
});
// Check deleted test files replaced by contract tests
const required=['test-shike-watch-removal-contract.js','test-shike-navigation-consolidation.js','test-shike-settings-consolidation.js'];
required.forEach(f=>assert(fs.existsSync(path.join(scriptsDir,f)),'contract test '+f+' exists'));
// Verify production code clean
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(!html.includes('data-page="watch"'),'no watch nav');
assert(!html.includes('data-page="permissions"'),'no permissions nav');
assert(!html.includes('data-page="data-safety"'),'no data-safety nav');
assert(!html.includes('data-page="reminder-diagnostics"'),'no reminder-diagnostics nav');
assert(!html.includes('id="page-watch"'),'no page-watch');
assert(!html.includes('id="page-permissions"'),'no page-permissions');
assert(!html.includes('id="page-data-safety"'),'no page-data-safety');
assert(!html.includes('id="page-reminder-diagnostics"'),'no page-reminder-diagnostics');
assert(!sw.includes('watch-center.js'),'SW no watch-center');
assert(!sw.includes('watch-storage.js'),'SW no watch-storage');
assert(!fs.existsSync(path.join(root,'src/watch')),'src/watch deleted');
const navMatches=html.match(/data-page="[^"]+"/g)||[];
const navPages=[...new Set(navMatches.map(m=>m.match(/data-page="([^"]+)"/)[1]))];
assert(navPages.length===4,'exactly 4 nav items: '+navPages.join(','));
['home','calendar','all','my'].forEach(p=>assert(navPages.includes(p),'nav includes '+p));
['reminderSection','permissionSection','dataBackupSection','trashList','snapshotList'].forEach(id=>{
  assert(html.includes('id="'+id+'"'),'migrated section #'+id+' exists');
});
console.log('\n========================================');
console.log('Test Integrity: '+(passed+failed)+' checks, '+passed+' passed, '+failed+' failed');
if(failed>0)process.exit(1);
