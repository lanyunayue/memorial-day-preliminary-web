'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const node = process.execPath;
const checks = [];

function run(script, args = [], env = {}) {
  return spawnSync(node, [path.join(root, 'scripts', script), ...args], {
    cwd: root,
    env: Object.assign({}, process.env, env),
    encoding: 'utf8',
    timeout: 30000
  });
}

function check(name, condition, detail) {
  if (!condition) throw new Error(`${name}: ${detail}`);
  checks.push(name);
  console.log(`  PASS: ${name}`);
}

const currentInstall = run('ci-install.js');
check(
  'locked dependencies install reproducibly',
  currentInstall.status === 0 && /npm ci completed using package-lock\.json/.test(currentInstall.stdout),
  currentInstall.stderr || currentInstall.stdout
);

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'shike-ci-gate-'));
try {
  fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ dependencies: { example: '1.0.0' } }));
  const missingLock = run('ci-install.js', [], { SHIKE_PROJECT_ROOT: fixture });
  check(
    'declared dependencies without a lockfile fail installation',
    missingLock.status !== 0 && /without a lockfile/.test(missingLock.stderr),
    missingLock.stderr || missingLock.stdout
  );
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

const lintFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'shike-lint-gate-'));
try {
  fs.mkdirSync(path.join(lintFixture, 'src'));
  fs.writeFileSync(
    path.join(lintFixture, 'src', 'broken.js'),
    '<<<<<<< HEAD\nconst value = 1;\n=======\nconst value = 2;\n>>>>>>> branch\n'
  );
  const conflictMarkers = run('lint-check.js', [], { SHIKE_PROJECT_ROOT: lintFixture });
  check(
    'lint rejects unresolved merge conflict markers',
    conflictMarkers.status !== 0 && /unresolved merge conflict marker/.test(conflictMarkers.stdout),
    conflictMarkers.stderr || conflictMarkers.stdout
  );
} finally {
  fs.rmSync(lintFixture, { recursive: true, force: true });
}

const optionalE2e = run('test-e2e-runner.js');
check(
  'optional local E2E reports SKIPPED explicitly',
  optionalE2e.status === 0 && /E2E SKIPPED:/.test(optionalE2e.stdout),
  optionalE2e.stderr || optionalE2e.stdout
);

const requiredE2e = run('test-e2e-runner.js', ['--required']);
check(
  'required E2E cannot convert SKIPPED into success',
  requiredE2e.status !== 0 && /E2E is required but could not run/.test(requiredE2e.stderr),
  requiredE2e.stderr || requiredE2e.stdout
);

console.log(`CI gate regression passed: ${checks.length}/${checks.length}`);
