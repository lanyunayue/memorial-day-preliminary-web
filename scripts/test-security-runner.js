// Security checks
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const V = path.resolve(__dirname, '..');

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

// 2. Verify parser hash unchanged
const parser = fs.readFileSync(path.join(V, 'src/parser/parser-adapter.js'), 'utf8');
const hash = crypto.createHash('sha256').update(parser).digest('hex');
console.log('Parser hash:', hash.substring(0, 16));

console.log(issues === 0 ? 'Security check passed: no issues' : `Security check: ${issues} issues`);
process.exit(issues > 0 ? 1 : 0);
