'use strict';

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const PARSER_PATH=path.resolve(__dirname,'..','src','parser','parser-adapter.js');
const EXPECTED_CANONICAL_HASH='efbff968efd518e26970bac24ad35396df8482a32ba56011c6670167d58c4b58';
function sha256(value){return crypto.createHash('sha256').update(value).digest('hex');}
function normalizeUtf8(value){return Buffer.isBuffer(value)?value.toString('utf8').replace(/\r\n?/g,'\n'):String(value).replace(/\r\n?/g,'\n');}
function calculate(filePath){const bytes=fs.readFileSync(filePath||PARSER_PATH);return {path:filePath||PARSER_PATH,workingTreeHash:sha256(bytes),canonicalNormalizedHash:sha256(Buffer.from(normalizeUtf8(bytes),'utf8'))};}

if(require.main===module){
  const result=calculate(process.argv[2]);
  console.log('Working-tree parser hash:',result.workingTreeHash);
  console.log('Canonical parser hash:',result.canonicalNormalizedHash);
}

module.exports=Object.freeze({PARSER_PATH,EXPECTED_CANONICAL_HASH,normalizeUtf8,calculate,sha256});
