// E2E test runner - runs Playwright-style tests or local Edge CDP checks.
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const V = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2).filter((arg) => !arg.startsWith('--artifact-dir=')));
const artifactArg = process.argv.slice(2).find((arg) => arg.startsWith('--artifact-dir='));
const required = args.has('--required') || process.env.SHIKE_E2E_REQUIRED === '1';
const autostart = args.has('--autostart') || process.env.SHIKE_AUTOSTART_EDGE === '1';
const captureLayout = args.has('--layout') || process.env.SHIKE_E2E_LAYOUT === '1';
const configuredArtifactDir = artifactArg
  ? path.resolve(V, artifactArg.slice('--artifact-dir='.length))
  : process.env.SHIKE_ARTIFACT_DIR;

// Check if playwright is available
let hasPlaywright = false;
try {
  require.resolve('@playwright/test');
  hasPlaywright = true;
} catch(e) {}

if (hasPlaywright) {
  const artifactDir = configuredArtifactDir || path.join(V, 'artifacts', 'playwright');
  fs.mkdirSync(artifactDir, { recursive: true });
  try {
    execSync('npx playwright test --project=chromium', { stdio: 'inherit', cwd: V });
    fs.writeFileSync(path.join(artifactDir, 'e2e-runner-result.json'), JSON.stringify({
      classification: 'PASS',
      mode: 'playwright',
      generatedAt: new Date().toISOString()
    }, null, 2));
    console.log('E2E tests passed');
  } catch(e) {
    fs.writeFileSync(path.join(artifactDir, 'e2e-runner-result.json'), JSON.stringify({
      classification: 'FAIL',
      mode: 'playwright',
      generatedAt: new Date().toISOString()
    }, null, 2));
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
  const explicitPath = process.env.SHIKE_BROWSER_PATH;
  if (explicitPath) {
    if (fs.existsSync(explicitPath)) return explicitPath;
    console.log('SHIKE_BROWSER_PATH set but not found: ' + explicitPath);
  }
  const candidates = [
    process.env.MSEDGE_PATH,
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    process.env.EDGE_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    '/snap/bin/chromium-browser'
  ].filter(Boolean);
  // Also check PATH for common browser names
  const pathNames = ['google-chrome','google-chrome-stable','chromium','chromium-browser','microsoft-edge','microsoft-edge-stable','msedge.exe'];
  if (process.env.PATH) {
    const sep = process.platform === 'win32' ? ';' : ':';
    for (const dir of process.env.PATH.split(sep)) {
      for (const name of pathNames) {
        const p = path.join(dir, name);
        if (fs.existsSync(p)) candidates.push(p);
      }
    }
  }
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function getBrowserVersion(browserPath) {
  try {
    // Use --version flag
    const result = require('child_process').spawnSync(browserPath, ['--version'], {
      encoding: 'utf8',
      timeout: 5000
    });
    return (result.stdout || result.stderr || '').trim();
  } catch(e) {
    return 'unknown';
  }
}

function getExpectedAppVersion() {
  if (process.env.SHIKE_EXPECTED_VERSION) return process.env.SHIKE_EXPECTED_VERSION;
  const source = fs.readFileSync(path.join(V, 'src', 'config', 'version.js'), 'utf8');
  const match = source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) throw new Error('APP_VERSION could not be read from src/config/version.js');
  return match[1];
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
  if (!fs.existsSync(fp)) return Promise.resolve({ skipped: true });
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [fp], {
      cwd: V,
      env: Object.assign({}, process.env, env),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), 180000);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: 1, stdout, stderr: `${stderr}${error.message}\n` });
    });
    child.on('close', (status, signal) => {
      clearTimeout(timer);
      if (signal) stderr += `Process terminated by ${signal}\n`;
      resolve({ status, stdout, stderr });
    });
  });
}

function startEdge(edge, browserArgs) {
  const browser = spawn(edge, browserArgs, {
    stdio: 'ignore',
    detached: false,
    windowsHide: true
  });
  browser.on('error', () => {});
  return browser;
}

function skip(reason) {
  console.log(`E2E SKIPPED: ${reason}`);
  if (required) {
    throw new Error(`E2E is required but could not run: ${reason}`);
  }
}

async function writeBrowserMetadata(cdpUrl, appUrl, artifactDir) {
  fs.mkdirSync(artifactDir, { recursive: true });
  const version = await waitForJson(`${cdpUrl}/json/version`, 10000);
  const targets = await waitForJson(`${cdpUrl}/json`, 10000);
  const metadata = {
    classification: 'RUNNING',
    generatedAt: new Date().toISOString(),
    cdpUrl,
    appUrl,
    browser: version.Browser || null,
    protocolVersion: version['Protocol-Version'] || null,
    userAgent: version['User-Agent'] || null,
    pageTargets: targets.filter((target) => target.type === 'page').map((target) => ({
      title: target.title,
      url: target.url
    }))
  };
  fs.writeFileSync(path.join(artifactDir, 'browser-metadata.json'), JSON.stringify(metadata, null, 2));
  return metadata;
}

