'use strict';

const parserHash=require('./chronos-parser-hash.js');
const checks=[];
function check(name,condition,detail){if(!condition)throw new Error(`${name}: ${detail||''}`);checks.push(name);}

const lf='alpha\nbeta\n';
const crlf='alpha\r\nbeta\r\n';
const cr='alpha\rbeta\r';
check('canonical normalization converts CRLF to LF',parserHash.normalizeUtf8(crlf)===lf);
check('canonical normalization converts CR to LF',parserHash.normalizeUtf8(cr)===lf);
check('canonical hashes ignore line ending style',parserHash.sha256(parserHash.normalizeUtf8(lf))===parserHash.sha256(parserHash.normalizeUtf8(crlf)));
const result=parserHash.calculate();
check('working-tree hash preserves current bytes',result.workingTreeHash==='d6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32');
check('canonical parser hash matches locked baseline',result.canonicalNormalizedHash===parserHash.EXPECTED_CANONICAL_HASH,result.canonicalNormalizedHash);
check('working and canonical hashes are explicitly distinct on CRLF checkout',result.workingTreeHash!==result.canonicalNormalizedHash);

console.log(`Chronos canonical parser hash passed: ${checks.length}/${checks.length}`);
