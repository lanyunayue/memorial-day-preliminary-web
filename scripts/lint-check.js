const fs = require('fs');
const path = require('path');
const V = path.resolve(process.env.SHIKE_PROJECT_ROOT || path.resolve(__dirname, '..'));
const SOURCE_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.yaml', '.yml']);
const IGNORED_DIRECTORIES = new Set(['.git', 'artifacts', 'corpus', 'node_modules']);
const CONFLICT_MARKER = /^(<<<<<<< .*|=======|>>>>>>> .*)$/m;

let issues = 0;
function checkFile(fp) {
  const c = fs.readFileSync(fp, 'utf8');
  const relativePath = path.relative(V, fp);
  const isProductSource = relativePath.split(path.sep)[0] === 'src';
  if (CONFLICT_MARKER.test(c)) {
    console.log('ERROR: unresolved merge conflict marker in', relativePath);
    issues++;
  }
  if (isProductSource && path.extname(fp) === '.js') {
    if (c.includes('eval(') && !fp.includes('test')) {
      console.log('WARN: eval() in', relativePath);
      issues++;
    }
    if (c.includes('document.write(')) {
      console.log('WARN: document.write in', relativePath);
      issues++;
    }
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir, {withFileTypes: true});
  for (const item of items) {
    const fp = path.join(dir, item.name);
    if (item.isDirectory() && !IGNORED_DIRECTORIES.has(item.name)) {
      walk(fp);
    } else if (item.isFile() && SOURCE_EXTENSIONS.has(path.extname(item.name))) {
      checkFile(fp);
    }
  }
}

walk(V);
console.log(issues === 0 ? 'Lint check passed: no issues found' : `Lint check: ${issues} issues found`);
process.exit(issues > 0 ? 1 : 0);
