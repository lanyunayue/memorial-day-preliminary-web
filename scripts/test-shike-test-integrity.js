'use strict';
// test-shike-test-integrity.js - Scans test files and blocks fake patterns
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const scriptsDir = __dirname;
let passed = 0;
const failures = [];

function check(condition, message) {
  if (condition) {
    passed++;
    console.log('  PASS:', message);
  } else {
    failures.push(message);
    console.error('  FAIL:', message);
  }
}

console.log('=== Test Integrity Scan ===\n');
const testFiles = fs.readdirSync(scriptsDir).filter(f=>f.startsWith('test-shike-')&&f.endsWith('.js'));
console.log('Scanning '+testFiles.length+' test files...\n');
const fakePatterns = [
  {name:'constant-true assertion with message',re:new RegExp('assert'+'\\(\\s*true\\s*,','g')},
  {name:'bare constant-true assertion',re:new RegExp('assert'+'\\(\\s*true\\s*\\)','g')},
  {name:'boolean-or bypass',re:new RegExp('\\|\\|\\s*true\\s*[,;)]','g')},
  {name:'successful exit used as skip',re:new RegExp('process\\.exit'+'\\(\\s*0\\s*\\)','g')},
  {name:'suspicious skip comment',re:new RegExp(['PASS intention','ally|always pa','ss|skip remo','ved|placeholder pa','ss|removed page con','tainer'].join(''),'gi')},
  {name:'standalone true statement',re:new RegExp('^\\s*true\\s*;\\s*\\/\\/','gm')},
];
testFiles.forEach(f=>{
  const c = fs.readFileSync(path.join(scriptsDir,f),'utf8');
  fakePatterns.forEach(({name,re})=>{
    const lines=c.split('\n'), bad=[];
    lines.forEach((l,i)=>{if(re.test(l)){bad.push(i+1);re.lastIndex=0;}});
    check(bad.length === 0, bad.length > 0
      ? f+': '+name+' at line(s) '+bad.join(',')
      : f+': no '+name);
  });
});
// Check deleted test files replaced by contract tests
const required=['test-shike-watch-removal-contract.js','test-shike-navigation-consolidation.js','test-shike-settings-consolidation.js'];
required.forEach(f=>check(fs.existsSync(path.join(scriptsDir,f)),'contract test '+f+' exists'));
// Verify production code clean
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
check(!html.includes('data-page="watch"'),'no watch nav');
check(!html.includes('data-page="permissions"'),'no permissions nav');
check(!html.includes('data-page="data-safety"'),'no data-safety nav');
check(!html.includes('data-page="reminder-diagnostics"'),'no reminder-diagnostics nav');
check(!html.includes('id="page-watch"'),'no page-watch');
check(!html.includes('id="page-permissions"'),'no page-permissions');
check(!html.includes('id="page-data-safety"'),'no page-data-safety');
check(!html.includes('id="page-reminder-diagnostics"'),'no page-reminder-diagnostics');
check(!sw.includes('watch-center.js'),'SW no watch-center');
check(!sw.includes('watch-storage.js'),'SW no watch-storage');
check(!fs.existsSync(path.join(root,'src/watch')),'src/watch deleted');
const navMatches=html.match(/data-page="[^"]+"/g)||[];
const navPages=[...new Set(navMatches.map(m=>m.match(/data-page="([^"]+)"/)[1]))];
check(navPages.length===4,'exactly 4 nav items: '+navPages.join(','));
['home','calendar','all','my'].forEach(p=>check(navPages.includes(p),'nav includes '+p));
['reminderSection','permissionSection','dataBackupSection','trashList','snapshotList'].forEach(id=>{
  check(html.includes('id="'+id+'"'),'migrated section #'+id+' exists');
});
console.log('\n========================================');
console.log('Test Integrity classification: '+(failures.length === 0 ? 'PASS' : 'FAIL')+'; skipped=0');
console.log('Test Integrity: '+(passed+failures.length)+' checks, '+passed+' passed, '+failures.length+' failed');
if(failures.length>0)process.exit(1);
