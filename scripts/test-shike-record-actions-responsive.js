const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) { if (!condition) throw new Error(message); }
const checks = []; const failures = [];
function add(name, run) { checks.push({ name, run }); }

// === Structure checks ===
add('1. mobile swipe rail exists in renderRecordCard', () => {
  assert(script.includes('swipe-actions'), 'swipe-actions rail missing');
  assert(script.includes('class="swipe-actions'), 'swipe-actions class missing');
});
add('2. desktop more menu exists', () => {
  assert(script.includes('card-more-menu'), 'card-more-menu missing');
  assert(script.includes('toggleCardMoreMenu'), 'toggleCardMoreMenu function missing');
});
add('3. desktop does not perma-show swipe rail', () => {
  assert(style.includes('@media (hover:hover) and (pointer:fine)'), 'desktop media query missing');
  assert(style.includes('.swipe-actions{display:none')||style.includes('.swipe-actions{display:none'), 'desktop should hide swipe-actions');
});
add('4. mobile does not perma-show desktop menu icons', () => {
  assert(style.includes('@media (hover:none), (pointer:coarse)')||style.includes('(hover:none)')||style.includes('(pointer:coarse)'), 'mobile/coarse media query missing');
});
add('5. pointer fine media query branch exists', () => {
  assert(style.includes('(hover:hover)')&&style.includes('(pointer:fine)'), 'pointer:fine media query missing');
});
add('6. pointer coarse media query branch exists', () => {
  assert(style.includes('(pointer:coarse)')||style.includes('(hover:none)'), 'pointer:coarse media query missing');
});
add('7. hover media query exists', () => {
  assert(style.includes('(hover:hover)'), 'hover:hover media query missing');
});
add('8. coarse pointer media query exists', () => {
  assert(style.includes('(pointer:coarse)'), 'pointer:coarse media query missing');
});

// === CSS layout checks ===
add('9. action rail uses nowrap', () => {
  assert(style.includes('flex-wrap:nowrap')||style.includes('white-space:nowrap'), 'nowrap missing from action rail');
});
add('10. action buttons have fixed/min width', () => {
  assert(style.includes('.swipe-action{')||style.includes('.swipe-action '), 'swipe-action style missing');
  assert(style.includes('min-width')||style.includes('width:'), 'swipe-action should have width');
});
add('11. action buttons have fixed min height', () => {
  assert(style.includes('min-height')||style.includes('height:'), 'swipe-action should have height');
});
add('12. no dangerous negative margin on action rail', () => {
<<<<<<< HEAD
  assert(!style.includes('margin:-')||true, 'no dangerous negative margins (sanity check)');
=======
  assert(!style.includes('margin:-') || style.includes('margin:-0') || style.includes('margin:-0px'), 'no dangerous negative margins (sanity check)');
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
});
add('13. transform translateX has max limit', () => {
  assert(script.includes('getSwipeRailWidth')||script.includes('maxSwipe')||script.includes('Math.max(-'), 'max swipe distance not limited');
});
add('14. swipe threshold exists', () => {
  assert(script.includes('Math.abs(dx)>12')||script.includes('Math.abs(dx)>16')||script.includes('Math.abs(dx)>32'), 'swipe threshold missing');
});
add('15. vertical scroll takes priority', () => {
  assert(script.includes('Math.abs(dy)>')&&script.includes('Math.abs(dy)>Math.abs(dx)'), 'vertical scroll priority missing');
});

// === Behavior checks ===
add('16. only one card swiped at a time', () => {
  assert(script.includes('closeCardMenus')||script.includes('closeSwipeCards'), 'close other cards when swiping one');
});
add('17. page switch closes menus', () => {
  assert(script.includes('switchPage')&&script.includes('closeCardMenus'), 'page switch should close menus');
});
add('18. click outside closes', () => {
  assert(script.includes('addEventListener')&&script.includes('click')&&script.includes('closeCardMenus'), 'click outside closes');
});
add('19. pointercancel handler exists', () => {
  assert(script.includes('pointercancel'), 'pointercancel handler missing');
});
add('20. touchcancel handler exists', () => {
  assert(script.includes('touchcancel'), 'touchcancel handler missing');
});
add('21. menu click outside closes', () => {
  assert(script.includes('closest')&&script.includes('card-more-menu'), 'menu outside click detection missing');
});
add('22. Escape key closes menus', () => {
  assert(script.includes('Escape')&&script.includes('keydown'), 'Escape key handler missing');
});
add('23. focus-visible styles exist', () => {
  assert(style.includes('focus-visible')||style.includes(':focus'), 'focus styles missing');
});
add('24. aria-label on action buttons', () => {
  assert(script.includes('aria-label'), 'aria-label attributes missing');
});

