'use strict';

const fs=require('fs');
const parserHash=require('./chronos-parser-hash.js');
const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}

const lf='alpha\nbeta\n';
const crlf='alpha\r\nbeta\r\n';
const cr='alpha\rbeta\r';
check('canonical normalization converts CRLF to LF',parserHash.normalizeUtf8(crlf)===lf);
check('canonical normalization converts CR to LF',parserHash.normalizeUtf8(cr)===lf);
check('canonical hashes ignore line ending style',parserHash.sha256(parserHash.normalizeUtf8(lf))===parserHash.sha256(parserHash.normalizeUtf8(crlf)));
const parserBytes=fs.readFileSync(parserHash.PARSER_PATH);
const result=parserHash.calculate();
check('working-tree hash preserves current bytes',result.workingTreeHash===parserHash.sha256(parserBytes));
check('canonical parser hash matches locked baseline',result.canonicalNormalizedHash===parserHash.EXPECTED_CANONICAL_HASH,result.canonicalNormalizedHash);
const checkoutUsesCanonicalBytes=parserBytes.equals(Buffer.from(parserHash.normalizeUtf8(parserBytes),'utf8'));
check('working and canonical equality reflects checkout bytes',(result.workingTreeHash===result.canonicalNormalizedHash)===checkoutUsesCanonicalBytes);

console.log(`Chronos canonical parser hash passed: ${checks.length}/${checks.length}`);
