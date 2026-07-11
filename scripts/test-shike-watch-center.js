const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const watchStorage = fs.readFileSync(path.join(root, 'src/watch/watch-storage.js'), 'utf8');
const watchCenter = fs.readFileSync(path.join(root, 'src/watch/watch-center.js'), 'utf8');
const versionJs = fs.readFileSync(path.join(root, 'src/config/version.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

// 1. Version is v2.0.0-rc4
add('version.js sets APP_VERSION to v2.0.0-rc4', () => {
  assert(versionJs.includes("APP_VERSION='v2.0.0-rc4'"), 'APP_VERSION should be v2.0.0-rc4');
});

// 2. Cache name is shike-v200rc4-v58
add('sw.js CACHE_NAME is shike-v200rc4-v58', () => {
  assert(sw.includes("shike-v200rc4-v58"), 'sw cache should be shike-v200rc4-v58');
});

// 3. Watch page exists in HTML
add('watch page div exists', () => {
  assert(html.includes('id="page-watch"'), 'page-watch missing from HTML');
  assert(html.includes('id="watchContent"'), 'watchContent container missing');
});

add('watch page belongs to the main app, not the sprite panel', () => {
  const watchIndex = html.indexOf('id="page-watch"');
  const drawerIndex = html.indexOf('<!-- Drawer -->');
  const spriteIndex = html.indexOf('<!-- Time Sprite -->');
  assert(watchIndex > html.indexOf('<div class="app"'), 'watch page should follow the app root');
  assert(watchIndex < drawerIndex, 'watch page should remain inside the main app area');
  assert(watchIndex < spriteIndex, 'watch page must not be nested inside the time sprite');
});

// 4. Nav item for watch exists
add('watch nav item exists', () => {
  assert(html.includes('data-page="watch"'), 'nav data-page="watch" missing');
  assert(html.includes('id="navWatch"'), 'navWatch id missing');
  assert(html.includes('data-i18n="navWatch"'), 'navWatch i18n missing');
});

// 5. Nav badge exists for unread count
add('watch nav badge exists', () => {
  assert(html.includes('id="navWatchBadge"'), 'navWatchBadge missing');
  assert(html.includes('nav-badge'), 'nav-badge class missing');
});

// 6. Script tags for watch modules in HTML
add('watch script tags included in index.html', () => {
  assert(html.includes('./src/watch/watch-storage.js'), 'watch-storage.js script missing');
  assert(html.includes('./src/watch/watch-center.js'), 'watch-center.js script missing');
});

// 7. Watch modules in SW precache
add('watch modules in SW PRECACHE_URLS', () => {
  assert(sw.includes('./src/watch/watch-storage.js'), 'watch-storage.js missing from SW precache');
  assert(sw.includes('./src/watch/watch-center.js'), 'watch-center.js missing from SW precache');
});

add('service worker is valid JavaScript', () => {
  assert(!sw.includes('\\n'), 'SW must not contain literal \\n tokens between precache entries');
  new Function(sw);
});

// 8. ShikeWatchStorage global exists
add('ShikeWatchStorage module exports correctly', () => {
  assert(watchStorage.includes('ShikeWatchStorage=Object.freeze'), 'ShikeWatchStorage freeze missing');
  assert(watchStorage.includes('getWatchItems'), 'getWatchItems missing');
  assert(watchStorage.includes('addWatchItem'), 'addWatchItem missing');
  assert(watchStorage.includes('removeWatchItem'), 'removeWatchItem missing');
  assert(watchStorage.includes('markAsRead'), 'markAsRead missing');
  assert(watchStorage.includes('isRead'), 'isRead missing');
  assert(watchStorage.includes('getUnreadCount'), 'getUnreadCount missing');
});

// 9. ShikeWatchCenter global exists
add('ShikeWatchCenter module exports correctly', () => {
  assert(watchCenter.includes('ShikeWatchCenter=Object.freeze'), 'ShikeWatchCenter freeze missing');
  assert(watchCenter.includes('init:'), 'init method missing');
  assert(watchCenter.includes('render:'), 'render method missing');
  assert(watchCenter.includes('refresh:'), 'refresh method missing');
  assert(watchCenter.includes('addWatchKeyword:'), 'addWatchKeyword method missing');
  assert(watchCenter.includes('getFeed:'), 'getFeed method missing');
  assert(watchCenter.includes('markItemRead:'), 'markItemRead method missing');
  assert(watchCenter.includes('markAllRead:'), 'markAllRead method missing');
  assert(watchCenter.includes('getUnreadCount:'), 'getUnreadCount method missing');
});

// 10. Watch keeps preferences local and fetches only direct public sources
add('watch center uses real fetch without XMLHttpRequest or proxy bypass', () => {
  assert(!watchCenter.includes('XMLHttpRequest'), 'should not use XMLHttpRequest');
  assert(watchCenter.includes('fetch('), 'real public source fetch should be used');
  assert(watchCenter.includes('No proxy') || watchCenter.includes('不使用代理'), 'proxy bypass must be explicitly excluded');
  assert(watchCenter.includes('localStorage') || watchStorage.includes('localStorage'), 'localStorage should be used');
});

// 11. Built-in whitelist sources are hardcoded
add('built-in sources are hardcoded and custom RSS is protocol validated', () => {
  assert(watchCenter.includes('BUILTIN_SOURCES'), 'BUILTIN_SOURCES missing');
  assert(watchCenter.includes('中文维基百科') && watchCenter.includes('GitHub'), 'built-in source names missing');
  assert(watchCenter.includes('validateFeedUrl'), 'custom RSS URL validation missing');
  assert(watchCenter.includes("parsed.protocol!=='http:'") && watchCenter.includes("parsed.protocol!=='https:'"), 'RSS protocol allowlist missing');
});

// 12. switchPage handles watch page
add('switchPage handles watch page in legacy-app', () => {
  assert(script.includes("page==='watch'"), 'switchPage watch case missing');
  assert(script.includes('ShikeWatchCenter.render()') || script.includes('ShikeWatchCenter.render'), 'watch render call missing');
});

// 13. updateWatchBadge function exists
add('updateWatchBadge function exists', () => {
  assert(script.includes('function updateWatchBadge(') || script.includes('function updateWatchBadge ('), 'updateWatchBadge missing');
  assert(script.includes('navWatchBadge'), 'badge element reference missing');
});

// 14. openWatchCenter function exists
add('openWatchCenter function exists', () => {
  assert(script.includes('function openWatchCenter(') || script.includes('function openWatchCenter ('), 'openWatchCenter missing');
});

// 15. Agent open_page tool includes 'watch'
add('agent open_page validates watch page', () => {
  assert(script.includes("'watch'"), 'watch page missing from open_page validation');
});

// 16. Agent manage_subscription tool implemented (calls addWatchKeyword when available)
add('agent manage_subscription tool calls addWatchKeyword', () => {
  assert(script.includes("name:'manage_subscription'"), 'manage_subscription tool missing');
  assert(script.includes('addWatchKeyword'), 'manage_subscription should call addWatchKeyword');
  assert(script.includes('keyword.length>50'), 'keyword length validation missing');
});

// 17. "打开关注中心" intent routes correctly
add('intent router handles open watch center', () => {
  assert(script.includes('打开关注中心') || script.includes('关注中心'), '关注中心 intent pattern missing');
  assert(script.includes("intent:'open_page'") && script.includes("page:'watch'"), 'open watch page intent missing');
});

// 18. "关注xxx" intent routes correctly
add('intent router handles 关注xxx pattern', () => {
  assert(script.includes("intent:'manage_subscription'"), 'manage_subscription intent missing');
  assert(script.includes('关注(.+)'), '关注 keyword pattern missing');
});

// 19. Honest disclaimer and no simulated feed
add('honest disclaimer present and simulated feed removed', () => {
  assert(!watchCenter.includes('FEED_SEED') && !watchCenter.includes('_simulateFetch'), 'simulated feed must be removed');
  assert(watchCenter.includes('isLive:true'), 'live-source marker missing');
  assert(html.includes('不构成投资') || watchCenter.includes('不构成投资') || watchCenter.includes('不提供') || watchCenter.includes('不构成'), 'disclaimer about not providing advice missing');
});

// 20. No forbidden claims (no fabricated news, buy/sell advice, fake prices)
add('no forbidden claims: no buy/sell, no real-time prices, no scraping', () => {
  const forbidden = [
    '买入建议', '卖出建议', '买卖建议', '实时股价', '实时行情',
    ' guaranteed return', 'stock tip', 'buy now', 'sell now',
    'scrape', 'crawl', '抓取网页', '爬取'
  ];
  forbidden.forEach((token) => {
    assert(!watchCenter.includes(token), `forbidden token present: ${token}`);
    assert(!watchStorage.includes(token), `forbidden token in storage: ${token}`);
  });
});

// 21. Local-only storage language present
add('local-only privacy statement present', () => {
  assert(watchCenter.includes('本地') || watchCenter.includes('localStorage') || watchCenter.includes('NEVER uploaded') || watchCenter.includes('不会上传'), 'local-only statement missing');
});

// 22. Watch center UI elements: refresh button
add('watch UI has refresh button', () => {
  assert(watchCenter.includes('watchRefreshBtn'), 'refresh button missing');
  assert(watchCenter.includes('刷新'), 'refresh label missing');
});

// 23. Watch center UI: add keyword input
add('watch UI has keyword add input and button', () => {
  assert(watchCenter.includes('watchAddInput'), 'add input missing');
  assert(watchCenter.includes('watchAddBtn'), 'add button missing');
});

// 24. Watch center UI: source filter chips
add('watch UI has source directory and filter', () => {
  assert(watchCenter.includes('watch-source-card') || watchCenter.includes('data-watch-source'), 'source directory controls missing');
  assert(watchCenter.includes('watchSourceFilter') && watchCenter.includes('watch-source-directory'), 'source filter or directory missing');
});

// 25. Watch center UI: feed list with read/unread dots
add('watch UI has feed items with unread dots', () => {
  assert(watchCenter.includes('watch-feed-item') || watchCenter.includes('watchFeedItem'), 'feed item class missing');
  assert(watchCenter.includes('watch-item-dot') || watchCenter.includes('unread'), 'unread dot missing');
  assert(watchCenter.includes('watch-item-source') || watchCenter.includes('sourceName'), 'source display missing');
  assert(watchCenter.includes('watch-item-time') || watchCenter.includes('timestamp') || watchCenter.includes('formatTime'), 'time display missing');
});

// 26. Watch center UI: freshness indicator
add('watch UI has freshness indicator', () => {
  assert(watchCenter.includes('freshness-dot') || watchCenter.includes('freshnessDot') || watchCenter.includes('上次刷新') || watchCenter.includes('getFreshnessLabel'), 'freshness indicator missing');
});

// 27. Watch center UI: mark all read
add('watch UI has mark all read button', () => {
  assert(watchCenter.includes('watchMarkAllBtn') || watchCenter.includes('全部已读') || watchCenter.includes('markAllRead'), 'mark all read button missing');
});

// 28. Read/unread status tracking
add('read status is tracked per item', () => {
  assert(watchStorage.includes('WATCH_READ_KEY') || watchStorage.includes('shike_watch_read'), 'read status key missing');
  assert(watchStorage.includes('markAsRead'), 'markAsRead missing');
});

// 29. Data freshness label function
add('freshness label function exists', () => {
  assert(watchCenter.includes('getFreshnessLabel'), 'getFreshnessLabel missing');
  assert(watchCenter.includes('分钟前') || watchCenter.includes('小时前') || watchCenter.includes('刚刚'), 'freshness time labels missing');
});

// 30. CSS styles for watch center exist
add('watch center CSS styles exist', () => {
  assert(style.includes('.watch-header') || style.includes('.watch-'), 'watch CSS missing');
  assert(style.includes('.watch-feed-item') || style.includes('.watch-feed'), 'watch feed CSS missing');
  assert(style.includes('.nav-badge'), 'nav-badge CSS missing');
});

// 31. v2.0.0-rc4 in release center list in HTML
add('v2.0.0-rc4 appears in release center list', () => {
  assert(html.includes('>v2.0.0-rc4<') || html.includes('v2.0.0-rc4'), 'v2.0.0-rc4 missing from release center');
  assert(html.includes('releaseCenterV140') || script.includes('releaseCenterV140'), 'releaseCenterV140 i18n key missing');
});

// 32. capabilityWatchCenter exists
add('capabilityWatchCenter in capability checklist', () => {
  assert(html.includes('capabilityWatchCenter') || script.includes('capabilityWatchCenter'), 'capabilityWatchCenter missing');
});

// 33. i18n navWatch exists in zh-CN
add('navWatch i18n key exists for zh-CN', () => {
  assert(script.includes("navWatch:'关注'"), 'zh-CN navWatch missing');
});

// 34. Watch center initialization called in legacy-app
add('watch center init called during app init', () => {
  assert(script.includes('ShikeWatchCenter.init()') || script.includes('ShikeWatchCenter.init'), 'watch center init call missing');
  assert(script.includes('ShikeWatchCenter.onRefresh'), 'watch center refresh callback missing');
});

// 35. Confirmation policy requires confirmation for manage_subscription
add('manage_subscription requires confirmation (safety)', () => {
  // confirmation-policy.js sets manage_subscription to 'confirm' level
  const confPolicy = fs.readFileSync(path.join(root, 'src/agent/confirmation-policy.js'), 'utf8');
  assert(confPolicy.includes("manage_subscription:'confirm'"), 'manage_subscription should require confirmation');
});

// 36. No paywall bypass or private scraping references
add('no paywall bypass or private scraping references', () => {
  assert(!watchCenter.includes('paywall'), 'no paywall references');
  assert(!watchCenter.includes('bypass'), 'no bypass references');
  assert(!watchCenter.includes('private') || watchCenter.includes('localStorage'), 'no private page scraping');
});

// 37. When no source available, honest messaging
add('honest about source availability', () => {
  assert(watchCenter.includes('没有找到') || watchCenter.includes('未知时间') || watchCenter.includes('暂无') || watchCenter.includes('empty'), 'empty/no-source honest messaging missing');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Watch center regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Watch center regression passed: ${checks.length}/${checks.length}`);
