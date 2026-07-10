const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const srcRoot=path.join(root,'src');
const entry=path.join(srcRoot,'app.js');
const graph=new Map();
const unresolved=[];

function visit(file){
  if(graph.has(file))return;
  const source=fs.readFileSync(file,'utf8');
  const dependencies=[...source.matchAll(/\bimport\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g)].map((match)=>match[1]);
  const resolved=[];
  for(const specifier of dependencies){
    if(!specifier.startsWith('.')){unresolved.push(`${path.relative(root,file)} -> ${specifier}`);continue;}
    const dependency=path.resolve(path.dirname(file),specifier);
    if(!dependency.startsWith(srcRoot+path.sep)||!fs.existsSync(dependency)){unresolved.push(`${path.relative(root,file)} -> ${specifier}`);continue;}
    resolved.push(dependency);visit(dependency);
  }
  graph.set(file,resolved);
}
visit(entry);

const cycles=[];
function detect(file,stack=[]){
  if(stack.includes(file)){cycles.push([...stack.slice(stack.indexOf(file)),file]);return;}
  for(const dependency of graph.get(file)||[])detect(dependency,[...stack,file]);
}
detect(entry);

const source=fs.readFileSync(entry,'utf8');
const checks=[
  ['entry exists',fs.existsSync(entry)],
  ['all imports resolve',unresolved.length===0],
  ['no circular imports',cycles.length===0],
  ['graph includes core', [...graph.keys()].some((file)=>file.endsWith('core'+path.sep+'event-bus.js'))],
  ['graph includes storage',[...graph.keys()].some((file)=>file.endsWith('storage'+path.sep+'repository.js'))],
  ['graph includes records',[...graph.keys()].some((file)=>file.endsWith('records'+path.sep+'record-service.js'))],
  ['graph includes parser',[...graph.keys()].some((file)=>file.endsWith('parser'+path.sep+'parser-adapter.js'))],
  ['graph includes calendar',[...graph.keys()].some((file)=>file.endsWith('calendar'+path.sep+'ics-export.js'))],
  ['graph includes views',[...graph.keys()].some((file)=>file.endsWith('views'+path.sep+'view-registry.js'))],
  ['graph includes components',[...graph.keys()].some((file)=>file.endsWith('components'+path.sep+'legacy-components.js'))],
  ['entry exports module namespace',source.includes('window.ShikeModules=modules')],
  ['entry publishes readiness event',source.includes("shike:modules-ready")]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failures.length){console.error(`Import graph regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));if(unresolved.length)console.error(unresolved.join('\n'));if(cycles.length)console.error(JSON.stringify(cycles));process.exit(1);}
console.log(`Import graph regression passed: ${checks.length}/${checks.length}`);
