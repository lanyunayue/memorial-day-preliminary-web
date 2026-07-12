// E2E test runner - runs Playwright-style tests or local Edge CDP checks.
const { execSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const V = path.resolve(__dirname, '..');

// Check if playwright is available
let hasPlaywright = false;
try {
  require.resolve('@playwright/test');
  hasPlaywright = true;
} catch(e) {}

if (hasPlaywright) {
  try {
    execSync('npx playwright test --project=chromium', { stdio: 'inherit', cwd: V });
    console.log('E2E tests passed');
  } catch(e) {
    console.log('E2E tests failed');
    process.exit(1);
  }
} else {
  runLocalCdpFallback().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}

function findEdge() {
  const candidates = [
    process.env.MSEDGE_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome'
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function mimeType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';
}

function startServer() {
  const server = http.createServer((req, res) => {
    const cleanPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const normalized = cleanPath === '/' ? '/index.html' : cleanPath;
    const target = path.normalize(path.join(V, normalized));
    const relativeTarget = path.relative(V, target);
    if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    fs.readFile(target, (err, data) => {
      if (err) {
        res.writeHead(404); res.end('Not found'); return;
      }
      res.writeHead(200, { 'Content-Type': mimeType(target), 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function waitForJson(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (e) {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function runScript(script, env) {
  const fp = path.join(V, 'scripts', script);
  if (!fs.existsSync(fp)) return { skipped: true };
  return spawnSync(process.execPath, [fp], {
    cwd: V,
    env: Object.assign({}, process.env, env),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 180000
  });
}

function psQuote(value) {
  return String(value).replace(/'/g, "''");
}

function startEdge(edge, args) {
  if (process.platform === 'win32') {
    const argString = args.map((arg) => {
      if (arg.startsWith('--user-data-dir=')) {
        return `--user-data-dir=\\"${arg.slice('--user-data-dir='.length)}\\"`;
      }
      return arg;
    }).join(' ');
    const command = `$p=Start-Process -FilePath '${psQuote(edge)}' -ArgumentList '${psQuote(argString)}' -WindowStyle Hidden -PassThru; $p.Id`;
    const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    if (result.status !== 0) {
      throw new Error(`Failed to start Edge: ${result.stderr || result.stdout}`);
    }
    const pid = parseInt((result.stdout || '').trim(), 10);
    return {
      pid,
      killed: false,
      kill() {
        this.killed = true;
        if (pid) {
          spawnSync('powershell.exe', ['-NoProfile', '-Command', `Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`]);
        }
      }
    };
  }
  return spawn(edge, args, { stdio: 'ignore', detached: false, windowsHide: true });
}

async function runLocalCdpFallback() {
  console.log('Playwright not installed - running CDP E2E validation when available');
  if (process.env.SHIKE_CDP_URL) {
    const artifactDir = process.env.SHIKE_ARTIFACT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'shike-e2e-artifacts-'));
    runCdpScripts({
      SHIKE_CDP_URL: process.env.SHIKE_CDP_URL,
      SHIKE_APP_URL: process.env.SHIKE_APP_URL || 'http://127.0.0.1:8090/index.html',
      SHIKE_ARTIFACT_DIR: artifactDir
    });
    return;
  }
  if (process.env.SHIKE_AUTOSTART_EDGE !== '1') {
    console.log('E2E skipped: set SHIKE_CDP_URL for browser validation, or SHIKE_AUTOSTART_EDGE=1 to try local Edge startup');
    return;
  }
  const edge = findEdge();
  if (!edge) {
    console.log('E2E skipped: no Playwright or Edge/Chromium executable found');
    return;
  }

  const server = await startServer();
  const appPort = server.address().port;
  const cdpPort = 9300 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shike-e2e-edge-'));
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shike-e2e-artifacts-'));
  const args = [
    `--remote-debugging-port=${cdpPort}`,
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--disable-extensions',
    '--new-window',
    `http://127.0.0.1:${appPort}/`
  ];
  const browser = startEdge(edge, args);
  try {
    await waitForJson(`http://127.0.0.1:${cdpPort}/json`, 15000);
    runCdpScripts({
      SHIKE_CDP_URL: `http://127.0.0.1:${cdpPort}`,
      SHIKE_APP_URL: `http://127.0.0.1:${appPort}/`,
      SHIKE_ARTIFACT_DIR: artifactDir
    });
  } finally {
    server.close();
    if (!browser.killed) browser.kill();
  }
}

function runCdpScripts(env) {
  let passed = 0;
  let failed = 0;
  for (const script of ['test-shike-runtime-cdp.js']) {
    const result = runScript(script, env);
    if (result.skipped) continue;
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) passed++;
    else failed++;
  }
  console.log(`E2E (CDP): ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}
