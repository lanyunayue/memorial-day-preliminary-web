const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(css) {
  return css.replace(/\s+/g, '');
}

function mediaBlock(minWidth) {
  const marker = `@media (min-width:${minWidth}px)`;
  const start = style.indexOf(marker);
  assert(start >= 0, `missing media block ${marker}`);
  const open = style.indexOf('{', start);
  assert(open >= 0, `missing opening brace for ${marker}`);
  let depth = 0;
  for (let i = open; i < style.length; i += 1) {
    if (style[i] === '{') depth += 1;
    if (style[i] === '}') depth -= 1;
    if (depth === 0) return style.slice(open + 1, i);
  }
  throw new Error(`unclosed media block ${marker}`);
}

function maxWidthForSelector(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`);
  const match = css.match(re);
  if (!match) return null;
  const width = match[1].match(/max-width\s*:\s*(\d+)px/);
  return width ? Number(width[1]) : null;
}

function containsRule(css, selector, declaration) {
  const compact = normalize(css);
  return compact.includes(`${normalize(selector)}{`) && compact.includes(normalize(declaration));
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

add('base mobile shell remains 430px wide and full width', () => {
  const appWidth = maxWidthForSelector(style, '.app');
  const navWidth = maxWidthForSelector(style, '.nav');
  assert(appWidth === 430, `base .app max-width should be 430px, got ${appWidth}`);
  assert(navWidth === 430, `base .nav max-width should be 430px, got ${navWidth}`);
  assert(containsRule(style, '.app', 'width:100%'), 'base .app should keep width:100%');
  assert(containsRule(style, '.nav', 'width:100%'), 'base .nav should keep width:100%');
});

add('page prevents horizontal overflow on narrow screens', () => {
  assert(containsRule(style, 'body', 'overflow-x:hidden'), 'body should prevent horizontal overflow');
  assert(style.includes('@media (max-width:390px)'), 'small-phone media block should exist');
  const small = style.slice(style.indexOf('@media (max-width:390px)'));
  assert(small.includes('.home-hero,.content'), 'small-phone block should adjust horizontal page padding');
});

add('tablet breakpoint expands app and nav beyond phone width', () => {
  const css = mediaBlock(768);
  const compact = normalize(css);
  assert(compact.includes('.app,.nav{max-width:860px;}'), '768px breakpoint should set .app,.nav max-width:860px');
  assert(compact.includes('.home-hero,.content{padding-left:28px;padding-right:28px;}'), '768px breakpoint should add wider content padding');
  assert(compact.includes('.drawer{max-width:560px;}'), '768px breakpoint should widen drawer moderately');
});

add('desktop breakpoint gives normal web width without full-screen stretching', () => {
  const css = mediaBlock(1024);
  const compact = normalize(css);
  assert(compact.includes('.app,.nav{max-width:1040px;}'), '1024px breakpoint should set .app,.nav max-width:1040px');
  assert(compact.includes('.home-hero,.content{padding-left:34px;padding-right:34px;}'), '1024px breakpoint should use wider content padding');
});

add('desktop calendar and empty-home content keep readable inner widths', () => {
  const css = mediaBlock(1024);
  const compact = normalize(css);
  assert(compact.includes('.app:not(.has-records).home-hero{max-width:760px;margin:0auto;}'), 'empty home should keep readable inner width');
  assert(compact.includes('#page-calendar.content{max-width:860px;margin:0auto;}'), 'calendar content should keep readable inner width');
});

add('large desktop cap stays within product-like width', () => {
  const css = mediaBlock(1280);
  const compact = normalize(css);
  assert(compact.includes('.app,.nav{max-width:1080px;}'), '1280px breakpoint should cap .app,.nav at 1080px');
});

add('desktop max-width values stay inside intended ranges', () => {
  const w768 = maxWidthForSelector(mediaBlock(768), '.app,.nav');
  const w1024 = maxWidthForSelector(mediaBlock(1024), '.app,.nav');
  const w1280 = maxWidthForSelector(mediaBlock(1280), '.app,.nav');
  assert(w768 >= 760 && w768 <= 860, `768px max-width out of range: ${w768}`);
  assert(w1024 >= 960 && w1024 <= 1080, `1024px max-width out of range: ${w1024}`);
  assert(w1280 >= 960 && w1280 <= 1120, `1280px max-width out of range: ${w1280}`);
});

add('bottom nav remains aligned with main shell on desktop', () => {
  [768, 1024, 1280].forEach((width) => {
    const css = mediaBlock(width);
    assert(normalize(css).includes('.app,.nav{max-width:'), `${width}px breakpoint should size app and nav together`);
  });
});

add('drawer grows on desktop but keeps modal width constrained', () => {
  const w768 = maxWidthForSelector(mediaBlock(768), '.drawer');
  const w1024 = maxWidthForSelector(mediaBlock(1024), '.drawer');
  assert(w768 === 560, `768px drawer max should be 560px, got ${w768}`);
  assert(w1024 === 640, `1024px drawer max should be 640px, got ${w1024}`);
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Responsive CSS regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Responsive CSS regression passed: ${checks.length}/${checks.length}`);
