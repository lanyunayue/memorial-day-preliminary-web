'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.env.SHIKE_PROJECT_ROOT || path.join(__dirname, '..'));
const manifestPath = path.join(root, 'package.json');
const lockfiles = ['package-lock.json', 'npm-shrinkwrap.json'];

function dependencyNames(manifest) {
  return ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
    .flatMap((field) => Object.keys(manifest[field] || {}));
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`package.json not found in ${root}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const lockfile = lockfiles.find((name) => fs.existsSync(path.join(root, name)));
  const dependencies = dependencyNames(manifest);

  if (!lockfile) {
    if (dependencies.length > 0) {
      throw new Error(`Dependency install blocked: ${dependencies.length} dependencies declared without a lockfile`);
    }
    console.log('Dependency install PASS: no dependencies declared and no lockfile required');
    return;
  }

  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ci'] : ['ci'];
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`npm ci failed with exit code ${result.status}`);
  }
  console.log(`Dependency install PASS: npm ci completed using ${lockfile}`);
}

try {
  main();
} catch (error) {
  console.error(`Dependency install FAIL: ${error.message}`);
  process.exit(1);
}
