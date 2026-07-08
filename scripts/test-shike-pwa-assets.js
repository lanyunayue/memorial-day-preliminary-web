const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
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

add('app version and service worker cache version align', () => {
  const appVersion = matchOne(indexHtml, /var APP_VERSION='v(\d+)\.(\d+)\.(\d+)'/, 'APP_VERSION should be present');
  const swCache = matchOne(sw, /CACHE_NAME\s*=\s*'shike-v(\d{3})-v(\d+)'/, 'CACHE_NAME should be present');
  const expectedToken = `${appVersion[1]}${appVersion[2]}${appVersion[3]}`;
  assertEqual(swCache[1], expectedToken, 'service worker cache version token should match APP_VERSION');
});

add('manifest required fields are stable', () => {
  assertEqual(manifest.name, '\u65f6\u523b - \u4f60\u7684\u8d34\u5fc3\u8bb0\u4e8b\u52a9\u624b', 'manifest name');
  assertEqual(manifest.short_name, '\u65f6\u523b', 'manifest short_name');
  assertEqual(manifest.description, '\u968f\u624b\u8bb0\uff0c\u6309\u65f6\u63d0\u9192', 'manifest description');
  assertEqual(manifest.start_url, './', 'manifest start_url');
  assertEqual(manifest.display, 'standalone', 'manifest display');
  assertEqual(manifest.orientation, 'portrait', 'manifest orientation');
});

add('manifest colors align with default app theme', () => {
  const metaTheme = parseColor(matchOne(indexHtml, /<meta name="theme-color" content="(#[0-9a-fA-F]{6})">/, 'theme-color meta')[1]);
  const defaultBg = parseColor(matchOne(indexHtml, /:root\{[^}]*--bg:(#[0-9a-fA-F]{6})/, 'default --bg should be present')[1]);
  assertEqual(metaTheme, defaultBg, 'theme-color meta should match default --bg');
  assertEqual(parseColor(manifest.theme_color), defaultBg, 'manifest theme_color should match default --bg');
  assertEqual(parseColor(manifest.background_color), defaultBg, 'manifest background_color should match default --bg');
});

add('manifest icons include valid 192 and 512 SVG data uris', () => {
  assert(Array.isArray(manifest.icons), 'manifest icons should be an array');
  const sizes = new Set(manifest.icons.map((icon) => icon.sizes));
  assert(sizes.has('192x192'), 'manifest should include 192x192 icon');
  assert(sizes.has('512x512'), 'manifest should include 512x512 icon');
  manifest.icons.forEach((icon) => {
    assertEqual(icon.type, 'image/svg+xml', `icon ${icon.sizes} type`);
    assert(icon.src.startsWith('data:image/svg+xml,'), `icon ${icon.sizes} should be SVG data URI`);
    const svg = decodeURIComponent(icon.src.slice('data:image/svg+xml,'.length));
    assert(svg.includes('<svg'), `icon ${icon.sizes} should contain <svg`);
    assert(svg.includes('</svg>'), `icon ${icon.sizes} should contain closing svg tag`);
    assert(svg.includes('\u65f6'), `icon ${icon.sizes} should include app glyph`);
    assert(/viewBox=['"]0 0 100 100['"]/.test(svg), `icon ${icon.sizes} should include viewBox`);
  });
});

add('service worker registration uses versioned URL and updateViaCache none', () => {
  assert(indexHtml.includes("var swUrl='sw.js?v='+encodeURIComponent(APP_VERSION);"), 'SW URL should include APP_VERSION');
  assert(indexHtml.includes("navigator.serviceWorker.register(swUrl,{updateViaCache:'none'})"), 'SW registration should bypass update cache');
  assert(indexHtml.includes("localStorage.setItem('shike_last_ver',APP_VERSION)"), 'index should remember last app version');
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
