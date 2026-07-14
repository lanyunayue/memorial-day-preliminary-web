'use strict';
const fs=require('fs');
const path=require('path');
const analyzer=require('./session-analyzer.js');
const report=require('./metrics-report.js');
const files=process.argv.slice(2);
if(!files.length){console.error('Usage: node analyze-files.js <participant-export.json> [...]');process.exit(2);}
const exports=files.map((file)=>JSON.parse(fs.readFileSync(path.resolve(file),'utf8')));
process.stdout.write(report.markdown(analyzer.analyze(exports))+'\n');
