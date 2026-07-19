'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const EDGE = process.env.SHIKE_EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = Number(process.env.SHIKE_TEST_PORT || 8090);
const BASE_CDP_PORT = Number(process.env.SHIKE_CDP_PORT || 9224);
const APP_URL = `http://127.0.0.1:${PORT}/index.html`;
const versionSource = fs.readFileSync(path.join(ROOT, 'src', 'config', 'version.js'), 'utf8');
const versionMatch = versionSource.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
const EXPECTED_VERSION = process.env.SHIKE_EXPECTED_VERSION || (versionMatch && versionMatch[1]);
const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'cdp');
const ALL_TESTS = [
  'test-shike-agent-runtime-cdp.js',
  'test-shike-experience-runtime-cdp.js',
  'test-shike-offline-runtime-cdp.js',
  'test-shike-runtime-cdp.js',
  'test-shike-storage-runtime-cdp.js',
  'test-shike-v150-network-cdp.js',
  'test-shike-v150-responsive-cdp.js',
];
const requestedTests = process.argv.slice(2);
const tests = requestedTests.length ? requestedTests : ALL_TESTS;

for (const script of tests) {
  if (!ALL_TESTS.includes(script)) throw new Error(`Unknown CDP test: ${script}`);
}
if (!EXPECTED_VERSION) throw new Error('Unable to read APP_VERSION');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      // Startup polling is expected to fail until the process listens.
    }
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function stopTree(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else {
    child.kill('SIGTERM');
  }
}

function runTest(script, env, timeoutMs = 180000) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', script)], {
      cwd: ROOT,
      env,
      stdio: 'inherit',
      windowsHide: true,
    });
    const timer = setTimeout(() => {
      console.error(`${script} exceeded ${timeoutMs}ms`);
      stopTree(child);
      resolve(124);
    }, timeoutMs);
    child.on('exit', (code) => {
      clearTimeout(timer);
      resolve(code === null ? 2 : code);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      console.error(`${script} failed to start: ${error.message}`);
      resolve(2);
    });
  });
}

async function main() {
  if (!fs.existsSync(EDGE)) {
    console.error(`CDP suite blocked: Edge not found at ${EDGE}`);
    process.exit(2);
  }
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve-static.js')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit',
    windowsHide: true,
  });
  const failures = [];

  try {
    await waitFor(APP_URL, 15000);
    for (let index = 0; index < tests.length; index += 1) {
      const script = tests[index];
      const cdpPort = BASE_CDP_PORT + index;
      const cdpUrl = `http://127.0.0.1:${cdpPort}`;
      const profile = path.join(ARTIFACT_DIR, `profile-${Date.now()}-${index}`);
      const initialUrl = script === 'test-shike-storage-runtime-cdp.js' ? 'about:blank' : APP_URL;
      fs.mkdirSync(profile, { recursive: true });
      console.log(`\n[CDP ${index + 1}/${tests.length}] ${script}`);
      const edge = spawn(EDGE, [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--remote-debugging-port=${cdpPort}`,
        `--user-data-dir=${profile}`,
        initialUrl,
      ], { stdio: 'ignore', windowsHide: true });

      try {
        await waitFor(`${cdpUrl}/json`, 20000);
        const code = await runTest(script, {
          ...process.env,
          SHIKE_CDP_URL: cdpUrl,
          SHIKE_APP_URL: APP_URL,
          SHIKE_EXPECTED_VERSION: EXPECTED_VERSION,
          SHIKE_ARTIFACT_DIR: ARTIFACT_DIR,
        });
        if (code !== 0) failures.push({ script, code });
      } finally {
        stopTree(edge);
        await delay(500);
      }
    }
  } finally {
    stopTree(server);
  }

  if (failures.length) {
    failures.forEach(({ script, code }) => console.error(`CDP FAIL: ${script} exit=${code}`));
    console.error(`CDP suite failed: ${tests.length - failures.length}/${tests.length} passed`);
    process.exit(1);
  }
  console.log(`CDP suite passed: ${tests.length}/${tests.length}`);
}

main().catch((error) => {
  console.error(`CDP suite failed to run: ${error.message}`);
  process.exit(1);
});
