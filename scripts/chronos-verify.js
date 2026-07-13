'use strict';

const {spawnSync}=require('child_process');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const args=new Set(process.argv.slice(2));const coreOnly=args.has('--core-only');const artifactRoot=path.join(root,'artifacts','chronos-alpha2');
fs.mkdirSync(artifactRoot,{recursive:true});
const checks=[];
function run(name,script,argsList=[]){
  const started=Date.now();const result=spawnSync(process.execPath,[path.join(root,'scripts',script),...argsList],{cwd:root,encoding:'utf8',timeout:600000,maxBuffer:20*1024*1024});const output=(result.stdout||'')+(result.stderr||'');if(output)process.stdout.write(output);const skipped=/\bSKIPPED\b/.test(output);const classification=result.status===0?(skipped?'SKIPPED':'PASS'):'FAIL';checks.push({name,classification,durationMs:Date.now()-started,command:`node scripts/${script} ${argsList.join(' ')}`.trim()});if(classification==='FAIL')throw new Error(`${name} failed`);return classification;
}
try{
  run('domain-unit','test-shike-temporal-domain.js');run('corpus','test-shike-temporal-corpus.js');run('property','test-shike-temporal-property.js');run('fault-recovery','test-chronos-fault-recovery.js');
  run('graph-consistency','test-shike-temporal-graph.js');run('operation-coverage','test-chronos-operation-coverage.js');run('migration','test-shike-storage-migration.js');run('multi-tab-contract','test-chronos-multi-tab-contract.js');
  run('conflict','test-chronos-conflict-engine.js');run('memory','test-chronos-temporal-memory.js');run('adaptation','test-chronos-adaptation.js');run('corpus-provenance','test-chronos-corpus-provenance.js');
  const corpusManifest=JSON.parse(fs.readFileSync(path.join(root,'corpus','temporal-corpus-manifest.json'),'utf8'));if(corpusManifest.summary.humanReviewed===0){checks.push({name:'human-corpus',classification:'NOT_AVAILABLE',durationMs:0,command:'reviewed blind set required'});console.log('Human corpus: NOT_AVAILABLE (0 reviewed fixtures)');}
  run('canonical-parser-hash','test-chronos-parser-hash.js');run('performance-node','benchmark-shike-chronos.js');run('security','test-security-runner.js');run('test-integrity','test-shike-test-integrity.js');run('lint','lint-check.js');run('format','format-check.js');
  if(!coreOnly){run('browser-e2e','test-e2e-runner.js',['--autostart','--layout','--artifact-dir=artifacts/chronos-alpha2/browser']);run('indexeddb-stress','test-e2e-runner.js',['--autostart','--stress-only','--artifact-dir=artifacts/chronos-alpha2/stress']);}
  const browserChecks=checks.filter((item)=>['browser-e2e','indexeddb-stress'].includes(item.name));const browserSkipped=browserChecks.some((item)=>item.classification==='SKIPPED');const humanGap=checks.some((item)=>item.name==='human-corpus'&&item.classification==='NOT_AVAILABLE');var classification=coreOnly?'CORE_PASS':browserSkipped?'CORE_PASS_BROWSER_SKIPPED':'PASS';if(humanGap)classification+='_HUMAN_CORPUS_NOT_AVAILABLE';const report={classification,generatedAt:new Date().toISOString(),runtime:process.version,coreOnly,checks};fs.writeFileSync(path.join(artifactRoot,'chronos-verify.json'),JSON.stringify(report,null,2)+'\n','utf8');console.log(`Chronos verify: ${report.classification}; ${checks.length} checks`);
}catch(error){const report={classification:'FAIL',generatedAt:new Date().toISOString(),runtime:process.version,coreOnly,error:error.message,checks};fs.writeFileSync(path.join(artifactRoot,'chronos-verify.json'),JSON.stringify(report,null,2)+'\n','utf8');console.error(error.message);process.exit(1);}
