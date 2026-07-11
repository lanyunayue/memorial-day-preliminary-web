const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const checks = [];
function add(name, condition) { checks.push({ name, passed: !!condition }); }

add('card action container exists', script.includes('card-action-menu') && style.includes('.swipe-actions'));
add('left swipe classes exist', style.includes('.record-swipe.swiped') && script.includes('pointerdown') && script.includes('pointermove'));
add('edit button exists', script.includes('card-action-edit') && script.includes('openEditDrawer'));
add('delete button exists', script.includes('card-action-delete') && script.includes('deleteRecord'));
add('pin button exists', script.includes('card-action-pin') && script.includes('togglePin'));
add('copy button exists', script.includes('card-action-copy') && script.includes('copyRecordText'));
add('single ics action exists', script.includes('card-action-ics') && script.includes('exportRecordIcsFile'));
add('memorial card action exists', script.includes('card-action-memorial') && script.includes('exportAnniversaryCardPng'));
add('desktop more button exists', script.includes('rc-more-btn') && script.includes('toggleCardMoreMenu'));
add('aria labels exist', script.includes('aria-label') && script.includes("t('moreActions')"));
add('delete confirmation still exists', script.includes('showConfirm') && script.includes('deleteRecord'));
add('toast feedback exists', script.includes("showToast(t('recordCopied')") && script.includes("showToast(r.pinned"));
add('copy uses clipboard or fallback', script.includes('navigator.clipboard') && script.includes('fallbackCopyRecordText'));
add('edit flow preserved', script.includes('function openEditDrawer'));
add('pin flow preserved', script.includes('function togglePin'));
add('delete flow preserved', script.includes('function deleteRecord'));
add('search still exists', html.includes('id="allSearchInput"'));
add('timeline still exists', html.includes('id="timelineBlock"') && script.includes('renderTimeline'));
add('today overview still exists', html.includes('id="todayOverviewBlock"') && script.includes('renderTodayOverview'));
add('mobile style exists', style.includes('touch-action:pan-y') && style.includes('translateX(-240px)'));
add('desktop style exists', style.includes('@media (hover:hover) and (pointer:fine)') && style.includes('.rc-more-btn{display:inline-flex;}'));
add('no horizontal overflow style preserved', style.includes('overflow:hidden') && style.includes('body{'));
add('no visible undefined/null/mojibake', !html.includes('>undefined<') && !html.includes('>null<') && !html.includes('\uFFFD'));
add('version is v1.5.0', script.includes("APP_VERSION='v1.5.0'"));
add('service worker cache is v150', sw.includes("CACHE_NAME = 'shike-v150-v54'"));
add('batch organize still exists', html.includes('id="page-import"') && html.includes('id="parseImportBtn"'));
add('dedupe still exists', script.includes('draftDuplicateSkipped') || script.includes('dedupe'));
add('ics export still exists', script.includes('function exportIcsFile'));
add('json backup still exists', script.includes('function exportBackupFile'));
add('bear quick actions still exist', html.includes('id="timeSpriteBatchBtn"') && html.includes('id="timeSpriteExportBtn"'));
add('release notes still exist', html.includes('id="releaseMask"') && script.includes('showReleaseNotes'));
add('feedback email still exists', html.includes('308138249@qq.com'));
add('personalization remains before feature hub', html.indexOf('id="personalizeSection"') < html.indexOf('id="featureHubSection"'));
add('feature hub still exists', html.includes('id="featureHubSection"'));
add('regression suite includes this test', fs.readFileSync(path.join(root, 'scripts', 'test-shike-regression-suite.js'), 'utf8').includes('test-shike-record-actions-polish.js'));

const failed = checks.filter((check) => !check.passed);
if (failed.length) {
  console.error(`Record actions polish regression failed: ${checks.length - failed.length}/${checks.length} passed`);
  failed.forEach((check) => console.error(`- ${check.name}`));
  process.exit(1);
}

console.log(`Record actions polish regression passed: ${checks.length}/${checks.length}`);
