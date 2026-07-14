'use strict';

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'artifacts','product-validation','preview');
const roots=['assets','src'];
const files=['index.html','manifest.json','sw.js','.nojekyll','_headers'];
function copyTree(source,target){fs.mkdirSync(target,{recursive:true});for(const item of fs.readdirSync(source,{withFileTypes:true})){const from=path.join(source,item.name);const to=path.join(target,item.name);item.isDirectory()?copyTree(from,to):fs.copyFileSync(from,to);}}
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function list(dir){var values=[];for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);values=values.concat(item.isDirectory()?list(file):[file]);}return values;}
fs.mkdirSync(output,{recursive:true});roots.forEach((name)=>copyTree(path.join(root,name),path.join(output,name)));files.forEach((name)=>fs.copyFileSync(path.join(root,name),path.join(output,name)));
const index=fs.readFileSync(path.join(output,'index.html'),'utf8');
if(!index.includes('product-validation-mode.js')||!index.includes('participant-consent.js'))throw new Error('Validation mode assets are missing from preview.');
const manifest={schema:'shike-product-validation-preview',builtAt:new Date().toISOString(),entry:'index.html?validation=1',containsParticipantData:false,files:list(output).filter((file)=>!file.endsWith('preview-manifest.json')).map((file)=>({path:path.relative(output,file).replace(/\\/g,'/'),sha256:hash(file)}))};
fs.writeFileSync(path.join(output,'preview-manifest.json'),JSON.stringify(manifest,null,2));
console.log(`Product validation preview built: ${manifest.files.length} files`);
