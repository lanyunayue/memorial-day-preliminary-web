// Accessibility check runner
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
const strictRunner = path.join(V, 'scripts', 'test-shike-a11y-static.js');

if (fs.existsSync(strictRunner)) {
  const result = spawnSync(process.execPath, [strictRunner], {
    cwd: V,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(typeof result.status === 'number' ? result.status : 1);
}

let issues = 0;

// Check HTML for basic a11y
const html = fs.readFileSync(path.join(V, 'index.html'), 'utf8');

// Check for images without alt
const imgRegex = /<img[^>]*>/g;
let m;
while ((m = imgRegex.exec(html)) !== null) {
  if (!m[0].includes('alt=')) {
    console.log('A11Y: img without alt:', m[0].substring(0, 50));
    issues++;
  }
}

// Check for buttons without accessible name
const btnRegex = /<button[^>]*>([^<]*)<\/button>/g;
while ((m = btnRegex.exec(html)) !== null) {
  if (!m[0].includes('aria-label') && !m[0].includes('title=') && m[1].trim() === '') {
    console.log('A11Y: button without accessible name');
    issues++;
  }
}

console.log(issues === 0 ? 'Accessibility check passed' : `Accessibility: ${issues} issues`);
process.exit(issues === 0 ? 0 : 1);
