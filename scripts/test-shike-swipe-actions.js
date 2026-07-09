const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

add('record card renders swipe wrapper and action rail', () => {
  const start = script.indexOf('function renderRecordCard(r)');
  const end = script.indexOf('function closeSwipeCards', start);
  const code = script.slice(start, end);
  assert(code.includes('record-swipe'), 'record-swipe wrapper missing');
  assert(code.includes('swipe-actions'), 'swipe action rail missing');
  assert(code.includes('swipe-action danger'), 'danger delete action missing');
});

add('swipe actions call edit delete and pin', () => {
  const start = script.indexOf('function renderRecordCard(r)');
  const end = script.indexOf('function closeSwipeCards', start);
  const code = script.slice(start, end);
  assert(code.includes('openEditDrawer'), 'edit action should call edit drawer');
  assert(code.includes('deleteRecord'), 'delete action should call delete record');
  assert(code.includes('togglePin'), 'pin action should call togglePin');
});

add('swipe css has hidden rail and smooth reveal', () => {
  ['.record-swipe', '.record-swipe.swiped .record-card', '.swipe-actions', '.swipe-action'].forEach((token) => {
    assert(style.includes(token), `${token} css missing`);
  });
  assert(style.includes('overflow:hidden'), 'swipe wrapper should prevent horizontal overflow');
  assert(style.includes('translateX(-212px)'), 'swiped card should translate left');
});

add('desktop hover fallback exists', () => {
  assert(style.includes('@media (hover:hover) and (pointer:fine)'), 'desktop hover fallback missing');
  assert(style.includes('.record-swipe:hover .record-card'), 'hover reveal missing');
});

add('touch gesture handler is delegated and thresholded', () => {
  assert(script.includes('function initSwipeActions()'), 'initSwipeActions missing');
  assert(script.includes("closest('.record-swipe')"), 'delegated target missing');
  assert(script.includes('Math.abs(dx)>32'), 'horizontal threshold missing');
  assert(script.includes('Math.abs(dx)>Math.abs(dy)*1.4'), 'vertical scroll guard missing');
});

add('swipe initialization is wired during init', () => {
  assert(script.includes('initSwipeActions();'), 'init should call initSwipeActions');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Swipe actions regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Swipe actions regression passed: ${checks.length}/${checks.length}`);
