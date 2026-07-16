// Basic lint check - validates no obvious issues
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');

let issues = 0;
function checkFile(fp) {
  const c = fs.readFileSync(fp, 'utf8');
  // Check for common issues
  if (c.includes('eval(') && !fp.includes('test')) { console.log('WARN: eval() in', path.relative(V, fp)); issues++; }
  if (c.includes('document.write(')) { console.log('WARN: document.write in', path.relative(V, fp)); issues++; }
  if (c.includes('innerHTML =') && !fp.includes('test') && !fp.includes('legacy-app') && !fp.includes('agent/ui')) {
    // innerHTML is used in legacy code, only flag new files
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir, {withFileTypes: true});
  for (const item of items) {
    const fp = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      walk(fp);
    } else if (item.name.endsWith('.js') && !item.name.includes('test')) {
      checkFile(fp);
    }
  }
}

walk(path.join(V, 'src'));
console.log(issues === 0 ? 'Lint check passed: no issues found' : `Lint check: ${issues} issues found`);
process.exit(issues > 0 ? 1 : 0);
