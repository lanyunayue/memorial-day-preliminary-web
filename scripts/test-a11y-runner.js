// Accessibility check runner
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');

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
process.exit(0); // Non-blocking for informational issues
