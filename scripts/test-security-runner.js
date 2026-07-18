// Security checks
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
const parserHash = require('./chronos-parser-hash.js');

let issues = 0;

// 1. Check for hardcoded secrets
const secretPatterns = [
  /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i,
  /token\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i,
  /sk-[a-zA-Z0-9]{30,}/,
  /AIza[a-zA-Z0-9_\-]{30,}/,
  /ghp_[a-zA-Z0-9]{30,}/,
];

function walk(dir) {
  const items = fs.readdirSync(dir, {withFileTypes: true});
  for (const item of items) {
    const fp = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== '.git') {
      walk(fp);
    } else if (item.name.endsWith('.js') || item.name.endsWith('.html')) {
      const c = fs.readFileSync(fp, 'utf8');
      for (const pat of secretPatterns) {
        if (pat.test(c)) {
          console.log('SECURITY: Possible secret in', path.relative(V, fp));
          issues++;
        }
      }
    }
  }
}

walk(V);

// 2. Verify browser policy and security quarantine ordering.
const indexHtml = fs.readFileSync(path.join(V, 'index.html'), 'utf8');
const syncClient = fs.readFileSync(path.join(V, 'src', 'sync', 'sync-client.js'), 'utf8');
const cspMatch = indexHtml.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
if (!cspMatch || !cspMatch[1].includes("object-src 'none'") || !cspMatch[1].includes("base-uri 'self'") || cspMatch[1].includes('connect-src *')) {
  console.log('SECURITY: Browser CSP is missing required restrictions');
  issues++;
}
if (!indexHtml.includes('<meta name="referrer" content="strict-origin-when-cross-origin">')) {
  console.log('SECURITY: Referrer policy is missing');
  issues++;
}
const quarantineIndex = syncClient.indexOf("push = function(){ return Promise.resolve({status:'sync_security_quarantined'");
const exportIndex = syncClient.indexOf('global.ShikeSyncClient = {');
if (quarantineIndex < 0 || exportIndex < quarantineIndex) {
  console.log('SECURITY: Sync client exports pre-quarantine functions');
  issues++;
}

// 3. Verify the normalized parser hash. Raw bytes are diagnostic only.
const hashes = parserHash.calculate();
console.log('Working-tree parser hash:', hashes.workingTreeHash);
console.log('Canonical parser hash:', hashes.canonicalNormalizedHash);
if (hashes.canonicalNormalizedHash !== parserHash.EXPECTED_CANONICAL_HASH) {
  console.log('SECURITY: Canonical parser hash changed');
  issues++;
}

console.log(issues === 0 ? 'Security check passed: no issues' : `Security check: ${issues} issues`);
process.exit(issues > 0 ? 1 : 0);
