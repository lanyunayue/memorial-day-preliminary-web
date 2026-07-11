// Basic format check
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let issues = 0;

function checkFile(fp) {
  const c = fs.readFileSync(fp, 'utf8');
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 500 && !fp.includes('legacy-app')) {
      console.log('WARN: long line in', path.relative(V, fp) + ':' + (i+1));
      issues++;
    }
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir, {withFileTypes: true});
  for (const item of items) {
    const fp = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      walk(fp);
    } else if (item.name.endsWith('.js')) {
      checkFile(fp);
    }
  }
}

walk(path.join(V, 'src'));
console.log(issues === 0 ? 'Format check passed' : `Format check: ${issues} issues`);
process.exit(0); // Non-blocking for now
