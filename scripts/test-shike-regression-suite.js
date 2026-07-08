const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

const tests = [
  {
    name: 'PWA assets',
    script: 'test-shike-pwa-assets.js',
    expected: 'PWA asset regression passed: 8/8'
  },
  {
    name: 'HTML integrity',
    script: 'test-shike-html-integrity.js',
    expected: 'HTML integrity regression passed: 7/7'
  },
  {
    name: 'A11y static',
    script: 'test-shike-a11y-static.js',
    expected: 'A11y static regression passed: 6/6'
  },
  {
    name: 'Demo examples',
    script: 'test-shike-demo-examples.js',
    expected: 'Demo examples regression passed: 6/6'
  },
  {
    name: 'Time sprite',
    script: 'test-shike-time-sprite.js',
    expected: 'Time sprite regression passed: 8/8'
  },
  {
    name: 'Responsive CSS',
    script: 'test-shike-responsive-css.js',
    expected: 'Responsive CSS regression passed: 9/9'
  },
  {
    name: 'I18N placeholders',
    script: 'test-shike-i18n-placeholders.js',
    expected: 'I18N placeholder regression passed: 6/6'
  },
  {
    name: 'ICS export',
    script: 'test-shike-ics-export.js',
    expected: 'ICS export regression passed: 11/11'
  },
  {
    name: 'Backup hardening',
    script: 'test-shike-backup-hardening.js',
    expected: 'Backup hardening regression passed: 11/11'
  },
  {
    name: 'ICS deep',
    script: 'test-shike-ics-deep.js',
    expected: 'ICS deep regression passed: 14/14'
  },
  {
    name: 'Data safety center',
    script: 'test-shike-data-safety-center.js',
    expected: 'Data safety center regression passed: 9/9'
  },
  {
    name: 'Import preview',
    script: 'test-shike-import-preview.js',
    expected: 'Import preview regression passed: 10/10'
  },
  {
    name: 'PWA notice',
    script: 'test-shike-pwa-notice.js',
    expected: 'PWA notice regression passed: 6/6'
  }
];

[
  {
    name: 'NLP parser',
    script: 'test-shike-nlp-parser.js',
    expected: 'NLP parser regression passed'
  },
  {
    name: 'Record id uniqueness',
    script: 'test-shike-record-id-uniqueness.js',
    expected: 'Record id uniqueness regression passed'
  }
].forEach((optionalTest) => {
  const scriptPath = path.join(__dirname, optionalTest.script);
  if (require('fs').existsSync(scriptPath)) tests.push(optionalTest);
});

const startedAt = Date.now();
const results = [];

for (const test of tests) {
  const scriptPath = path.join(__dirname, test.script);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const stdout = (result.stdout || '').trim();
  const stderr = (result.stderr || '').trim();
  const output = [stdout, stderr].filter(Boolean).join('\n');
  const passed = result.status === 0 && output.includes(test.expected);

  results.push({
    name: test.name,
    script: test.script,
    status: result.status,
    passed,
    output
  });

  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${test.name}`);
  if (output) {
    output.split(/\r?\n/).forEach((line) => console.log(`  ${line}`));
  }
}

const failed = results.filter((result) => !result.passed);
const elapsedMs = Date.now() - startedAt;

console.log('');
console.log(`Shike clean candidate suite: ${results.length - failed.length}/${results.length} passed in ${elapsedMs}ms`);

if (failed.length) {
  console.error('');
  console.error('Failed checks:');
  failed.forEach((result) => {
    console.error(`- ${result.name} (${result.script}) exit=${result.status}`);
  });
  process.exit(1);
}
