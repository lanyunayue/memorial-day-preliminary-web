const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

const tests = [
  {
    name: 'Time sprite',
    script: 'test-shike-time-sprite.js',
    expected: 'Time sprite regression passed: 8/8'
  }
];

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