async function runLocalCdpFallback() {
  console.log('Playwright not installed - running CDP E2E validation when available');
  if (typeof WebSocket === 'undefined') {
    throw new Error('WebSocket global is not available. Node.js 22+ is required for CDP browser tests.');
  }
  if (process.env.SHIKE_CDP_URL) {
    const artifactDir = configuredArtifactDir || fs.mkdtempSync(path.join(os.tmpdir(), 'shike-e2e-artifacts-'));
    const appUrl = process.env.SHIKE_APP_URL || 'http://127.0.0.1:8090/index.html';
    await writeBrowserMetadata(process.env.SHIKE_CDP_URL, appUrl, artifactDir);
    await runCdpScripts({
      SHIKE_CDP_URL: process.env.SHIKE_CDP_URL,
      SHIKE_APP_URL: appUrl,
      SHIKE_ARTIFACT_DIR: artifactDir,
      SHIKE_EXPECTED_VERSION: getExpectedAppVersion()
    }, artifactDir);
    return;
  }
  if (!autostart) {
    skip('set SHIKE_CDP_URL for browser validation, or use --autostart to launch local Edge/Chromium');
    return;
  }
  const edge = findEdge();
  if (!edge) {
    skip('no Playwright or Edge/Chromium executable found');
    return;
  }
  const browserVersion = getBrowserVersion(edge);
  console.log('Using browser: ' + edge + ' (' + browserVersion + ')');

  const server = await startServer();
  const appPort = server.address().port;
  const cdpPort = 9300 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shike-e2e-edge-'));
  const artifactDir = configuredArtifactDir || fs.mkdtempSync(path.join(os.tmpdir(), 'shike-e2e-artifacts-'));
  const browserArgs = [
    `--remote-debugging-port=${cdpPort}`,
    '--remote-debugging-address=127.0.0.1',
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--no-first-run',
    '--disable-extensions',
    `http://127.0.0.1:${appPort}/`
  ];
  if (process.platform !== 'win32') browserArgs.push('--no-sandbox');
  const browser = startEdge(edge, browserArgs);
  try {
    const cdpUrl = `http://127.0.0.1:${cdpPort}`;
    const appUrl = `http://127.0.0.1:${appPort}/`;
    await waitForJson(`${cdpUrl}/json`, 30000);
    await writeBrowserMetadata(cdpUrl, appUrl, artifactDir);
    await runCdpScripts({
      SHIKE_CDP_URL: cdpUrl,
      SHIKE_APP_URL: appUrl,
      SHIKE_ARTIFACT_DIR: artifactDir,
      SHIKE_EXPECTED_VERSION: getExpectedAppVersion()
    }, artifactDir);
  } finally {
    server.close();
    if (!browser.killed) browser.kill();
  }
}

async function runCdpScripts(env, artifactDir) {
  let passed = 0;
  let failed = 0;
  const scripts = [
    {
      name: 'test-shike-runtime-cdp.js',
      env: captureLayout ? { SHIKE_CAPTURE_SCREENSHOTS: '1' } : {}
    },
    {
      name: 'test-shike-chronos-runtime-cdp.js',
      env: {}
    },
    {
      name: 'test-shike-multi-tab-runtime-cdp.js',
      env: {}
    },
    {
      name: 'test-shike-offline-runtime-cdp.js',
      env: {}
    }
  ];
  for (let index = 0; index < scripts.length; index++) {
    const script = scripts[index];
    if (index > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const result = await runScript(script.name, Object.assign({}, env, script.env));
    if (result.skipped) {
      failed++;
      console.error(`E2E FAIL: required script missing: ${script.name}`);
      continue;
    }
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) passed++;
    else failed++;
  }
  const classification = failed === 0 && passed === scripts.length ? 'PASS' : 'FAIL';
  const metadataPath = path.join(artifactDir, 'browser-metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    metadata.classification = classification;
    metadata.completedAt = new Date().toISOString();
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }
  fs.writeFileSync(path.join(artifactDir, 'e2e-runner-result.json'), JSON.stringify({
    classification,
    generatedAt: new Date().toISOString(),
    scripts: scripts.map((script) => script.name),
    passed,
    failed
  }, null, 2));
  console.log(`E2E (CDP) ${classification}: ${passed} passed, ${failed} failed`);
  if (failed) throw new Error(`CDP E2E failed: ${failed} script(s) failed`);
}
