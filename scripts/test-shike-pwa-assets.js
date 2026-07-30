const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html: indexHtml, style, script } = require('./load-shike-source').loadShikeSource(root);
const manifestRaw = fs.readFileSync(path.join(root, 'manifest.json'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function matchOne(text, re, message) {
  const match = text.match(re);
  assert(match, message);
  return match;
}

function parseColor(value) {
  assert(/^#[0-9a-fA-F]{6}$/.test(value), `invalid color ${value}`);
  return value.toLowerCase();
}

const failures = [];
const checks = [];
function add(name, run) {
  checks.push({ name, run });
}

let manifest;
add('manifest is valid json', () => {
  manifest = JSON.parse(manifestRaw);
  assert(manifest && typeof manifest === 'object', 'manifest should be an object');
});

add('index references manifest and theme metadata', () => {
  assert(indexHtml.includes('<link rel="manifest" href="manifest.json">'), 'index should reference manifest.json');
  assert(/<meta name="theme-color" content="#[0-9a-fA-F]{6}">/.test(indexHtml), 'index should include theme-color meta');
  assert(indexHtml.includes('apple-mobile-web-app-capable'), 'index should include iOS web app capable meta');
});

add('public metadata supports search, sharing, and iOS installation', () => {
  assert(/<meta name="description" content="[^"]+">/.test(indexHtml), 'index should include a description');
  assert(indexHtml.includes('<link rel="canonical" href="https://lanyunayue.github.io/memorial-day-preliminary-web/">'), 'index should include the production canonical URL');
  assert(indexHtml.includes('<meta property="og:title"'), 'index should include an Open Graph title');
  assert(indexHtml.includes('<meta property="og:description"'), 'index should include an Open Graph description');
  assert(indexHtml.includes('<meta property="og:url"'), 'index should include an Open Graph URL');
  assert(indexHtml.includes('<link rel="apple-touch-icon"'), 'index should include an Apple touch icon');
});

add('app version and service worker cache version align', () => {
  const appVersion = matchOne(script, /var APP_VERSION='(v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)'/, 'APP_VERSION should be present');
  const swCache = matchOne(sw, /CACHE_NAME\s*=\s*'shike-(v[0-9a-z]+)-v(\d+)'/, 'CACHE_NAME should be present');
  var verClean = appVersion[1].replace(/^v/, '');
  var expectedToken = verClean === '1.0.0-rc' ? 'v100rc' : 'v' + verClean.replace(/[-.]/g, '');
  assertEqual(swCache[1], expectedToken, 'service worker cache version token should match APP_VERSION');

});

add('manifest required fields are stable', () => {
  assertEqual(manifest.name, '\u65f6\u523b\u00b7\u4e2a\u4eba\u8d1f\u8377\u4e0e\u6062\u590d\u52a9\u624b', 'manifest name');
  assertEqual(manifest.short_name, '\u65f6\u523b', 'manifest short_name');
  assert(manifest.description.includes('\u8d1f\u8377') && manifest.description.includes('\u51cf\u5c11'), 'manifest description should match the load and recovery position');
  assertEqual(manifest.id, './', 'manifest id');
  assertEqual(manifest.start_url, './', 'manifest start_url');
  assertEqual(manifest.scope, './', 'manifest scope');
  assertEqual(manifest.display, 'standalone', 'manifest display');
  assert(!Object.prototype.hasOwnProperty.call(manifest, 'orientation'), 'manifest should not force portrait on desktop installs');
});

add('manifest colors align with default app theme', () => {
  const metaTheme = parseColor(matchOne(indexHtml, /<meta name="theme-color" content="(#[0-9a-fA-F]{6})">/, 'theme-color meta')[1]);
  const defaultBg = parseColor(matchOne(style, /:root\{[^}]*--bg:(#[0-9a-fA-F]{6})/, 'default --bg should be present')[1]);
  assertEqual(metaTheme, defaultBg, 'theme-color meta should match default --bg');
  assertEqual(parseColor(manifest.theme_color), defaultBg, 'manifest theme_color should match default --bg');
  assertEqual(parseColor(manifest.background_color), defaultBg, 'manifest background_color should match default --bg');
});

add('manifest icons include valid 192 and 512 PNG files', () => {
  assert(Array.isArray(manifest.icons), 'manifest icons should be an array');
  const sizes = new Set(manifest.icons.map((icon) => icon.sizes));
  assert(sizes.has('192x192'), 'manifest should include 192x192 icon');
  assert(sizes.has('512x512'), 'manifest should include 512x512 icon');
  manifest.icons.forEach((icon) => {
    assertEqual(icon.type, 'image/png', `icon ${icon.sizes} type`);
    assert(!icon.src.startsWith('data:'), `icon ${icon.sizes} should use a real file`);
    const file = path.join(root, icon.src.replace(/^\.\//, ''));
    assert(fs.existsSync(file), `icon ${icon.sizes} should exist`);
    const png = fs.readFileSync(file);
    assertEqual(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes, `icon ${icon.sizes} dimensions`);
  });
  assert(manifest.icons.some((icon) => String(icon.purpose).includes('maskable')), 'manifest should include a maskable icon');
});

add('service worker registration uses versioned URL and updateViaCache none', () => {
  assert(script.includes("var swUrl='sw.js?v='+encodeURIComponent(APP_VERSION);"), 'SW URL should include APP_VERSION');
  assert(script.includes("navigator.serviceWorker.register(swUrl,{updateViaCache:'none'})"), 'SW registration should bypass update cache');
  assert(script.includes("localStorage.setItem('shike_last_ver',APP_VERSION)"), 'app should remember last app version');
});

add('service worker lifecycle and fetch strategy remain update-safe', () => {
  assert(sw.includes('self.skipWaiting()'), 'SW should call skipWaiting');
  assert(sw.includes('self.clients.claim()'), 'SW should claim clients on activate');
  assert(sw.includes("fetch(req,{cache:'no-store'})"), 'HTML/SW fetch should use no-store');
  assert(sw.includes('caches.keys()'), 'SW should enumerate old caches');
  assert(sw.includes('caches.delete(k)'), 'SW should delete old caches');
  assert(sw.includes("caches.match('./index.html')"), 'SW should fallback navigations to index.html');
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`PWA asset regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PWA asset regression passed: ${checks.length}/${checks.length}`);
