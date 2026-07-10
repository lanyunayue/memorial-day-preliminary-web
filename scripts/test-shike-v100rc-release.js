const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

add('release lineage has a semantic APP_VERSION', () => assert(/APP_VERSION='v\d+\.\d+\.\d+(?:-[^']+)?'/.test(script), 'version mismatch'));
add('release lineage has a versioned service worker cache', () => assert(/CACHE_NAME = 'shike-v[\w-]+-v\d+'/.test(sw), 'cache mismatch'));
add('product position section exists', () => assert(html.includes('id="productPositionSection"') && html.includes('data-i18n="productPositionText"'), 'product position missing'));
add('does not claim Google Calendar replacement', () => assert(!html.includes('替代 ' + 'Google Calendar') && !html.includes('replace Google Calendar'), 'calendar replacement claim found'));
add('does not claim Days Matter replacement', () => assert(!html.includes('完全替代 ' + 'Days Matter') && !html.includes('replace Days Matter'), 'Days Matter replacement claim found'));
add('capability checklist exists', () => assert(html.includes('id="capabilityChecklistSection"') && html.includes('data-i18n="capabilityChecklistTitle"'), 'capability checklist missing'));
add('one-sentence input capability exists', () => assert(html.includes('data-i18n="capabilityOneSentence"') && script.includes('demoRouteOneTitle'), 'one-sentence ability missing'));
add('batch organize capability exists', () => assert(html.includes('data-i18n="capabilityBatchOrganize"') && html.includes('id="parseImportBtn"'), 'batch organize missing'));
add('dedupe protection capability exists', () => assert(html.includes('data-i18n="capabilityDedupe"') && script.includes('dedupe'), 'dedupe missing'));
add('bear assistant capability exists', () => assert(html.includes('data-i18n="capabilitySprite"') && html.includes('id="timeSprite"'), 'sprite missing'));
add('update center exists', () => assert(html.includes('id="releaseCenterSection"') && html.includes('v1.0.0'), 'update center missing'));
add('feedback entry exists', () => assert(html.includes('id="feedbackSection"') && html.includes('308138249@qq.com'), 'feedback missing'));
add('.ics export exists', () => assert(html.includes('data-i18n="capabilityIcsExport"') && html.includes('id="exportIcsBtn"'), '.ics export missing'));
add('JSON backup exists', () => assert(html.includes('data-i18n="capabilityJsonBackup"') && html.includes('id="exportBackupBtnMy"'), 'JSON backup missing'));
add('data safety copy exists', () => assert(html.includes('id="dataSafetySection"') && script.includes('dataSafetyHint'), 'data safety missing'));
add('current browser local save copy exists', () => assert(script.includes('数据默认保存在当前浏览器') || script.includes('Data is saved in this browser'), 'local save copy missing'));
add('no launched cloud sync claim', () => assert(!html.includes('云同步已上线') && !script.includes('已实现云同步'), 'cloud sync claim found'));
add('no automatic stock monitoring claim', () => assert(!html.includes('自动股票监控') && !script.includes('已支持股票监控'), 'stock monitoring claim found'));
add('no background persistent reminder claim', () => assert(!html.includes('后台持续提醒') && !html.includes('网页关闭后还能主动提醒'), 'background reminder claim found'));
add('no trading advice claim', () => assert(!html.includes('智能交易建议') && !html.includes('自动买卖建议'), 'trading advice claim found'));
add('demo route entry exists', () => assert(html.includes('data-i18n="demoRouteEntryTitle"') && html.includes('id="demoRouteBlock"'), 'demo route missing'));
add('feature hub exists', () => assert(html.includes('id="featureHubSection"') && html.includes('data-feature-action="updates"'), 'feature hub missing'));
add('personalization remains before feature hub', () => assert(html.indexOf('id="personalizeSection"') > 0 && html.indexOf('id="personalizeSection"') < html.indexOf('id="featureHubSection"'), 'personalization order changed'));
add('record actions still exist', () => assert((html+style+script).includes('record-more-btn') && script.includes('copyRecordText') && script.includes('togglePin'), 'record actions missing'));
add('home remains concise', () => assert(html.includes('id="quickInput"') && html.includes('id="todayOverviewBlock"') && html.includes('home-muted-entry'), 'home core missing'));
add('dark theme readable tokens exist', () => assert(style.includes('.theme-dot.t-night') && style.includes('[data-theme="night"]'), 'night theme tokens missing'));
add('mobile styles exist', () => assert(style.includes('@media (max-width:767px)') && style.includes('safe-bottom'), 'mobile styles missing'));
add('desktop styles exist', () => assert(style.includes('@media (min-width:1024px)') && style.includes('max-width:1080px'), 'desktop styles missing'));
add('no visible undefined marker', () => assert(!html.includes('>undefined<'), 'visible undefined marker'));
add('no visible null marker', () => assert(!html.includes('>null<'), 'visible null marker'));
add('no mojibake marker', () => assert(!html.includes('�'), 'mojibake marker'));
add('release notes keep honest capability wording', () => assert(script.includes('releaseCenterV100rc') && script.includes('未上线能力做承诺'), 'release note honesty mismatch'));
add('feedback email exists', () => assert(html.includes('href="mailto:308138249@qq.com"') && html.includes('id="copyFeedbackTemplateBtn"'), 'feedback email/template missing'));
add('experience examples exist', () => assert(html.includes('id="experienceExampleSection"') && html.includes('id="demoBtnMy"'), 'experience examples missing'));
add('sprite quick actions exist', () => assert(html.includes('id="timeSpriteInputBtn"') && html.includes('id="timeSpriteBatchBtn"') && html.includes('id="timeSpriteUpdateBtn"'), 'sprite quick actions missing'));
add('data import and export exist', () => assert(html.includes('id="restoreFileInputMy"') && html.includes('id="exportBackupBtnMy"'), 'import/export missing'));
add('calendar dot logic exists', () => assert(style.includes('.cal-dot') && script.includes('cal-dot'), 'calendar dot logic missing'));
add('timeline exists', () => assert(html.includes('id="timelineBlock"') && script.includes('renderTimeline'), 'timeline missing'));
add('today overview exists', () => assert(html.includes('id="todayOverviewBlock"') && script.includes('renderTodayOverview'), 'today overview missing'));
add('regression suite includes v100rc test', () => assert(fs.readFileSync(path.join(root, 'scripts', 'test-shike-regression-suite.js'), 'utf8').includes('test-shike-v100rc-release.js'), 'regression suite missing v100rc test'));

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`v1.0.0-rc release regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`v1.0.0-rc release regression passed: ${checks.length}/${checks.length}`);