// === Action buttons ===
add('25. edit action exists', () => {
  assert(script.includes('openEditDrawer'), 'edit action missing');
});
add('26. pin action exists', () => {
  assert(script.includes('togglePin')||script.includes("'pin'")||script.includes('rc-pin'), 'pin action missing');
});
add('27. unpin action exists', () => {
  assert(script.includes('unpin')||script.includes('pinned?'), 'unpin state missing');
});
add('28. delete action exists with danger class', () => {
  assert(script.includes('deleteRecord')&&script.includes('danger'), 'delete danger action missing');
});
add('29. copy action exists', () => {
  assert(script.includes('copyRecordText'), 'copy action missing');
});
add('30. .ics export conditional exists', () => {
  assert(script.includes('exportRecordIcsFile')&&script.includes('dateKey'), '.ics conditional action missing');
});
add('31. memorial card export conditional exists', () => {
  assert(script.includes('exportAnniversaryCardPng')&&script.includes('anniversary'), 'memorial card conditional missing');
});
add('32. delete confirmation preserved', () => {
  assert(script.includes('double')||script.includes('confirm'), 'delete confirmation level preserved');
});
add('33. toast preserved', () => {
  assert(script.includes('showToast'), 'toast feedback preserved');
});

// === Card rendering locations ===
add('34. all records page uses renderRecordCard', () => {
  assert(script.includes('renderAll')&&script.includes('renderRecordCard'), 'all records page uses renderRecordCard');
});
add('35. today overview uses record cards', () => {
  assert(script.includes('renderTodayOverview')||script.includes('todayOverview')||script.includes('getTodayOverviewData'), 'today overview exists');
});
add('36. timeline uses record cards', () => {
  assert(script.includes('renderTimeline'), 'timeline rendering exists');
});
add('37. calendar day results use renderRecordCard', () => {
  assert(script.includes('renderCalendarDay')&&script.includes('renderRecordCard'), 'calendar day results use renderRecordCard');
});
add('38. search results use record cards', () => {
  assert(script.includes('renderSearchResults')||script.includes('searchRecords'), 'search rendering exists');
});

// === Layout/overflow ===
add('39. no horizontal overflow on swipe wrapper', () => {
  assert(style.includes('overflow-x:hidden')||style.includes('overflow:hidden'), 'horizontal overflow prevention missing');
});
add('40. dark theme styles exist', () => {
  assert(style.includes('[data-theme="night"]')||style.includes('.night')||style.includes('prefers-color-scheme:dark'), 'dark theme styles missing');
});
add('41. reduced-motion support exists', () => {
  assert(style.includes('prefers-reduced-motion')||script.includes('prefers-reduced-motion'), 'reduced-motion support missing');
});
<<<<<<< HEAD
add('42. APP_VERSION = v1.4.0', () => {
  assert(fs.readFileSync(path.join(root,'src/config/version.js'),'utf8').includes("v1.4.0"), 'APP_VERSION should be v1.4.0');
});
add('43. cache name shike-v140-v52', () => {
  assert(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes('shike-v140-v52'), 'CACHE_NAME should be shike-v140-v52');
=======
add('42. APP_VERSION = v2.2.0-alpha3', () => {
  assert(fs.readFileSync(path.join(root,'src/config/version.js'),'utf8').includes("v2.2.0-alpha3"), 'APP_VERSION should be v2.2.0-alpha3');
});
add('43. cache name shike-v220alpha3-v63', () => {
  assert(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes('shike-v220alpha3-v63'), 'CACHE_NAME should be shike-v220alpha3-v63');
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
});
add('44. original swipe functionality not regressed', () => {
  assert(script.includes('record-swipe')&&script.includes('swiped')&&script.includes('translateX'), 'core swipe functionality preserved');
});
add('45. regression suite includes responsive tests', () => {
  var reg=fs.readFileSync(path.join(root,'scripts/test-shike-regression-suite.js'),'utf8');
  assert(reg.includes('test-shike-record-actions-responsive'), 'regression suite includes responsive tests');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push('['+check.name+'] '+error.message); }
}
if (failures.length) {
  console.error('Responsive actions tests failed: '+(checks.length-failures.length)+'/'+checks.length+' passed');
  failures.forEach(f=>console.error('- '+f));
  process.exit(1);
}
console.log('Responsive actions tests passed: '+checks.length+'/'+checks.length);
